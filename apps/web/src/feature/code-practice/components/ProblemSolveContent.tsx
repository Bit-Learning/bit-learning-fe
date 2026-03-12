import React, { useState, useEffect } from "react";
import {
  Play,
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
  Star,
  Settings,
  Maximize,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/Card";
import { Textarea } from "@workspace/ui/components/Textarea";
import { cn } from "@workspace/ui/lib/utils";
import {
  ProblemDetailResponse,
  Difficulty,
  SubmissionBriefResponse,
  Language,
  SubmissionStatus,
  SubmissionResultResponse,
} from "../types/coding.type";
import { DifficultyBadge, languageOptions, statusConfig, SubmissionItem } from "./Component";
import { useNavigate, useParams } from "@tanstack/react-router";

const mockProblem: ProblemDetailResponse = {
  id: "1",
  title: "Two Sum",
  slug: "two-sum",
  description: `Cho một mảng số nguyên \`nums\` và một số nguyên \`target\`, hãy tìm chỉ số của hai số sao cho tổng của chúng bằng \`target\`.

Bạn có thể giả định rằng mỗi đầu vào sẽ có đúng một giải pháp và bạn không được sử dụng cùng một phần tử hai lần.

Bạn có thể trả lời kết quả theo bất kỳ thứ tự nào.

### Ví dụ 1:
**Input:** nums = [2,7,11,15], target = 9
**Output:** [0,1]
**Giải thích:** Vì nums[0] + nums[1] == 9, chúng ta trả về [0, 1].

### Ví dụ 2:
**Input:** nums = [3,2,4], target = 6
**Output:** [1,2]

### Ràng buộc:
- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- \`-10^9 <= target <= 10^9\`
- Chỉ tồn tại một đáp án hợp lệ duy nhất.`,
  difficulty: Difficulty.EASY,
  timeLimitMs: 1000,
  memoryLimitMb: 256,
  isPublic: true,
  tags: ["Array", "Hash Table"],
  sampleTestcases: [
    {
      id: "tc1",
      input: "[2, 7, 11, 15]\n9",
      expectedOutput: "[0, 1]",
      isSample: true,
      orderIndex: 0,
    },
    {
      id: "tc2",
      input: "[3, 2, 4]\n6",
      expectedOutput: "[1, 2]",
      isSample: true,
      orderIndex: 1,
    },
  ],
  codeTemplate: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        prevMap = {}  # val : index

        for i, n in enumerate(nums):
            diff = target - n
            if diff in prevMap:
                return [prevMap[diff], i]
            prevMap[n] = i`,
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

const mockSubmissions: SubmissionBriefResponse[] = [
  {
    submissionId: "sub1",
    problemId: "1",
    problemTitle: "Two Sum",
    problemSlug: "two-sum",
    language: Language.PYTHON,
    status: SubmissionStatus.ACCEPTED,
    totalTimeMs: 45,
    maxMemoryMb: 15.2,
    passedTestcases: 2,
    totalTestcases: 2,
    createdAt: "2024-03-07T10:30:00",
  },
  {
    submissionId: "sub2",
    problemId: "1",
    problemTitle: "Two Sum",
    problemSlug: "two-sum",
    language: Language.PYTHON,
    status: SubmissionStatus.WRONG_ANSWER,
    totalTimeMs: 32,
    maxMemoryMb: 14.8,
    passedTestcases: 1,
    totalTestcases: 2,
    createdAt: "2024-03-07T10:25:00",
  },
];

const mockSubmissionResult: SubmissionResultResponse = {
  submissionId: "sub1",
  problemId: "1",
  language: Language.PYTHON,
  status: SubmissionStatus.ACCEPTED,
  totalTimeMs: 45,
  maxMemoryMb: 15.2,
  passedTestcases: 2,
  totalTestcases: 2,
  testcaseResults: [
    {
      testcaseId: "tc1",
      orderIndex: 0,
      status: SubmissionStatus.ACCEPTED,
      executionTimeMs: 23,
      memoryUsageMb: 14.5,
      actualOutput: "[0, 1]",
    },
    {
      testcaseId: "tc2",
      orderIndex: 1,
      status: SubmissionStatus.ACCEPTED,
      executionTimeMs: 22,
      memoryUsageMb: 15.2,
      actualOutput: "[1, 2]",
    },
  ],
  createdAt: "2024-03-07T10:30:00",
  updatedAt: "2024-03-07T10:30:01",
};

const ProblemSolveContent: React.FC = () => {
  const { id: problemId } = useParams({ strict: false });
  const navigate = useNavigate();
  // const { data: problem, isLoading: problemLoading } = useProblemDetail(problemId || "", language);
  // const { data: submissionsData } = useProblemSubmissions(problemId || "", { size: 10 });
  // const submitCode = useSubmitCode();
  // const { data: submissionResult } = useSubmissionResult(submissionId || "", { enabled: !!submissionId });

  const [language, setLanguage] = useState<Language>(Language.PYTHON);
  const [code, setCode] = useState<string>("");
  const [leftTab, setLeftTab] = useState<"description" | "submissions">("description");
  const [submissionResult, setSubmissionResult] = useState<SubmissionResultResponse | null>(null);
  const [expandedResults, setExpandedResults] = useState<number[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const problem = mockProblem;
  const submissions = mockSubmissions;

  useEffect(() => {
    if (problem?.codeTemplate) setCode(problem.codeTemplate);
  }, [problem?.codeTemplate]);

  const handleSubmit = async (): Promise<void> => {
    if (!problem) return;
    setIsSubmitting(true);
    // const res = await submitCode.mutateAsync({ problemId: problem.id, language, sourceCode: code });
    setTimeout(() => {
      setSubmissionResult(mockSubmissionResult);
      setIsSubmitting(false);
    }, 1500);
  };

  const handleReset = (): void => {
    if (problem?.codeTemplate) setCode(problem.codeTemplate);
  };

  const handleCopyCode = (): void => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleResultExpand = (index: number): void => {
    setExpandedResults((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };

  const handleBack = (): void => {
    navigate({ to: "/problem" });
  };

  const passedCount = submissionResult?.passedTestcases || 0;
  const totalCount = submissionResult?.totalTestcases || 0;
  const progressPercent = totalCount > 0 ? (passedCount / totalCount) * 100 : 0;

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <main className="flex-1 flex overflow-hidden mx-auto w-full">
        <section className="w-1/2 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="cursor-pointer p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold">{problem.title}</h1>
              <DifficultyBadge difficulty={problem.difficulty} />
            </div>
            <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-yellow-500 dark:text-slate-400 transition-colors">
              <Star className="w-5 h-5" />
              <span className="hidden sm:inline">Yêu thích</span>
            </button>
          </div>

          <div className="h-10 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-2">
            {[
              { id: "description", icon: FileText, label: "Đề bài" },
              { id: "submissions", icon: History, label: "Submissions" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setLeftTab(tab.id as any)}
                className={cn(
                  "cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors",
                  leftTab === tab.id
                    ? "bg-slate-100 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100",
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-6 space-y-6 bg-white dark:bg-slate-900">
            {leftTab === "description" && (
              <>
                {problem.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {problem.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        <Hash className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <article className="prose prose-slate dark:prose-invert max-w-none text-sm leading-snug text-slate-900 dark:text-slate-100">
                  {problem.description.split("\n").map((line, idx) => {
                    if (line.startsWith("###")) {
                      return (
                        <h3 key={idx} className="text-base font-bold mt-3 mb-1.5 text-slate-900 dark:text-slate-100">
                          {line.replace("### ", "")}
                        </h3>
                      );
                    }
                    if (line.startsWith("**")) {
                      return (
                        <p
                          key={idx}
                          className="my-1.5 font-mono text-sm bg-slate-100 dark:bg-slate-800/50 p-3 rounded border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                        >
                          {line}
                        </p>
                      );
                    }
                    if (line.startsWith("-")) {
                      return (
                        <li key={idx} className="ml-4 my-0.5 text-slate-900 dark:text-slate-100">
                          {line.replace("- ", "")}
                        </li>
                      );
                    }
                    return line ? (
                      <p key={idx} className="my-0.5 text-slate-900 dark:text-slate-100">
                        {line}
                      </p>
                    ) : null;
                  })}
                </article>

                {problem.sampleTestcases?.length > 0 && (
                  <div className="space-y-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-4">
                      <Terminal className="w-5 h-5 text-blue-600" />
                      <h3 className="font-bold text-slate-900 dark:text-slate-100">Kiểm thử (Test Cases)</h3>
                    </div>
                    {problem.sampleTestcases.map((tc, idx) => (
                      <Card key={tc.id}>
                        <CardHeader className="py-2 px-3 bg-slate-100 dark:bg-slate-800/50">
                          <CardTitle className="text-sm text-slate-900 dark:text-slate-100">
                            Test Case {idx + 1}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                              Input:
                            </label>
                            <pre className="p-2 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-sm whitespace-pre-wrap text-slate-900 dark:text-slate-100">
                              {tc.input}
                            </pre>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                              Expected Output:
                            </label>
                            <pre className="p-2 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-sm whitespace-pre-wrap text-slate-900 dark:text-slate-100">
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
                  submissions.map((sub) => <SubmissionItem key={sub.submissionId} submission={sub} />)
                ) : (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-8">Chưa có submission nào</p>
                )}
              </div>
            )}
          </div>
        </section>

        <div className="w-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-blue-600/30 cursor-col-resize transition-colors flex items-center justify-center">
          <div className="h-8 w-0.5 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
        </div>

        <section className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
          <div className="h-12 flex items-center justify-between px-4 bg-slate-800/50 border-b border-white/5">
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-slate-700/50 px-3 py-1.5 rounded-md text-sm font-medium text-slate-200 border-none cursor-pointer hover:bg-slate-700 transition-colors"
              >
                {languageOptions.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <button onClick={handleCopyCode} className="hover:text-white transition-colors">
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
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
              className="h-full w-full resize-none rounded-none border-0 font-mono text-sm bg-slate-900 text-slate-300 focus-visible:ring-0 p-4"
              style={{ lineHeight: 1.6 }}
              spellCheck={false}
              placeholder="// Write your code here..."
            />
          </div>

          {submissionResult && (
            <div className="h-1/3 min-h-50 bg-[#090c10] border-t border-slate-800 flex flex-col shrink-0">
              <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Terminal className="w-4 h-4" />
                  Kết quả nộp bài
                </div>
                <button
                  onClick={() => setSubmissionResult(null)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <span className={statusConfig[submissionResult.status].color}>
                    {statusConfig[submissionResult.status].icon}
                  </span>
                  <span className={cn("font-bold text-sm", statusConfig[submissionResult.status].color)}>
                    {statusConfig[submissionResult.status].label}
                  </span>
                  <span className="text-slate-500">
                    ({passedCount}/{totalCount} test cases passed)
                  </span>
                </div>

                {submissionResult.testcaseResults?.map((result, idx) => {
                  const isPass = result.status === SubmissionStatus.ACCEPTED;
                  return (
                    <div key={result.testcaseId} className="flex gap-4">
                      <span className={cn("font-bold", isPass ? "text-green-500" : "text-rose-500")}>
                        CASE {idx + 1}:
                      </span>
                      <span className="text-slate-400">
                        {result.executionTimeMs}ms | {result.memoryUsageMb}MB
                      </span>
                      <span className={isPass ? "text-green-400" : "text-rose-400"}>
                        {isPass ? "✓ Chính xác" : "✗ " + statusConfig[result.status].label}
                      </span>
                    </div>
                  );
                })}

                {submissionResult.errorMessage && (
                  <div className="mt-3 p-3 bg-rose-900/20 border border-rose-800 rounded text-rose-400">
                    <div className="font-bold mb-1">Error:</div>
                    <div className="whitespace-pre-wrap">{submissionResult.errorMessage}</div>
                  </div>
                )}

                <div className="pt-2 text-slate-500 border-t border-slate-800 mt-3">
                  &gt; Total execution time: {submissionResult.totalTimeMs}ms | Max memory:{" "}
                  {submissionResult.maxMemoryMb}MB
                </div>
              </div>
            </div>
          )}

          <div className="h-16 flex items-center justify-between px-6 bg-slate-900 border-t border-white/5 shrink-0">
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{problem.timeLimitMs}ms</span>
              <div className="mx-2 h-4 w-px bg-slate-700"></div>
              <HardDrive className="w-4 h-4" />
              <span className="text-sm">{problem.memoryLimitMb}MB</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                isDisabled
                className="px-5 py-4 rounded bg-slate-800 text-slate-400 text-sm font-semibold border border-slate-700 cursor-not-allowed"
              >
                Chạy thử
              </Button>
              <Button
                onClick={handleSubmit}
                isDisabled={isSubmitting || !code.trim()}
                className={cn(
                  "px-6 py-4 rounded text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2",
                  isSubmitting || !code.trim() ? "bg-slate-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700",
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
              </Button>
            </div>
          </div>
        </section>
      </main>

      <div className="h-1 bg-slate-200 dark:bg-slate-800">
        <div className="h-full bg-blue-600 w-1/3 transition-all duration-300"></div>
      </div>
    </div>
  );
};

export default ProblemSolveContent;
