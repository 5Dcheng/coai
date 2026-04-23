import * as fs from "fs/promises";
import * as path from "path";
import * as vscode from "vscode";
import { buildAnchorPattern } from "./core/anchorCore";
import { notifyBugRecorded, refreshOpenBugDiagnostics, writeOpenBugRecord } from "./bugLog";
import { syncMapperFromGitChanges } from "./gitSync";

const TOKEN_PATTERN = /\[\[([^[\]]+)\]\]/g;

type MapperNode = {
  anchor?: string;
  file: string;
  line: number;
  lastUpdated?: string;
};

type MapperFile = {
  nodes?: Record<string, MapperNode>;
};

type MapperResolution = {
  mapperFile: string;
  entry: MapperNode;
};

type NodeFile = {
  label?: string;
  intent?: string;
  logic?: string[];
  risks?: string[];
  scale?: string[];
};

type TokenContext = {
  token: string;
  range: vscode.Range;
};

type GitSyncRecoveryResult =
  | { status: "not_run" }
  | { status: "no_changes" }
  | { status: "recovered"; updatedEntries: number }
  | { status: "retry_allowed"; updatedEntries: number };

export class CoaiLinkProvider implements vscode.HoverProvider, vscode.DocumentLinkProvider {
  async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<vscode.Hover | undefined> {
    // @coai anchor: plugin.navigation.hover.001
    const tokenContext = getTokenAtPosition(document, position);
    if (!tokenContext) {
      return undefined;
    }

    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    if (!workspaceFolder) {
      return undefined;
    }

    const nodeData = await loadNodeData(workspaceFolder.uri.fsPath, document.uri.fsPath, tokenContext.token);
    if (!nodeData) {
      // @coai anchor: plugin.navigation.branch.no-node.001
      return undefined;
    }

    return new vscode.Hover(buildHoverMarkdown(nodeData, tokenContext.token), tokenContext.range);
  }

  async provideDocumentLinks(document: vscode.TextDocument): Promise<vscode.DocumentLink[]> {
    // @coai anchor: plugin.navigation.links.001
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    if (!workspaceFolder) {
      return [];
    }

    const text = document.getText();
    const links: vscode.DocumentLink[] = [];
    for (const match of text.matchAll(TOKEN_PATTERN)) {
      const fullMatch = match[0];
      const token = match[1]?.trim();
      if (!token) {
        continue;
      }

      const start = document.positionAt(match.index ?? 0);
      const end = document.positionAt((match.index ?? 0) + fullMatch.length);
      const args = encodeURIComponent(JSON.stringify([{ token, sourceUri: document.uri.toString() }]));
      const target = vscode.Uri.parse(`command:coaiNavigation.openMappedCode?${args}`);
      links.push(new vscode.DocumentLink(new vscode.Range(start, end), target));
    }

    return links;
  }
}

// @coai anchor: plugin.navigation.click.001
export async function openMappedCode(
  token?: string,
  sourceUri?: vscode.Uri | string,
  diagnostics?: vscode.DiagnosticCollection,
  outputChannel?: vscode.OutputChannel,
  options?: {
    allowGitSyncRecovery?: boolean;
  }
): Promise<void> {
  if (!token || !sourceUri) {
    return;
  }

  const allowGitSyncRecovery = options?.allowGitSyncRecovery ?? true;

  const sourceDocumentUri = typeof sourceUri === "string" ? vscode.Uri.parse(sourceUri) : sourceUri;
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(sourceDocumentUri);
  if (!workspaceFolder) {
    void vscode.window.showWarningMessage("CoAI Navigation: 当前文件不在工作区内。");
    return;
  }

  const docPaths = await resolveCoaiPaths(workspaceFolder.uri.fsPath, sourceDocumentUri.fsPath);
  if (!docPaths) {
    void vscode.window.showWarningMessage("CoAI Navigation: 当前文档不在 .coai/project/ 下，无法解析双链路径。");
    return;
  }

  const mapperResolution = await loadMapperEntry(docPaths.mapperFile, token);
  if (!mapperResolution) {
    // @coai anchor: plugin.navigation.exception.missing-mapper.001
    const recovered = await handleMissingMapperRecoveryOrBug({
      workspaceRoot: workspaceFolder.uri.fsPath,
      sourceDocumentUri,
      token,
      docPaths,
      diagnostics,
      outputChannel,
      allowGitSyncRecovery
    });
    if (recovered) {
      await openMappedCode(token, sourceUri, diagnostics, outputChannel, { allowGitSyncRecovery: false });
    }
    return;
  }

  const { entry } = mapperResolution;
  const targetUri = vscode.Uri.file(path.resolve(workspaceFolder.uri.fsPath, entry.file));
  let document: vscode.TextDocument;
  let editor: vscode.TextEditor;
  try {
    document = await vscode.workspace.openTextDocument(targetUri);
    editor = await vscode.window.showTextDocument(document, { preview: false });
  } catch {
    // @coai anchor: plugin.navigation.recovery.target-open.001
    const recovered = await tryGitSyncRecovery({
      workspaceRoot: workspaceFolder.uri.fsPath,
      token,
      diagnostics,
      outputChannel,
      allowGitSyncRecovery,
      reason: `CoAI Navigation: 无法打开 [[${token}]] 对应代码文件。可尝试先运行一次 git-sync。`
    });
    if (recovered) {
      await openMappedCode(token, sourceUri, diagnostics, outputChannel, { allowGitSyncRecovery: false });
      return;
    }

    void vscode.window.showWarningMessage(
      `CoAI Navigation: 无法打开 [[${token}]] 对应代码文件。请检查 mapper 或运行 bug-repair。`
    );
    return;
  }

  // @coai anchor: plugin.navigation.anchor-sync.001
  const anchorLine = findAnchorLine(document, entry.anchor);
  if (!anchorLine && isLineOutOfBounds(document, entry.line)) {
    // @coai anchor: plugin.navigation.recovery.stale-mapping.001
    const recovery = await tryGitSyncRecovery({
      workspaceRoot: workspaceFolder.uri.fsPath,
      token,
      diagnostics,
      outputChannel,
      allowGitSyncRecovery,
      reason: `CoAI Navigation: 已找到 [[${token}]] 的 mapper，但 anchor 未命中且 line 超出文件范围，更像是 stale mapping。`
    });
    if (recovery.status === "retry_allowed") {
      await openMappedCode(token, sourceUri, diagnostics, outputChannel, { allowGitSyncRecovery: false });
      return;
    }

    if (recovery.status === "no_changes" || recovery.status === "not_run") {
      void vscode.window.showWarningMessage(
        `CoAI Navigation: [[${token}]] 的映射看起来已过期，但这次 git-sync 没有修复定位。请检查 mapper 或进入 bug-repair。`
      );
    }
  }

  if (anchorLine && anchorLine !== entry.line) {
    entry.line = anchorLine;
    await updateMapperLine(mapperResolution.mapperFile, token, anchorLine);
  }

  const lineIndex = Math.max(0, (anchorLine ?? entry.line) - 1);
  const targetPosition = new vscode.Position(lineIndex, 0);
  editor.selection = new vscode.Selection(targetPosition, targetPosition);
  editor.revealRange(new vscode.Range(targetPosition, targetPosition), vscode.TextEditorRevealType.InCenter);
}

function getTokenAtPosition(
  document: vscode.TextDocument,
  position: vscode.Position
): TokenContext | undefined {
  // @coai anchor: plugin.navigation.token.001
  const lineText = document.lineAt(position.line).text;
  for (const match of lineText.matchAll(TOKEN_PATTERN)) {
    const fullMatch = match[0];
    const token = match[1]?.trim();
    const startColumn = match.index ?? 0;
    const endColumn = startColumn + fullMatch.length;
    if (position.character >= startColumn && position.character <= endColumn && token) {
      return {
        token,
        range: new vscode.Range(position.line, startColumn, position.line, endColumn)
      };
    }
  }

  return undefined;
}

function buildHoverMarkdown(nodeData: NodeFile, fallbackLabel: string): vscode.MarkdownString {
  const label = nodeData.label ?? fallbackLabel;
  const markdown = new vscode.MarkdownString(undefined, true);
  markdown.appendMarkdown(`**功能：${escapeMarkdown(label)}**\n\n`);

  if (nodeData.intent) {
    markdown.appendMarkdown(`**意图**\n${escapeMarkdown(nodeData.intent)}\n\n`);
  }

  appendSection(markdown, "逻辑", nodeData.logic);
  appendSection(markdown, "风险", nodeData.risks);
  appendSection(markdown, "规模", nodeData.scale);
  markdown.isTrusted = true;
  return markdown;
}

function appendSection(markdown: vscode.MarkdownString, title: string, items?: string[]): void {
  if (!items || items.length === 0) {
    return;
  }

  markdown.appendMarkdown(`**${escapeMarkdown(title)}**\n`);
  for (const item of items) {
    markdown.appendMarkdown(`- ${escapeMarkdown(item)}\n`);
  }
  markdown.appendMarkdown("\n");
}

function escapeMarkdown(text: string): string {
  return text.replace(/[\\`*_{}[\]()#+\-.!]/g, "\\$&");
}

async function loadNodeData(
  workspaceRoot: string,
  documentPath: string,
  token: string
): Promise<NodeFile | undefined> {
  const docPaths = await resolveCoaiPaths(workspaceRoot, documentPath);
  if (!docPaths) {
    return undefined;
  }

  const candidates = [
    path.join(docPaths.nodeDir, `${token}.node.json`),
    path.join(docPaths.nodeDir, `${slugify(token)}.node.json`)
  ];

  for (const candidate of candidates) {
    const nodeFile = await readJsonFile<NodeFile>(candidate);
    if (nodeFile) {
      return nodeFile;
    }
  }

  return undefined;
}

async function loadMapperEntry(
  mapperFilePath: string,
  token: string
): Promise<MapperResolution | undefined> {
  const mapper = await readJsonFile<MapperFile>(mapperFilePath);
  const entry = mapper?.nodes?.[token];
  if (!entry) {
    return undefined;
  }

  return {
    mapperFile: mapperFilePath,
    entry
  };
}

async function resolveCoaiPaths(
  workspaceRoot: string,
  documentPath: string
): Promise<{ mapperFile: string; nodeDir: string } | undefined> {
  // @coai anchor: plugin.navigation.resolve-paths.001
  const projectRoot = vscode.workspace.getConfiguration("coaiNavigation").get<string>("projectRoot", ".coai");
  const coaiRoot = path.join(workspaceRoot, projectRoot);
  const projectDir = path.join(coaiRoot, "project");
  const mapperDir = path.join(coaiRoot, "mapper");
  const nodeRootDir = path.join(coaiRoot, "node");

  const relativeProjectPath = path.relative(projectDir, documentPath);
  if (relativeProjectPath.startsWith("..")) {
    // @coai anchor: plugin.navigation.branch.non-project-doc.001
    return undefined;
  }

  const relativeNoExt = relativeProjectPath.replace(/\.[^.]+$/, "");
  const mapperFile = path.join(mapperDir, `${relativeNoExt}.mapper.json`);
  const nodeDir = path.join(nodeRootDir, relativeNoExt);
  return { mapperFile, nodeDir };
}

async function readJsonFile<T>(filePath: string): Promise<T | undefined> {
  // @coai anchor: plugin.navigation.read-json.001
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function findAnchorLine(document: vscode.TextDocument, anchor?: string): number | undefined {
  if (!anchor) {
    return undefined;
  }

  const anchorPattern = buildAnchorPattern(anchor);
  for (let index = 0; index < document.lineCount; index += 1) {
    if (anchorPattern.test(document.lineAt(index).text)) {
      return index + 1;
    }
  }

  return undefined;
}

function isLineOutOfBounds(document: vscode.TextDocument, line: number): boolean {
  return line < 1 || line > document.lineCount;
}

async function updateMapperLine(mapperFilePath: string, token: string, line: number): Promise<void> {
  // @coai anchor: plugin.navigation.write-mapper.001
  const mapper = await readJsonFile<MapperFile>(mapperFilePath);
  if (!mapper?.nodes?.[token]) {
    return;
  }

  mapper.nodes[token].line = line;
  mapper.nodes[token].lastUpdated = new Date().toISOString().slice(0, 10);
  await fs.writeFile(mapperFilePath, `${JSON.stringify(mapper, null, 2)}\n`, "utf8");
}

// @coai anchor: plugin.navigation.recovery.git-sync.001
async function tryGitSyncRecovery(args: {
  workspaceRoot: string;
  token: string;
  diagnostics?: vscode.DiagnosticCollection;
  outputChannel?: vscode.OutputChannel;
  allowGitSyncRecovery: boolean;
  reason: string;
  skipPrompt?: boolean;
}): Promise<GitSyncRecoveryResult> {
  const { diagnostics, outputChannel, allowGitSyncRecovery, reason, skipPrompt } = args;
  if (!allowGitSyncRecovery || !diagnostics || !outputChannel) {
    return { status: "not_run" };
  }

  if (!skipPrompt) {
    const action = await vscode.window.showWarningMessage(reason, "Run git-sync once", "取消");
    if (action !== "Run git-sync once") {
      return { status: "not_run" };
    }
  }

  if (!skipPrompt) {
    void vscode.window.setStatusBarMessage("CoAI Navigation: 正在执行一次 git-sync...", 3000);
  } else {
    void vscode.window.setStatusBarMessage("CoAI Navigation: 正在按你的选择执行 git-sync...", 3000);
  }

  const result = await syncMapperFromGitChanges(outputChannel, diagnostics);
  if (!result || result.status === "no_changes") {
    void vscode.window.showInformationMessage("CoAI Navigation: 已运行一次 git-sync，但没有发现可同步的变更。");
    return { status: "no_changes" };
  }

  const updatedEntries = result.summary.updatedEntries;
  const message =
    updatedEntries > 0
      ? `CoAI Navigation: git-sync 已更新 ${updatedEntries} 项映射，正在重试跳转。`
      : "CoAI Navigation: git-sync 已执行完成，正在重试跳转。";
  void vscode.window.showInformationMessage(message);
  return { status: "retry_allowed", updatedEntries };
}

// @coai anchor: plugin.navigation.recovery.missing-mapper.001
async function handleMissingMapperRecoveryOrBug(args: {
  workspaceRoot: string;
  sourceDocumentUri: vscode.Uri;
  token: string;
  docPaths: {
    mapperFile: string;
    nodeDir: string;
  };
  diagnostics?: vscode.DiagnosticCollection;
  outputChannel?: vscode.OutputChannel;
  allowGitSyncRecovery: boolean;
}): Promise<boolean> {
  const { workspaceRoot, sourceDocumentUri, token, docPaths, diagnostics, outputChannel, allowGitSyncRecovery } = args;
  const actions = allowGitSyncRecovery ? ["Run git-sync once", "视为 bug", "忽略"] : ["视为 bug", "忽略"];
  const action = await vscode.window.showWarningMessage(
    `CoAI Navigation: 未找到 [[${token}]] 的 mapper 映射，这更像是 missing mapper，而不是单纯 line 过期。`,
    ...actions
  );

  if (action === "Run git-sync once" && diagnostics && outputChannel) {
    const recovery = await tryGitSyncRecovery({
      workspaceRoot,
      token,
      diagnostics,
      outputChannel,
      allowGitSyncRecovery: true,
      reason: `CoAI Navigation: 先尝试运行一次 git-sync。若仍失败，再按 missing mapper 处理。`,
      skipPrompt: true
    });
    return recovery.status === "retry_allowed";
  }

  if (action === "视为 bug") {
    await handleMissingNodeNavigationBug({
      workspaceRoot,
      sourceDocumentUri,
      token,
      docPaths,
      diagnostics
    });
  }

  return false;
}

// @coai anchor: plugin.navigation.bug-report.001
async function handleMissingNodeNavigationBug(args: {
  workspaceRoot: string;
  sourceDocumentUri: vscode.Uri;
  token: string;
  docPaths: {
    mapperFile: string;
    nodeDir: string;
  };
  diagnostics?: vscode.DiagnosticCollection;
}): Promise<void> {
  const { workspaceRoot, sourceDocumentUri, token, docPaths, diagnostics } = args;
  const expectedNodeFile = path.join(docPaths.nodeDir, `${token}.node.json`);
  const action = await vscode.window.showWarningMessage(
    `CoAI Navigation: [[${token}]] 没有可跳转的导航节点。你可以忽略，或将其记录为 bug 进入 bug-repair。`,
    "视为 bug",
    "忽略"
  );

  if (action !== "视为 bug") {
    return;
  }

  const context = await writeOpenBugRecord({
    workspaceRoot,
    type: "missing-node",
    message: `未找到 [[${token}]] 的 mapper 映射，当前导航无法跳转。`,
    sourceFilePath: sourceDocumentUri.fsPath,
    mapperFilePath: docPaths.mapperFile,
    nodeFilePath: expectedNodeFile,
    token,
    contextFiles: [
      normalizeWorkspacePath(workspaceRoot, sourceDocumentUri.fsPath),
      normalizeWorkspacePath(workspaceRoot, docPaths.mapperFile),
      normalizeWorkspacePath(workspaceRoot, expectedNodeFile)
    ]
  });

  if (diagnostics) {
    await refreshOpenBugDiagnostics(workspaceRoot, diagnostics);
  }

  await notifyBugRecorded(context);
}

function normalizeWorkspacePath(workspaceRoot: string, filePath: string): string {
  return path.relative(workspaceRoot, filePath).replace(/\\/g, "/");
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
