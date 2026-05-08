import React, { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { CheckCircle, XCircle, Minus, Code, Clock, Send, FileText, AlertCircle, Lock } from "lucide-react";
import { Badge } from "@workspace/ui/components/Badge";
import { useContestProblems, useContestDetail } from "../queries/useContest";
import { useProblemDetail } from "@/feature/code-practice/queries/useCoding";
import { ContestProblemListDTO } from "../types/contest.type";
import { ProblemSubmitTab } from "./ProblemSubmitTab";

type TabType = "description" | "submit";

const ContestProblemsContent: React.FC = () => {
  const { id, problemId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { data: problemsData, isLoading } = useContestProblems(id || "");
  const { data: contestData } = useContestDetail(id || "");

  const problems = problemsData?.data;
  const contest = contestData?.data;

  const [activeTab, setActiveTab] = useState<TabType>("description");
  const [selectedProblem, setSelectedProblem] = useState<ContestProblemListDTO | null>(null);

  const { data: problemDetail, isLoading: isProblemDetailLoading } = useProblemDetail(
    selectedProblem?.problemId || "",
    undefined,
    {
      enabled: !!selectedProblem?.problemId,
    },
  );

  const isUpcoming = contest?.status === "UPCOMING";
  const isEnded = contest?.status === "ENDED";
  const canSubmit = !isUpcoming && !isEnded;

  const sampleTestCases = problemDetail?.sampleTestcases || [];

  React.useEffect(() => {
    if (!problems?.length) return;

    const problem = problemId ? problems.find((p) => p.contestProblemId === problemId) : null;

    setSelectedProblem(problem ?? problems[0] ?? null);
  }, [problems, problemId]);

  const handleProblemSelect = (problem: ContestProblemListDTO) => {
    setSelectedProblem(problem);
    navigate({
      to: "/contests/$id/problems/$problemId",
      params: { id: id || "", problemId: problem.contestProblemId },
    });
  };

  const getStatusIcon = (status: string | null) => {
    if (status === "AC") return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status === "WA") return <XCircle className="w-5 h-5 text-red-500" />;
    if (status === "TLE") return <Clock className="w-5 h-5 text-orange-500" />;
    if (status === "RE" || status === "CE") return <AlertCircle className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-slate-300 dark:text-slate-600" />;
  };

  const getDifficultyColor = (difficulty: string) => {
    const lowerDiff = difficulty.toLowerCase();
    if (lowerDiff === "easy" || lowerDiff === "dễ") return "text-green-500";
    if (lowerDiff === "medium" || lowerDiff === "trung bình") return "text-orange-500";
    if (lowerDiff === "hard" || lowerDiff === "khó") return "text-red-500";
    return "text-slate-500";
  };

  const getDifficultyBadge = (difficulty: string) => {
    const lowerDiff = difficulty.toLowerCase();
    if (lowerDiff === "easy" || lowerDiff === "dễ") {
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    }
    if (lowerDiff === "medium" || lowerDiff === "trung bình") {
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    }
    if (lowerDiff === "hard" || lowerDiff === "khó") {
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    }
    return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
  };

  const getDifficultyLabel = (difficulty: string) => {
    const lowerDiff = difficulty.toLowerCase();
    if (lowerDiff === "easy") return "Dễ";
    if (lowerDiff === "medium") return "Trung bình";
    if (lowerDiff === "hard") return "Khó";
    return difficulty;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-md text-slate-800">Đang tải danh sách bài tập...</p>
        </div>
      </div>
    );
  }

  if (!problems || problems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="text-center max-w-md space-y-4">
          <p className="text-slate-600 dark:text-slate-400">Chưa có bài thi nào</p>
        </div>
      </div>
    );
  }

  if (isUpcoming) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="text-center max-w-md space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <Lock className="w-10 h-10 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Cuộc thi chưa bắt đầu</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Bạn chưa thể xem đề bài và nộp bài. Vui lòng quay lại khi cuộc thi bắt đầu.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      <aside className="w-[320px] border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-xl">Danh sách bài</h3>
          <Badge className="text-sm text-black font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800">
            {problems.length} bài tập
          </Badge>
        </div>

        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-md uppercase tracking-wider font-bold">
              <tr>
                <th className="px-4 py-3 w-12 text-center">#</th>
                <th className="px-4 py-3">Tên bài</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {problems.map((problem) => (
                <tr
                  key={problem.contestProblemId}
                  onClick={() => handleProblemSelect(problem)}
                  className={`group hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors ${
                    selectedProblem?.contestProblemId === problem.contestProblemId
                      ? "bg-primary/10 border-l-4 border-primary"
                      : ""
                  }`}
                >
                  <td
                    className={`px-4 py-4 text-center font-bold ${
                      selectedProblem?.contestProblemId === problem.contestProblemId ? "text-primary" : ""
                    }`}
                  >
                    {problem.label}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-md block">{problem.title}</span>{" "}
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold uppercase ${getDifficultyColor(problem.difficulty)}`}>
                          {getDifficultyLabel(problem.difficulty)}
                        </span>
                        {problem.myAttempts > 0 && (
                          <span className="text-sm text-slate-400">• {problem.myAttempts} lần</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">{getStatusIcon(problem.myStatus)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </aside>

      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
        <div className="flex items-center px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("description")}
              className={`py-4 text-md cursor-pointer font-bold flex items-center gap-2 transition-colors ${
                activeTab === "description"
                  ? "border-primary text-primary border-b-2"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <FileText className="w-5 h-5" />
              Đề bài
            </button>
            <button
              onClick={() => canSubmit && setActiveTab("submit")}
              disabled={!canSubmit || !contest?.isRegistered}
              className={`py-4 text-md font-bold flex items-center gap-2 transition-colors ${
                !canSubmit || !contest?.isRegistered
                  ? "border-transparent text-slate-400 cursor-not-allowed opacity-50"
                  : activeTab === "submit"
                    ? "border-primary text-primary border-b-2 cursor-pointer"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
              }`}
            >
              <Send className="w-5 h-5" />
              Nộp bài
              {isEnded && <Lock className="w-4 h-4 ml-1" />}
            </button>
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto ${activeTab !== "description" ? "hidden" : ""}`}>
          {selectedProblem && (
            <section className="max-w-4xl mx-auto p-8 space-y-8">
              {isProblemDetailLoading ? (
                <div className="flex items-center justify-center min-h-[calc(100vh-100px)] ">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-sm text-slate-600">Đang tải đề bài...</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-500">
                      <span className="text-sm font-bold uppercase tracking-widest">
                        Problem {selectedProblem.label}
                      </span>
                      <div className="h-1 w-1 rounded-full bg-slate-300" />
                      <span className="text-sm font-medium">
                        {selectedProblem.timeLimitMs}ms, {selectedProblem.memoryLimitMb}MB
                      </span>
                    </div>

                    <h2 className="text-4xl font-bold">{selectedProblem.title}</h2>

                    <div className="flex gap-2 flex-wrap">
                      <Badge
                        className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getDifficultyBadge(selectedProblem.difficulty)}`}
                      >
                        {getDifficultyLabel(selectedProblem.difficulty)}
                      </Badge>
                      {selectedProblem.myStatus && (
                        <Badge
                          className={`px-2 py-0.5 rounded text-xs font-bold ${
                            selectedProblem.myStatus === "AC"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {selectedProblem.myStatus}
                        </Badge>
                      )}
                      {selectedProblem.myAttempts > 0 && (
                        <Badge className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          {selectedProblem.myAttempts} lần
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="prose dark:prose-invert max-w-none space-y-6">
                    <div className="space-y-3">
                      <div className="prose prose-sm max-w-none text-lg text-gray-700 whitespace-pre-wrap">
                        {problemDetail?.description}
                      </div>
                    </div>

                    {sampleTestCases.length > 0 && (
                      <div className="space-y-6 pt-2">
                        <h3 className="text-xl text-black font-bold flex items-center gap-2">
                          <Code className="w-5 h-5 text-primary" />
                          Ví dụ
                        </h3>
                        {sampleTestCases.map((testCase, index) => (
                          <div key={index} className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Đầu vào {index + 1}
                              </h4>
                              <pre className="bg-slate-100 text-black dark:bg-slate-800 p-4 rounded-lg font-mono text-sm border border-slate-200 dark:border-slate-700 whitespace-pre-wrap wrap-break-word">
                                {testCase.input}
                              </pre>
                            </div>

                            <div className="space-y-3">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Đầu ra {index + 1}
                              </h4>
                              <pre className="bg-slate-100 text-black dark:bg-slate-800 p-4 rounded-lg font-mono text-sm border border-slate-200 dark:border-slate-700 whitespace-pre-wrap wrap-break-word">
                                {testCase.expectedOutput}
                              </pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </section>
          )}
        </div>

        <div className={`flex-1 ${activeTab !== "submit" ? "hidden" : "flex flex-col"}`}>
          {selectedProblem && (
            <>
              {isEnded && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-800 px-6 py-4 shrink-0">
                  <div className="flex items-center gap-3 max-w-4xl mx-auto">
                    <Lock className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-orange-900 dark:text-orange-200">Cuộc thi đã kết thúc</p>
                      <p className="text-xs text-orange-700 dark:text-orange-300 mt-0.5">
                        Bạn không thể nộp bài sau khi cuộc thi kết thúc
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <ProblemSubmitTab
                contestProblemId={selectedProblem.contestProblemId}
                problemId={selectedProblem.problemId}
                disabled={!canSubmit}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContestProblemsContent;
