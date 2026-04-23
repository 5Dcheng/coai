import * as vscode from "vscode";
import { refreshOpenBugDiagnostics } from "./bugLog";
import { syncMapperFromGitChanges } from "./gitSync";
import { installGitHook, restoreGitHookBackup, uninstallGitHook } from "./hookInstaller";
import { CoaiLinkProvider, openMappedCode } from "./navigation";
import { runPreCommitCoaiCheck } from "./preCommitCheck";
import { reopenResolvedBugLog, resolveOpenBugLog } from "./repair";

const outputChannel = vscode.window.createOutputChannel("CoAI Navigation");
const bugDiagnostics = vscode.languages.createDiagnosticCollection("coai-bugs");

// @coai anchor: plugin.extension-entry.activate.001
export function activate(context: vscode.ExtensionContext): void {
  const provider = new CoaiLinkProvider();
  context.subscriptions.push(
    outputChannel,
    bugDiagnostics,
    // @coai anchor: plugin.extension-entry.navigation-registration.001
    vscode.languages.registerHoverProvider({ language: "markdown" }, provider),
    vscode.languages.registerDocumentLinkProvider({ language: "markdown" }, provider),
    vscode.commands.registerCommand(
      "coaiNavigation.openMappedCode",
      async (args?: { token?: string; sourceUri?: vscode.Uri | string }) => {
        await openMappedCode(args?.token, args?.sourceUri, bugDiagnostics, outputChannel);
      }
    ),
    // @coai anchor: plugin.extension-entry.git-sync-command.001
    vscode.commands.registerCommand("coaiNavigation.syncMapperFromGitChanges", async () => {
      await syncMapperFromGitChanges(outputChannel, bugDiagnostics);
    }),
    // @coai anchor: plugin.extension-entry.pre-commit-command.001
    vscode.commands.registerCommand("coaiNavigation.runPreCommitCoaiCheck", async () => {
      await runPreCommitCoaiCheck(outputChannel, bugDiagnostics);
    }),
    // @coai anchor: plugin.extension-entry.install-hook-command.001
    vscode.commands.registerCommand("coaiNavigation.installGitHook", async () => {
      await installGitHook(outputChannel);
    }),
    // @coai anchor: plugin.extension-entry.uninstall-hook-command.001
    vscode.commands.registerCommand("coaiNavigation.uninstallGitHook", async () => {
      await uninstallGitHook(outputChannel);
    }),
    // @coai anchor: plugin.extension-entry.restore-hook-command.001
    vscode.commands.registerCommand("coaiNavigation.restoreGitHookBackup", async () => {
      await restoreGitHookBackup(outputChannel);
    }),
    // @coai anchor: plugin.extension-entry.bug-log-command.001
    vscode.commands.registerCommand("coaiNavigation.resolveOpenBugLog", async () => {
      await resolveOpenBugLog(outputChannel, bugDiagnostics);
    }),
    // @coai anchor: plugin.extension-entry.bug-reopen-command.001
    vscode.commands.registerCommand("coaiNavigation.reopenResolvedBugLog", async () => {
      await reopenResolvedBugLog(outputChannel, bugDiagnostics);
    })
  );

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (workspaceRoot) {
    // @coai anchor: plugin.bug-repair.problem-refresh-watch.001
    let refreshTimer: NodeJS.Timeout | undefined;
    const refreshDiagnostics = (): void => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
      refreshTimer = setTimeout(() => {
        refreshTimer = undefined;
        void refreshOpenBugDiagnostics(workspaceRoot, bugDiagnostics);
      }, 250);
    };

    void refreshOpenBugDiagnostics(workspaceRoot, bugDiagnostics);
    const bugWatcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(workspaceRoot, ".coai/log/bugs/**/*.json")
    );
    const refreshInterval = setInterval(refreshDiagnostics, 5000);
    context.subscriptions.push(
      bugWatcher,
      bugWatcher.onDidCreate(refreshDiagnostics),
      bugWatcher.onDidChange(refreshDiagnostics),
      bugWatcher.onDidDelete(refreshDiagnostics),
      new vscode.Disposable(() => {
        if (refreshTimer) {
          clearTimeout(refreshTimer);
        }
        clearInterval(refreshInterval);
      })
    );
  }
}

export function deactivate(): void {
  // No-op.
}
