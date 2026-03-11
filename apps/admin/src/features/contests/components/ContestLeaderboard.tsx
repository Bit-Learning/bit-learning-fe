import React from "react";
// import { useAdminLeaderboard } from "../queries/useContest";
import { RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ContestLeaderboardProps {
  contestId: string;
}

const MOCK_LEADERBOARD = [
  {
    rank: 1,
    userId: 1,
    username: "Lê Hoàng Nam",
    email: "namlh.ptit@gmail.com",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA5bQNEDVCGEigVtunzCtftSULh2IdNy6IzURJpjPd4xNXeGY62KFJWOci3sNNIu3wiK8_1ajyrOMDGtMT5SrcM65Jku0g7vLn1gGz_gCZo2zBds1FWJFzv8ShyrwKgWCiULMr6Uqn29JhewpUYRs3gzdkQM-Uh5SiZthqFuaiRNPOdFnrb5MzxVqL8UEPyt2B0pCbuMbche_5aOWGAYo3Jv-nOVrag7qVE9mzpOrea71UsTfsQ9bIzF1Ug-ZUzQguRXYP2PMlee9S6",
    solvedCount: 5,
    totalPenaltyMinutes: 145,
    problemResults: [
      { label: "A", solved: true, attempts: 1, acTimeMinutes: 15 },
      { label: "B", solved: true, attempts: 1, acTimeMinutes: 32 },
      { label: "C", solved: true, attempts: 2, acTimeMinutes: 58 },
      { label: "D", solved: true, attempts: 1, acTimeMinutes: 70 },
      { label: "E", solved: true, attempts: 3, acTimeMinutes: 125 },
    ],
  },
  {
    rank: 2,
    userId: 2,
    username: "Trần Anh Tuấn",
    email: "tuan.ta@hust.edu.vn",
    avatar: null,
    solvedCount: 4,
    totalPenaltyMinutes: 210,
    problemResults: [
      { label: "A", solved: true, attempts: 1, acTimeMinutes: 12 },
      { label: "B", solved: true, attempts: 1, acTimeMinutes: 45 },
      { label: "C", solved: false, attempts: 2, acTimeMinutes: null },
      { label: "D", solved: true, attempts: 4, acTimeMinutes: 115 },
      { label: "E", solved: true, attempts: 1, acTimeMinutes: 130 },
    ],
  },
  {
    rank: 3,
    userId: 3,
    username: "Nguyễn Việt Hoàng",
    email: "hoangnv.k65@vnu.vn",
    avatar: null,
    solvedCount: 3,
    totalPenaltyMinutes: 180,
    problemResults: [
      { label: "A", solved: true, attempts: 1, acTimeMinutes: 8 },
      { label: "B", solved: true, attempts: 3, acTimeMinutes: 45 },
      { label: "C", solved: false, attempts: 0, acTimeMinutes: null },
      { label: "D", solved: true, attempts: 1, acTimeMinutes: 82 },
      { label: "E", solved: false, attempts: 5, acTimeMinutes: null },
    ],
  },
  {
    rank: 4,
    userId: 4,
    username: "Phạm Minh Thái",
    email: "thaipm@gmail.com",
    avatar: null,
    solvedCount: 2,
    totalPenaltyMinutes: 95,
    problemResults: [
      { label: "A", solved: true, attempts: 1, acTimeMinutes: 15 },
      { label: "B", solved: true, attempts: 2, acTimeMinutes: 40 },
      { label: "C", solved: false, attempts: 0, acTimeMinutes: null },
      { label: "D", solved: false, attempts: 0, acTimeMinutes: null },
      { label: "E", solved: false, attempts: 0, acTimeMinutes: null },
    ],
  },
];

export const ContestLeaderboard: React.FC<ContestLeaderboardProps> = ({ contestId }) => {
  // const { data: leaderboard, isLoading } = useAdminLeaderboard(contestId);
  const leaderboard = MOCK_LEADERBOARD;
  const isLoading = false;

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold">
          {rank}
        </span>
      );
    } else if (rank === 2) {
      return (
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-bold">
          {rank}
        </span>
      );
    } else if (rank === 3) {
      return (
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-bold">
          {rank}
        </span>
      );
    }
    return (
      <span className="flex items-center justify-center w-7 h-7 text-slate-500 dark:text-slate-500 text-xs font-bold">
        {rank}
      </span>
    );
  };

  const getProblemCell = (result: any) => {
    if (!result.solved && result.attempts === 0) {
      return (
        <td className="min-w-25 text-center text-xs font-medium py-3 border-l border-slate-100 dark:border-slate-800/50">
          <div className="text-slate-300 dark:text-slate-700 font-bold">—</div>
        </td>
      );
    }

    if (!result.solved && result.attempts > 0) {
      return (
        <td className="min-w-25 text-center text-xs font-medium py-3 bg-red-50 dark:bg-red-900/10 border-l border-slate-100 dark:border-slate-800/50">
          <div className="text-red-600 dark:text-red-400 font-bold">-{result.attempts}</div>
          <div className="text-[10px] text-red-500 opacity-80">{result.attempts > 5 ? "Failed" : "In progress"}</div>
        </td>
      );
    }

    const bgColor = result.attempts > 2 ? "bg-yellow-50 dark:bg-yellow-900/10" : "bg-green-50 dark:bg-green-900/10";
    const textColor =
      result.attempts > 2 ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400";

    return (
      <td
        className={`min-w-25 text-center text-xs font-medium py-3 ${bgColor} border-l border-slate-100 dark:border-slate-800/50`}
      >
        <div className={`${textColor} font-bold`}>+{result.attempts}</div>
        <div className={`text-[10px] ${textColor} opacity-80`}>{result.acTimeMinutes}m</div>
      </td>
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-full">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Thí sinh</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">150</span>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Trạng thái</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Cập nhật lần cuối: 10 giây trước
              </span>
              <button className="text-primary hover:rotate-180 transition-transform duration-500">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Xuất Excel
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-250">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-16">
                  Hạng
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Thí sinh
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">
                  Tổng điểm
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">
                  Penalty
                </th>
                <th className="text-center text-xs text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 min-w-25 py-3">
                  A
                </th>
                <th className="text-center text-xs text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 min-w-25 py-3">
                  B
                </th>
                <th className="text-center text-xs text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 min-w-25 py-3">
                  C
                </th>
                <th className="text-center text-xs text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 min-w-25 py-3">
                  D
                </th>
                <th className="text-center text-xs text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 min-w-25 py-3">
                  E
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                  Admin
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {leaderboard.map((entry) => (
                <tr
                  key={entry.userId}
                  className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">{getRankBadge(entry.rank)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 border border-slate-200 dark:border-slate-700">
                        <AvatarImage src={entry.avatar || undefined} alt={entry.username} />
                        <AvatarFallback className="text-xs">
                          {entry.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          {entry.username}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{entry.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-bold text-primary">{entry.solvedCount * 100}</span>
                    <p className="text-[10px] text-slate-400">Solved: {entry.solvedCount}/5</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {entry.totalPenaltyMinutes}m
                    </span>
                  </td>
                  {entry.problemResults.map((result) => getProblemCell(result))}
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs font-bold text-primary hover:underline">Xem bài nộp</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Đang hiển thị <span className="font-bold text-slate-700 dark:text-slate-200">1 - 10</span> trong số{" "}
            <span className="font-bold text-slate-700 dark:text-slate-200">150</span> thí sinh
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed"
            disabled
          >
            <span className="material-icons-round">chevron_left</span>
          </button>
          <button className="w-8 h-8 rounded-lg bg-primary text-white text-sm font-bold">1</button>
          <button className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors text-slate-600 dark:text-slate-400">
            2
          </button>
          <button className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors text-slate-600 dark:text-slate-400">
            3
          </button>
          <span className="px-1 text-slate-400">...</span>
          <button className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors text-slate-600 dark:text-slate-400">
            15
          </button>
          <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <span className="material-icons-round">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};
