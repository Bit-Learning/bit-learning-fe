import React, { useState, useEffect } from "react";
import { Clock, HardDrive, Loader2, Terminal, FileText, Hash, History, ChevronLeft } from "lucide-react";
import { Badge } from "@workspace/ui/components/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/Card";
import { cn } from "@workspace/ui/lib/utils";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  useProblemDetail,
  useProblemSubmissions,
  useSubmitCode,
  useSubmissionResult,
  useRunCode,
  useDebugCode,
} from "../queries/useCoding";
import { DifficultyBadge } from "./DifficultyBadge";
import { SubmissionStatusBadge } from "./SubmissionStatusBadge";
import {
  Language,
  RunCodeResponse,
  DebugResponse,
  SubmitCodeRequest,
  RunCodeRequest,
  DebugRequest,
} from "../types/coding.type";
import { CodeEditor } from "./CodeEditor";
import { EditorFile } from "./FileTab";

const ProblemSolveContent: React.FC = () => {
  const { id: problemId } = useParams({ strict: false });
  const navigate = useNavigate();

  const [language, setLanguage] = useState<Language>(Language.PYTHON);
  const [code, setCode] = useState<string>("");
  const [leftTab, setLeftTab] = useState<"description" | "submissions">("description");
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<RunCodeResponse | null>(null);
  const [debugResult, setDebugResult] = useState<DebugResponse | null>(null);
  const [debugLines, setDebugLines] = useState<string>("1");
  const [debugVars, setDebugVars] = useState<string>("");

  const [editorFiles, setEditorFiles] = useState<EditorFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string>("1");

  const { data: problem, isLoading: problemLoading } = useProblemDetail(problemId || "", language, {
    enabled: !!problemId,
  });

  const { data: submissionsData } = useProblemSubmissions(problemId || "", {
    size: 10,
    sort: "createdAt,desc",
  });

  const submitCode = useSubmitCode();
  const runCode = useRunCode();
  const debugCode = useDebugCode();

  const { data: submissionResult } = useSubmissionResult(submissionId || "");

  const submissions = submissionsData?.content || [];

  useEffect(() => {
    if (problem?.codeTemplate) {
      setCode(problem.codeTemplate);
    }
  }, [problem?.codeTemplate, language]);

  const isMultiFile = editorFiles.length > 1;

  const getActiveFileName = () => {
    return editorFiles.find((f) => f.id === activeFileId)?.name ?? "main";
  };

  const toCodeFiles = () => editorFiles.map((f) => ({ name: f.name, content: f.content }));

  const handleSubmit = async (): Promise<void> => {
    if (!problem) return;
    try {
      const request: SubmitCodeRequest = isMultiFile
        ? { problemId: problem.id, language, files: toCodeFiles(), entryFile: getActiveFileName() }
        : { problemId: problem.id, language, sourceCode: code };

      const response = await submitCode.mutateAsync(request);
      if (response.data.data?.submissionId) {
        setSubmissionId(response.data.data.submissionId);
        setRunResult(null);
        setDebugResult(null);
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const handleRun = async (): Promise<void> => {
    if (!problem) return;
    try {
      const request: RunCodeRequest = isMultiFile
        ? { language, files: toCodeFiles(), entryFile: getActiveFileName() }
        : { problemId: problem.id, language, sourceCode: code };

      const response = await runCode.mutateAsync(request);
      if (response.data.data) {
        setRunResult(response.data.data);
        setSubmissionId(null);
        setDebugResult(null);
      }
    } catch (error) {
      console.error("Run error:", error);
    }
  };

  const handleDebug = async (): Promise<void> => {
    const parsedLines = debugLines
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0);
    const parsedVars = debugVars
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (parsedLines.length === 0) return;
    try {
      const request: DebugRequest = isMultiFile
        ? {
            language,
            lines: parsedLines,
            variables: parsedVars.length > 0 ? parsedVars : undefined,
            files: toCodeFiles(),
            entryFile: getActiveFileName(),
          }
        : {
            language,
            code,
            lines: parsedLines,
            variables: parsedVars.length > 0 ? parsedVars : undefined,
          };

      const response = await debugCode.mutateAsync(request);
      if (response.data.data) {
        setDebugResult(response.data.data);
        setSubmissionId(null);
        setRunResult(null);
      }
    } catch (error) {
      console.error("Debug error:", error);
    }
  };

  const handleReset = (): void => {
    if (problem?.codeTemplate) {
      setCode(problem.codeTemplate);
    }
  };

  const handleCloseResult = (): void => {
    setSubmissionId(null);
    setRunResult(null);
    setDebugResult(null);
  };

  const handleFilesChange = (files: EditorFile[], newActiveFileId: string) => {
    setEditorFiles(files);
    setActiveFileId(newActiveFileId);
    if (files.length === 1) {
      setCode(files[0]?.content!);
    }
  };

  if (problemLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải bài tập...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Không tìm thấy bài tập</p>
      </div>
    );
  }

  const passedCount = submissionResult?.passedTestcases || 0;
  const totalCount = submissionResult?.totalTestcases || 0;

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <main className="flex-1 flex overflow-hidden mx-auto w-full">
        <section className="w-1/2 flex flex-col border-r border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-200 flex items-center gap-3">
            <button
              onClick={() => navigate({ to: "/problem" })}
              className="p-2 cursor-pointer rounded hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">{problem.title}</h1>
            <DifficultyBadge difficulty={problem.difficulty} />
          </div>

          <div className="h-10 border-b border-gray-200 flex items-center px-4 gap-2">
            {[
              { id: "description", icon: FileText, label: "Đề bài" },
              { id: "submissions", icon: History, label: "Submissions" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setLeftTab(tab.id as "description" | "submissions")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors",
                  leftTab === tab.id ? "bg-gray-100 font-medium text-gray-900" : "text-gray-600 hover:text-gray-900",
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-6 space-y-6 bg-white">
            {leftTab === "description" && (
              <>
                {problem.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {problem.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                        <Hash className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{problem.description}</div>

                {problem.constraints && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Constraints</p>
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                      {problem.constraints}
                    </div>
                  </div>
                )}

                {problem.sampleTestcases?.length > 0 && (
                  <div className="space-y-3 mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Terminal className="w-5 h-5 text-blue-600" />
                      <h3 className="font-bold text-gray-900">Test Cases</h3>
                    </div>
                    {problem.sampleTestcases.map((tc, idx) => (
                      <Card key={tc.id} className="border-gray-200">
                        <CardHeader className="py-2 px-3 bg-gray-50">
                          <CardTitle className="text-sm text-gray-900">Test Case {idx + 1}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Input:</label>
                            <pre className="p-2 rounded bg-gray-50 border border-gray-200 font-mono text-sm whitespace-pre-wrap text-gray-900">
                              {tc.input}
                            </pre>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                              Expected Output:
                            </label>
                            <pre className="p-2 rounded bg-gray-50 border border-gray-200 font-mono text-sm whitespace-pre-wrap text-gray-900">
                              {tc.expectedOutput}
                            </pre>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}

            {leftTab === "submissions" && (
              <div className="space-y-2">
                {submissions.length > 0 ? (
                  submissions.map((sub) => (
                    <Card
                      key={sub.submissionId}
                      className="cursor-pointer hover:bg-gray-50 transition-colors border-gray-200"
                      onClick={() => navigate({ to: `/submissions/${sub.submissionId}` })}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <SubmissionStatusBadge status={sub.status} showIcon />
                          <span className="text-xs text-gray-500">
                            {new Date(sub.createdAt).toLocaleString("vi-VN")}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{sub.language}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {sub.totalTimeMs}ms
                          </span>
                          <span className="flex items-center gap-1">
                            <HardDrive className="w-3 h-3" />
                            {sub.maxMemoryMb}MB
                          </span>
                          <span
                            className={cn(
                              "font-medium",
                              sub.passedTestcases === sub.totalTestcases ? "text-green-600" : "text-red-600",
                            )}
                          >
                            {sub.passedTestcases}/{sub.totalTestcases}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">Chưa có submission nào</p>
                )}
              </div>
            )}
          </div>
        </section>

        <div className="w-1.5 bg-gray-200 hover:bg-blue-200 cursor-col-resize transition-colors flex items-center justify-center">
          <div className="h-8 w-0.5 bg-gray-300 rounded-full" />
        </div>

        <section className="flex-1 flex flex-col bg-gray-900 overflow-hidden">
          <CodeEditor
            language={language}
            code={code}
            problem={{ timeLimitMs: problem.timeLimitMs, memoryLimitMb: problem.memoryLimitMb }}
            submissionResult={submissionResult ?? null}
            runResult={runResult}
            debugResult={debugResult}
            isSubmitting={submitCode.isPending}
            isRunning={runCode.isPending}
            isDebugging={debugCode.isPending}
            debugLines={debugLines}
            debugVars={debugVars}
            onLanguageChange={setLanguage}
            onCodeChange={setCode}
            onFilesChange={handleFilesChange}
            onDebugLinesChange={setDebugLines}
            onDebugVarsChange={setDebugVars}
            onSubmit={handleSubmit}
            onRun={handleRun}
            onDebug={handleDebug}
            onReset={handleReset}
            onCloseResult={handleCloseResult}
          />
        </section>
      </main>

      <div className="h-1 bg-gray-200">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${(passedCount / totalCount) * 100 || 0}%` }}
        />
      </div>
    </div>
  );
};

export default ProblemSolveContent;
