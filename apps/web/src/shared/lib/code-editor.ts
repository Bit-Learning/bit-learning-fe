import { FormatError, Language } from "@/feature/code-practice/types/coding.type";

export const LANGUAGE_EXTENSIONS: Record<Language, string> = {
  [Language.CPP]: ".cpp",
  [Language.JAVA]: ".java",
  [Language.PYTHON]: ".py",
  [Language.JAVASCRIPT]: ".js",
};

export function highlightCode(code: string, language: Language): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const LANG_KEYWORD_GROUPS: Record<Language, Record<string, Set<string>>> = {
    [Language.PYTHON]: {
      pink: new Set(["return", "break", "continue", "pass", "yield"]),
      orange: new Set(["class", "def", "import", "from", "as", "with", "lambda", "async", "await"]),
      purple: new Set([
        "if",
        "else",
        "elif",
        "for",
        "while",
        "try",
        "except",
        "finally",
        "in",
        "and",
        "or",
        "not",
        "is",
      ]),
      yellow: new Set(["None", "True", "False"]),
    },
    [Language.JAVASCRIPT]: {
      pink: new Set(["return", "break", "continue", "yield", "throw"]),
      orange: new Set([
        "const",
        "let",
        "var",
        "function",
        "class",
        "import",
        "export",
        "default",
        "new",
        "delete",
        "typeof",
        "instanceof",
        "void",
        "static",
      ]),
      purple: new Set([
        "if",
        "else",
        "for",
        "while",
        "do",
        "switch",
        "case",
        "try",
        "catch",
        "finally",
        "of",
        "in",
        "async",
        "await",
        "extends",
      ]),
      yellow: new Set(["null", "undefined", "true", "false", "this"]),
    },
    [Language.CPP]: {
      pink: new Set(["return", "break", "continue", "goto"]),
      orange: new Set([
        "class",
        "struct",
        "namespace",
        "using",
        "template",
        "typename",
        "typedef",
        "enum",
        "new",
        "delete",
        "this",
        "operator",
        "explicit",
        "friend",
        "virtual",
        "override",
        "final",
      ]),
      purple: new Set(["if", "else", "for", "while", "do", "switch", "case", "default"]),
      green: new Set([
        "int",
        "float",
        "double",
        "char",
        "void",
        "bool",
        "long",
        "short",
        "unsigned",
        "signed",
        "auto",
        "const",
        "static",
        "inline",
        "extern",
        "volatile",
        "mutable",
        "constexpr",
        "decltype",
        "noexcept",
        "register",
        "thread_local",
      ]),
      yellow: new Set(["nullptr", "true", "false", "sizeof", "alignof", "static_assert"]),
      gray: new Set(["include", "define", "ifdef", "ifndef", "endif", "pragma"]),
    },
    [Language.JAVA]: {
      pink: new Set(["return", "break", "continue", "throw", "yield"]),
      orange: new Set([
        "class",
        "interface",
        "enum",
        "extends",
        "implements",
        "new",
        "this",
        "super",
        "import",
        "package",
        "record",
        "sealed",
        "permits",
      ]),
      purple: new Set([
        "if",
        "else",
        "for",
        "while",
        "do",
        "switch",
        "case",
        "default",
        "try",
        "catch",
        "finally",
        "throws",
        "instanceof",
      ]),
      green: new Set(["int", "float", "double", "char", "void", "boolean", "long", "short", "byte", "var"]),
      blue: new Set([
        "public",
        "private",
        "protected",
        "static",
        "final",
        "abstract",
        "native",
        "strictfp",
        "transient",
        "volatile",
        "synchronized",
      ]),
      yellow: new Set(["null", "true", "false"]),
    },
  };

  const COLOR_MAP: Record<string, string> = {
    pink: "#f472b6",
    orange: "#fb923c",
    purple: "#a78bfa",
    green: "#4ade80",
    blue: "#60a5fa",
    yellow: "#fbbf24",
    gray: "#94a3b8",
  };

  const LANG_TYPES: Record<Language, Set<string>> = {
    [Language.PYTHON]: new Set([
      "int",
      "str",
      "float",
      "list",
      "dict",
      "set",
      "tuple",
      "bool",
      "bytes",
      "complex",
      "type",
      "object",
      "Exception",
      "BaseException",
    ]),
    [Language.JAVASCRIPT]: new Set([
      "Array",
      "Object",
      "Map",
      "Set",
      "WeakMap",
      "WeakSet",
      "Promise",
      "String",
      "Number",
      "Boolean",
      "Symbol",
      "BigInt",
      "Error",
      "TypeError",
      "RangeError",
      "Date",
      "RegExp",
      "JSON",
      "Math",
      "Proxy",
      "Reflect",
      "Intl",
    ]),
    [Language.CPP]: new Set([
      "vector",
      "map",
      "set",
      "unordered_map",
      "unordered_set",
      "multimap",
      "multiset",
      "pair",
      "tuple",
      "stack",
      "queue",
      "deque",
      "priority_queue",
      "list",
      "forward_list",
      "array",
      "bitset",
      "string",
      "wstring",
      "size_t",
      "ptrdiff_t",
      "uint8_t",
      "uint16_t",
      "uint32_t",
      "uint64_t",
      "int8_t",
      "int16_t",
      "int32_t",
      "int64_t",
      "shared_ptr",
      "unique_ptr",
      "weak_ptr",
      "optional",
      "variant",
      "any",
    ]),
    [Language.JAVA]: new Set([
      "Integer",
      "Long",
      "Double",
      "Float",
      "Character",
      "Boolean",
      "Short",
      "Byte",
      "String",
      "StringBuilder",
      "StringBuffer",
      "ArrayList",
      "LinkedList",
      "HashMap",
      "TreeMap",
      "LinkedHashMap",
      "HashSet",
      "TreeSet",
      "LinkedHashSet",
      "ArrayDeque",
      "List",
      "Map",
      "Set",
      "Queue",
      "Deque",
      "Collection",
      "Iterable",
      "Iterator",
      "Optional",
      "Stream",
      "Arrays",
      "Collections",
      "Objects",
      "Math",
      "Exception",
      "RuntimeException",
      "NullPointerException",
      "IllegalArgumentException",
      "Object",
      "Comparable",
      "Comparator",
      "Runnable",
      "Thread",
      "System",
    ]),
  };

  const LANG_BUILTINS: Record<Language, Set<string>> = {
    [Language.PYTHON]: new Set([
      "print",
      "len",
      "range",
      "enumerate",
      "zip",
      "map",
      "filter",
      "sorted",
      "reversed",
      "sum",
      "max",
      "min",
      "abs",
      "round",
      "pow",
      "divmod",
      "isinstance",
      "issubclass",
      "hasattr",
      "getattr",
      "setattr",
      "delattr",
      "type",
      "id",
      "hash",
      "repr",
      "open",
      "input",
      "format",
      "hex",
      "bin",
      "oct",
      "chr",
      "ord",
      "eval",
      "exec",
      "vars",
      "dir",
      "super",
      "property",
      "staticmethod",
      "classmethod",
    ]),
    [Language.JAVASCRIPT]: new Set([
      "console",
      "log",
      "warn",
      "error",
      "info",
      "debug",
      "parseInt",
      "parseFloat",
      "isNaN",
      "isFinite",
      "setTimeout",
      "setInterval",
      "clearTimeout",
      "clearInterval",
      "fetch",
      "alert",
      "confirm",
      "prompt",
      "push",
      "pop",
      "shift",
      "unshift",
      "slice",
      "splice",
      "concat",
      "join",
      "reverse",
      "sort",
      "flat",
      "flatMap",
      "find",
      "findIndex",
      "includes",
      "indexOf",
      "every",
      "some",
      "reduce",
      "forEach",
      "toString",
      "valueOf",
      "hasOwnProperty",
      "then",
      "catch",
      "resolve",
      "reject",
      "all",
      "race",
      "allSettled",
    ]),
    [Language.CPP]: new Set([
      "cout",
      "cin",
      "cerr",
      "endl",
      "flush",
      "printf",
      "scanf",
      "sprintf",
      "fprintf",
      "push_back",
      "pop_back",
      "emplace_back",
      "emplace",
      "size",
      "empty",
      "clear",
      "resize",
      "reserve",
      "begin",
      "end",
      "rbegin",
      "rend",
      "find",
      "count",
      "insert",
      "erase",
      "at",
      "front",
      "back",
      "top",
      "sort",
      "stable_sort",
      "reverse",
      "unique",
      "lower_bound",
      "upper_bound",
      "binary_search",
      "min",
      "max",
      "swap",
      "fill",
      "copy",
      "move",
      "make_pair",
      "make_shared",
      "make_unique",
      "abs",
      "sqrt",
      "pow",
      "ceil",
      "floor",
      "round",
      "log",
      "memset",
      "memcpy",
      "strlen",
    ]),
    [Language.JAVA]: new Set([
      "println",
      "print",
      "printf",
      "format",
      "toString",
      "equals",
      "hashCode",
      "compareTo",
      "valueOf",
      "parseInt",
      "parseDouble",
      "parseLong",
      "length",
      "size",
      "isEmpty",
      "contains",
      "add",
      "remove",
      "get",
      "set",
      "put",
      "clear",
      "sort",
      "binarySearch",
      "asList",
      "copyOf",
      "max",
      "min",
      "abs",
      "pow",
      "sqrt",
      "ceil",
      "floor",
      "round",
      "random",
      "charAt",
      "substring",
      "indexOf",
      "startsWith",
      "endsWith",
      "trim",
      "strip",
      "split",
      "replace",
      "replaceAll",
      "toUpperCase",
      "toLowerCase",
      "append",
      "stream",
      "filter",
      "collect",
      "forEach",
      "findFirst",
      "anyMatch",
      "currentTimeMillis",
      "arraycopy",
      "exit",
    ]),
  };

  const COMMENT_PREFIX: Record<Language, string> = {
    [Language.PYTHON]: "#",
    [Language.JAVASCRIPT]: "//",
    [Language.CPP]: "//",
    [Language.JAVA]: "//",
  };

  const keywordGroups = LANG_KEYWORD_GROUPS[language];
  const types = LANG_TYPES[language];
  const builtins = LANG_BUILTINS[language];
  const commentPrefix = COMMENT_PREFIX[language];

  type Token = { kind: "string" | "comment" | "code"; value: string };

  const tokenizeLine = (line: string): Token[] => {
    const tokens: Token[] = [];
    let i = 0;
    let buf = "";

    while (i < line.length) {
      if (line.slice(i, i + commentPrefix.length) === commentPrefix) {
        if (buf) {
          tokens.push({ kind: "code", value: buf });
          buf = "";
        }
        tokens.push({ kind: "comment", value: line.slice(i) });
        return tokens;
      }

      const ch = line[i]!;

      if (ch === '"' || ch === "'") {
        const triple = ch + ch + ch;
        if (line.slice(i, i + 3) === triple) {
          if (buf) {
            tokens.push({ kind: "code", value: buf });
            buf = "";
          }
          let str = triple;
          i += 3;
          while (i < line.length) {
            if (line.slice(i, i + 3) === triple) {
              str += triple;
              i += 3;
              break;
            }
            str += line[i++];
          }
          tokens.push({ kind: "string", value: str });
          continue;
        }
        if (buf) {
          tokens.push({ kind: "code", value: buf });
          buf = "";
        }
        let str = ch;
        i++;
        while (i < line.length) {
          if (line[i] === "\\" && i + 1 < line.length) {
            str += line[i]! + line[i + 1];
            i += 2;
          } else if (line[i] === ch) {
            str += line[i++];
            break;
          } else {
            str += line[i++];
          }
        }
        tokens.push({ kind: "string", value: str });
        continue;
      }

      buf += ch;
      i++;
    }

    if (buf) tokens.push({ kind: "code", value: buf });
    return tokens;
  };

  const renderCodeToken = (value: string): string => {
    return esc(value).replace(/\b([a-zA-Z_][a-zA-Z0-9_]*|\d+(?:\.\d+)?)\b/g, (word) => {
      for (const [group, wordSet] of Object.entries(keywordGroups)) {
        if ((wordSet as Set<string>).has(word)) {
          const color = COLOR_MAP[group]!;
          const bold = group === "pink" || group === "orange" ? ";font-weight:600" : "";
          return `<span style="color:${color}${bold}">${word}</span>`;
        }
      }
      if (types.has(word)) return `<span style="color:#2dd4bf">${word}</span>`;
      if (builtins.has(word)) return `<span style="color:#818cf8">${word}</span>`;
      if (/^\d+(\.\d+)?$/.test(word)) return `<span style="color:#e879f9">${word}</span>`;
      return word;
    });
  };

  return code
    .split("\n")
    .map((line) =>
      tokenizeLine(line)
        .map((tok) => {
          if (tok.kind === "string") return `<span style="color:#fcd34d">${esc(tok.value)}</span>`;
          if (tok.kind === "comment") return `<span style="color:#6b7280;font-style:italic">${esc(tok.value)}</span>`;
          return renderCodeToken(tok.value);
        })
        .join(""),
    )
    .join("\n");
}

export function validatePythonIndentation(code: string): FormatError[] {
  const lines = code.split("\n");
  const errors: FormatError[] = [];
  const indentStack: number[] = [0];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line?.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;

    const indent = line?.length! - line?.trimStart().length!;

    if (line?.includes("\t")) {
      errors.push({
        line: i + 1,
        message: "Use spaces instead of tabs for indentation",
      });
      continue;
    }

    if (indent % 4 !== 0) {
      errors.push({
        line: i + 1,
        message: "Indentation should be a multiple of 4 spaces",
      });
    }

    if (trimmed.endsWith(":")) {
      indentStack.push(indent + 4);
    } else {
      while (indentStack.length > 1 && indent < indentStack[indentStack.length - 1]!) {
        indentStack.pop();
      }

      if (indent !== indentStack[indentStack.length - 1] && indent !== 0) {
        errors.push({
          line: i + 1,
          message: `Unexpected indentation (expected ${indentStack[indentStack.length - 1]} spaces)`,
        });
      }
    }
  }

  return errors;
}

function formatPythonCode(code: string): string {
  const lines = code.split("\n");
  const formatted: string[] = [];
  let indentLevel = 0;

  for (let line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      formatted.push("");
      continue;
    }

    if (
      trimmed.startsWith("elif ") ||
      trimmed.startsWith("else:") ||
      trimmed.startsWith("except ") ||
      trimmed.startsWith("except:") ||
      trimmed.startsWith("finally:")
    ) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    const indent = "    ".repeat(indentLevel);
    formatted.push(indent + trimmed);

    if (trimmed.endsWith(":")) {
      indentLevel++;
    }
  }

  return formatted.join("\n");
}

function formatCStyleCode(code: string): string {
  const lines = code.split("\n");
  const formatted: string[] = [];
  let indentLevel = 0;

  for (let line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      formatted.push("");
      continue;
    }

    if (trimmed.startsWith("}")) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    const indent = "  ".repeat(indentLevel);
    formatted.push(indent + trimmed);

    const openBraces = (trimmed.match(/{/g) || []).length;
    const closeBraces = (trimmed.match(/}/g) || []).length;
    indentLevel += openBraces - closeBraces;
    indentLevel = Math.max(0, indentLevel);
  }

  return formatted.join("\n");
}

export function formatCode(code: string, language: Language): string {
  switch (language) {
    case Language.PYTHON:
      return formatPythonCode(code);
    case Language.CPP:
    case Language.JAVA:
    case Language.JAVASCRIPT:
      return formatCStyleCode(code);
    default:
      return code;
  }
}
