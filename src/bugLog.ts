import * as vscode from "vscode";
export {
  collectOpenBugContexts,
  findBlockingBugForCodeFile,
  writeOpenBugRecord,
  type BugRecord,
  type BugStatus,
  type BugType,
  type OpenBugContext
} from "./core/bugStore";
import { collectOpenBugContexts, type OpenBugContext } from "./core/bugStore";

// @coai anchor: plugin.bug-repair.problems-panel.001
export async function refreshOpenBugDiagnostics(
  workspaceRoot: string,
  diagnostics: vscode.DiagnosticCollection
): Promise<OpenBugContext[]> {
  diagnostics.clear();
  const bugs = await collectOpenBugContexts(workspaceRoot);
  const byFile = new Map<string, vscode.Diagnostic[]>();

  for (const bug of bugs) {
    const bugUri = vscode.Uri.file(bug.bugFilePath);
    const segments = [bug.record.type, bug.record.token];
    if (bug.record.anchor) {
      segments.push(bug.record.anchor);
    }
    const message = `CoAI unresolved bug: ${segments.join(" | ")}`;
    const diagnostic = new vscode.Diagnostic(
      new vscode.Range(0, 0, 0, 1),
      message,
      vscode.DiagnosticSeverity.Warning
    );
    diagnostic.source = "CoAI Navigation";
    const list = byFile.get(bugUri.fsPath) ?? [];
    list.push(diagnostic);
    byFile.set(bugUri.fsPath, list);
  }

  for (const [filePath, fileDiagnostics] of byFile) {
    diagnostics.set(vscode.Uri.file(filePath), fileDiagnostics);
  }

  return bugs;
}

// @coai anchor: plugin.bug-repair.prompt-open.001
export async function notifyBugRecorded(context: OpenBugContext): Promise<void> {
  const action = await vscode.window.showWarningMessage(
    `CoAI Navigation: 检测到 ${context.record.type}，已生成 bug 日志。`,
    "打开 bug 日志"
  );
  if (action === "打开 bug 日志") {
    const document = await vscode.workspace.openTextDocument(vscode.Uri.file(context.bugFilePath));
    await vscode.window.showTextDocument(document, { preview: false });
  }
}
