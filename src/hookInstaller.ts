import * as vscode from "vscode";
import {
  inspectPreCommitHook,
  installPreCommitHookCore,
  restoreBackupHookCore,
  uninstallPreCommitHookCore
} from "./core/hookInstallerCore";

// @coai anchor: plugin.cli.install-hook-command.001
export async function installGitHook(outputChannel: vscode.OutputChannel): Promise<void> {
  await runHookCommand(outputChannel, "Install pre-commit hook", async (workspaceRoot) => {
    const inspection = await inspectPreCommitHook(workspaceRoot);
    const action = describeHookInstallAction(inspection);
    outputChannel.appendLine(`[Hook] state=${inspection.state}, backup=${inspection.backupExists ? "yes" : "no"}`);
    const result = await installPreCommitHookCore(workspaceRoot, {
      appendLine: (line) => outputChannel.appendLine(line)
    });
    void vscode.window.showInformationMessage(`CoAI Navigation: ${action}${result.backupHookFileCreated ? "，并已备份旧 hook。" : "。"}`);
  });
}

// @coai anchor: plugin.cli.uninstall-hook-command.001
export async function uninstallGitHook(outputChannel: vscode.OutputChannel): Promise<void> {
  await runHookCommand(outputChannel, "Uninstall pre-commit hook", async (workspaceRoot) => {
    const result = await uninstallPreCommitHookCore(workspaceRoot, {
      appendLine: (line) => outputChannel.appendLine(line)
    });
    void vscode.window.showInformationMessage(
      result.uninstalled
        ? "CoAI Navigation: 已卸载本地 pre-commit hook。"
        : "CoAI Navigation: 当前没有可卸载的 CoAI hook。"
    );
  });
}

// @coai anchor: plugin.cli.restore-hook-command.001
export async function restoreGitHookBackup(outputChannel: vscode.OutputChannel): Promise<void> {
  await runHookCommand(outputChannel, "Restore pre-commit hook backup", async (workspaceRoot) => {
    await restoreBackupHookCore(workspaceRoot, {
      appendLine: (line) => outputChannel.appendLine(line)
    });
    void vscode.window.showInformationMessage("CoAI Navigation: 已从备份恢复 pre-commit hook。");
  });
}

async function runHookCommand(
  outputChannel: vscode.OutputChannel,
  title: string,
  task: (workspaceRoot: string) => Promise<void>
): Promise<void> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    void vscode.window.showWarningMessage("CoAI Navigation: 当前没有可用工作区。");
    return;
  }

  const workspaceRoot = workspaceFolder.uri.fsPath;
  try {
    outputChannel.clear();
    outputChannel.appendLine(`[CoAI] ${title}`);
    outputChannel.appendLine(`[CoAI] Workspace: ${workspaceRoot}`);
    await task(workspaceRoot);
    outputChannel.show(true);
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : `${title} failed.`;
    outputChannel.show(true);
    outputChannel.appendLine(`[Error] ${message}`);
    void vscode.window.showWarningMessage(`CoAI Navigation: ${message}`);
  }
}

function describeHookInstallAction(inspection: Awaited<ReturnType<typeof inspectPreCommitHook>>): string {
  if (inspection.state === "missing") {
    return "pre-commit hook 已安装";
  }

  if (inspection.state === "managed") {
    return "pre-commit hook 已更新";
  }

  return "pre-commit hook 已安装并覆盖旧 hook";
}
