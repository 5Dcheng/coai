import * as fs from "fs/promises";
import * as path from "path";

export type BugStatus = "open" | "fixed" | "wont_fix" | "obsolete";
export type BugType = "missing-anchor" | "duplicate-anchor" | "invalid-mapper" | "missing-node";

export type BugRecord = {
  id: string;
  type: BugType;
  status: BugStatus;
  createdAt: string;
  workspace: string;
  projectFile: string;
  sourceFile: string;
  mapperFile: string | null;
  nodeFile: string | null;
  token: string;
  anchor: string | null;
  codeFile: string | null;
  contextFiles: string[];
  message: string;
  systemAction: "reported_only";
  repairPrompt: string;
  resolution: {
    resolvedAt: string | null;
    action: string | null;
    summary: string | null;
  };
};

export type OpenBugContext = {
  bugFilePath: string;
  relativeBugFilePath: string;
  record: BugRecord;
};

// @coai anchor: plugin.bug-repair.log-write.001
// @coai anchor: plugin.bug-repair.log-store-write.001
export async function writeOpenBugRecord(args: {
  workspaceRoot: string;
  type: BugType;
  message: string;
  sourceFilePath?: string;
  mapperFilePath?: string;
  nodeFilePath?: string;
  token: string;
  anchor?: string;
  codeFile?: string;
  contextFiles?: string[];
}): Promise<OpenBugContext> {
  const { workspaceRoot, type, message, sourceFilePath, mapperFilePath, nodeFilePath, token, anchor, codeFile } = args;
  const relativeMapperPath = mapperFilePath ? normalizePath(path.relative(workspaceRoot, mapperFilePath)) : null;
  const relativeSourcePath = sourceFilePath ? normalizePath(path.relative(workspaceRoot, sourceFilePath)) : null;
  const relativeNodePath = nodeFilePath ? normalizePath(path.relative(workspaceRoot, nodeFilePath)) : null;
  const relativeCodeFile = codeFile ? normalizePath(codeFile) : null;
  const projectFile = relativeMapperPath ? inferProjectFilePath(relativeMapperPath) : relativeSourcePath ?? ".coai/project/unknown.md";
  const contextFiles = Array.from(
    new Set(
      (args.contextFiles ?? [relativeSourcePath, relativeMapperPath, relativeNodePath, relativeCodeFile]).filter(
        (value): value is string => Boolean(value)
      )
    )
  );
  const bugKey = buildBugKey(type, {
    projectFile,
    mapperFile: relativeMapperPath,
    token,
    anchor
  });
  const bugRecord: BugRecord = {
    id: buildBugId(type, bugKey),
    type,
    status: "open",
    createdAt: new Date().toISOString(),
    workspace: normalizePath(workspaceRoot),
    projectFile,
    sourceFile: relativeSourcePath ?? projectFile,
    mapperFile: relativeMapperPath,
    nodeFile: relativeNodePath,
    token,
    anchor: anchor ?? null,
    codeFile: relativeCodeFile,
    contextFiles,
    message,
    systemAction: "reported_only",
    repairPrompt: buildRepairPrompt({
      type,
      projectFile,
      sourceFile: relativeSourcePath ?? projectFile,
      mapperFile: relativeMapperPath,
      nodeFile: relativeNodePath,
      token,
      anchor: anchor ?? null,
      codeFile: relativeCodeFile,
      contextFiles,
      message
    }),
    resolution: {
      resolvedAt: null,
      action: null,
      summary: null
    }
  };

  const bugLogDir = path.join(workspaceRoot, ".coai", "log", "bugs", "open");
  await fs.mkdir(bugLogDir, { recursive: true });
  const bugFilePath = path.join(bugLogDir, `${buildBugFileName(type, bugKey)}.json`);
  await fs.writeFile(bugFilePath, `${JSON.stringify(bugRecord, null, 2)}\n`, "utf8");
  return {
    bugFilePath,
    relativeBugFilePath: normalizePath(path.relative(workspaceRoot, bugFilePath)),
    record: bugRecord
  };
}

// @coai anchor: plugin.bug-repair.log-store-read.001
export async function collectOpenBugContexts(workspaceRoot: string): Promise<OpenBugContext[]> {
  const openDir = path.join(workspaceRoot, ".coai", "log", "bugs", "open");
  const bugFiles = await collectJsonFiles(openDir);
  const result: OpenBugContext[] = [];

  for (const bugFilePath of bugFiles) {
    const record = await readJsonFile<BugRecord>(bugFilePath);
    if (!record) {
      continue;
    }

    result.push({
      bugFilePath,
      relativeBugFilePath: normalizePath(path.relative(workspaceRoot, bugFilePath)),
      record
    });
  }

  return result;
}

export function findBlockingBugForCodeFile(
  bugs: OpenBugContext[],
  relativeCodeFile: string
): OpenBugContext | undefined {
  return bugs.find(
    (bug) => bug.record.status === "open" && bug.record.codeFile && normalizePath(bug.record.codeFile) === relativeCodeFile
  );
}

export async function collectResolvedBugFiles(rootDir: string): Promise<string[]> {
  return collectJsonFiles(rootDir);
}

export async function readJsonFile<T>(filePath: string): Promise<T | undefined> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

async function collectJsonFiles(rootDir: string): Promise<string[]> {
  try {
    const stat = await fs.stat(rootDir);
    if (!stat.isDirectory()) {
      return [];
    }
  } catch {
    return [];
  }

  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  const result: string[] = [];
  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      result.push(...(await collectJsonFiles(entryPath)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".json")) {
      result.push(entryPath);
    }
  }

  return result;
}

function inferProjectFilePath(relativeMapperPath: string): string {
  return relativeMapperPath
    .replace(/^\.coai\/mapper\//, ".coai/project/")
    .replace(/\.mapper\.json$/, ".md");
}

function buildBugId(type: BugType, key: string): string {
  return `${type}:${key}`;
}

function buildBugKey(
  type: BugType,
  args: {
    projectFile: string;
    mapperFile: string | null;
    token: string;
    anchor?: string;
  }
): string {
  if (type === "invalid-mapper") {
    return args.mapperFile ?? `${args.projectFile}:${args.token}`;
  }

  if (type === "missing-node") {
    return `${args.projectFile}:${args.token}`;
  }

  return args.anchor ?? `${args.projectFile}:${args.token}`;
}

function buildBugFileName(type: BugType, key: string): string {
  return `${type}__${sanitizeFileSegment(key)}`;
}

function sanitizeFileSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "_");
}

function buildRepairPrompt(args: {
  type: BugType;
  projectFile: string;
  sourceFile: string;
  mapperFile: string | null;
  nodeFile: string | null;
  token: string;
  anchor: string | null;
  codeFile: string | null;
  contextFiles: string[];
  message: string;
}): string {
  const { type, projectFile, sourceFile, mapperFile, nodeFile, token, anchor, codeFile, contextFiles, message } = args;

  return [
    "你正在修复一个 CoAI 映射异常。",
    "",
    "## 异常信息",
    `- 异常类型：\`${type}\``,
    `- 功能文档：\`${projectFile}\``,
    `- 来源文件：\`${sourceFile}\``,
    `- mapper 文件：\`${mapperFile ?? "N/A"}\``,
    `- node 文件：\`${nodeFile ?? "N/A"}\``,
    `- token：\`${token}\``,
    `- anchor：\`${anchor ?? "N/A"}\``,
    `- 代码文件：\`${codeFile || "N/A"}\``,
    `- 相关文件：\`${contextFiles.join("`, `") || "N/A"}\``,
    "",
    "## 系统检测结果",
    `- \`${message}\``,
    "- `系统已阻止错误结果写回 mapper`",
    "- `当前没有自动触发 AI 修复，只生成了 bug 日志与提示`",
    "",
    "## 你的任务",
    "1. 判断该异常产生的真实原因",
    "2. 判断是应该补 anchor、更新 mapper、调整功能文档，还是标记为不应修复",
    "3. 若能高置信度修复，直接给出 patch",
    "4. 若不能高置信度修复，给出修复建议，不要盲目修改",
    "5. 保持 `.coai/project`、`.coai/mapper`、`.coai/node` 的职责分离",
    "",
    "## 输出要求",
    "1. 先给出原因判断",
    "2. 再给出修复方案",
    "3. 如有高置信度，直接提供 patch",
    "4. 如修复会影响 mapper / node / project，请明确列出应同步更新的文件",
    ""
  ].join("\n");
}

function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}
