import * as fs from "fs/promises";
import * as path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import {
  collectOpenBugContexts,
  findBlockingBugForCodeFile,
  readJsonFile,
  writeOpenBugRecord,
  type OpenBugContext
} from "./bugStore";
import { findAnchorLineNumbers, runAnchorDoctorOnFiles } from "./anchorCore";
import { archiveResolvedOpenBugs } from "./repairStore";

const execFileAsync = promisify(execFile);
const IGNORED_CHANGED_PATH_PREFIXES = ["node_modules/", ".git/"];

type MapperNode = {
  anchor?: string;
  file?: string;
  line?: number;
  lastUpdated?: string;
};

type MapperFile = {
  nodes?: Record<string, MapperNode>;
};

type MapperEntryRecord = {
  token: string;
  mapperFilePath: string;
  entry: MapperNode;
};

type AnchorScanResult =
  | { status: "found"; line: number }
  | { status: "missing" }
  | { status: "duplicate"; lines: number[] };

export type SyncSummary = {
  changedFiles: number;
  matchedFiles: number;
  updatedEntries: number;
  skippedEntries: number;
  failedEntries: number;
};

export type SyncResult = {
  status: "no_changes" | "no_mapper_match" | "completed";
  summary: SyncSummary;
  writtenMapperFiles: string[];
  normalizedCodeFiles: string[];
  archivedBugFiles: string[];
  removedOpenBugFiles: string[];
  openBugs: OpenBugContext[];
  recordedBugs: OpenBugContext[];
};

export type CoreReporter = {
  clear?: () => void;
  appendLine: (line: string) => void;
  show?: () => void;
};

// @coai anchor: plugin.git-sync.core-command.001
export async function runGitSyncCore(
  workspaceRoot: string,
  reporter: CoreReporter
): Promise<SyncResult> {
  reporter.clear?.();
  reporter.appendLine("[CoAI] Sync mapper from git changes");
  reporter.appendLine(`[CoAI] Workspace: ${workspaceRoot}`);

  await ensureGitWorkspace(workspaceRoot);

  const archiveResult = await archiveResolvedOpenBugs(workspaceRoot, (line) => reporter.appendLine(line));
  if (archiveResult.count > 0) {
    reporter.appendLine(`[Repair] archived=${archiveResult.count}`);
  }

  let openBugs = await collectOpenBugContexts(workspaceRoot);
  if (openBugs.length > 0) {
    reporter.appendLine(`[CoAI] Open bugs (${openBugs.length}):`);
    for (const bug of openBugs) {
      reporter.appendLine(`  - ${bug.relativeBugFilePath} -> ${bug.record.type} (${bug.record.anchor})`);
    }
  }

  const changedFiles = await getChangedGitFiles(workspaceRoot);
  if (changedFiles.length === 0) {
    reporter.appendLine("[CoAI] No changed files detected.");
    return {
      status: "no_changes",
      summary: {
        changedFiles: 0,
        matchedFiles: 0,
        updatedEntries: 0,
        skippedEntries: 0,
        failedEntries: 0
      },
      writtenMapperFiles: [],
      normalizedCodeFiles: [],
      archivedBugFiles: archiveResult.archivedBugFiles,
      removedOpenBugFiles: archiveResult.removedOpenBugFiles,
      openBugs,
      recordedBugs: []
    };
  }

  reporter.appendLine(`[CoAI] Changed files (${changedFiles.length}):`);
  for (const changedFile of changedFiles) {
    reporter.appendLine(`  - ${changedFile}`);
  }

  const anchorDoctorResult = await runAnchorDoctorOnFiles({
    workspaceRoot,
    relativeFilePaths: changedFiles,
    reporter,
    mode: "fix",
    logPrefix: "[CoAI]"
  });
  const normalizedCodeFiles = anchorDoctorResult.issues.map((issue) => issue.filePath);
  if (anchorDoctorResult.fixedIssues > 0) {
    reporter.appendLine("[CoAI] Re-run git sync after anchor normalization");
  }

  const recordedBugs: OpenBugContext[] = [];
  const mapperIndex = await buildMapperReverseIndex(workspaceRoot, reporter, recordedBugs);
  openBugs = await collectOpenBugContexts(workspaceRoot);

  const matchedEntriesByFile = new Map<string, MapperEntryRecord[]>();
  for (const changedFile of changedFiles) {
    const normalized = normalizePath(changedFile);
    const entries = mapperIndex.get(normalized);
    if (entries && entries.length > 0) {
      matchedEntriesByFile.set(normalized, entries);
    }
  }

  const summary: SyncSummary = {
    changedFiles: changedFiles.length,
    matchedFiles: matchedEntriesByFile.size,
    updatedEntries: 0,
    skippedEntries: 0,
    failedEntries: 0
  };

  if (matchedEntriesByFile.size === 0) {
    // @coai anchor: plugin.git-sync.branch.no-mapper-match.001
    reporter.appendLine("[CoAI] No mapper entries matched the changed files.");
    return {
      status: "no_mapper_match",
      summary,
      writtenMapperFiles: [],
      normalizedCodeFiles,
      archivedBugFiles: archiveResult.archivedBugFiles,
      removedOpenBugFiles: archiveResult.removedOpenBugFiles,
      openBugs,
      recordedBugs
    };
  }

  reporter.appendLine(`[CoAI] Matched files (${matchedEntriesByFile.size}):`);
  for (const [filePath] of matchedEntriesByFile) {
    reporter.appendLine(`  - ${filePath}`);
  }

  const mapperUpdates = new Map<string, MapperFile>();
  const writtenMapperFiles: string[] = [];
  const today = new Date().toISOString().slice(0, 10);

  // @coai anchor: plugin.git-sync.core-scan-files.001
  for (const [codeFile, entries] of matchedEntriesByFile) {
    const blockingBug = findBlockingBugForCodeFile(openBugs, codeFile);
    if (blockingBug) {
      // @coai anchor: plugin.git-sync.branch.freeze-on-open-bug.001
      reporter.appendLine(
        `[Freeze] ${codeFile} -> blocked by ${blockingBug.record.type} (${blockingBug.relativeBugFilePath})`
      );
      summary.skippedEntries += entries.length;
      continue;
    }

    const codeFilePath = path.resolve(workspaceRoot, codeFile);
    let text: string;
    try {
      text = await fs.readFile(codeFilePath, "utf8");
    } catch {
      reporter.appendLine(`[Fail] ${codeFile} -> file not found`);
      summary.failedEntries += entries.length;
      continue;
    }

    reporter.appendLine(`[CoAI] Scanning ${codeFile}`);
    for (const record of entries) {
      const anchorResult = findAnchorLinesInText(text, record.entry.anchor);
      if (anchorResult.status === "missing") {
        // @coai anchor: plugin.git-sync.exception.missing-anchor.001
        reporter.appendLine(`[Fail] ${record.token} (${record.entry.anchor ?? "no-anchor"}) -> anchor missing`);
        const bug = await writeOpenBugRecord({
          workspaceRoot,
          type: "missing-anchor",
          message: "Anchor not found during git sync.",
          mapperFilePath: record.mapperFilePath,
          token: record.token,
          anchor: record.entry.anchor ?? "missing-anchor-id",
          codeFile
        });
        reporter.appendLine(`[Bug] ${bug.relativeBugFilePath}`);
        recordedBugs.push(bug);
        summary.failedEntries += 1;
        continue;
      }

      if (anchorResult.status === "duplicate") {
        // @coai anchor: plugin.git-sync.exception.duplicate-anchor.001
        reporter.appendLine(
          `[Fail] ${record.token} (${record.entry.anchor ?? "no-anchor"}) -> duplicate anchors at ${anchorResult.lines.join(", ")}`
        );
        const bug = await writeOpenBugRecord({
          workspaceRoot,
          type: "duplicate-anchor",
          message: `Duplicate anchors found during git sync at lines ${anchorResult.lines.join(", ")}.`,
          mapperFilePath: record.mapperFilePath,
          token: record.token,
          anchor: record.entry.anchor ?? "duplicate-anchor-id",
          codeFile
        });
        reporter.appendLine(`[Bug] ${bug.relativeBugFilePath}`);
        recordedBugs.push(bug);
        summary.failedEntries += 1;
        continue;
      }

      if (anchorResult.line === record.entry.line) {
        // @coai anchor: plugin.git-sync.branch.line-unchanged.001
        reporter.appendLine(
          `[Skip] ${record.token} (${record.entry.anchor ?? "no-anchor"}) -> line unchanged (${record.entry.line})`
        );
        summary.skippedEntries += 1;
        continue;
      }

      let mapper = mapperUpdates.get(record.mapperFilePath);
      if (!mapper) {
        mapper = await readJsonFile<MapperFile>(record.mapperFilePath);
        if (!mapper?.nodes?.[record.token]) {
          reporter.appendLine(`[Fail] ${record.token} -> invalid mapper file ${record.mapperFilePath}`);
          summary.failedEntries += 1;
          continue;
        }
        mapperUpdates.set(record.mapperFilePath, mapper);
      }

      const mapperNodes = mapper.nodes;
      if (!mapperNodes?.[record.token]) {
        reporter.appendLine(`[Fail] ${record.token} -> mapper entry disappeared during update`);
        summary.failedEntries += 1;
        continue;
      }

      mapperNodes[record.token].line = anchorResult.line;
      mapperNodes[record.token].lastUpdated = today;
      reporter.appendLine(
        `[Update] ${record.token} (${record.entry.anchor ?? "no-anchor"}) -> ${record.entry.line} => ${anchorResult.line}`
      );
      summary.updatedEntries += 1;
    }
  }

  // @coai anchor: plugin.git-sync.write-mapper.001
  for (const [mapperFilePath, mapper] of mapperUpdates) {
    await fs.writeFile(mapperFilePath, `${JSON.stringify(mapper, null, 2)}\n`, "utf8");
    reporter.appendLine(`[Write] ${mapperFilePath}`);
    writtenMapperFiles.push(mapperFilePath);
  }

  openBugs = await collectOpenBugContexts(workspaceRoot);
  reporter.appendLine(
    `[Done] changed=${summary.changedFiles}, matched=${summary.matchedFiles}, updated=${summary.updatedEntries}, skipped=${summary.skippedEntries}, failed=${summary.failedEntries}`
  );
  return {
    status: "completed",
    summary,
    writtenMapperFiles,
    normalizedCodeFiles,
    archivedBugFiles: archiveResult.archivedBugFiles,
    removedOpenBugFiles: archiveResult.removedOpenBugFiles,
    openBugs,
    recordedBugs
  };
}

// @coai anchor: plugin.git-sync.core-git-status.001
export async function ensureGitWorkspace(workspaceRoot: string): Promise<void> {
  await execFileAsync("git", ["rev-parse", "--is-inside-work-tree"], { cwd: workspaceRoot });
}

async function getChangedGitFiles(workspaceRoot: string): Promise<string[]> {
  const { stdout } = await execFileAsync(
    "git",
    ["-c", "core.quotepath=false", "status", "--porcelain=v1", "-z", "--untracked-files=all"],
    { cwd: workspaceRoot }
  );

  const changedFiles = new Set<string>();
  const entries = stdout.split("\0").filter(Boolean);
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    if (!entry.trim()) {
      continue;
    }

    const status = entry.slice(0, 2);
    const filePath = entry.slice(3);
    if ((status.includes("R") || status.includes("C")) && index + 1 < entries.length) {
      index += 1;
      const renamedPath = entries[index];
      if (renamedPath) {
        changedFiles.add(normalizePath(renamedPath));
      }
      continue;
    }

    if (filePath) {
      changedFiles.add(normalizePath(filePath));
    }
  }

  return [...changedFiles].filter((filePath) => !isIgnoredChangedPath(filePath));
}

function isIgnoredChangedPath(filePath: string): boolean {
  return IGNORED_CHANGED_PATH_PREFIXES.some((prefix) => filePath === prefix.slice(0, -1) || filePath.startsWith(prefix));
}

// @coai anchor: plugin.git-sync.core-mapper-index.001
async function buildMapperReverseIndex(
  workspaceRoot: string,
  reporter: CoreReporter,
  recordedBugs: OpenBugContext[]
): Promise<Map<string, MapperEntryRecord[]>> {
  const mapperRoot = path.join(workspaceRoot, ".coai", "mapper");
  const mapperFiles = await collectMapperFiles(mapperRoot);
  const index = new Map<string, MapperEntryRecord[]>();

  for (const mapperFilePath of mapperFiles) {
    const mapper = await readJsonFile<MapperFile>(mapperFilePath);
    if (!mapper?.nodes) {
      // @coai anchor: plugin.git-sync.exception.invalid-mapper.001
      reporter.appendLine(`[Fail] Invalid mapper JSON: ${mapperFilePath}`);
      const bug = await writeOpenBugRecord({
        workspaceRoot,
        type: "invalid-mapper",
        message: "Invalid mapper JSON detected during git sync.",
        mapperFilePath,
        token: "__invalid_mapper__",
        anchor: "invalid-mapper",
        codeFile: ""
      });
      reporter.appendLine(`[Bug] ${bug.relativeBugFilePath}`);
      recordedBugs.push(bug);
      continue;
    }

    for (const [token, entry] of Object.entries(mapper.nodes)) {
      if (!entry?.file) {
        // @coai anchor: plugin.git-sync.branch.mapper-skeleton-without-file.001
        reporter.appendLine(`[Warn] ${token} -> mapper skeleton has no file yet in ${mapperFilePath}`);
        continue;
      }
      const normalizedCodeFile = normalizePath(entry.file);
      const records = index.get(normalizedCodeFile) ?? [];
      records.push({ token, mapperFilePath, entry });
      index.set(normalizedCodeFile, records);
    }
  }

  return index;
}

async function collectMapperFiles(rootDir: string): Promise<string[]> {
  try {
    const stat = await fs.stat(rootDir);
    if (!stat.isDirectory()) {
      return [];
    }
  } catch {
    return [];
  }

  const result: string[] = [];
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      result.push(...(await collectMapperFiles(entryPath)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".mapper.json")) {
      result.push(entryPath);
    }
  }

  return result;
}

// @coai anchor: plugin.git-sync.core-anchor-scan.001
function findAnchorLinesInText(text: string, anchor?: string): AnchorScanResult {
  if (!anchor) {
    return { status: "missing" };
  }

  const lines = findAnchorLineNumbers(text, anchor);

  if (lines.length === 0) {
    return { status: "missing" };
  }

  if (lines.length > 1) {
    return { status: "duplicate", lines };
  }

  return { status: "found", line: lines[0] };
}
function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}
