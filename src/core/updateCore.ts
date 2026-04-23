import { execFile } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import { promisify } from "util";
import { installPreCommitHookCore } from "./hookInstallerCore";
import { syncLocalRuntimeAssets } from "./localRuntimeCore";
import { type CoreReporter } from "./gitSyncCore";

const execFileAsync = promisify(execFile);

type PackageJson = {
  name?: string;
  version?: string;
  scripts?: Record<string, string>;
  [key: string]: unknown;
};

type CoaiMetadata = {
  version?: string;
  channels?: {
    systemPackage?: {
      name?: string;
      version?: string;
    };
    workspaceAssets?: {
      version?: string;
    };
  };
  compatibility?: {
    vscodeExtension?: string;
  };
};

type CoaiScriptsFile = {
  scripts?: Record<string, string>;
};

export type CoaiVersionInfo = {
  packageName: string;
  packageVersion: string;
  workspaceAssetsVersion: string | null;
  vscodeExtensionVersionHint: string | null;
};

export type CoaiUpdateCheckResult = {
  packageName: string;
  currentVersion: string;
  latestVersion: string | null;
  updateAvailable: boolean;
  error?: string;
};

export type CoaiWorkspaceUpdateResult = {
  createdFiles: number;
  updatedFiles: number;
  unchangedFiles: number;
  scriptsMerged: string[];
  hookInstalled: boolean;
};

// @coai anchor: plugin.cli.version-core.001
export async function getCoaiVersionInfo(
  workspaceRoot: string,
  packageRoot: string
): Promise<CoaiVersionInfo> {
  const packageJson = await readJsonFile<PackageJson>(path.join(packageRoot, "package.json"));
  const metadata = await readOptionalJsonFile<CoaiMetadata>(
    path.join(workspaceRoot, ".coai", "coai", "metadata", "version.json")
  );

  return {
    packageName: packageJson.name ?? "coai",
    packageVersion: packageJson.version ?? "0.0.0",
    workspaceAssetsVersion: metadata?.channels?.workspaceAssets?.version ?? metadata?.version ?? null,
    vscodeExtensionVersionHint: metadata?.compatibility?.vscodeExtension ?? metadata?.channels?.systemPackage?.version ?? null
  };
}

// @coai anchor: plugin.cli.check-update-core.001
export async function checkCoaiPackageUpdate(packageRoot: string): Promise<CoaiUpdateCheckResult> {
  const packageJson = await readJsonFile<PackageJson>(path.join(packageRoot, "package.json"));
  const packageName = packageJson.name ?? "coai";
  const currentVersion = packageJson.version ?? "0.0.0";

  try {
    const { stdout } = await execFileAsync(getNpmCommand(), ["view", packageName, "version", "--silent"], {
      cwd: packageRoot,
      shell: process.platform === "win32"
    });
    const latestVersion = stdout.trim() || null;
    return {
      packageName,
      currentVersion,
      latestVersion,
      updateAvailable: Boolean(latestVersion && compareSemver(latestVersion, currentVersion) > 0)
    };
  } catch (error) {
    return {
      packageName,
      currentVersion,
      latestVersion: null,
      updateAvailable: false,
      error: error instanceof Error ? error.message : "Unknown npm registry error"
    };
  }
}

// @coai anchor: plugin.cli.update-core.001
export async function updateCoaiWorkspaceCore(
  workspaceRoot: string,
  packageRoot: string,
  reporter: Pick<CoreReporter, "appendLine">
): Promise<CoaiWorkspaceUpdateResult> {
  const sourceCoaiSystemRoot = path.join(packageRoot, "template", ".coai", "coai");
  const targetCoaiSystemRoot = path.join(workspaceRoot, ".coai", "coai");

  reporter.appendLine("[Update] Update CoAI workspace system assets");
  const copyResult = await copySystemAssets(sourceCoaiSystemRoot, targetCoaiSystemRoot);
  reporter.appendLine(
    `[Update] created=${copyResult.createdFiles}, updated=${copyResult.updatedFiles}, unchanged=${copyResult.unchangedFiles}`
  );
  const runtimeResult = await syncLocalRuntimeAssets(packageRoot, workspaceRoot);
  reporter.appendLine(
    `[Update] local runtime synced: created=${runtimeResult.createdFiles}, updated=${runtimeResult.updatedFiles}, unchanged=${runtimeResult.unchangedFiles}`
  );

  const scriptsMerged = await mergeCoaiScripts(workspaceRoot);
  reporter.appendLine(`[Update] scripts merged (${scriptsMerged.length}): ${scriptsMerged.join(", ") || "none"}`);

  const hookResult = await installPreCommitHookCore(workspaceRoot, reporter);
  reporter.appendLine("[Update] done");

  return {
    ...copyResult,
    scriptsMerged,
    hookInstalled: hookResult.installed
  };
}

async function copySystemAssets(
  sourceDir: string,
  targetDir: string
): Promise<{ createdFiles: number; updatedFiles: number; unchangedFiles: number }> {
  const sourceStat = await fs.stat(sourceDir);
  if (!sourceStat.isDirectory()) {
    throw new Error(`CoAI system asset directory is not valid: ${sourceDir}`);
  }

  await fs.mkdir(targetDir, { recursive: true });
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  let createdFiles = 0;
  let updatedFiles = 0;
  let unchangedFiles = 0;

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      const result = await copySystemAssets(sourcePath, targetPath);
      createdFiles += result.createdFiles;
      updatedFiles += result.updatedFiles;
      unchangedFiles += result.unchangedFiles;
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const sourceText = await fs.readFile(sourcePath);
    const targetExists = await exists(targetPath);
    if (targetExists) {
      const targetText = await fs.readFile(targetPath);
      if (sourceText.equals(targetText)) {
        unchangedFiles += 1;
        continue;
      }
      await fs.copyFile(sourcePath, targetPath);
      updatedFiles += 1;
      continue;
    }

    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.copyFile(sourcePath, targetPath);
    createdFiles += 1;
  }

  return { createdFiles, updatedFiles, unchangedFiles };
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
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

async function readOptionalJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    return await readJsonFile<T>(filePath);
  } catch {
    return null;
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

function compareSemver(left: string, right: string): number {
  const leftParts = parseSemver(left);
  const rightParts = parseSemver(right);
  for (let index = 0; index < 3; index += 1) {
    if (leftParts[index] > rightParts[index]) {
      return 1;
    }
    if (leftParts[index] < rightParts[index]) {
      return -1;
    }
  }
  return 0;
}

function parseSemver(version: string): [number, number, number] {
  const [major = "0", minor = "0", patch = "0"] = version.replace(/^[^\d]*/, "").split(".");
  return [Number(major) || 0, Number(minor) || 0, Number(patch) || 0];
}

function getNpmCommand(): string {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}
