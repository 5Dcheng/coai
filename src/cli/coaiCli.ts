#!/usr/bin/env node
import * as path from "path";
import { initCoaiWorkspaceCore } from "../core/initCore";
import { installPreCommitHookCore } from "../core/hookInstallerCore";
import { restoreBackupHookCore, uninstallPreCommitHookCore } from "../core/hookInstallerCore";
import { runAnchorDoctor } from "../core/anchorCore";
import { runPreCommitCheckCore } from "../core/preCommitCore";
import { syncCoaiSkillCore } from "../core/skillSyncCore";
import { checkCoaiPackageUpdate, getCoaiVersionInfo, updateCoaiWorkspaceCore } from "../core/updateCore";

type CliCommand =
  | "init"
  | "version"
  | "check-update"
  | "update"
  | "doctor"
  | "pre-commit-check"
  | "install-hook"
  | "install-hooks"
  | "uninstall-hook"
  | "restore-hook"
  | "skill-sync"
  | "coai-sync";

// @coai anchor: plugin.cli.entry.001
async function main(): Promise<void> {
  const parsed = parseCommand(process.argv.slice(2));
  const command = parsed.command;
  const args = parsed.args;
  const workspaceRoot = process.cwd();
  const initOptions = {
    noPackageJson: args.includes("--no-package-json")
  };
  const skillSyncOptions = {
    workspaceRoot,
    targetDir: readFlagValue(args, "--target"),
    sourceDir: readFlagValue(args, "--source-dir"),
    devMode: args.includes("--dev")
  };
  const commands = [
    "init",
    "version",
    "check-update",
    "update",
    "doctor",
    "pre-commit-check",
    "install-hook",
    "install-hooks",
    "uninstall-hook",
    "restore-hook",
    "skill-sync",
    "coai-sync"
  ];
  if (!command || command === "--help" || command === "-h") {
    printUsage();
    process.exitCode = 0;
    return;
  }

  if (!commands.includes(command)) {
    printUsage();
    console.error(`[CoAI CLI] Unknown command: ${command}`);
    process.exitCode = 1;
    return;
  }
  const cliCommand = command as CliCommand;

  const reporter = {
    appendLine: (line: string) => console.log(line),
    clear: () => undefined,
    show: () => undefined
  };

  try {
    if (cliCommand === "init") {
      // @coai anchor: plugin.cli.init-entry.001
      await initCoaiWorkspaceCore(workspaceRoot, getPackageRoot(), reporter, initOptions);
      process.exitCode = 0;
      return;
    }

    if (cliCommand === "version") {
      // @coai anchor: plugin.cli.version-entry.001
      const versionInfo = await getCoaiVersionInfo(workspaceRoot, getPackageRoot());
      reporter.appendLine(`CoAI package: ${versionInfo.packageName}@${versionInfo.packageVersion}`);
      reporter.appendLine(`CoAI workspace assets: ${versionInfo.workspaceAssetsVersion ?? "not initialized"}`);
      reporter.appendLine(`VS Code extension compatibility: ${versionInfo.vscodeExtensionVersionHint ?? "unknown"}`);
      reporter.appendLine("[Version] Next suggested actions:");
      reporter.appendLine("  - Sync workspace system assets: npx coai update");
      reporter.appendLine("  - Sync local Codex skill: npx coai skill sync");
      process.exitCode = 0;
      return;
    }

    if (cliCommand === "check-update") {
      // @coai anchor: plugin.cli.check-update-entry.001
      const result = await checkCoaiPackageUpdate(getPackageRoot());
      if (result.error) {
        reporter.appendLine(`[Update] Unable to check npm registry for ${result.packageName}: ${result.error}`);
        reporter.appendLine("[Update] Registry check was skipped or unavailable. You can still run:");
        reporter.appendLine("  - npx coai update");
        reporter.appendLine("  - npx coai skill sync");
        process.exitCode = 0;
        return;
      }
      if (result.updateAvailable && result.latestVersion) {
        reporter.appendLine(`CoAI update available: ${result.currentVersion} -> ${result.latestVersion}`);
        reporter.appendLine(`Run: npm install -D ${result.packageName}@latest`);
        reporter.appendLine("Then run:");
        reporter.appendLine("  - npx coai update");
        reporter.appendLine("  - npx coai skill sync");
        process.exitCode = 0;
        return;
      }
      reporter.appendLine(`CoAI package is up to date: ${result.packageName}@${result.currentVersion}`);
      reporter.appendLine("[Update] No package upgrade needed. If you want to refresh local state, run:");
      reporter.appendLine("  - npx coai update");
      reporter.appendLine("  - npx coai skill sync");
      process.exitCode = 0;
      return;
    }

    if (cliCommand === "update") {
      // @coai anchor: plugin.cli.update-entry.001
      await updateCoaiWorkspaceCore(workspaceRoot, getPackageRoot(), reporter);
      process.exitCode = 0;
      return;
    }

    if (cliCommand === "doctor") {
      // @coai anchor: plugin.cli.doctor-entry.001
      const result = await runAnchorDoctor(workspaceRoot, reporter, "fix");
      if (result.detectedIssues === 0) {
        reporter.appendLine("[Doctor] no anchor format issues found");
      } else {
        reporter.appendLine(`[Doctor] fixed ${result.fixedIssues} issues in ${result.touchedFiles} files`);
      }
      process.exitCode = 0;
      return;
    }

    if (cliCommand === "install-hook" || cliCommand === "install-hooks") {
      // @coai anchor: plugin.cli.install-hook-entry.001
      await installPreCommitHookCore(workspaceRoot, reporter);
      process.exitCode = 0;
      return;
    }

    if (cliCommand === "uninstall-hook") {
      // @coai anchor: plugin.cli.uninstall-hook-entry.001
      const result = await uninstallPreCommitHookCore(workspaceRoot, reporter);
      process.exitCode = result.uninstalled ? 0 : 1;
      return;
    }

    if (cliCommand === "restore-hook") {
      // @coai anchor: plugin.cli.restore-hook-entry.001
      await restoreBackupHookCore(workspaceRoot, reporter);
      process.exitCode = 0;
      return;
    }

    if (cliCommand === "skill-sync") {
      // @coai anchor: plugin.cli.skill-sync-entry.001
      await syncCoaiSkillCore(getPackageRoot(), reporter, skillSyncOptions);
      process.exitCode = 0;
      return;
    }

    if (cliCommand === "coai-sync") {
      // @coai anchor: plugin.cli.workspace-sync-entry.001
      await updateCoaiWorkspaceCore(workspaceRoot, getPackageRoot(), reporter);
      process.exitCode = 0;
      return;
    }

    await runPreCommitCheckCore(workspaceRoot, reporter);
    process.exitCode = 0;
  } catch (error) {
    console.error(`[CoAI CLI] ${error instanceof Error ? error.message : "Unknown error"}`);
    process.exitCode = cliCommand === "pre-commit-check" ? 0 : 1;
  }
}

function printUsage(): void {
  console.log(
    "Usage: coai <init|version|check-update|update|doctor|pre-commit-check|install-hook|install-hooks|uninstall-hook|restore-hook|skill sync|coai sync> [--no-package-json] [--target <dir>] [--dev] [--source-dir <dir>]"
  );
}

function getPackageRoot(): string {
  return path.resolve(__dirname, "..", "..");
}

function parseCommand(argv: string[]): { command?: CliCommand | "--help" | "-h"; args: string[] } {
  const [first, second, ...rest] = argv;
  if (!first) {
    return { command: undefined, args: [] };
  }

  if (first === "--help" || first === "-h") {
    return { command: first, args: rest };
  }

  if (first === "skill" && second === "sync") {
    return { command: "skill-sync", args: rest };
  }

  if (first === "coai" && second === "sync") {
    return { command: "coai-sync", args: rest };
  }

  return { command: first as CliCommand, args: [second, ...rest].filter((value) => value !== undefined) };
}

function readFlagValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1 || index + 1 >= args.length) {
    return undefined;
  }
  return args[index + 1];
}

void main();
