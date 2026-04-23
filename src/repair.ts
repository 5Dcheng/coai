import * as fs from "fs/promises";
import * as path from "path";
import * as vscode from "vscode";
import { refreshOpenBugDiagnostics } from "./bugLog";
import {
  collectOpenBugContexts,
  collectResolvedBugFiles,
  readJsonFile,
  type BugRecord,
  type BugStatus
} from "./core/bugStore";
import { archiveResolvedOpenBugs as archiveResolvedOpenBugsCore } from "./core/repairStore";

// @coai anchor: plugin.bug-repair.archive-resolved.001
export async function archiveResolvedOpenBugs(
  workspaceRoot: string,
  outputChannel: vscode.OutputChannel
): Promise<number> {
  const result = await archiveResolvedOpenBugsCore(workspaceRoot, (line) => outputChannel.appendLine(line));
  return result.count;
}

// @coai anchor: plugin.bug-repair.resolve-command.001
export async function resolveOpenBugLog(
  outputChannel: vscode.OutputChannel,
  diagnostics: vscode.DiagnosticCollection
): Promise<void> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    void vscode.window.showWarningMessage("CoAI Navigation: 当前没有可用工作区。");
    return;
  }

  const workspaceRoot = workspaceFolder.uri.fsPath;
  const openBugs = await collectOpenBugContexts(workspaceRoot);
  if (openBugs.length === 0) {
    void vscode.window.showInformationMessage("CoAI Navigation: 当前没有 open bug 记录。");
    return;
  }

  const selectedBug = await vscode.window.showQuickPick(
    openBugs.map((bug) => ({
      label: `${bug.record.type} :: ${bug.record.anchor}`,
      description: bug.relativeBugFilePath,
      detail: `${bug.record.token} | ${bug.record.mapperFile}`,
      bug
    })),
    { placeHolder: "选择要处理的 CoAI bug" }
  );
  if (!selectedBug) {
    return;
  }

  const statusChoice = await vscode.window.showQuickPick(
    [
      { label: "fixed", detail: "已修复" },
      { label: "wont_fix", detail: "明确不修复" },
      { label: "obsolete", detail: "问题已失效" }
    ],
    { placeHolder: "选择 bug 的处理结果" }
  );
  if (!statusChoice) {
    return;
  }

  const summary =
    (await vscode.window.showInputBox({
      prompt: "输入本次处理说明",
      placeHolder: "例如：已补 anchor 并重新执行 git-sync"
    })) ?? "";

  selectedBug.bug.record.status = statusChoice.label as BugStatus;
  selectedBug.bug.record.resolution = {
    resolvedAt: new Date().toISOString(),
    action: statusChoice.label,
    summary: summary || null
  };
  await fs.writeFile(selectedBug.bug.bugFilePath, `${JSON.stringify(selectedBug.bug.record, null, 2)}\n`, "utf8");
  await archiveResolvedOpenBugs(workspaceRoot, outputChannel);
  await refreshOpenBugDiagnostics(workspaceRoot, diagnostics);
  outputChannel.show(true);
  void vscode.window.showInformationMessage(`CoAI Navigation: 已将 bug 标记为 ${statusChoice.label}。`);
}

// @coai anchor: plugin.bug-repair.reopen-command.001
export async function reopenResolvedBugLog(
  outputChannel: vscode.OutputChannel,
  diagnostics: vscode.DiagnosticCollection
): Promise<void> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    void vscode.window.showWarningMessage("CoAI Navigation: 当前没有可用工作区。");
    return;
  }

  const workspaceRoot = workspaceFolder.uri.fsPath;
  const resolvedDir = path.join(workspaceRoot, ".coai", "log", "bugs", "resolved");
  const resolvedBugFiles = await collectResolvedBugFiles(resolvedDir);
  if (resolvedBugFiles.length === 0) {
    void vscode.window.showInformationMessage("CoAI Navigation: 当前没有 resolved bug 记录。");
    return;
  }

  const resolvedBugs = await Promise.all(
    resolvedBugFiles.map(async (bugFilePath) => ({
      bugFilePath,
      relativeBugFilePath: normalizePath(path.relative(workspaceRoot, bugFilePath)),
      record: await readJsonFile<BugRecord>(bugFilePath)
    }))
  );

  const availableBugs = resolvedBugs.filter((bug): bug is { bugFilePath: string; relativeBugFilePath: string; record: BugRecord } => Boolean(bug.record));
  if (availableBugs.length === 0) {
    void vscode.window.showInformationMessage("CoAI Navigation: resolved bug 文件不可读取。");
    return;
  }

  const selectedBug = await vscode.window.showQuickPick(
    availableBugs.map((bug) => ({
      label: `${bug.record.type} :: ${bug.record.anchor}`,
      description: bug.relativeBugFilePath,
      detail: `${bug.record.status} | ${bug.record.token} | ${bug.record.mapperFile}`,
      bug
    })),
    { placeHolder: "选择要 reopen 的 resolved bug" }
  );
  if (!selectedBug) {
    return;
  }

  const reopenReason =
    (await vscode.window.showInputBox({
      prompt: "输入 reopen 原因",
      placeHolder: "例如：修复后再次复现，需重新进入 open 流程"
    })) ?? "";

  selectedBug.bug.record.status = "open";
  selectedBug.bug.record.resolution = {
    resolvedAt: null,
    action: "reopened",
    summary: reopenReason || "Bug reopened from resolved."
  };

  const openDir = path.join(workspaceRoot, ".coai", "log", "bugs", "open");
  await fs.mkdir(openDir, { recursive: true });
  const targetPath = path.join(openDir, path.basename(selectedBug.bug.bugFilePath));
  await fs.writeFile(targetPath, `${JSON.stringify(selectedBug.bug.record, null, 2)}\n`, "utf8");
  await fs.rm(selectedBug.bug.bugFilePath, { force: true });
  await refreshOpenBugDiagnostics(workspaceRoot, diagnostics);

  outputChannel.appendLine(
    `[Repair] ${selectedBug.bug.relativeBugFilePath} -> ${normalizePath(path.relative(workspaceRoot, targetPath))} (reopened)`
  );
  outputChannel.show(true);
  void vscode.window.showInformationMessage("CoAI Navigation: 已将 bug reopen 到 open。");
}
function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}
