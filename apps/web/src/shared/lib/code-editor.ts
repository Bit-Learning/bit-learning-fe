import { FormatError, Language } from "@/feature/code-practice/types/coding.type";
import prettier from "prettier/standalone";
import prettierBabel from "prettier/plugins/babel";
import prettierEstree from "prettier/plugins/estree";
import { getSingletonHighlighter, type Highlighter, type BundledLanguage } from "shiki";

export const LANGUAGE_EXTENSIONS: Record<Language, string> = {
  [Language.CPP]: ".cpp",
  [Language.JAVA]: ".java",
  [Language.PYTHON]: ".py",
  [Language.JAVASCRIPT]: ".js",
};

const SHIKI_LANG: Record<Language, string> = {
  [Language.PYTHON]: "python",
  [Language.JAVASCRIPT]: "javascript",
  [Language.CPP]: "cpp",
  [Language.JAVA]: "java",
};

const SHIKI_THEME = "one-dark-pro";

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (highlighterPromise) return highlighterPromise;

  highlighterPromise = getSingletonHighlighter({
    themes: [SHIKI_THEME],
    langs: Object.values(SHIKI_LANG),
  });

  return highlighterPromise;
}

getHighlighter().catch(() => {
  highlighterPromise = null;
});

export async function highlightCode(code: string, language: Language): Promise<string> {
  try {
    const hl = await getHighlighter();
    const lang = SHIKI_LANG[language] as BundledLanguage;
    const result = hl.codeToTokens(code, { lang, theme: SHIKI_THEME });

    return result.tokens
      .map((lineTokens) =>
        lineTokens
          .map((token) => {
            const color = token.color ?? "#abb2bf";
            const fontStyle = token.fontStyle ?? 0;

            const styles: string[] = [`color:${color}`];
            if (fontStyle & 1) styles.push("font-style:italic");
            if (fontStyle & 2) styles.push("font-weight:bold");
            if (fontStyle & 4) styles.push("text-decoration:underline");

            const escaped = token.content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

            return `<span style="${styles.join(";")}">${escaped}</span>`;
          })
          .join(""),
      )
      .join("\n");
  } catch {
    return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
}

export function highlightCodeSync(code: string): string {
  return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function validatePythonIndentation(code: string): FormatError[] {
  const lines = code.split("\n");
  const errors: FormatError[] = [];
  const indentStack: number[] = [0];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const indent = line.length - line.trimStart().length;

    if (line.includes("\t")) {
      errors.push({ line: i + 1, message: "Dùng dấu cách thay vì tab để thụt lề" });
      continue;
    }
    if (indent % 4 !== 0) {
      errors.push({ line: i + 1, message: "Thụt lề phải là bội số của 4 dấu cách" });
    }
    if (trimmed.endsWith(":")) {
      indentStack.push(indent + 4);
    } else {
      while (indentStack.length > 1 && indent < indentStack[indentStack.length - 1]!) indentStack.pop();
      const expected = indentStack[indentStack.length - 1];
      if (indent !== expected && indent !== 0) {
        errors.push({ line: i + 1, message: `Thụt lề không hợp lệ (cần ${expected} dấu cách)` });
      }
    }
  }

  return errors;
}

function isInsideString(line: string, pos: number): boolean {
  let inStr = false;
  let strCh = "";
  let i = 0;

  while (i < pos) {
    const ch = line[i]!;
    if (!inStr) {
      if (ch === '"' || ch === "'") {
        const triple = ch + ch + ch;
        if (line.slice(i, i + 3) === triple) {
          const close = line.indexOf(triple, i + 3);
          if (close === -1 || close >= pos) return true;
          i = close + 3;
          continue;
        }
        inStr = true;
        strCh = ch;
      }
    } else {
      if (ch === "\\") {
        i += 2;
        continue;
      }
      if (ch === strCh) inStr = false;
    }
    i++;
  }

  return inStr;
}

function fixCommaSpacing(line: string): string {
  let result = "";
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    result += ch;
    if (ch === "," && !isInsideString(line, i) && i + 1 < line.length && line[i + 1] !== " " && line[i + 1] !== "\n") {
      result += " ";
    }
  }
  return result;
}

function fixOperatorSpacing(line: string): string {
  const ops2 = ["==", "!=", "<=", ">=", "+=", "-=", "*=", "/=", "%=", "**=", "//=", "->"];

  const safeReplace = (src: string, pattern: RegExp, fn: (m: string, offset: number) => string) =>
    src.replace(pattern, (match, offset: number) => (isInsideString(src, offset) ? match : fn(match, offset)));

  let result = line;

  for (const op of ops2) {
    const escaped = op.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = safeReplace(result, new RegExp(`[ ]*${escaped}[ ]*`, "g"), () => ` ${op} `);
  }

  result = safeReplace(result, /([a-zA-Z0-9_\]])=([^=])/g, (match) => {
    const before = match[0]!;
    const after = match[match.length - 1]!;
    return `${before} = ${after}`;
  });

  return result;
}

function fixCallSpacing(line: string): string {
  return line.replace(/([a-zA-Z0-9_]) +([(\[])/g, (match, word, bracket, offset) =>
    isInsideString(line, offset) ? match : `${word}${bracket}`,
  );
}

function normalizeIndent(line: string): string {
  const stripped = line.trimStart();
  if (!stripped) return "";
  const rawIndent = line.slice(0, line.length - stripped.length);
  const expanded = rawIndent.replace(/\t/g, "    ");
  const normalized = Math.round(expanded.length / 4) * 4;
  return " ".repeat(normalized) + stripped;
}

let ruffPromise: Promise<any> | null = null;

function loadRuff(): Promise<any> {
  if (ruffPromise) return ruffPromise;
  ruffPromise = import("@astral-sh/ruff-wasm-web").catch((err) => {
    ruffPromise = null;
    throw err;
  });
  return ruffPromise;
}

async function formatPythonRuff(code: string): Promise<string> {
  const { Workspace, defaultSettings } = await loadRuff();

  const workspace = new Workspace({
    ...defaultSettings,
    format: {
      indent_style: "space",
      indent_width: 4,
      line_ending: "lf",
      magic_trailing_comma: true,
      quote_style: "double",
      skip_magic_trailing_comma: false,
    },
  });

  const result = workspace.format({ source: code });
  workspace.free();
  return result.source;
}

function formatPythonLocal(code: string): string {
  const processed = code.split("\n").map((raw) => {
    let line = normalizeIndent(raw).trimEnd();
    const trimmed = line.trimStart();
    if (trimmed && !trimmed.startsWith("#")) {
      line = fixCommaSpacing(line);
      line = fixOperatorSpacing(line);
      line = fixCallSpacing(line);
    }
    return line;
  });

  const clamped: string[] = [];
  let blankRun = 0;
  for (const line of processed) {
    if (line === "") {
      blankRun++;
      if (blankRun <= 2) clamped.push(line);
    } else {
      blankRun = 0;
      clamped.push(line);
    }
  }

  while (clamped.length > 0 && clamped[0] === "") clamped.shift();
  while (clamped.length > 0 && clamped[clamped.length - 1] === "") clamped.pop();

  return clamped.join("\n") + "\n";
}

async function formatPython(code: string): Promise<string> {
  try {
    return await formatPythonRuff(code);
  } catch {
    return formatPythonLocal(code);
  }
}

function formatCStyle(code: string): string {
  const formatted: string[] = [];
  let indent = 0;

  for (const line of code.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) {
      formatted.push("");
      continue;
    }
    if (trimmed.startsWith("}")) indent = Math.max(0, indent - 1);
    formatted.push("  ".repeat(indent) + trimmed);
    indent = Math.max(0, indent + (trimmed.match(/{/g)?.length ?? 0) - (trimmed.match(/}/g)?.length ?? 0));
  }

  return formatted.join("\n");
}

async function formatJavaScript(code: string): Promise<string> {
  return prettier.format(code, {
    parser: "babel",
    plugins: [prettierBabel, prettierEstree],
    printWidth: 100,
    tabWidth: 2,
    semi: true,
    singleQuote: false,
  });
}

let javaPluginPromise: Promise<any> | null = null;

function loadJavaPlugin(): Promise<any> {
  if (javaPluginPromise) return javaPluginPromise;
  javaPluginPromise = import("prettier-plugin-java").catch((err) => {
    javaPluginPromise = null;
    throw err;
  });
  return javaPluginPromise;
}

async function formatJava(code: string): Promise<string> {
  try {
    const javaPlugin = await loadJavaPlugin();
    return await prettier.format(code, {
      parser: "java",
      plugins: [javaPlugin],
      printWidth: 100,
      tabWidth: 4,
      useTabs: false,
    });
  } catch {
    return formatCStyle(code);
  }
}

let clangFormat: any = null;
let clangLoading: Promise<any> | null = null;

async function loadClangFormat(): Promise<any> {
  if (clangFormat) return clangFormat;
  if (clangLoading) return clangLoading;

  clangLoading = (async () => {
    await new Promise<void>((resolve, reject) => {
      if (document.querySelector("script[data-clang-format]")) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/clang-format-wasm@0.0.14/clang-format/clang-format.js";
      script.dataset.clangFormat = "true";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Không thể tải clang-format-wasm"));
      document.head.appendChild(script);
    });
    clangFormat = await (window as any).createClangFormat();
    return clangFormat;
  })();

  return clangLoading;
}

async function formatCpp(code: string): Promise<string> {
  const cf = await loadClangFormat();
  return cf.format(code, JSON.stringify({ BasedOnStyle: "Google", IndentWidth: 2, ColumnLimit: 100 }));
}

export type FormatResult = {
  formatted: string;
  syntaxError?: boolean;
  message?: string;
};

export async function formatCode(code: string, language: Language): Promise<FormatResult> {
  try {
    switch (language) {
      case Language.PYTHON:
        return { formatted: await formatPython(code) };
      case Language.JAVASCRIPT:
        return { formatted: await formatJavaScript(code) };
      case Language.CPP:
        return { formatted: await formatCpp(code) };
      case Language.JAVA:
        return { formatted: await formatJava(code) };
      default:
        return { formatted: code };
    }
  } catch (e: any) {
    console.error("[formatCode] error:", e);
    return { formatted: code };
  }
}
