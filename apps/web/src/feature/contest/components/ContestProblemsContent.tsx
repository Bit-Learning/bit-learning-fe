import React, { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { CheckCircle, XCircle, Minus, Code, Clock, Copy, Send, FileText, AlertCircle } from "lucide-react";
import { Badge } from "@workspace/ui/components/Badge";
import { useContestProblems } from "../queries/useContest";
import { ContestProblemListDTO } from "../types/contest.type";
import { ProblemSubmitTab } from "./ProblemSubmitTab";

type TabType = "description" | "submit";

const ContestProblemsContent: React.FC = () => {
  const { id, problemId } = useParams({ strict: false });
  const navigate = useNavigate();
  // const { data: problems, isLoading } = useContestProblems(id || "");

  const mockProblems: ContestProblemListDTO[] = [
    {
      contestProblemId: "cp-1",
      label: "A",
      orderIndex: 0,
      problemId: "p-1",
      title: "Two Sum",
      difficulty: "Easy",
      timeLimitMs: 1000,
      memoryLimitMb: 256,
      myStatus: "AC",
      myAttempts: 1,
      totalAccepted: 234,
      totalSubmissions: 312,
    },
    {
      contestProblemId: "cp-2",
      label: "B",
      orderIndex: 1,
      problemId: "p-2",
      title: "Longest Substring",
      difficulty: "Medium",
      timeLimitMs: 2000,
      memoryLimitMb: 512,
      myStatus: "WA",
      myAttempts: 3,
      totalAccepted: 156,
      totalSubmissions: 289,
    },
    {
      contestProblemId: "cp-3",
      label: "C",
      orderIndex: 2,
      problemId: "p-3",
      title: "Median of Arrays",
      difficulty: "Hard",
      timeLimitMs: 3000,
      memoryLimitMb: 512,
      myStatus: null,
      myAttempts: 0,
      totalAccepted: 89,
      totalSubmissions: 245,
    },
    {
      contestProblemId: "cp-4",
      label: "D",
      orderIndex: 3,
      problemId: "p-4",
      title: "Graph Traversal",
      difficulty: "Medium",
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      myStatus: "TLE",
      myAttempts: 2,
      totalAccepted: 123,
      totalSubmissions: 198,
    },
    {
      contestProblemId: "cp-5",
      label: "E",
      orderIndex: 4,
      problemId: "p-5",
      title: "Dynamic Programming",
      difficulty: "Hard",
      timeLimitMs: 3000,
      memoryLimitMb: 1024,
      myStatus: null,
      myAttempts: 0,
      totalAccepted: 67,
      totalSubmissions: 178,
    },
  ];

  const problems = mockProblems;
  const isLoading = false;

  const [activeTab, setActiveTab] = useState<TabType>("description");
  const [selectedProblem, setSelectedProblem] = useState<ContestProblemListDTO | null>(null);

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
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-500">Đang tải danh sách bài tập...</div>
      </div>
    );
  }

  if (!problems || problems.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-500">Không có bài tập nào</div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      <aside className="w-[320px] border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-lg">Danh sách bài</h3>
          <Badge className="text-xs text-black font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800">
            {problems.length} bài tập
          </Badge>
        </div>

        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-4 py-3 w-12 text-center">#</th>
                <th className="px-4 py-3">Tên bài</th>
                <th className="px-4 py-3 text-center">T/S</th>
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
                      <span className="font-bold text-sm">{problem.title}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase ${getDifficultyColor(problem.difficulty)}`}>
                          {getDifficultyLabel(problem.difficulty)}
                        </span>
                        {problem.myAttempts > 0 && (
                          <span className="text-[10px] text-slate-400">• {problem.myAttempts} lần</span>
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
              className={`py-4 text-sm cursor-pointer font-bold flex items-center gap-2 transition-colors ${
                activeTab === "description"
                  ? "border-primary text-primary border-b-2"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <FileText className="w-5 h-5" />
              Đề bài
            </button>
            <button
              onClick={() => setActiveTab("submit")}
              className={`py-4 text-sm cursor-pointer font-bold flex items-center gap-2 transition-colors ${
                activeTab === "submit"
                  ? "border-primary text-primary border-b-2"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Send className="w-5 h-5" />
              Nộp bài
            </button>
          </div>
        </div>

        {activeTab === "description" && selectedProblem && (
          <div className="flex-1 overflow-y-auto">
            <section className="max-w-4xl mx-auto p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-500">
                  <span className="text-sm font-bold uppercase tracking-widest">Problem {selectedProblem.label}</span>
                  <div className="h-1 w-1 rounded-full bg-slate-300" />
                  <span className="text-sm font-medium">
                    {selectedProblem.timeLimitMs / 1000}s, {selectedProblem.memoryLimitMb}MB
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
                      {selectedProblem.myAttempts} lần thử
                    </Badge>
                  )}
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none space-y-6">
                <div className="space-y-3">
                  <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                    Cho một mảng các số nguyên <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">nums</code>{" "}
                    và một số nguyên <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">target</code>. Hãy
                    tìm chỉ số của hai số trong mảng sao cho tổng của chúng bằng{" "}
                    <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">target</code>.
                  </p>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-xl text-black font-bold flex items-center gap-2">
                    <Code className="w-5 h-5 text-primary" />
                    Định dạng Input
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Dòng đầu tiên chứa số nguyên N (2 ≤ N ≤ 10⁴) và target.
                    <br />
                    Dòng thứ hai chứa N số nguyên, các số cách nhau bởi dấu cách.
                  </p>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-xl text-black font-bold flex items-center gap-2">
                    <Code className="w-5 h-5 text-primary" />
                    Định dạng Output
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Hai số nguyên là chỉ số của hai phần tử có tổng bằng target. Chỉ số bắt đầu từ 0.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Sample Input</h4>
                    <div className="relative group">
                      <pre className="bg-slate-100 text-black dark:bg-slate-800 p-4 rounded-lg font-mono text-sm border border-slate-200 dark:border-slate-700">
                        {`4 9
2 7 11 15`}
                      </pre>
                      <button className="absolute top-2 right-2 p-1.5 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Sample Output</h4>
                    <pre className="bg-slate-100 text-black dark:bg-slate-800 p-4 rounded-lg font-mono text-sm border border-slate-200 dark:border-slate-700">
                      0 1
                    </pre>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "submit" && selectedProblem && (
          <ProblemSubmitTab contestProblemId={selectedProblem.contestProblemId} />
        )}
      </div>
    </div>
  );
};

export default ContestProblemsContent;
