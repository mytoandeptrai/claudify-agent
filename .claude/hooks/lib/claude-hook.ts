// .claude/hooks/lib/claude-hook.ts
// Shared Claude Code hook I/O: stdin payload, transcript parsing, hook output

import { readFileSync, existsSync } from "fs";
import { join } from "path";

export interface HookInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  hook_event_name: string;
  stop_hook_active?: boolean;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
}

export interface ToolUse {
  name: string;
  input: Record<string, unknown>;
  isError: boolean;
}

interface ContentBlock {
  type: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  is_error?: boolean;
}

interface TranscriptEntry {
  type?: string;
  uuid?: string;
  isMeta?: boolean;
  isSidechain?: boolean;
  message?: { role?: string; content?: string | ContentBlock[] };
}

export interface Turn {
  id: string;
  entries: TranscriptEntry[];
  toolUses: ToolUse[];
}

// Shape of the error thrown by execSync/execFileSync on a non-zero exit
export interface ExecError {
  status?: number | null;
  stdout?: string | Buffer;
  stderr?: string | Buffer;
  message: string;
}

export const EDIT_TOOLS = ["Edit", "Write", "MultiEdit", "NotebookEdit"];
export const SUBAGENT_TOOLS = ["Agent", "Task"];

export async function readHookInput(): Promise<HookInput> {
  const stdin = await new Promise<string>((resolve) => {
    let data = "";
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
  });
  return JSON.parse(stdin);
}

// Project-local state lives next to the hooks, in <project>/.claude
export function stateDir(input: HookInput): string {
  return join(process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd(), ".claude");
}

function isUserPrompt(entry: TranscriptEntry): boolean {
  if (entry.type !== "user" || entry.isMeta || entry.isSidechain) return false;
  const content = entry.message?.content;
  if (typeof content === "string") return true;
  return Array.isArray(content) && content.some((b) => b.type === "text");
}

// The current turn: everything after the last prompt the user typed
export function loadCurrentTurn(transcriptPath: string): Turn | null {
  if (!transcriptPath || !existsSync(transcriptPath)) return null;

  const entries: TranscriptEntry[] = [];
  for (const line of readFileSync(transcriptPath, "utf-8").split("\n")) {
    if (!line.trim()) continue;
    try {
      entries.push(JSON.parse(line));
    } catch {
      // Skip partially written lines
    }
  }

  let start = -1;
  for (let i = entries.length - 1; i >= 0; i--) {
    if (isUserPrompt(entries[i])) {
      start = i;
      break;
    }
  }
  const turnEntries = entries.slice(start + 1).filter((e) => !e.isSidechain);

  const uses = new Map<string, ToolUse>();
  for (const entry of turnEntries) {
    const content = entry.message?.content;
    if (!Array.isArray(content)) continue;
    for (const block of content) {
      if (block.type === "tool_use" && block.id && block.name) {
        uses.set(block.id, { name: block.name, input: block.input ?? {}, isError: false });
      } else if (block.type === "tool_result" && block.tool_use_id && block.is_error) {
        const use = uses.get(block.tool_use_id);
        if (use) use.isError = true;
      }
    }
  }

  return {
    id: start >= 0 ? entries[start].uuid ?? String(start) : "start",
    entries: turnEntries,
    toolUses: [...uses.values()],
  };
}

export function editedFiles(toolUses: ToolUse[]): string[] {
  const files = toolUses
    .filter((t) => EDIT_TOOLS.includes(t.name))
    .map((t) => (t.input.file_path ?? t.input.notebook_path) as string | undefined)
    .filter((f): f is string => !!f);
  return [...new Set(files)];
}

// Code text written in this turn, keyed by file
export function writtenCode(toolUses: ToolUse[]): { file: string; code: string }[] {
  const out: { file: string; code: string }[] = [];
  for (const t of toolUses) {
    const file = String(t.input.file_path ?? "");
    if (t.name === "Write") out.push({ file, code: String(t.input.content ?? "") });
    else if (t.name === "Edit") out.push({ file, code: String(t.input.new_string ?? "") });
    else if (t.name === "MultiEdit" && Array.isArray(t.input.edits)) {
      for (const e of t.input.edits as { new_string?: string }[]) {
        out.push({ file, code: String(e.new_string ?? "") });
      }
    }
  }
  return out;
}

// "mcp__<server>__<tool>" → "<server>"
export function mcpServer(toolName: string): string | undefined {
  return toolName.startsWith("mcp__") ? toolName.split("__")[1] : undefined;
}

// Stop hook: keep Claude working with `reason` as its next instruction.
// Never block twice in a row (stop_hook_active) to avoid infinite loops.
export function blockOrNotify(input: HookInput, reason: string): void {
  if (input.stop_hook_active) {
    console.log(JSON.stringify({ systemMessage: reason }));
  } else {
    console.log(JSON.stringify({ decision: "block", reason }));
  }
}

export function notify(message: string): void {
  console.log(JSON.stringify({ systemMessage: message }));
}

export function done(): never {
  console.log(JSON.stringify({}));
  process.exit(0);
}
