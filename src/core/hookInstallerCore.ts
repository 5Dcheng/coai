import * as fs from "fs/promises";
import * as path from "path";
import { ensureGitWorkspace, type CoreReporter } from "./gitSyncCore";

export type HookState = "missing" | "managed" | "foreign";

export type HookPaths = {
  sourceHookFile: string;
  targetHookFile: string;
  backupHookFile: string;
};

export type HookInspection = HookPaths & {
  state: HookState;
  targetExists: boolean;
  backupExists: boolean;
  targetContent?: string;
  sourceContent: string;
  backupContent?: string;
};

export type HookInstallResult = HookInspection & {
  installed: boolean;
  backupHookFileCreated?: string;
};

export type HookUninstallResult = HookInspection & {
  uninstalled: boolean;
};

export type HookRestoreResult = HookInspection & {
  restored: boolean;
  backupHookFileUsed: string;
};

// @coai anchor: plugin.cli.inspect-hook-core.001
export async function inspectPreCommitHook(workspaceRoot: string): Promise<HookInspection> {
  await ensureGitWorkspace(workspaceRoot);

  const paths = getHookPaths(workspaceRoot);
  const sourceContent = await fs.readFile(paths.sourceHookFile, "utf8");
  const targetContent = await readFileIfExists(paths.targetHookFile);
  const backupContent = await readFileIfExists(paths.backupHookFile);
  const targetExists = targetContent !== undefined;
  const backupExists = backupContent !== undefined;

  let state: HookState = "missing";
  if (targetExists) {
    state = isCoaiManagedHook(targetContent) || targetContent === sourceContent ? "managed" : "foreign";
  }

  return {
    ...paths,
    state,
    targetExists,
    backupExists,
    targetContent,
    sourceContent,
    backupContent
  };
}

// @coai anchor: plugin.cli.install-hook-core.001
export async function installPreCommitHookCore(
  workspaceRoot: string,
  reporter: Pick<CoreReporter, "appendLine">
): Promise<HookInstallResult> {
  const inspection = await inspectPreCommitHook(workspaceRoot);
  await fs.mkdir(path.dirname(inspection.targetHookFile), { recursive: true });

  if (inspection.state === "managed" && inspection.targetContent === inspection.sourceContent) {
    reporter.appendLine("[Hook] already installed -> .git/hooks/pre-commit");
    return {
      ...inspection,
      installed: false
    };
  }

  let backupHookFileCreated: string | undefined;
  if (inspection.state === "foreign" && inspection.targetContent) {
    backupHookFileCreated = await backupForeignHook(workspaceRoot, inspection, reporter);
  }

  await fs.writeFile(inspection.targetHookFile, inspection.sourceContent, "utf8");
  await ensureExecutable(inspection.targetHookFile);
  reporter.appendLine(`[Hook] installed -> ${normalizePath(path.relative(workspaceRoot, inspection.targetHookFile))}`);

  return {
    ...(await inspectPreCommitHook(workspaceRoot)),
    installed: true,
    backupHookFileCreated
  };
}

// @coai anchor: plugin.cli.uninstall-hook-core.001
export async function uninstallPreCommitHookCore(
  workspaceRoot: string,
  reporter: Pick<CoreReporter, "appendLine">
): Promise<HookUninstallResult> {
  const inspection = await inspectPreCommitHook(workspaceRoot);
  if (!inspection.targetExists) {
    reporter.appendLine("[Hook] no local pre-commit hook to uninstall");
    return {
      ...inspection,
      uninstalled: false
    };
  }

  if (inspection.state !== "managed") {
    throw new Error("当前 pre-commit hook 不是 CoAI 管理版本，拒绝直接卸载。");
  }

  await fs.rm(inspection.targetHookFile, { force: true });
  reporter.appendLine(`[Hook] uninstalled -> ${normalizePath(path.relative(workspaceRoot, inspection.targetHookFile))}`);
  return {
    ...(await inspectPreCommitHook(workspaceRoot)),
    uninstalled: true
  };
}

// @coai anchor: plugin.cli.restore-hook-core.001
export async function restoreBackupHookCore(
  workspaceRoot: string,
  reporter: Pick<CoreReporter, "appendLine">
): Promise<HookRestoreResult> {
  const inspection = await inspectPreCommitHook(workspaceRoot);
  if (!inspection.backupExists || !inspection.backupContent) {
    throw new Error("当前没有可恢复的 pre-commit hook 备份。");
  }

  if (inspection.state === "foreign") {
    throw new Error("当前 pre-commit hook 不是 CoAI 管理版本，拒绝直接用备份覆盖。");
  }

  await fs.writeFile(inspection.targetHookFile, inspection.backupContent, "utf8");
  await ensureExecutable(inspection.targetHookFile);
  reporter.appendLine(`[Hook] restored from backup -> ${normalizePath(path.relative(workspaceRoot, inspection.backupHookFile))}`);

  return {
    ...(await inspectPreCommitHook(workspaceRoot)),
    restored: true,
    backupHookFileUsed: inspection.backupHookFile
  };
}

async function backupForeignHook(
  workspaceRoot: string,
  inspection: HookInspection,
  reporter: Pick<CoreReporter, "appendLine">
): Promise<string> {
  const preferredBackup = inspection.backupHookFile;
  const preferredContent = await readFileIfExists(preferredBackup);
  if (!preferredContent) {
    await fs.copyFile(inspection.targetHookFile, preferredBackup);
    reporter.appendLine(`[Hook] backup created -> ${normalizePath(path.relative(workspaceRoot, preferredBackup))}`);
    return preferredBackup;
  }

  if (preferredContent === inspection.targetContent) {
    reporter.appendLine(`[Hook] backup already matches current foreign hook -> ${normalizePath(path.relative(workspaceRoot, preferredBackup))}`);
    return preferredBackup;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const conflictBackup = `${preferredBackup}.${timestamp}`;
  await fs.copyFile(inspection.targetHookFile, conflictBackup);
  reporter.appendLine(`[Hook] conflict backup created -> ${normalizePath(path.relative(workspaceRoot, conflictBackup))}`);
  return conflictBackup;
}

function getHookPaths(workspaceRoot: string): HookPaths {
  return {
    sourceHookFile: path.join(workspaceRoot, ".coai", "coai", "githooks", "pre-commit"),
    targetHookFile: path.join(workspaceRoot, ".git", "hooks", "pre-commit"),
    backupHookFile: path.join(workspaceRoot, ".git", "hooks", "pre-commit.coai.backup")
  };
}

async function readFileIfExists(filePath: string): Promise<string | undefined> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return undefined;
  }
}

async function ensureExecutable(filePath: string): Promise<void> {
  try {
    await fs.chmod(filePath, 0o755);
  } catch {
    // Best effort only, especially on Windows.
  }
}

function isCoaiManagedHook(content: string): boolean {
  return (
    content.includes("CoAI managed pre-commit hook") ||
    content.includes("CoAI pre-commit check blocked this commit.")
  );
}

function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}
