import * as path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { collectOpenBugContexts } from "./bugStore";
import { runGitSyncCore, ensureGitWorkspace, type CoreReporter, type SyncResult } from "./gitSyncCore";

const execFileAsync = promisify(execFile);

export type PreCommitCheckResult = {
  status: "pass" | "pass_with_warnings";
  syncResult: SyncResult;
  openBugCount: number;
  stagedCanonicalizedCodeFiles: string[];
  stagedMapperFiles: string[];
  stagedBugFiles: string[];
  unstagedOpenBugFiles: string[];
};

// @coai anchor: plugin.cli.pre-commit-core.001
export async function runPreCommitCheckCore(
  workspaceRoot: string,
  reporter: CoreReporter
): Promise<PreCommitCheckResult> {
  reporter.appendLine("[CoAI] Run pre-commit CoAI check");
  await ensureGitWorkspace(workspaceRoot);

  const syncResult = await runGitSyncCore(workspaceRoot, {
    appendLine: (line) => reporter.appendLine(line)
  });
  const openBugs = await collectOpenBugContexts(workspaceRoot);
  const stagedCanonicalizedCodeFiles = await stageCanonicalizedCodeFiles(
    workspaceRoot,
    syncResult.normalizedCodeFiles,
    reporter
  );
  const stagedMapperFiles = await stageMapperFiles(workspaceRoot, syncResult.writtenMapperFiles, reporter);
  const stagedBugFiles = await stageBugFiles(
    workspaceRoot,
    [...syncResult.removedOpenBugFiles, ...syncResult.archivedBugFiles],
    reporter
  );
  const unstagedOpenBugFiles = await unstageOpenBugFiles(workspaceRoot, openBugs.map((bug) => bug.bugFilePath), reporter);

  if (openBugs.length > 0) {
    reporter.appendLine(`[PreCommit] pass with warnings: ${openBugs.length} open bugs kept in working tree`);
    return {
      status: "pass_with_warnings",
      syncResult,
      openBugCount: openBugs.length,
      stagedCanonicalizedCodeFiles,
      stagedMapperFiles,
      stagedBugFiles,
      unstagedOpenBugFiles
    };
  }

  reporter.appendLine("[PreCommit] pass");
  return {
    status: "pass",
    syncResult,
    openBugCount: 0,
    stagedCanonicalizedCodeFiles,
    stagedMapperFiles,
    stagedBugFiles,
    unstagedOpenBugFiles
  };
}

// @coai anchor: plugin.cli.stage-code-core.001
export async function stageCanonicalizedCodeFiles(
  workspaceRoot: string,
  codeFiles: string[],
  reporter: Pick<CoreReporter, "appendLine">
): Promise<string[]> {
  if (codeFiles.length === 0) {
    return [];
  }

  const relativeCodeFiles = dedupeNormalizedRelativePaths(workspaceRoot, codeFiles);
  await execFileAsync("git", ["add", "--", ...relativeCodeFiles], { cwd: workspaceRoot });
  reporter.appendLine(`[PreCommit] staged canonicalized code files (${relativeCodeFiles.length})`);
  for (const codeFile of relativeCodeFiles) {
    reporter.appendLine(`  - ${codeFile}`);
  }
  return relativeCodeFiles;
}

// @coai anchor: plugin.cli.stage-mapper-core.001
export async function stageMapperFiles(
  workspaceRoot: string,
  mapperFiles: string[],
  reporter: Pick<CoreReporter, "appendLine">
): Promise<string[]> {
  if (mapperFiles.length === 0) {
    return [];
  }

  const relativeMapperFiles = dedupeNormalizedRelativePaths(workspaceRoot, mapperFiles);
  await execFileAsync("git", ["add", "--", ...relativeMapperFiles], { cwd: workspaceRoot });
  reporter.appendLine(`[PreCommit] staged mapper files (${relativeMapperFiles.length})`);
  for (const mapperFile of relativeMapperFiles) {
    reporter.appendLine(`  - ${mapperFile}`);
  }
  return relativeMapperFiles;
}

// @coai anchor: plugin.cli.stage-bug-core.001
export async function stageBugFiles(
  workspaceRoot: string,
  bugFiles: string[],
  reporter: Pick<CoreReporter, "appendLine">
): Promise<string[]> {
  if (bugFiles.length === 0) {
    return [];
  }

  const relativeBugFiles = dedupeNormalizedRelativePaths(workspaceRoot, bugFiles);
  await execFileAsync("git", ["add", "-A", "--", ...relativeBugFiles], { cwd: workspaceRoot });
  reporter.appendLine(`[PreCommit] staged resolved bug archive changes (${relativeBugFiles.length})`);
  for (const bugFile of relativeBugFiles) {
    reporter.appendLine(`  - ${bugFile}`);
  }
  return relativeBugFiles;
}

// @coai anchor: plugin.cli.unstage-open-bug-core.001
export async function unstageOpenBugFiles(
  workspaceRoot: string,
  bugFiles: string[],
  reporter: Pick<CoreReporter, "appendLine">
): Promise<string[]> {
  if (bugFiles.length === 0) {
    return [];
  }

  const relativeBugFiles = dedupeNormalizedRelativePaths(workspaceRoot, bugFiles);
  const stagedFiles = await getStagedFiles(workspaceRoot);
  const stagedOpenBugFiles = relativeBugFiles.filter((filePath) => stagedFiles.has(filePath));
  if (stagedOpenBugFiles.length === 0) {
    reporter.appendLine("[PreCommit] open bug files kept in working tree (none staged)");
    return [];
  }

  if (await hasHeadCommit(workspaceRoot)) {
    await execFileAsync("git", ["restore", "--staged", "--", ...stagedOpenBugFiles], { cwd: workspaceRoot });
  } else {
    await execFileAsync("git", ["rm", "--cached", "--quiet", "--ignore-unmatch", "--", ...stagedOpenBugFiles], {
      cwd: workspaceRoot
    });
  }
  reporter.appendLine(`[PreCommit] unstaged open bug files (${stagedOpenBugFiles.length})`);
  for (const bugFile of stagedOpenBugFiles) {
    reporter.appendLine(`  - ${bugFile}`);
  }
  return stagedOpenBugFiles;
}

async function getStagedFiles(workspaceRoot: string): Promise<Set<string>> {
  const { stdout } = await execFileAsync("git", ["-c", "core.quotepath=false", "diff", "--name-only", "--cached", "-z"], {
    cwd: workspaceRoot
  });
  return new Set(stdout.split("\0").filter(Boolean).map(normalizePath));
}

async function hasHeadCommit(workspaceRoot: string): Promise<boolean> {
  try {
    await execFileAsync("git", ["rev-parse", "--verify", "HEAD"], { cwd: workspaceRoot });
    return true;
  } catch {
    return false;
  }
}

function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}

function dedupeNormalizedRelativePaths(workspaceRoot: string, filePaths: Array<string | undefined | null>): string[] {
  return [
    ...new Set(
      filePaths
        .filter((filePath): filePath is string => typeof filePath === "string" && filePath.length > 0)
        .map((filePath) => normalizePath(path.relative(workspaceRoot, filePath)))
    )
  ];
}
