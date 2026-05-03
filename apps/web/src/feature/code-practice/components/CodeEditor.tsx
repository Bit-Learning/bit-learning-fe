import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Copy,
  Check,
  RotateCcw,
  Settings,
  Maximize,
  X,
  Clock,
  HardDrive,
  Send,
  Loader2,
  Plus,
  Download,
  AlertCircle,
  Wand2,
  Play,
  Bug,
  FileCode2,
  Terminal,
  HelpCircle,
} from "lucide-react";
import {
  Language,
  SubmissionResultResponse,
  SubmissionStatus,
  RunCodeResponse,
  DebugResponse,
  DebugStep,
  ProblemDetailResponse,
} from "../types/coding.type";
import {
  formatCode,
  highlightCode,
  highlightCodeSync,
  LANGUAGE_EXTENSIONS,
  validatePythonIndentation,
} from "@/shared/lib/code-editor";
import { EditorFile, FileTab } from "./FileTab";
import { cn } from "@workspace/ui/lib/utils";
import { SubmissionStatusBadge } from "./SubmissionStatusBadge";
import { DebugPanel } from "./DebugPanel";

type BottomPanelTab = "submission" | "run" | "debug";

interface CodeEditorProps {
  language: Language;
  code: string;
  problem: ProblemDetailResponse;
  submissionResult: SubmissionResultResponse | null;
  runResult: RunCodeResponse | null;
  debugResult: DebugResponse | null;
  isSubmitting: boolean;
  isRunning: boolean;
  isDebugging: boolean;
  isTemplateLoading?: boolean;
  isMultiFileMode?: boolean;
  hasMultifileTemplate?: boolean;
  onToggleMultiFileMode?: (multi: boolean) => void;
  debugLines: string;
  onLanguageChange: (language: Language) => void;
  onCodeChange: (code: string) => void;
  onFilesChange: (files: EditorFile[], activeFileId: string) => void;
  onDebugLinesChange: (v: string) => void;
  debugCurrentLine?: { line: number; file?: string };
  onDebugStepChange?: (step: DebugStep | null) => void;
  onSubmit: () => void;
  onRun: () => void;
  onDebug: () => void;
  onReset: () => void;
  onCloseResult?: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  code,
  problem,
  submissionResult,
  runResult,
  debugResult,
  isSubmitting,
  isRunning,
  isDebugging,
  isTemplateLoading = false,
  isMultiFileMode = false,
  hasMultifileTemplate = false,
  onToggleMultiFileMode,
  debugLines,
  debugCurrentLine,
  onDebugStepChange,
  onLanguageChange,
  onCodeChange,
  onFilesChange,
  onDebugLinesChange,
  onSubmit,
  onRun,
  onDebug,
  onReset,
  onCloseResult,
}) => {
  const [files, setFiles] = useState<EditorFile[]>([
    {
      id: "1",
      name: `main${LANGUAGE_EXTENSIONS[language]}`,
      content: code,
      language,
    },
  ]);
  const [activeFileId, setActiveFileId] = useState("1");
  const [copied, setCopied] = useState(false);
  const [formatErrors, setFormatErrors] = useState<any[]>([]);
  const [isFormatting, setIsFormatting] = useState(false);
  const [formatMessage, setFormatMessage] = useState<string | null>(null);
  const [bottomTab, setBottomTab] = useState<BottomPanelTab>("submission");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const helpRef = useRef<HTMLDivElement>(null);

  const [bottomPanelHeight, setBottomPanelHeight] = useState<number>(280);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    let rafId: number | null = null;
    let prevY = 0;

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = prevY - e.clientY;
      prevY = e.clientY;
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!isDragging.current || !containerRef.current) return;
        const containerH = containerRef.current.getBoundingClientRect().height;
        setBottomPanelHeight((prev) => Math.min(Math.max(prev + delta, 120), containerH - 100));
      });
    };

    const onMouseDown = (e: MouseEvent) => {
      prevY = e.clientY;
    };

    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  const [breakpointMap, setBreakpointMap] = useState<Map<string, Set<number>>>(new Map());

  const activeBreakpoints: Set<number> = breakpointMap.get(activeFileId) ?? new Set();

  const toggleBreakpoint = useCallback(
    (lineNum: number) => {
      setBreakpointMap((prev) => {
        const next = new Map(prev);
        const fileSet = new Set(next.get(activeFileId) ?? []);
        fileSet.has(lineNum) ? fileSet.delete(lineNum) : fileSet.add(lineNum);
        next.set(activeFileId, fileSet);
        return next;
      });
    },
    [activeFileId],
  );

  const bpKey = [...activeBreakpoints].sort((a, b) => a - b).join(",");
  useEffect(() => {
    onDebugLinesChange(bpKey);
  }, [bpKey]);

  useEffect(() => {
    if (debugLines === "") setBreakpointMap(new Map());
  }, [debugLines]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  const activeFile = files.find((f) => f.id === activeFileId)!;

  const notifyFilesChange = useCallback(
    (next: EditorFile[], nextActiveId: string) => {
      onFilesChange(next, nextActiveId);
    },
    [onFilesChange],
  );

  const handleCodeChange = useCallback(
    (newCode: string) => {
      isInternalChange.current = true;
      setFiles((prev) => {
        const next = prev.map((f) => (f.id === activeFileId ? { ...f, content: newCode } : f));
        notifyFilesChange(next, activeFileId);
        return next;
      });
      onCodeChange(newCode);
    },
    [activeFileId, onCodeChange, notifyFilesChange],
  );

  const prevCodeRef = useRef(code);
  useEffect(() => {
    if (prevCodeRef.current === code) return;
    prevCodeRef.current = code;
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    setFiles((prev) => {
      const active = prev.find((f) => f.id === activeFileId);
      if (active?.content === code) return prev;
      return prev.map((f) => (f.id === activeFileId ? { ...f, content: code } : f));
    });
  }, [code]);

  useEffect(() => {
    setFiles((prev) => {
      const next = prev.map((f) => {
        if (f.id !== activeFileId) return f;
        const newName = f.name.replace(/\.(cpp|java|py|js)$/, LANGUAGE_EXTENSIONS[language]);
        return { ...f, language, name: newName };
      });
      notifyFilesChange(next, activeFileId);
      return next;
    });
  }, [language]);

  useEffect(() => {
    const textarea = textareaRef.current;
    const highlight = highlightRef.current;
    const lineNumbers = lineNumbersRef.current;
    if (!textarea || !highlight) return;
    const handleScroll = () => {
      highlight.scrollTop = textarea.scrollTop;
      highlight.scrollLeft = textarea.scrollLeft;
      if (lineNumbers) lineNumbers.scrollTop = textarea.scrollTop;
    };
    textarea.addEventListener("scroll", handleScroll, { passive: true });
    return () => textarea.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeFile?.language === Language.PYTHON) setFormatErrors(validatePythonIndentation(activeFile.content));
    else setFormatErrors([]);
  }, [activeFile?.content, activeFile?.language]);

  useEffect(() => {
    if (submissionResult) setBottomTab("submission");
  }, [submissionResult]);
  useEffect(() => {
    if (runResult) setBottomTab("run");
  }, [runResult]);
  useEffect(() => {
    if (debugResult) setBottomTab("debug");
  }, [debugResult]);

  const [highlightedCode, setHighlightedCode] = useState<string>(() => highlightCodeSync(activeFile?.content ?? ""));
  useEffect(() => {
    let cancelled = false;
    highlightCode(activeFile?.content ?? "", activeFile?.language ?? language).then((html) => {
      if (!cancelled) setHighlightedCode(html);
    });
    return () => {
      cancelled = true;
    };
  }, [activeFile?.content, activeFile?.language, language]);

  const handleFormat = useCallback(async () => {
    setIsFormatting(true);
    setFormatMessage(null);
    try {
      const { formatted, syntaxError, message } = await formatCode(activeFile.content, activeFile.language);
      handleCodeChange(formatted);
      if (syntaxError && message) setFormatMessage(message);
    } finally {
      setIsFormatting(false);
    }
  }, [activeFile?.content, activeFile?.language, handleCodeChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = activeFile.content;
      const indent = activeFile.language === Language.PYTHON ? "    " : "  ";

      if (e.key === "Tab") {
        e.preventDefault();
        if (start !== end) {
          const lineStart = value.lastIndexOf("\n", start - 1) + 1;
          const lineEnd = value.indexOf("\n", end) === -1 ? value.length : value.indexOf("\n", end);
          const selectedLines = value.slice(lineStart, lineEnd).split("\n");
          const processed = e.shiftKey
            ? selectedLines.map((l) =>
                l.startsWith(indent) ? l.slice(indent.length) : l.startsWith("\t") ? l.slice(1) : l,
              )
            : selectedLines.map((l) => indent + l);
          handleCodeChange(value.slice(0, lineStart) + processed.join("\n") + value.slice(lineEnd));
          setTimeout(() => {
            textarea.selectionStart = lineStart;
            textarea.selectionEnd = lineStart + processed.join("\n").length;
          }, 0);
          return;
        }
        if (e.shiftKey) {
          const lineStart = value.lastIndexOf("\n", start - 1) + 1;
          const before = value.slice(lineStart, start);
          const remove = before.endsWith(indent) ? indent.length : before.endsWith("\t") ? 1 : 0;
          if (remove) {
            handleCodeChange(value.slice(0, start - remove) + value.slice(start));
            setTimeout(() => {
              textarea.selectionStart = textarea.selectionEnd = start - remove;
            }, 0);
          }
        } else {
          handleCodeChange(value.slice(0, start) + indent + value.slice(end));
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + indent.length;
          }, 0);
        }
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        const lineStart = value.lastIndexOf("\n", start - 1) + 1;
        const currentLine = value.slice(lineStart, start);
        const currentIndent = currentLine.match(/^(\s+)/)?.[1] ?? "";
        const extra = currentLine.trimEnd().endsWith(":") || currentLine.trimEnd().endsWith("{") ? indent : "";
        handleCodeChange(value.slice(0, start) + "\n" + currentIndent + extra + value.slice(end));
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1 + currentIndent.length + extra.length;
        }, 0);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleFormat();
      }
    },
    [activeFile?.content, activeFile?.language, handleCodeChange, handleFormat],
  );

  const handleAddFile = useCallback(() => {
    const newFile: EditorFile = {
      id: Date.now().toString(),
      name: `file${files.length}${LANGUAGE_EXTENSIONS[activeFile.language]}`,
      content: "",
      language: activeFile.language,
    };
    setFiles((prev) => {
      const next = [...prev, newFile];
      notifyFilesChange(next, newFile.id);
      return next;
    });
    setActiveFileId(newFile.id);
    isInternalChange.current = true;
  }, [files.length, activeFile?.language, notifyFilesChange]);

  const handleDeleteFile = useCallback(
    (id: string) => {
      if (files.length === 1) return;
      const deletedIndex = files.findIndex((f) => f.id === id);
      const remaining = files.filter((f) => f.id !== id);
      const newActiveId =
        activeFileId === id ? (remaining[deletedIndex]?.id ?? remaining[deletedIndex - 1]?.id!) : activeFileId;
      setFiles(remaining);
      notifyFilesChange(remaining, newActiveId);
      if (activeFileId === id) setActiveFileId(newActiveId);
    },
    [files, activeFileId, notifyFilesChange],
  );

  const handleRenameFile = useCallback(
    (id: string, newName: string) => {
      setFiles((prev) => {
        const next = prev.map((f) => (f.id === id ? { ...f, name: newName } : f));
        notifyFilesChange(next, activeFileId);
        return next;
      });
    },
    [activeFileId, notifyFilesChange],
  );

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [activeFile?.content]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([activeFile.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeFile.name;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeFile?.content, activeFile?.name]);

  const passedCount =
    submissionResult?.testcaseResults?.filter((r) => r.status === SubmissionStatus.ACCEPTED).length ?? 0;
  const totalCount = submissionResult?.testcaseResults?.length ?? 0;
  const hasBottomPanel = !!(submissionResult || runResult || debugResult);
  const parsedDebugLines = debugLines
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n > 0);
  const lineCount = activeFile.content.split("\n").length;

  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleScroll = () => {
      setScrollTop(textarea.scrollTop);
    };

    textarea.addEventListener("scroll", handleScroll);
    return () => textarea.removeEventListener("scroll", handleScroll);
  }, []);
  const getLineHeight = () => {
    const el = textareaRef.current;
    if (!el) return 24;
    const computed = window.getComputedStyle(el);
    return parseFloat(computed.lineHeight);
  };

  const lineHeight = getLineHeight();
  const paddingTop = 16;

  return (
    <div ref={containerRef} className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="h-12 flex items-center bg-gray-800 border-b border-gray-700">
        <div className="flex items-center px-4">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
        </div>
        <div className="flex flex-1 overflow-x-auto">
          {files.map((file, index) => (
            <FileTab
              key={file.id}
              file={file}
              isActive={file.id === activeFileId}
              onClick={() => setActiveFileId(file.id)}
              onDelete={() => handleDeleteFile(file.id)}
              onRename={(newName) => handleRenameFile(file.id, newName)}
              canDelete={files.length > 1 && index !== 0}
              canRename={index !== 0}
            />
          ))}
        </div>
        {isMultiFileMode && (
          <button
            onClick={handleAddFile}
            className="cursor-pointer px-4 py-2 hover:bg-gray-700 transition-colors border-l text-white border-gray-700"
            title="Thêm file mới"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="h-12 flex items-center justify-between px-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as Language)}
            className="bg-gray-700 px-3 py-1.5 rounded-md text-sm font-medium text-gray-200 border-none cursor-pointer hover:bg-gray-600"
          >
            <option value={Language.CPP}>C++</option>
            <option value={Language.JAVA}>Java</option>
            <option value={Language.PYTHON}>Python</option>
            <option value={Language.JAVASCRIPT}>JavaScript</option>
          </select>
          {/* {formatErrors.length > 0 && (
            <div className="flex items-center gap-1.5 text-yellow-400 text-xs">
              <AlertCircle className="w-4 h-4" />
              <span>
                {formatErrors.length} formatting issue
                {formatErrors.length > 1 ? "s" : ""}
              </span>
            </div>
          )} */}
        </div>
        <div className="flex items-center gap-4 text-gray-300">
          <button
            onClick={handleFormat}
            disabled={isFormatting}
            className="cursor-pointer hover:text-white transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {isFormatting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
            <span className="text-xs">{isFormatting ? "Formatting..." : "Format"}</span>
          </button>
          <div className="h-5 w-px bg-gray-600" />
          <button onClick={handleDownload} className="cursor-pointer hover:text-white transition-colors">
            <Download className="w-5 h-5" />
          </button>
          <button onClick={handleCopyCode} className="cursor-pointer hover:text-white transition-colors">
            {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
          </button>
          <button onClick={onReset} className="cursor-pointer hover:text-white transition-colors">
            <RotateCcw className="w-5 h-5" />
          </button>
          <div ref={settingsRef} className="relative inline-flex items-center">
            <button
              onClick={() => setSettingsOpen((v) => !v)}
              className={cn("cursor-pointer hover:text-white transition-colors", settingsOpen && "text-white")}
              title="Cài đặt editor"
            >
              <Settings className="w-5 h-5" />
            </button>
            {settingsOpen && (
              <div className="absolute right-0 top-8 z-50 w-60 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 text-sm">
                <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-gray-300 font-semibold border-b border-gray-700">
                  Cài đặt
                </div>

                {hasMultifileTemplate && (
                  <>
                    <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-gray-600 font-semibold">
                      Chế độ nộp bài
                    </div>
                    <div className="flex items-center gap-1 mx-3 mb-2 p-0.5 bg-gray-700 rounded-lg">
                      <button
                        onClick={() => {
                          onToggleMultiFileMode?.(false);
                          setSettingsOpen(false);
                        }}
                        className={cn(
                          "cursor-pointer flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-semibold rounded-md transition-all",
                          !isMultiFileMode ? "bg-gray-900 text-white shadow-sm" : "text-gray-300 hover:text-gray-200",
                        )}
                      >
                        <FileCode2 className="w-3.5 h-3.5" />1 file
                      </button>
                      <button
                        onClick={() => {
                          onToggleMultiFileMode?.(true);
                          setSettingsOpen(false);
                        }}
                        className={cn(
                          "cursor-pointer flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-semibold rounded-md transition-all",
                          isMultiFileMode ? "bg-gray-900 text-white shadow-sm" : "text-gray-300 hover:text-gray-200",
                        )}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Nhiều file
                      </button>
                    </div>
                    <div className="border-t border-gray-700 my-1" />
                  </>
                )}

                {isMultiFileMode && (
                  <button
                    onClick={() => {
                      handleAddFile();
                      setSettingsOpen(false);
                    }}
                    className="cursor-pointer w-full flex items-center gap-2.5 px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <Plus className="w-4 h-4 text-gray-300" />
                    Thêm file mới
                  </button>
                )}

                {!hasMultifileTemplate && (
                  <div className="px-3 py-3 text-xs text-gray-600 text-center">Bài tập này chỉ hỗ trợ nộp 1 file.</div>
                )}
              </div>
            )}
          </div>
          <div
            ref={helpRef}
            className="relative"
            onMouseEnter={() => setHelpOpen(true)}
            onMouseLeave={() => setHelpOpen(false)}
          >
            <button className="cursor-pointer hover:text-white transition-colors mt-1.5">
              <HelpCircle className="w-5 h-5" />
            </button>

            {helpOpen && (
              <div className="absolute right-0 top-8 z-50 w-72 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-4 text-sm">
                <div className="text-sm uppercase tracking-wider text-white font-semibold mb-3">Hướng dẫn sử dụng</div>

                <div className="flex flex-col gap-3">
                  <div className="flex gap-3 items-start">
                    <span className="mt-0.5 bg-green-950 rounded-md p-1.5 shrink-0">
                      <Play className="w-3 h-3 text-green-400" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-green-200 mb-0.5">Chạy thử</p>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        Chạy code với test cases mẫu. Xem ngay output mà không cần nộp bài.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <span className="mt-0.5 bg-yellow-950 rounded-md p-1.5 shrink-0">
                      <Bug className="w-3 h-3 text-yellow-400" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-yellow-200 mb-0.5">Debug</p>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        Click vào số dòng để đặt breakpoint (chấm đỏ), rồi bấm Debug để kiểm tra giá trị biến từng bước.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <span className="mt-0.5 bg-blue-950 rounded-md p-1.5 shrink-0">
                      <Send className="w-3 h-3 text-blue-400" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-blue-200 mb-0.5">Nộp bài</p>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        Nộp code để chấm với toàn bộ test cases ẩn. Kết quả hiển thị bên dưới.
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-800 mt-1 pt-3 flex flex-col gap-1.5">
                    <p className="text-xs text-gray-300">
                      <kbd className="bg-gray-700 text-white text-xs px-1.5 py-0.5 rounded font-mono">Tab</kbd>
                      {" / "}
                      <kbd className="bg-gray-700 text-white text-xs px-1.5 py-0.5 rounded font-mono">Shift+Tab</kbd>
                      {" để thụt lề"}
                    </p>
                    <p className="text-[11px] text-gray-300">
                      <kbd className="bg-gray-700 text-white text-xs px-1.5 py-0.5 rounded font-mono">Ctrl+S</kbd>
                      {" để format code tự động"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={cn("relative overflow-hidden flex min-h-0", hasBottomPanel ? "flex-1" : "flex-1")}>
        {formatMessage && (
          <div className="absolute bottom-0 left-0 right-0 bg-orange-900/30 border-b border-orange-700 px-4 py-2 flex items-center gap-3 z-10">
            <AlertCircle className="w-4 h-4 text-orange-400 shrink-0" />
            <span className="text-orange-200 text-xs flex-1">{formatMessage}</span>
            <button onClick={() => setFormatMessage(null)} className="text-orange-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div
          ref={lineNumbersRef}
          className="shrink-0 w-12 bg-gray-900 border-r border-gray-700 pt-4 pb-4 overflow-hidden select-none"
        >
          <div className="font-mono text-sm text-right" style={{ lineHeight: 1.6 }}>
            {Array.from({ length: lineCount }, (_, idx) => {
              const lineNum = idx + 1;
              const isBp = activeBreakpoints.has(lineNum);
              return (
                <div
                  key={lineNum}
                  onClick={() => toggleBreakpoint(lineNum)}
                  className="relative flex items-center justify-end pr-2 cursor-pointer group"
                  style={{ height: "1.6em" }}
                  title={isBp ? "Xóa breakpoint" : "Đặt breakpoint"}
                >
                  <span
                    className={cn(
                      "absolute left-1.5 w-2.5 h-2.5 rounded-full transition-all duration-100",
                      isBp ? "bg-red-500 opacity-100" : "bg-red-500 opacity-0 group-hover:opacity-30",
                    )}
                    style={{ top: "50%", transform: "translateY(-50%)" }}
                  />
                  <span className={cn("text-xs", isBp ? "text-red-400" : "text-gray-300 group-hover:text-gray-300")}>
                    {lineNum}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative flex-1 h-full bg-gray-900 font-mono text-sm overflow-hidden">
          {isTemplateLoading && (
            <div className="absolute inset-0 p-4 z-10 bg-gray-900 space-y-3">
              {[70, 50, 85, 40, 60, 75, 45].map((w, i) => (
                <div
                  key={i}
                  className="h-4 rounded bg-gray-700 animate-pulse"
                  style={{ width: `${w}%`, animationDelay: `${i * 60}ms` }}
                />
              ))}
            </div>
          )}

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              transform: `translateY(-${scrollTop}px)`,
            }}
          >
            {[...activeBreakpoints].map((lineNum) => (
              <div
                key={lineNum}
                className="absolute left-0 right-0 bg-red-500/10"
                style={{
                  top: paddingTop + (lineNum - 1) * lineHeight,
                  height: lineHeight,
                }}
              />
            ))}
            {debugCurrentLine && (!debugCurrentLine.file || debugCurrentLine.file === activeFile.name) && (
              <div
                className="absolute left-0 right-0 bg-yellow-400/15 border-l-2 border-yellow-400"
                style={{
                  top: paddingTop + (debugCurrentLine.line - 1) * lineHeight,
                  height: lineHeight,
                }}
              />
            )}
          </div>

          <pre
            ref={highlightRef}
            className="absolute inset-0 p-4 pointer-events-none whitespace-pre overflow-auto m-0"
            style={{ color: "#e5e7eb", lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
          <textarea
            ref={textareaRef}
            value={activeFile.content}
            onChange={(e) => handleCodeChange(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            className="absolute inset-0 p-4 resize-none border-0 outline-none bg-transparent whitespace-pre overflow-auto"
            style={{
              color: "transparent",
              caretColor: "white",
              lineHeight: 1.6,
            }}
          />
        </div>
      </div>

      {hasBottomPanel && (
        <div
          onMouseDown={handleDividerMouseDown}
          className="shrink-0 h-1.5 bg-gray-800 hover:bg-blue-500/40 active:bg-blue-500/60 cursor-row-resize transition-colors flex items-center justify-center group"
        >
          <div className="w-8 h-0.5 rounded-full bg-gray-600 group-hover:bg-blue-400 transition-colors" />
        </div>
      )}

      {hasBottomPanel && (
        <div
          className="shrink-0 bg-gray-950 border-t border-gray-800 flex flex-col overflow-hidden"
          style={{ height: bottomPanelHeight }}
        >
          <div className="px-4 py-0 border-b border-gray-800 flex items-center justify-between bg-gray-900">
            <div className="flex items-center gap-1">
              {submissionResult && (
                <button
                  onClick={() => setBottomTab("submission")}
                  className={cn(
                    "cursor-pointer flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2",
                    bottomTab === "submission"
                      ? "text-blue-400 border-blue-500"
                      : "text-gray-300 border-transparent hover:text-gray-300",
                  )}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  Kết quả nộp
                </button>
              )}
              {runResult && (
                <button
                  onClick={() => setBottomTab("run")}
                  className={cn(
                    "cursor-pointer flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2",
                    bottomTab === "run"
                      ? "text-green-400 border-green-500"
                      : "text-gray-300 border-transparent hover:text-gray-300",
                  )}
                >
                  <Play className="w-3.5 h-3.5" />
                  Chạy thử
                </button>
              )}
              {debugResult && (
                <button
                  onClick={() => setBottomTab("debug")}
                  className={cn(
                    "cursor-pointer flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2",
                    bottomTab === "debug"
                      ? "text-yellow-400 border-yellow-500"
                      : "text-gray-300 border-transparent hover:text-gray-300",
                  )}
                >
                  <Bug className="w-3.5 h-3.5" />
                  Debug
                </button>
              )}
            </div>
            <button onClick={onCloseResult} className="cursor-pointer text-gray-300 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto font-mono text-xs">
            {bottomTab === "submission" && submissionResult && (
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <SubmissionStatusBadge status={submissionResult.status} showIcon />
                  <span className="text-gray-300">
                    ({passedCount}/{totalCount} test cases passed)
                  </span>
                </div>
                {submissionResult.testcaseResults?.map((result, idx) => {
                  const isPass = result.status === SubmissionStatus.ACCEPTED;
                  return (
                    <div key={result.testcaseId} className="flex gap-4">
                      <span className={cn("font-bold", isPass ? "text-green-500" : "text-red-500")}>
                        CASE {idx + 1}:
                      </span>
                      <span className="text-gray-300">
                        {result.executionTimeMs}ms | {result.memoryUsageMb}MB
                      </span>
                      <span className={isPass ? "text-green-400" : "text-red-400"}>
                        {isPass ? "✓ Chính xác" : "✗ Sai"}
                      </span>
                      {!isPass && result.actualOutput && <span className="text-red-300">→ {result.actualOutput}</span>}
                    </div>
                  );
                })}
                {submissionResult.errorMessage && (
                  <div className="mt-3 p-3 bg-red-900/20 border border-red-800 rounded text-red-400">
                    <div className="font-bold mb-1">Error:</div>
                    <div className="whitespace-pre-wrap">{submissionResult.errorMessage}</div>
                  </div>
                )}
              </div>
            )}

            {bottomTab === "run" && runResult && (
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <SubmissionStatusBadge status={runResult.overallStatus} showIcon />
                </div>
                {runResult.compileError && (
                  <div className="p-3 bg-red-900/20 border border-red-800 rounded text-red-400 mb-3">
                    <div className="font-bold mb-1">Compile Error:</div>
                    <div className="whitespace-pre-wrap">{runResult.compileError}</div>
                  </div>
                )}
                {runResult.testCaseResults.map((tc, idx) => {
                  const isPass = tc.status === SubmissionStatus.ACCEPTED;
                  return (
                    <div key={idx} className="border border-gray-800 rounded p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className={cn("font-bold", isPass ? "text-green-500" : "text-red-500")}>
                          Case {idx + 1}
                        </span>
                        <span className="text-gray-300">
                          {tc.executionTimeMs}ms | {tc.memoryUsageMb}MB
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-gray-300 mb-0.5">Input</div>
                          <pre className="bg-gray-900 p-1.5 rounded text-gray-300 whitespace-pre-wrap">{tc.input}</pre>
                        </div>
                        {tc.expectedOutput && (
                          <div>
                            <div className="text-gray-300 mb-0.5">Expected</div>
                            <pre className="bg-gray-900 p-1.5 rounded text-gray-300 whitespace-pre-wrap">
                              {tc.expectedOutput}
                            </pre>
                          </div>
                        )}
                      </div>
                      {!isPass && (
                        <div>
                          <div className="text-red-400 mb-0.5">Got</div>
                          <pre className="bg-red-900/20 border border-red-800 p-1.5 rounded text-red-300 whitespace-pre-wrap">
                            {tc.actualOutput || tc.errorMessage || "(no output)"}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {bottomTab === "debug" && (
              <div className="h-full">
                <DebugPanel
                  result={debugResult}
                  isDebugging={isDebugging}
                  breakpointCount={activeBreakpoints.size}
                  onStepChange={onDebugStepChange}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="h-16 flex items-center justify-between px-6 bg-gray-900 border-t border-gray-800 shrink-0">
        <div className="flex items-center gap-2 text-gray-300">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{problem.timeLimitMs}ms</span>
          <div className="mx-2 h-4 w-px bg-gray-700" />
          <HardDrive className="w-4 h-4" />
          <span className="text-sm">{problem.memoryLimitMb}MB</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onRun}
            disabled={isRunning || !activeFile.content.trim()}
            className={cn(
              "px-4 py-2 rounded text-sm font-semibold border transition-all flex items-center gap-2 cursor-pointer",
              isRunning || !activeFile.content.trim()
                ? "bg-gray-800 text-gray-300 border-gray-700 cursor-not-allowed"
                : "bg-gray-800 text-green-400 border-green-700 hover:bg-green-900/30",
            )}
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang chạy...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Chạy thử</span>
              </>
            )}
          </button>

          <button
            onClick={onDebug}
            disabled={isDebugging || !activeFile.content.trim() || parsedDebugLines.length === 0}
            title={parsedDebugLines.length === 0 ? "Click vào số dòng để đặt breakpoint" : ""}
            className={cn(
              "px-4 py-2 rounded text-sm font-semibold border transition-all flex items-center gap-2 cursor-pointer",
              isDebugging || !activeFile.content.trim() || parsedDebugLines.length === 0
                ? "bg-gray-800 text-gray-300 border-gray-700 cursor-not-allowed"
                : "bg-gray-800 text-yellow-400 border-yellow-700 hover:bg-yellow-900/30",
            )}
          >
            {isDebugging ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang debug...</span>
              </>
            ) : (
              <>
                <Bug className="w-4 h-4" />
                <span>Debug</span>
                {activeBreakpoints.size > 0 && (
                  <span className="bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {activeBreakpoints.size}
                  </span>
                )}
              </>
            )}
          </button>

          <button
            onClick={onSubmit}
            disabled={isSubmitting || !activeFile.content.trim()}
            className={cn(
              "px-6 py-2 rounded text-white text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer",
              isSubmitting || !activeFile.content.trim()
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700",
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang nộp...</span>
              </>
            ) : (
              <>
                <span>Nộp bài</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="px-6 py-2 bg-gray-900 border-t border-gray-800 flex items-center gap-4 shrink-0 min-h-0">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <Bug className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
          <span className="text-xs text-gray-300 shrink-0">Breakpoints:</span>
          {activeBreakpoints.size === 0 ? (
            <span className="text-xs text-gray-600 italic">Click vào số dòng để đặt breakpoint</span>
          ) : (
            [...activeBreakpoints]
              .sort((a, b) => a - b)
              .map((ln) => (
                <button
                  key={ln}
                  onClick={() => toggleBreakpoint(ln)}
                  title="Click để xóa"
                  className="flex items-center gap-0.5 bg-red-900/40 border border-red-800/60 text-red-300 text-[10px] px-1.5 py-0.5 rounded font-mono hover:bg-red-900/70 transition-colors"
                >
                  {ln}
                  <X className="w-2 h-2 ml-0.5" />
                </button>
              ))
          )}
        </div>
      </div>
    </div>
  );
};
