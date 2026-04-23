import * as fs from "fs/promises";
import * as path from "path";
import { collectOpenBugContexts, type BugStatus } from "./bugStore";

export type ArchiveResolvedResult = {
  count: number;
  archivedBugFiles: string[];
  removedOpenBugFiles: string[];
};

// @coai anchor: plugin.bug-repair.archive-store.001
export async function archiveResolvedOpenBugs(
  workspaceRoot: string,
  appendLine?: (line: string) => void
): Promise<ArchiveResolvedResult> {
  const openBugs = await collectOpenBugContexts(workspaceRoot);
  const resolvedStatuses: BugStatus[] = ["fixed", "wont_fix", "obsolete"];
  let movedCount = 0;
  const archivedBugFiles: string[] = [];
  const removedOpenBugFiles: string[] = [];

  for (const bug of openBugs) {
    if (!resolvedStatuses.includes(bug.record.status)) {
      continue;
    }

    const resolvedDir = path.join(workspaceRoot, ".coai", "log", "bugs", "resolved");
    await fs.mkdir(resolvedDir, { recursive: true });
    const targetPath = path.join(resolvedDir, path.basename(bug.bugFilePath));
    await fs.rename(bug.bugFilePath, targetPath);
    removedOpenBugFiles.push(bug.bugFilePath);
    archivedBugFiles.push(targetPath);
    appendLine?.(
      `[Repair] ${bug.relativeBugFilePath} -> ${normalizePath(path.relative(workspaceRoot, targetPath))}`
    );
    movedCount += 1;
  }

  return {
    count: movedCount,
    archivedBugFiles,
    removedOpenBugFiles
  };
}

function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}
