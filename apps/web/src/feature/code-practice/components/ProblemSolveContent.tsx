// features/coding/components/student/ProblemSolveContent.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import {
  Play,
  Send,
  RotateCcw,
  ChevronLeft,
  Clock,
  HardDrive,
  Check,
  X,
  Loader2,
  Terminal,
  FileText,
  Copy,
  CheckCircle2,
  AlertCircle,
  Timer,
  Zap,
  ChevronDown,
  ChevronUp,
  Hash,
  PanelLeftClose,
  LayoutPanelLeft,
  History,
  Target,
} from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/Card";
import { Textarea } from "@workspace/ui/components/Textarea";
import { Progress } from "@workspace/ui/components/Progress";
import { cn } from "@workspace/ui/lib/utils";
import {
  Difficulty,
  Language,
  SubmissionStatus,
  SubmissionBriefResponse,
  TestCaseResultResponse,
} from "../types/coding.type";
import {
  useProblemDetail,
  useProblemStatistics,
  useProblemSubmissions,
  useSubmitCode,
  useSubmissionResult,
} from "../queries/useCoding";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";

const difficultyConfig = {
  EASY: { label: "Easy", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  MEDIUM: { label: "Medium", color: "text-amber-500", bg: "bg-amber-500/10" },
  HARD: { label: "Hard", color: "text-rose-500", bg: "bg-rose-500/10" },
};

const languageOptions = [
  { value: Language.CPP, label: "C++ 17", icon: "⚡" },
  { value: Language.JAVA, label: "Java 17", icon: "☕" },
  { value: Language.PYTHON, label: "Python 3", icon: "🐍" },
  { value: Language.JAVASCRIPT, label: "Node.js 18", icon: "🟨" },
];

const statusConfig: Record<SubmissionStatus, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: "Pending", color: "text-muted-foreground", icon: <Loader2 className="w-4 h-4 animate-spin" /> },
  JUDGING: { label: "Judging", color: "text-blue-500", icon: <Loader2 className="w-4 h-4 animate-spin" /> },
  ACCEPTED: { label: "Accepted", color: "text-emerald-500", icon: <CheckCircle2 className="w-4 h-4" /> },
  WRONG_ANSWER: { label: "Wrong Answer", color: "text-rose-500", icon: <X className="w-4 h-4" /> },
  TIME_LIMIT_EXCEEDED: { label: "Time Limit", color: "text-amber-500", icon: <Timer className="w-4 h-4" /> },
  RUNTIME_ERROR: { label: "Runtime Error", color: "text-rose-500", icon: <AlertCircle className="w-4 h-4" /> },
  COMPILE_ERROR: { label: "Compile Error", color: "text-rose-500", icon: <AlertCircle className="w-4 h-4" /> },
};

const DifficultyBadge: React.FC<{ difficulty: Difficulty }> = ({ difficulty }) => {
  const config = difficultyConfig[difficulty];
  return (
    <Badge variant="outline" className={cn("font-semibold", config.color, config.bg)}>
      {config.label}
    </Badge>
  );
};

const TestCaseResult: React.FC<{ result: TestCaseResultResponse; isExpanded: boolean; onToggle: () => void }> = ({
  result,
  isExpanded,
  onToggle,
}) => {
  const config = statusConfig[result.status];
  const isAccepted = result.status === SubmissionStatus.ACCEPTED;
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between p-3 transition-all hover:bg-muted/50",
          isAccepted ? "bg-emerald-500/5" : "bg-rose-500/5",
        )}
      >
        <div className="flex items-center gap-3">
          <span className={config.color}>{config.icon}</span>
          <span className="font-medium">Test #{result.orderIndex + 1}</span>
          <Badge variant="secondary" className="text-xs">
            {result.executionTimeMs}ms
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {result.memoryUsageMb}MB
          </Badge>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {isExpanded && (result.actualOutput || result.errorMessage) && (
        <div className="p-3 border-t bg-muted/30">
          {result.actualOutput && (
            <div className="mb-2">
              <p className="text-xs text-muted-foreground mb-1">Your Output:</p>
              <pre className="p-2 rounded bg-muted font-mono text-sm whitespace-pre-wrap">{result.actualOutput}</pre>
            </div>
          )}
          {result.errorMessage && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Error:</p>
              <pre className="p-2 rounded bg-rose-500/10 font-mono text-sm text-rose-500 whitespace-pre-wrap">
                {result.errorMessage}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SubmissionItem: React.FC<{ submission: SubmissionBriefResponse }> = ({ submission }) => {
  const config = statusConfig[submission.status];
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <span className={config.color}>{config.icon}</span>
        <div>
          <p className={cn("font-medium text-sm", config.color)}>{config.label}</p>
          <p className="text-xs text-muted-foreground">{format(new Date(submission.createdAt), "dd/MM HH:mm")}</p>
        </div>
      </div>
      <div className="text-right text-sm">
        <p>{submission.totalTimeMs}ms</p>
        <p className="text-muted-foreground">
          {submission.passedTestcases}/{submission.totalTestcases}
        </p>
      </div>
    </div>
  );
};

const ProblemSolveContent: React.FC = () => {
  const { id: problemId } = useParams({ strict: false });
  const navigate = useNavigate();

  const [language, setLanguage] = useState<Language>(Language.CPP);
  const [code, setCode] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [bottomTab, setBottomTab] = useState<"testcase" | "result">("testcase");
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [showDescription, setShowDescription] = useState(true);
  const [expandedResults, setExpandedResults] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const [leftTab, setLeftTab] = useState<"description" | "submissions">("description");

  const { data: problem, isLoading: problemLoading } = useProblemDetail(problemId || "", language);
  const { data: stats } = useProblemStatistics(problemId || "");
  const { data: submissionsData } = useProblemSubmissions(problemId || "", { size: 10 });
  const submitCode = useSubmitCode();

  const { data: submissionResult } = useSubmissionResult(submissionId || "", {
    enabled: !!submissionId,
    // refetchInterval:
    //   submissionId &&
    //   submissionResult?.status &&
    //   [SubmissionStatus.PENDING, SubmissionStatus.JUDGING].includes(submissionResult.status)
    //     ? 1000
    //     : false,
  });
  useEffect(() => {
    if (problem?.codeTemplate) setCode(problem.codeTemplate);
  }, [problem?.codeTemplate]);
  useEffect(() => {
    if (problem?.sampleTestcases?.[0]) setCustomInput(problem.sampleTestcases[0].input);
  }, [problem?.sampleTestcases]);

  const handleSubmit = async () => {
    if (!problem) return;
    try {
      const res = await submitCode.mutateAsync({ problemId: problem.id, language, sourceCode: code });
      setSubmissionId(res.data.data?.submissionId || null);
      setBottomTab("result");
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = () => {
    if (problem?.codeTemplate) setCode(problem.codeTemplate);
  };
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const toggleResultExpand = (index: number) =>
    setExpandedResults((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));

  if (problemLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  if (!problem)
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground">Problem không tồn tại</p>
        <Button onClick={() => navigate({ to: "/problem" })}>Quay lại</Button>
      </div>
    );

  const passedCount = submissionResult?.passedTestcases || 0;
  const totalCount = submissionResult?.totalTestcases || 0;
  const progressPercent = totalCount > 0 ? (passedCount / totalCount) * 100 : 0;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <div className="h-12 border-b flex items-center justify-between px-4 bg-card shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/problem" })}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Problems
          </Button>
          <div className="h-6 w-px bg-border" />
          <h1 className="font-semibold truncate max-w-75">{problem.title}</h1>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {problem.timeLimitMs}ms
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <HardDrive className="w-4 h-4" />
            {problem.memoryLimitMb}MB
          </div>
          {stats && <Badge variant="secondary">AC: {stats.acceptanceRate.toFixed(1)}%</Badge>}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {showDescription && (
          <div className="w-[40%] min-w-75 max-w-150 border-r flex flex-col">
            <div className="h-10 border-b flex items-center px-4 gap-2">
              {[
                { id: "description", icon: FileText, label: "Đề bài" },
                { id: "submissions", icon: History, label: "Submissions" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setLeftTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors",
                    leftTab === tab.id ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-auto p-4">
              {leftTab === "description" && (
                <div className="space-y-4">
                  {problem.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {problem.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          <Hash className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{problem.description}</ReactMarkdown>
                  </div>
                  {problem.sampleTestcases?.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold">Examples</h3>
                      {problem.sampleTestcases.map((tc, idx) => (
                        <Card key={tc.id}>
                          <CardHeader className="py-2 px-3 bg-muted/50">
                            <CardTitle className="text-sm">Example {idx + 1}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-3 space-y-3">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Input:</p>
                              <pre className="p-2 rounded bg-muted font-mono text-sm whitespace-pre-wrap">
                                {tc.input}
                              </pre>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Output:</p>
                              <pre className="p-2 rounded bg-muted font-mono text-sm whitespace-pre-wrap">
                                {tc.expectedOutput}
                              </pre>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {leftTab === "submissions" && (
                <div className="space-y-2">
                  {submissionsData?.data ? (
                    submissionsData.data.map((sub) => <SubmissionItem key={sub.submissionId} submission={sub} />)
                  ) : (
                    <p className="text-center text-muted-foreground py-8">Chưa có submission nào</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-10 border-b flex items-center justify-between px-3 bg-card shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={() => setShowDescription(!showDescription)} className="p-1.5 rounded hover:bg-muted">
                {showDescription ? <PanelLeftClose className="w-4 h-4" /> : <LayoutPanelLeft className="w-4 h-4" />}
              </button>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="h-7 px-2 text-xs rounded border border-input bg-background"
              >
                {languageOptions.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.icon} {lang.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleCopyCode} className="p-1.5 rounded hover:bg-muted">
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <button onClick={handleReset} className="p-1.5 rounded hover:bg-muted">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-full w-full resize-none rounded-none border-0 font-mono text-sm bg-zinc-950 text-zinc-100 focus-visible:ring-0"
              style={{ lineHeight: 1.6 }}
              spellCheck={false}
            />
          </div>

          <div className="h-[35%] min-h-50 border-t flex flex-col bg-card">
            <div className="h-10 border-b flex items-center justify-between px-3 shrink-0">
              <div className="flex items-center gap-1">
                {[
                  { id: "testcase", icon: Terminal, label: "Testcase" },
                  { id: "result", icon: Zap, label: "Result" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setBottomTab(tab.id as any)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors",
                      bottomTab === tab.id ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <tab.icon className="w-3 h-3" />
                    {tab.label}
                    {tab.id === "result" && submissionResult && (
                      <Badge
                        variant={submissionResult.status === SubmissionStatus.ACCEPTED ? "default" : "destructive"}
                        className="ml-1 h-4 text-[10px]"
                      >
                        {passedCount}/{totalCount}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" isDisabled>
                  <Play className="w-3 h-3" />
                  Run
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={handleSubmit}
                  isDisabled={submitCode.isPending || !code.trim()}
                >
                  {submitCode.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  Submit
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-3">
              {bottomTab === "testcase" && (
                <div className="h-full flex flex-col">
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {problem.sampleTestcases?.map((_, idx) => (
                      <Button
                        key={idx}
                        variant={activeTestCase === idx ? "default" : "outline"}
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => {
                          setActiveTestCase(idx);
                          if (problem.sampleTestcases?.[idx]) {
                            setCustomInput(problem.sampleTestcases[idx].input);
                          }
                        }}
                      >
                        Case {idx + 1}
                      </Button>
                    ))}
                    <Button
                      variant={activeTestCase === -1 ? "default" : "outline"}
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => {
                        setActiveTestCase(-1);
                        setCustomInput("");
                      }}
                    >
                      Custom
                    </Button>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Input:</p>
                    <Textarea
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      className="h-[calc(100%-20px)] font-mono text-sm resize-none"
                    />
                  </div>
                </div>
              )}

              {bottomTab === "result" && (
                <div className="space-y-3">
                  {!submissionResult && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Submit code để xem kết quả</p>
                    </div>
                  )}
                  {submissionResult && (
                    <>
                      <div
                        className={cn(
                          "p-4 rounded-lg border",
                          submissionResult.status === SubmissionStatus.ACCEPTED
                            ? "bg-emerald-500/10 border-emerald-500/30"
                            : "bg-rose-500/10 border-rose-500/30",
                        )}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <span className={statusConfig[submissionResult.status].color}>
                            {statusConfig[submissionResult.status].icon}
                          </span>
                          <span className={cn("text-lg font-bold", statusConfig[submissionResult.status].color)}>
                            {statusConfig[submissionResult.status].label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4 text-muted-foreground" />
                            {passedCount}/{totalCount}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            {submissionResult.totalTimeMs}ms
                          </div>
                          <div className="flex items-center gap-1">
                            <HardDrive className="w-4 h-4 text-muted-foreground" />
                            {submissionResult.maxMemoryMb}MB
                          </div>
                        </div>
                        <Progress value={progressPercent} className="mt-3 h-2" />
                      </div>
                      {submissionResult.errorMessage && (
                        <Card className="border-rose-500/30">
                          <CardHeader className="py-2 px-3">
                            <CardTitle className="text-sm text-rose-500">Error</CardTitle>
                          </CardHeader>
                          <CardContent className="p-3">
                            <pre className="font-mono text-xs text-rose-500 whitespace-pre-wrap">
                              {submissionResult.errorMessage}
                            </pre>
                          </CardContent>
                        </Card>
                      )}
                      {submissionResult.testcaseResults?.map((result, idx) => (
                        <TestCaseResult
                          key={result.testcaseId}
                          result={result}
                          isExpanded={expandedResults.includes(idx)}
                          onToggle={() => toggleResultExpand(idx)}
                        />
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemSolveContent;
