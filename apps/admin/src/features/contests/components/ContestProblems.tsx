import React from "react";
// import { useContestProblems } from "../hooks/useContest";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ContestProblemsProps {
  contestId: string;
}

const MOCK_PROBLEMS = [
  {
    contestProblemId: "1",
    label: "A",
    orderIndex: 1,
    problemId: "p1",
    title: "Two Sum",
    difficulty: "Dễ",
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    myStatus: "AC",
    myAttempts: 1,
    totalAccepted: 856,
    totalSubmissions: 1240,
  },
  {
    contestProblemId: "2",
    label: "B",
    orderIndex: 2,
    problemId: "p2",
    title: "Binary Search Mastery",
    difficulty: "Trung bình",
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    myStatus: "WA",
    myAttempts: 3,
    totalAccepted: 412,
    totalSubmissions: 980,
  },
  {
    contestProblemId: "3",
    label: "C",
    orderIndex: 3,
    problemId: "p3",
    title: "Longest Common Subsequence",
    difficulty: "Trung bình",
    timeLimitMs: 2000,
    memoryLimitMb: 512,
    myStatus: null,
    myAttempts: 0,
    totalAccepted: 210,
    totalSubmissions: 750,
  },
  {
    contestProblemId: "4",
    label: "D",
    orderIndex: 4,
    problemId: "p4",
    title: "Graph Traversal Challenge",
    difficulty: "Khó",
    timeLimitMs: 3000,
    memoryLimitMb: 512,
    myStatus: null,
    myAttempts: 0,
    totalAccepted: 52,
    totalSubmissions: 430,
  },
  {
    contestProblemId: "5",
    label: "E",
    orderIndex: 5,
    problemId: "p5",
    title: "Prime factorization (Large N)",
    difficulty: "Khó",
    timeLimitMs: 5000,
    memoryLimitMb: 1024,
    myStatus: null,
    myAttempts: 0,
    totalAccepted: 8,
    totalSubmissions: 120,
  },
];

export const ContestProblems: React.FC<ContestProblemsProps> = ({ contestId }) => {
  // const { data: problems, isLoading } = useContestProblems(contestId);
  const problems = MOCK_PROBLEMS;
  const isLoading = false;

  const getDifficultyBadge = (difficulty: string) => {
    const config: Record<string, string> = {
      Dễ: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 border-green-100 dark:border-green-500/20",
      "Trung bình":
        "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-100 dark:border-amber-500/20",
      Khó: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border-rose-100 dark:border-rose-500/20",
    };

    const className = config[difficulty] || config["Trung bình"];

    return (
      <Badge className={`px-2 py-1 rounded-md text-[11px] font-bold border uppercase tracking-wide ${className}`}>
        {difficulty}
      </Badge>
    );
  };

  const calculateAcceptanceRate = (accepted: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((accepted / total) * 100);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Danh sách bài tập ({problems.length})</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý các bài toán trong kỳ thi này</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Thêm bài tập
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Mã / Tên bài tập
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Độ khó
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">
                    Lượt nộp
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">
                    Đã giải
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Tỉ lệ AC
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {problems.map((problem) => {
                  const acceptanceRate = calculateAcceptanceRate(problem.totalAccepted, problem.totalSubmissions);
                  const progressColor = acceptanceRate > 60 ? "#22c55e" : acceptanceRate > 30 ? "#f59e0b" : "#ef4444";

                  return (
                    <tr
                      key={problem.contestProblemId}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-primary mb-0.5">{problem.label}</span>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                            {problem.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getDifficultyBadge(problem.difficulty)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-medium">{problem.totalSubmissions.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-medium">{problem.totalAccepted.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${acceptanceRate}%`,
                                backgroundColor: progressColor,
                              }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                            {acceptanceRate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400 italic">
          Mẹo: Kéo thả các bài tập để thay đổi thứ tự xuất hiện trong đề thi.
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">Trang 1 / 1</span>
        </div>
      </div>
    </div>
  );
};
