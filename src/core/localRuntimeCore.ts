import * as fs from "fs/promises";
import * as path from "path";

export type LocalRuntimeSyncResult = {
  createdFiles: number;
  updatedFiles: number;
  unchangedFiles: number;
};

export async function syncLocalRuntimeAssets(
  packageRoot: string,
  workspaceRoot: string
): Promise<LocalRuntimeSyncResult> {
  const runtimeTargetRoot = path.join(workspaceRoot, ".coai", "coai", "runtime");
  const skillTargetRoot = path.join(workspaceRoot, ".coai", "coai", "skills", "coai");
  const manifestTargetPath = path.join(workspaceRoot, ".coai", "coai", "package.json");

  let createdFiles = 0;
  let updatedFiles = 0;
  let unchangedFiles = 0;

  const runtimeResult = await copyDirectoryRecursive(path.join(packageRoot, "out"), runtimeTargetRoot);
  createdFiles += runtimeResult.createdFiles;
  updatedFiles += runtimeResult.updatedFiles;
  unchangedFiles += runtimeResult.unchangedFiles;

  const skillResult = await copyDirectoryRecursive(path.join(packageRoot, "skills", "coai"), skillTargetRoot);
  createdFiles += skillResult.createdFiles;
  updatedFiles += skillResult.updatedFiles;
  unchangedFiles += skillResult.unchangedFiles;

  const manifestResult = await copyFileIfChanged(path.join(packageRoot, "package.json"), manifestTargetPath);
  createdFiles += manifestResult.createdFiles;
  updatedFiles += manifestResult.updatedFiles;
  unchangedFiles += manifestResult.unchangedFiles;

  return {
    createdFiles,
    updatedFiles,
    unchangedFiles
  };
}

async function copyDirectoryRecursive(sourceDir: string, targetDir: string): Promise<LocalRuntimeSyncResult> {
  const stat = await fs.stat(sourceDir);
  if (!stat.isDirectory()) {
    throw new Error(`Local runtime source directory is not valid: ${sourceDir}`);
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

    const fileResult = await copyFileIfChanged(sourcePath, targetPath);
    createdFiles += fileResult.createdFiles;
    updatedFiles += fileResult.updatedFiles;
    unchangedFiles += fileResult.unchangedFiles;
  }

  return { createdFiles, updatedFiles, unchangedFiles };
}

async function copyFileIfChanged(sourcePath: string, targetPath: string): Promise<LocalRuntimeSyncResult> {
  const sourceContent = await fs.readFile(sourcePath);
  const targetExists = await exists(targetPath);
  if (!targetExists) {
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, sourceContent);
    return { createdFiles: 1, updatedFiles: 0, unchangedFiles: 0 };
  }

  const targetContent = await fs.readFile(targetPath);
  if (sourceContent.equals(targetContent)) {
    return { createdFiles: 0, updatedFiles: 0, unchangedFiles: 1 };
  }

  await fs.writeFile(targetPath, sourceContent);
  return { createdFiles: 0, updatedFiles: 1, unchangedFiles: 0 };
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
