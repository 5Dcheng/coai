import * as vscode from "vscode";
import { notifyBugRecorded, refreshOpenBugDiagnostics } from "./bugLog";
import {
  ensureGitWorkspace,
  runGitSyncCore,
  type SyncResult
} from "./core/gitSyncCore";

export { ensureGitWorkspace, type SyncResult } from "./core/gitSyncCore";

// @coai anchor: plugin.git-sync.command.001
export async function syncMapperFromGitChanges(
  outputChannel: vscode.OutputChannel,
  diagnostics: vscode.DiagnosticCollection
): Promise<SyncResult | undefined> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    void vscode.window.showWarningMessage("CoAI Navigation: 当前没有可用工作区。");
    return;
  }

  const workspaceRoot = workspaceFolder.uri.fsPath;
  try {
    const result = await runGitSyncCore(workspaceRoot, {
      clear: () => outputChannel.clear(),
      appendLine: (line) => outputChannel.appendLine(line),
      show: () => outputChannel.show(true)
    });

    await refreshOpenBugDiagnostics(workspaceRoot, diagnostics);

    if (result.recordedBugs.length > 0) {
      for (const bug of result.recordedBugs) {
        await notifyBugRecorded(bug);
      }
    } else if (result.openBugs.length > 0) {
      await showFirstOpenBugMessage(result.openBugs);
    }

    outputChannel.show(true);
    if (result.status === "no_changes") {
      void vscode.window.showInformationMessage("CoAI Navigation: 无可同步内容。");
    } else if (result.status === "no_mapper_match") {
      void vscode.window.showInformationMessage(
        `CoAI Navigation: 检测到 ${result.summary.changedFiles} 个变更文件，但没有命中 mapper。`
      );
    } else {
      void vscode.window.showInformationMessage(
        `CoAI Navigation: 已扫描 ${result.summary.changedFiles} 个变更文件，更新 ${result.summary.updatedEntries} 项，跳过 ${result.summary.skippedEntries} 项，失败 ${result.summary.failedEntries} 项。`
      );
    }

    return result;
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : "当前目录不是 git 工作区或 git 不可用。";
    outputChannel.clear();
    outputChannel.appendLine("[CoAI] Sync mapper from git changes");
    outputChannel.appendLine(`[CoAI] Workspace: ${workspaceRoot}`);
    outputChannel.appendLine(`[Error] ${message}`);
    outputChannel.show(true);
    void vscode.window.showWarningMessage(`CoAI Navigation: ${message}`);
    return;
  }
}

// @coai anchor: plugin.git-sync.open-bug-prompt.001
async function showFirstOpenBugMessage(
  bugs: Awaited<ReturnType<typeof refreshOpenBugDiagnostics>>
): Promise<void> {
  const firstBug = bugs[0];
  const action = await vscode.window.showWarningMessage(
    `CoAI Navigation: 当前存在 ${bugs.length} 个未处理 bug。`,
    "打开第一个 bug 日志"
  );
  if (action === "打开第一个 bug 日志") {
    const document = await vscode.workspace.openTextDocument(vscode.Uri.file(firstBug.bugFilePath));
    await vscode.window.showTextDocument(document, { preview: false });
  }
}
