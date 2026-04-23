import * as fs from "fs/promises";
import * as path from "path";
import { installPreCommitHookCore } from "./hookInstallerCore";
import { syncLocalRuntimeAssets } from "./localRuntimeCore";
import { type CoreReporter } from "./gitSyncCore";

type PackageJson = {
  name?: string;
  version?: string;
  scripts?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
};

type CoaiScriptsFile = {
  scripts?: Record<string, string>;
};

export type InitResult = {
  copiedFiles: number;
  skippedFiles: number;
  scriptsMerged: string[];
  hookInstalled: boolean;
  packageJsonMode: "standard" | "no_package_json";
};

export type InitOptions = {
  noPackageJson?: boolean;
};

// @coai anchor: plugin.cli.init-core.001
export async function initCoaiWorkspaceCore(
  workspaceRoot: string,
  packageRoot: string,
  reporter: Pick<CoreReporter, "appendLine">,
  options: InitOptions = {}
): Promise<InitResult> {
  const templateCoaiRoot = path.join(packageRoot, "template", ".coai");
  const targetCoaiRoot = path.join(workspaceRoot, ".coai");
  const packageJsonMode = options.noPackageJson ? "no_package_json" : "standard";

  reporter.appendLine("[Init] Copy CoAI template assets");
  const copyResult = await copyMissingFiles(templateCoaiRoot, targetCoaiRoot);
  reporter.appendLine(`[Init] copied=${copyResult.copiedFiles}, skipped=${copyResult.skippedFiles}`);

  let scriptsMerged: string[] = [];
  if (options.noPackageJson) {
    reporter.appendLine("[Init] package.json merge skipped (--no-package-json)");
  } else {
    scriptsMerged = await mergeCoaiScripts(workspaceRoot);
    reporter.appendLine(`[Init] scripts merged (${scriptsMerged.length}): ${scriptsMerged.join(", ") || "none"}`);
  }
  const runtimeResult = await syncLocalRuntimeAssets(packageRoot, workspaceRoot);
  reporter.appendLine(
    `[Init] local runtime synced: created=${runtimeResult.createdFiles}, updated=${runtimeResult.updatedFiles}, unchanged=${runtimeResult.unchangedFiles}`
  );
  const gitignoreChanged = await ensureGitignore(workspaceRoot);
  reporter.appendLine(`[Init] .gitignore ${gitignoreChanged ? "updated" : "already ok"}`);

  const hookResult = await installPreCommitHookCore(workspaceRoot, reporter);
  reporter.appendLine("[Init] done");

  return {
    copiedFiles: copyResult.copiedFiles,
    skippedFiles: copyResult.skippedFiles,
    scriptsMerged,
    hookInstalled: hookResult.installed,
    packageJsonMode
  };
}

async function copyMissingFiles(sourceDir: string, targetDir: string): Promise<{ copiedFiles: number; skippedFiles: number }> {
  const sourceStat = await fs.stat(sourceDir);
  if (!sourceStat.isDirectory()) {
    throw new Error(`CoAI template directory is not valid: ${sourceDir}`);
  }

  await fs.mkdir(targetDir, { recursive: true });
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  let copiedFiles = 0;
  let skippedFiles = 0;

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      const result = await copyMissingFiles(sourcePath, targetPath);
      copiedFiles += result.copiedFiles;
      skippedFiles += result.skippedFiles;
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (await exists(targetPath)) {
      skippedFiles += 1;
      continue;
    }

    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.copyFile(sourcePath, targetPath);
    copiedFiles += 1;
  }

  return { copiedFiles, skippedFiles };
}

async function mergeCoaiScripts(workspaceRoot: string): Promise<string[]> {
  const packageJsonPath = path.join(workspaceRoot, "package.json");
  const scriptsPath = path.join(workspaceRoot, ".coai", "coai", "package.coai-scripts.json");
  const packageJson = await readPackageJson(packageJsonPath);
  const coaiScripts = await readJsonFile<CoaiScriptsFile>(scriptsPath);
  const scripts = coaiScripts.scripts ?? {};
  packageJson.scripts = {
    ...(packageJson.scripts ?? {}),
    ...scripts
  };
  await fs.writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, "utf8");
  return Object.keys(scripts);
}

async function ensureGitignore(workspaceRoot: string): Promise<boolean> {
  const gitignorePath = path.join(workspaceRoot, ".gitignore");
  const requiredEntries = ["node_modules/"];
  const existing = (await exists(gitignorePath)) ? await fs.readFile(gitignorePath, "utf8") : "";
  const lines = existing.split(/\r?\n/).map((line) => line.trim());
  const missing = requiredEntries.filter((entry) => !lines.includes(entry));
  if (missing.length === 0) {
    return false;
  }

  const prefix = existing.length > 0 && !existing.endsWith("\n") ? "\n" : "";
  await fs.appendFile(gitignorePath, `${prefix}${missing.join("\n")}\n`, "utf8");
  return true;
}

async function readPackageJson(packageJsonPath: string): Promise<PackageJson> {
  if (!(await exists(packageJsonPath))) {
    return {
      name: path.basename(path.dirname(packageJsonPath)),
      version: "0.1.0",
      scripts: {}
    };
  }

  return readJsonFile<PackageJson>(packageJsonPath);
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    throw new Error(`Failed to read JSON file ${filePath}: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
