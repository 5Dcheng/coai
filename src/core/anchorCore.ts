import * as fs from "fs/promises";
import * as path from "path";

const COMPATIBLE_ANCHOR_CAPTURE_PATTERN = /@coai\s+anchor\s*:?[ \t]*([A-Za-z0-9._-]+)/;
const COMPATIBLE_ANCHOR_GLOBAL_PATTERN = /@coai\s+anchor\s*:?[ \t]*([A-Za-z0-9._-]+)/g;
const CANONICAL_ANCHOR_PREFIX = "@coai anchor: ";
const IGNORED_SCAN_PREFIXES = [".git/", "node_modules/", "out/"];

export type AnchorFormatIssue = {
  filePath: string;
  relativeFilePath: string;
  line: number;
  anchorId: string;
  currentText: string;
  fixedText: string;
};

export type AnchorDoctorResult = {
  scannedFiles: number;
  touchedFiles: number;
  detectedIssues: number;
  fixedIssues: number;
  issues: AnchorFormatIssue[];
};

export function buildAnchorPattern(anchor: string): RegExp {
  return new RegExp(`@coai\\s+anchor\\s*:?[ \\t]*${escapeRegExp(anchor)}(?=\\s*$|\\*/|-->|#)`);
}

export function findAnchorLineNumbers(text: string, anchor?: string): number[] {
  if (!anchor) {
    return [];
  }

  const lines: number[] = [];
  const split = text.split(/\r?\n/);
  const anchorPattern = buildAnchorPattern(anchor);
  for (let index = 0; index < split.length; index += 1) {
    if (anchorPattern.test(split[index])) {
      lines.push(index + 1);
    }
  }

  return lines;
}

// @coai anchor: plugin.cli.doctor-core.001
export async function runAnchorDoctor(
  workspaceRoot: string,
  reporter?: { appendLine: (line: string) => void },
  mode: "check" | "fix" = "fix"
): Promise<AnchorDoctorResult> {
  reporter?.appendLine(`[Doctor] Anchor format ${mode}`);
  reporter?.appendLine(`[Doctor] Workspace: ${workspaceRoot}`);

  const files = await collectWorkspaceFiles(workspaceRoot);
  const issues: AnchorFormatIssue[] = [];
  let touchedFiles = 0;
  let fixedIssues = 0;

  for (const relativeFilePath of files) {
    const filePath = path.join(workspaceRoot, relativeFilePath);
    let text: string;
    try {
      text = await fs.readFile(filePath, "utf8");
    } catch {
      continue;
    }

    const lines = text.split(/\r?\n/);
    let fileChanged = false;
    for (let index = 0; index < lines.length; index += 1) {
      const currentLine = lines[index];
      const fixedLine = canonicalizeAnchorLine(currentLine);
      if (!fixedLine || fixedLine === currentLine) {
        continue;
      }

      const match = COMPATIBLE_ANCHOR_CAPTURE_PATTERN.exec(currentLine);
      const anchorId = match?.[1] ?? "unknown-anchor";
      issues.push({
        filePath,
        relativeFilePath,
        line: index + 1,
        anchorId,
        currentText: currentLine,
        fixedText: fixedLine
      });
      reporter?.appendLine(`[Doctor] ${relativeFilePath}:${index + 1} -> normalize ${anchorId}`);

      if (mode === "fix") {
        lines[index] = fixedLine;
        fixedIssues += 1;
        fileChanged = true;
      }
    }

    if (fileChanged) {
      await fs.writeFile(filePath, `${lines.join("\n")}\n`, "utf8");
      touchedFiles += 1;
      reporter?.appendLine(`[Doctor] write ${relativeFilePath}`);
    }
  }

  reporter?.appendLine(
    `[Doctor] scanned=${files.length}, touched=${touchedFiles}, detected=${issues.length}, fixed=${fixedIssues}`
  );

  return {
    scannedFiles: files.length,
    touchedFiles,
    detectedIssues: issues.length,
    fixedIssues,
    issues
  };
}

// @coai anchor: plugin.git-sync.anchor-normalize.001
export async function runAnchorDoctorOnFiles(args: {
  workspaceRoot: string;
  relativeFilePaths: string[];
  reporter?: { appendLine: (line: string) => void };
  mode?: "check" | "fix";
  logPrefix?: string;
}): Promise<AnchorDoctorResult> {
  const { workspaceRoot, reporter, mode = "fix", logPrefix = "[Doctor]" } = args;
  const relativeFilePaths = dedupeNormalizedPaths(args.relativeFilePaths).filter((filePath) => !shouldIgnorePath(filePath));

  reporter?.appendLine(`${logPrefix} Anchor format ${mode}`);
  reporter?.appendLine(`${logPrefix} Workspace: ${workspaceRoot}`);

  const issues: AnchorFormatIssue[] = [];
  let touchedFiles = 0;
  let fixedIssues = 0;

  for (const relativeFilePath of relativeFilePaths) {
    const filePath = path.join(workspaceRoot, relativeFilePath);
    let text: string;
    try {
      text = await fs.readFile(filePath, "utf8");
    } catch {
      continue;
    }

    const lines = text.split(/\r?\n/);
    let fileChanged = false;
    for (let index = 0; index < lines.length; index += 1) {
      const currentLine = lines[index];
      const fixedLine = canonicalizeAnchorLine(currentLine);
      if (!fixedLine || fixedLine === currentLine) {
        continue;
      }

      const match = COMPATIBLE_ANCHOR_CAPTURE_PATTERN.exec(currentLine);
      const anchorId = match?.[1] ?? "unknown-anchor";
      issues.push({
        filePath,
        relativeFilePath,
        line: index + 1,
        anchorId,
        currentText: currentLine,
        fixedText: fixedLine
      });
      reporter?.appendLine(`[Fix] Non-canonical anchor format: ${relativeFilePath}:${index + 1} -> normalized (${anchorId})`);

      if (mode === "fix") {
        lines[index] = fixedLine;
        fixedIssues += 1;
        fileChanged = true;
      }
    }

    if (fileChanged) {
      await fs.writeFile(filePath, `${lines.join("\n")}\n`, "utf8");
      touchedFiles += 1;
      reporter?.appendLine(`${logPrefix} write ${relativeFilePath}`);
    }
  }

  reporter?.appendLine(
    `${logPrefix} scanned=${relativeFilePaths.length}, touched=${touchedFiles}, detected=${issues.length}, fixed=${fixedIssues}`
  );

  return {
    scannedFiles: relativeFilePaths.length,
    touchedFiles,
    detectedIssues: issues.length,
    fixedIssues,
    issues
  };
}

export function canonicalizeAnchorLine(line: string): string | undefined {
  const match = COMPATIBLE_ANCHOR_CAPTURE_PATTERN.exec(line);
  if (!match) {
    return undefined;
  }

  const fullMatch = match[0];
  const anchorId = match[1];
  const canonical = `${CANONICAL_ANCHOR_PREFIX}${anchorId}`;
  if (fullMatch === canonical) {
    return line;
  }

  return line.replace(fullMatch, canonical);
}

async function collectWorkspaceFiles(workspaceRoot: string): Promise<string[]> {
  const result: string[] = [];
  await collectWorkspaceFilesRecursive(workspaceRoot, workspaceRoot, result);
  return result;
}

async function collectWorkspaceFilesRecursive(rootDir: string, currentDir: string, result: string[]): Promise<void> {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name);
    const relativePath = normalizePath(path.relative(rootDir, absolutePath));
    if (shouldIgnorePath(relativePath)) {
      continue;
    }

    if (entry.isDirectory()) {
      await collectWorkspaceFilesRecursive(rootDir, absolutePath, result);
      continue;
    }

    if (entry.isFile()) {
      result.push(relativePath);
    }
  }
}

function shouldIgnorePath(relativePath: string): boolean {
  return IGNORED_SCAN_PREFIXES.some((prefix) => relativePath === prefix.slice(0, -1) || relativePath.startsWith(prefix));
}

function dedupeNormalizedPaths(filePaths: Array<string | undefined | null>): string[] {
  return [
    ...new Set(
      filePaths
        .filter((filePath): filePath is string => typeof filePath === "string" && filePath.length > 0)
        .map(normalizePath)
    )
  ];
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}
