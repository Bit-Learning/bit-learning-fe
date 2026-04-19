import React, { useState, useEffect, useRef, useMemo } from "react";
import { FileCode, Upload, Trash2, Info, ChevronDown } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { useSubmitSolution, useContestRunCode, useContestDebugCode } from "../queries/useContest";
import { useParams } from "@tanstack/react-router";
import { useCodeTemplates, useProblemDetail } from "@/feature/code-practice/queries/useCoding";
import {
  Language,
  SubmissionStatus,
  type RunCodeResponse,
  type DebugResponse,
  type DebugStep,
} from "@/feature/code-practice/types/coding.type";
import { EditorFile } from "@/feature/code-practice/components/FileTab";
import { CodeEditor } from "@/feature/code-practice/components/CodeEditor";
import type {
  ContestRunResponse,
  ContestDebugResponse,
  ContestRunRequest,
  ContestDebugRequest,
  ContestVerdict,
} from "../types/contest.type";

type SubmitMode = "editor" | "file";

interface ProblemSubmitTabProps {
  contestProblemId: string;
  problemId: string;
  disabled?: boolean;
}

function verdictToSubmissionStatus(verdict: ContestVerdict | "COMPILE_ERROR" | string): SubmissionStatus {
  switch (verdict) {
    case "AC":
    case "ACCEPTED":
      return SubmissionStatus.ACCEPTED;
    case "WA":
    case "WRONG_ANSWER":
      return SubmissionStatus.WRONG_ANSWER;
    case "TLE":
    case "TIME_LIMIT_EXCEEDED":
      return SubmissionStatus.TIME_LIMIT_EXCEEDED;
    case "MLE":
    case "MEMORY_LIMIT_EXCEEDED":
      return SubmissionStatus.RUNTIME_ERROR;
    case "RE":
    case "RUNTIME_ERROR":
      return SubmissionStatus.RUNTIME_ERROR;
    case "CE":
    case "COMPILE_ERROR":
      return SubmissionStatus.COMPILE_ERROR;
    default:
      return SubmissionStatus.RUNTIME_ERROR;
  }
}

function adaptRunResult(r: ContestRunResponse): RunCodeResponse {
  return {
    overallStatus: verdictToSubmissionStatus(r.overallStatus),
    language: r.language,
    compileError: r.compileError ?? undefined,
    testCaseResults: r.testCaseResults.map((tc) => ({
      orderIndex: tc.orderIndex,
      status: verdictToSubmissionStatus(tc.status),
      input: tc.input ?? "",
      expectedOutput: tc.expectedOutput ?? "",
      actualOutput: tc.actualOutput ?? undefined,
      executionTimeMs: tc.executionTimeMs ?? 0,
      memoryUsageMb: tc.memoryUsageMb ?? 0,
      errorMessage: tc.errorMessage ?? undefined,
    })),
  };
}

function adaptDebugResult(r: ContestDebugResponse): DebugResponse {
  return {
    status: r.status,
    steps: r.steps.map((s) => ({
      line: s.line,
      iteration: s.iteration,
      file: s.file,
      variables: s.variables,
    })),
    output: r.output || undefined,
    error: r.error ?? undefined,
  };
}

export const ProblemSubmitTab: React.FC<ProblemSubmitTabProps> = ({
  contestProblemId,
  problemId,
  disabled = false,
}) => {
  const { id: contestId } = useParams({ strict: false });
  const { mutate: submitSolution, isPending } = useSubmitSolution();
  const { data: codeTemplates, isLoading: isTemplatesLoading } = useCodeTemplates(problemId);
  const runCode = useContestRunCode();
  const debugCode = useContestDebugCode();

  const [language, setLanguage] = useState<Language>(Language.PYTHON);

  const { data: problem, isLoading: problemLoading } = useProblemDetail(problemId || "", language, {
    enabled: !!problemId,
  });

  const [mode, setMode] = useState<SubmitMode>("editor");
  const [code, setCode] = useState<string>("");
  const [isTemplateLoading, setIsTemplateLoading] = useState(true);
  const [isMultiFileMode, setIsMultiFileMode] = useState(false);
  const templateCache = useRef<Partial<Record<Language, string>>>({});
  const multifileTemplateCache = useRef<Partial<Record<Language, string>>>({});
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [contestRunResult, setContestRunResult] = useState<ContestRunResponse | null>(null);
  const [contestDebugResult, setContestDebugResult] = useState<ContestDebugResponse | null>(null);
  const [debugLines, setDebugLines] = useState<string>("");
  const [debugCurrentLine, setDebugCurrentLine] = useState<{
    line: number;
    file?: string;
  } | null>(null);
  const [debugInput, setDebugInput] = useState<string>("");
  const [editorFiles, setEditorFiles] = useState<EditorFile[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    setContestRunResult(null);
    setContestDebugResult(null);
    setSubmissionId(null);
    setDebugCurrentLine(null);
    setDebugLines("");
  }, [contestProblemId]);

  const runResult: RunCodeResponse | null = useMemo(
    () => (contestRunResult ? adaptRunResult(contestRunResult) : null),
    [contestRunResult],
  );
  const debugResult: DebugResponse | null = useMemo(
    () => (contestDebugResult ? adaptDebugResult(contestDebugResult) : null),
    [contestDebugResult],
  );

  const languageOptions = [
    { value: Language.PYTHON, label: "Python" },
    { value: Language.CPP, label: "C++ " },
    { value: Language.JAVA, label: "Java " },
    { value: Language.JAVASCRIPT, label: "JavaScript" },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file);
  };

  const handleRemoveFile = () => setUploadedFile(null);

  const getFileExtension = (lang: Language) => {
    switch (lang) {
      case Language.PYTHON:
        return ".py";
      case Language.CPP:
        return ".cpp";
      case Language.JAVA:
        return ".java";
      case Language.JAVASCRIPT:
        return ".js";
      default:
        return ".txt";
    }
  };

  const handleLanguageChange = (lang: Language) => {
    const cache = isMultiFileMode ? multifileTemplateCache.current : templateCache.current;
    const cached = cache[lang];
    if (cached !== undefined) {
      setCode(cached);
      setLanguage(lang);
    } else {
      setCode("");
      setIsTemplateLoading(true);
      setLanguage(lang);
    }
  };

  const handleToggleMultiFileMode = (multi: boolean) => {
    setIsMultiFileMode(multi);
    if (multi) {
      const template =
        multifileTemplateCache.current[language] ?? problem?.multifileEntryTemplate ?? problem?.codeTemplate ?? "";
      setCode(template);
    } else {
      setCode(templateCache.current[language] ?? "");
      setEditorFiles([]);
    }
    setDebugLines("");
    setContestRunResult(null);
    setContestDebugResult(null);
    setSubmissionId(null);
  };

  useEffect(() => {
    if (codeTemplates && codeTemplates.length > 0) {
      const template = codeTemplates.find((t) => t.language === language);
      if (template) {
        templateCache.current[language] = template.templateCode;
        if (!isMultiFileMode) setCode(template.templateCode);
        setIsTemplateLoading(false);
      }
    }
  }, [language, codeTemplates, isMultiFileMode]);

  const isMultiFile = editorFiles.length > 1;
  const getEntryFileName = () => editorFiles[0]?.name ?? "main";
  const toCodeFiles = () => editorFiles.map((f) => ({ name: f.name, content: f.content }));

  const handleFilesChange = (files: EditorFile[]) => setEditorFiles(files);

  const handleSubmit = async (): Promise<void> => {
    if (!contestId) return;
    try {
      if (mode === "file" && uploadedFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          submitSolution({
            contestId,
            request: {
              contestProblemId,
              language,
              sourceCode: e.target?.result as string,
            },
          });
        };
        reader.readAsText(uploadedFile);
      } else if (mode === "editor") {
        if (isMultiFile) {
          submitSolution({
            contestId,
            request: {
              contestProblemId,
              language,
              files: toCodeFiles(),
              entryFile: getEntryFileName(),
            },
          });
        } else {
          submitSolution({
            contestId,
            request: { contestProblemId, language, sourceCode: code },
          });
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const handleRun = async (): Promise<void> => {
    if (!contestId) return;
    try {
      const request: ContestRunRequest = isMultiFile
        ? {
            contestProblemId,
            language,
            files: toCodeFiles(),
            entryFile: getEntryFileName(),
          }
        : { contestProblemId, language, sourceCode: code };

      const response = await runCode.mutateAsync({ contestId, request });
      if (response.data.data) {
        setContestRunResult(response.data.data);
        setSubmissionId(null);
        setContestDebugResult(null);
      }
    } catch (error) {
      console.error("Run error:", error);
    }
  };

  const handleDebug = async (): Promise<void> => {
    if (!contestId) return;
    const lines = debugLines
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0);
    if (lines.length === 0) return;

    try {
      const request: ContestDebugRequest = isMultiFile
        ? {
            contestProblemId,
            language,
            lines,
            input: debugInput || undefined,
            files: toCodeFiles(),
            entryFile: getEntryFileName(),
          }
        : {
            contestProblemId,
            language,
            lines,
            input: debugInput || undefined,
            code,
          };

      const response = await debugCode.mutateAsync({ contestId, request });
      if (response.data.data) {
        setContestDebugResult(response.data.data);
        setSubmissionId(null);
        setContestRunResult(null);
      }
    } catch (error) {
      console.error("Debug error:", error);
    }
  };

  const handleReset = () => {
    setCode(templateCache.current[language] ?? "");
    setEditorFiles([]);
    setDebugLines("");
    setContestRunResult(null);
    setContestDebugResult(null);
    setSubmissionId(null);
  };

  const handleCloseResult = () => {
    setContestRunResult(null);
    setContestDebugResult(null);
    setSubmissionId(null);
    setDebugCurrentLine(null);
  };

  const handleDebugStepChange = (step: DebugStep | null): void => {
    setDebugCurrentLine(step ? { line: step.line, file: step.file } : null);
  };

  if (isTemplatesLoading || problemLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-slate-600">Đang tải code template...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-slate-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden min-h-200">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between px-4 py-2 gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-200/80 dark:bg-slate-800 p-1 rounded-md">
            <button
              onClick={() => setMode("editor")}
              className={`flex items-center cursor-pointer gap-2 py-2 px-4 rounded-md font-bold text-sm transition-all ${
                mode === "editor"
                  ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
              }`}
            >
              <FileCode className="w-4 h-4" />
              Soạn thảo
            </button>
            <button
              onClick={() => setMode("file")}
              className={`flex items-center cursor-pointer gap-2 py-2 px-4 rounded-md font-bold text-sm transition-all ${
                mode === "file"
                  ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
              }`}
            >
              <Upload className="w-4 h-4" />
              Nộp file
            </button>
          </div>

          {mode === "file" && (
            <>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />
              <div className="relative group">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 pr-8 text-xs font-bold focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                >
                  {languageOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 w-4 h-4" />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden px-4 pb-4">
        {mode === "editor" ? (
          <CodeEditor
            key={isMultiFileMode ? "multi" : "single"}
            language={language}
            code={code}
            isTemplateLoading={isTemplateLoading}
            isMultiFileMode={isMultiFileMode}
            hasMultifileTemplate={!!problem.multifileEntryTemplate}
            onToggleMultiFileMode={handleToggleMultiFileMode}
            problem={problem}
            submissionResult={null}
            runResult={runResult}
            debugResult={debugResult}
            debugCurrentLine={debugCurrentLine ?? undefined}
            isSubmitting={isPending}
            isRunning={runCode.isPending}
            isDebugging={debugCode.isPending}
            debugLines={debugLines}
            onLanguageChange={handleLanguageChange}
            onCodeChange={setCode}
            onFilesChange={handleFilesChange}
            onDebugLinesChange={setDebugLines}
            onDebugStepChange={handleDebugStepChange}
            onSubmit={handleSubmit}
            onRun={handleRun}
            onDebug={handleDebug}
            onReset={handleReset}
            onCloseResult={handleCloseResult}
          />
        ) : (
          <>
            <div className="flex-1 flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <label
                  htmlFor="file-upload"
                  className="w-full max-w-2xl aspect-video border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-4 bg-slate-50/50 dark:bg-slate-800/20 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                      Kéo thả file code tại đây hoặc click để chọn
                    </p>
                    <p className="text-sm text-slate-500 mt-1">Dung lượng tối đa: 10MB</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    <Badge className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {getFileExtension(language)}
                    </Badge>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    accept={getFileExtension(language)}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {uploadedFile && (
                  <div className="w-full max-w-2xl mt-6">
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                          <FileCode className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {uploadedFile.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {(uploadedFile.size / 1024).toFixed(1)} KB • Code File
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveFile}
                        className="cursor-pointer p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Info className="w-4 h-4" />
                  File nộp phải thuộc định dạng {getFileExtension(language)}
                </span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  onClick={handleSubmit}
                  isDisabled={isPending || !uploadedFile || disabled}
                  className="flex-1 sm:flex-none px-8 py-5 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Đang gửi..." : "Gửi bài làm"}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
