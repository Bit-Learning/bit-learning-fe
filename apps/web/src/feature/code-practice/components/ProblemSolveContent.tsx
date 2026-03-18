import React, { useState, useEffect } from "react";
import {
  Send,
  RotateCcw,
  Clock,
  HardDrive,
  Check,
  X,
  Loader2,
  Terminal,
  FileText,
  Copy,
  Hash,
  History,
  Settings,
  Maximize,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/Card";
import { Textarea } from "@workspace/ui/components/Textarea";
import { cn } from "@workspace/ui/lib/utils";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useProblemDetail, useProblemSubmissions, useSubmitCode, useSubmissionResult } from "../queries/useCoding";
import { DifficultyBadge } from "./DifficultyBadge";
import { SubmissionStatusBadge } from "./SubmissionStatusBadge";
import { Language, SubmissionStatus } from "../types/coding.type";

const ProblemSolveContent: React.FC = () => {
  const { id: problemId } = useParams({ strict: false });
  const navigate = useNavigate();

  const [language, setLanguage] = useState<Language>(Language.PYTHON);
  const [code, setCode] = useState<string>("");
  const [leftTab, setLeftTab] = useState<"description" | "submissions">("description");
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const { data: problem, isLoading: problemLoading } = useProblemDetail(problemId || "", language, {
    enabled: !!problemId,
  });

  const { data: submissionsData } = useProblemSubmissions(problemId || "", {
    size: 10,
    sort: "createdAt,desc",
  });

  const submitCode = useSubmitCode();

  const { data: submissionResult } = useSubmissionResult(submissionId || "");

  const submissions = submissionsData?.content || [];

  useEffect(() => {
    if (problem?.codeTemplate) {
      setCode(problem.codeTemplate);
    }
  }, [problem?.codeTemplate, language]);

  const handleSubmit = async (): Promise<void> => {
    if (!problem) return;

    try {
      const response = await submitCode.mutateAsync({
        problemId: problem.id,
        language,
        sourceCode: code,
      });

      if (response.data.data?.submissionId) {
        setSubmissionId(response.data.data.submissionId);
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const handleReset = (): void => {
    if (problem?.codeTemplate) {
      setCode(problem.codeTemplate);
    }
  };

  const handleCopyCode = (): void => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBack = (): void => {
    navigate({ to: "/problem" });
  };

  const languageOptions = [
    { value: Language.PYTHON, label: "Python" },
    { value: Language.JAVA, label: "Java" },
    { value: Language.CPP, label: "C++" },
    { value: Language.JAVASCRIPT, label: "JavaScript" },
  ];

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
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy bài tập</p>
        </div>
      </div>
    );
  }

  const passedCount = submissionResult?.passedTestcases || 0;
  const totalCount = submissionResult?.totalTestcases || 0;

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <main className="flex-1 flex overflow-hidden mx-auto w-full">
        <section className="w-1/2 flex flex-col border-r border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={handleBack} className="p-2 cursor-pointer rounded hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">{problem.title}</h1>
              <DifficultyBadge difficulty={problem.difficulty} />
            </div>
          </div>

          <div className="h-10 border-b border-gray-200 flex items-center px-4 gap-2">
            {[
              { id: "description", icon: FileText, label: "Đề bài" },
              { id: "submissions", icon: History, label: "Submissions" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setLeftTab(tab.id as any)}
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
          <div className="h-8 w-0.5 bg-gray-300 rounded-full"></div>
        </div>

        <section className="flex-1 flex flex-col bg-gray-900 overflow-hidden">
          <div className="h-12 flex items-center justify-between px-4 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-gray-700 px-3 py-1.5 rounded-md text-sm font-medium text-gray-200 border-none cursor-pointer hover:bg-gray-600 transition-colors"
              >
                {languageOptions.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-4 text-gray-400">
              <button onClick={handleCopyCode} className="hover:text-white transition-colors">
                {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
              </button>
              <button onClick={handleReset} className="hover:text-white transition-colors">
                <RotateCcw className="w-5 h-5" />
              </button>
              <button className="hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="hover:text-white transition-colors">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className={cn("relative overflow-hidden", submissionResult ? "h-[60%]" : "flex-1")}>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-full w-full resize-none rounded-none border-0 font-mono text-sm bg-gray-900 text-gray-300 focus-visible:ring-0 p-4"
              style={{ lineHeight: 1.6 }}
              spellCheck={false}
              placeholder="// Write your code here..."
            />
          </div>

          {submissionResult && (
            <div className="h-1/3 min-h-50 bg-gray-950 border-t border-gray-800 flex flex-col shrink-0">
              <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between bg-gray-900">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <Terminal className="w-4 h-4" />
                  Kết quả nộp bài
                </div>
                <button
                  onClick={() => setSubmissionId(null)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <SubmissionStatusBadge status={submissionResult.status} showIcon />
                  <span className="text-gray-500">
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
                      <span className="text-gray-400">
                        {result.executionTimeMs}ms | {result.memoryUsageMb}MB
                      </span>
                      <span className={isPass ? "text-green-400" : "text-red-400"}>
                        {isPass ? "✓ Chính xác" : "✗ Sai"}
                      </span>
                    </div>
                  );
                })}

                {submissionResult.errorMessage && (
                  <div className="mt-3 p-3 bg-red-900/20 border border-red-800 rounded text-red-400">
                    <div className="font-bold mb-1">Error:</div>
                    <div className="whitespace-pre-wrap">{submissionResult.errorMessage}</div>
                  </div>
                )}

                <div className="pt-2 text-gray-500 border-t border-gray-800 mt-3">
                  &gt; Total execution time: {submissionResult.totalTimeMs}ms | Max memory:{" "}
                  {submissionResult.maxMemoryMb}MB
                </div>
              </div>
            </div>
          )}

          <div className="h-16 flex items-center justify-between px-6 bg-gray-900 border-t border-gray-800 shrink-0">
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{problem.timeLimitMs}ms</span>
              <div className="mx-2 h-4 w-px bg-gray-700"></div>
              <HardDrive className="w-4 h-4" />
              <span className="text-sm">{problem.memoryLimitMb}MB</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                isDisabled
                className="px-5 py-2 rounded bg-gray-800 text-gray-400 text-sm font-semibold border border-gray-700 cursor-not-allowed"
              >
                Chạy thử
              </Button>
              <Button
                onClick={handleSubmit}
                isDisabled={submitCode.isPending || !code.trim()}
                className={cn(
                  "px-6 py-2 rounded text-white text-sm font-semibold transition-all flex items-center gap-2",
                  submitCode.isPending || !code.trim()
                    ? "bg-gray-700 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700",
                )}
              >
                {submitCode.isPending ? (
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
              </Button>
            </div>
          </div>
        </section>
      </main>

      <div className="h-1 bg-gray-200">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${(passedCount / totalCount) * 100 || 0}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProblemSolveContent;
