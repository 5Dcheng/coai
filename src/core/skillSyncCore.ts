import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import { type CoreReporter } from "./gitSyncCore";

export type SkillSyncOptions = {
  workspaceRoot?: string;
  targetDir?: string;
  devMode?: boolean;
  sourceDir?: string;
};

export type SkillSyncResult = {
  sourceDir: string;
  sourceType: "package" | "workspace-dev" | "custom";
  targetDir: string;
  createdFiles: number;
  updatedFiles: number;
  unchangedFiles: number;
};

// @coai anchor: plugin.cli.skill-sync-core.001
export async function syncCoaiSkillCore(
  packageRoot: string,
  reporter: Pick<CoreReporter, "appendLine">,
  options: SkillSyncOptions = {}
): Promise<SkillSyncResult> {
  const resolvedSource = await resolveSkillSource(packageRoot, options);
  const sourceDir = resolvedSource.sourceDir;
  const targetDir = options.targetDir ?? path.join(os.homedir(), ".codex", "skills", "coai");

  reporter.appendLine("[Skill] Sync local CoAI skill");
  reporter.appendLine(`[Skill] Source mode: ${resolvedSource.sourceType}`);
  reporter.appendLine(`[Skill] Source: ${sourceDir}`);
  reporter.appendLine(`[Skill] Target: ${targetDir}`);

  const result = await copyDirectoryRecursive(sourceDir, targetDir);
  reporter.appendLine(
    `[Skill] created=${result.createdFiles}, updated=${result.updatedFiles}, unchanged=${result.unchangedFiles}`
  );
  reporter.appendLine("[Skill] done");

  return {
    sourceDir,
    sourceType: resolvedSource.sourceType,
    targetDir,
    ...result
  };
}

async function resolveSkillSource(
  packageRoot: string,
  options: SkillSyncOptions
): Promise<{ sourceDir: string; sourceType: "package" | "workspace-dev" | "custom" }> {
  if (options.sourceDir) {
    const customSourceDir = path.resolve(options.sourceDir);
    await ensureDirectoryExists(customSourceDir, "custom");
    return {
      sourceDir: customSourceDir,
      sourceType: "custom"
    };
  }

  if (options.devMode) {
    const workspaceRoot = options.workspaceRoot ?? process.cwd();
    const devSourceDir = path.join(workspaceRoot, "skills", "coai");
    await ensureDirectoryExists(devSourceDir, "workspace-dev");
    return {
      sourceDir: devSourceDir,
      sourceType: "workspace-dev"
    };
  }

  const packageSourceDir = path.join(packageRoot, "skills", "coai");
  await ensureDirectoryExists(packageSourceDir, "package");
  return {
    sourceDir: packageSourceDir,
    sourceType: "package"
  };
}

async function copyDirectoryRecursive(
  sourceDir: string,
  targetDir: string
): Promise<{ createdFiles: number; updatedFiles: number; unchangedFiles: number }> {
  const stat = await fs.stat(sourceDir);
  if (!stat.isDirectory()) {
    throw new Error(`Skill source directory is not valid: ${sourceDir}`);
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
      const result = await copyDirectoryRecursive(sourcePath, targetPath);
      createdFiles += result.createdFiles;
      updatedFiles += result.updatedFiles;
      unchangedFiles += result.unchangedFiles;
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const sourceContent = await fs.readFile(sourcePath);
    const targetExists = await exists(targetPath);
    if (!targetExists) {
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, sourceContent);
      createdFiles += 1;
      continue;
    }

    const targetContent = await fs.readFile(targetPath);
    if (sourceContent.equals(targetContent)) {
      unchangedFiles += 1;
      continue;
    }

    await fs.writeFile(targetPath, sourceContent);
    updatedFiles += 1;
  }

  return { createdFiles, updatedFiles, unchangedFiles };
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDirectoryExists(
  directoryPath: string,
  sourceType: "package" | "workspace-dev" | "custom"
): Promise<void> {
  const stat = await fs.stat(directoryPath).catch(() => undefined);
  if (stat?.isDirectory()) {
    return;
  }

  if (sourceType === "package") {
    throw new Error(
      `CoAI skill source was not found in the installed package: ${directoryPath}. If you are developing CoAI itself, run "coai skill sync --dev".`
    );
  }

  if (sourceType === "workspace-dev") {
    throw new Error(`CoAI dev skill source was not found in the current workspace: ${directoryPath}`);
  }

  throw new Error(`CoAI skill source directory is not valid: ${directoryPath}`);
}
