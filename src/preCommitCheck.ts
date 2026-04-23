import * as vscode from "vscode";
import { refreshOpenBugDiagnostics } from "./bugLog";
import { runPreCommitCheckCore } from "./core/preCommitCore";

// @coai anchor: plugin.git-sync.pre-commit-command.001
export async function runPreCommitCoaiCheck(
  outputChannel: vscode.OutputChannel,
  diagnostics: vscode.DiagnosticCollection
): Promise<void> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    void vscode.window.showWarningMessage("CoAI Navigation: 当前没有可用工作区。");
    return;
  }

  const workspaceRoot = workspaceFolder.uri.fsPath;
  try {
    const result = await runPreCommitCheckCore(workspaceRoot, {
      appendLine: (line) => outputChannel.appendLine(line),
      clear: () => outputChannel.clear(),
      show: () => outputChannel.show(true)
    });

    await refreshOpenBugDiagnostics(workspaceRoot, diagnostics);
    outputChannel.show(true);

    if (result.status === "pass_with_warnings") {
      // @coai anchor: plugin.git-sync.pre-commit-open-bugs.001
      const action = await vscode.window.showWarningMessage(
        `CoAI Navigation: 提交前检查发现 ${result.openBugCount} 个未处理 CoAI bug；这些 bug 不会阻止提交，open bug 文件会留在修改区。`,
        "打开第一个 bug 日志"
      );
      if (action === "打开第一个 bug 日志") {
        const firstBug = result.syncResult.openBugs[0];
        const document = await vscode.workspace.openTextDocument(vscode.Uri.file(firstBug.bugFilePath));
        await vscode.window.showTextDocument(document, { preview: false });
      }
      return;
    }

    if (result.stagedMapperFiles.length > 0) {
      // @coai anchor: plugin.git-sync.pre-commit-stage-mapper.001
      outputChannel.appendLine(`[PreCommit] staged mapper files confirmed (${result.stagedMapperFiles.length})`);
    }
    if (result.stagedBugFiles.length > 0) {
      // @coai anchor: plugin.git-sync.pre-commit-stage-bug.001
      outputChannel.appendLine(`[PreCommit] staged resolved bug files confirmed (${result.stagedBugFiles.length})`);
    }
    if (result.unstagedOpenBugFiles.length > 0) {
      // @coai anchor: plugin.git-sync.pre-commit-unstage-open-bug.001
      outputChannel.appendLine(`[PreCommit] open bug files kept unstaged (${result.unstagedOpenBugFiles.length})`);
    }

    // @coai anchor: plugin.git-sync.pre-commit-pass.001
    void vscode.window.showInformationMessage("CoAI Navigation: 提交前检查通过，可继续提交。");
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : "当前目录不是 git 工作区或 git 不可用。";
    outputChannel.clear();
    outputChannel.appendLine("[CoAI] Run pre-commit CoAI check");
    outputChannel.appendLine(`[Error] ${message}`);
    outputChannel.show(true);
    void vscode.window.showWarningMessage(`CoAI Navigation: ${message}`);
  }
}
