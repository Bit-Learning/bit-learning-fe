import React from "react";
import { useParams } from "@tanstack/react-router";
import { Users, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import { Avatar, AvatarImage, AvatarFallback } from "@workspace/ui/components/Avatar";
import { useLeaderboard } from "../queries/useContest";

const ContestLeaderboardContent: React.FC = () => {
  const { id } = useParams({ strict: false });
  // const { data: leaderboard, isLoading } = useLeaderboard(id || "", 0, 50);

  const mockLeaderboard = {
    contestId: id || "",
    contestTitle: "Olympic Tin học Trẻ 2025",
    totalParticipants: 250,
    lastUpdatedAt: "2025-03-05T10:00:00",
    myRank: 42,
    rankings: [
      {
        rank: 1,
        userId: 101,
        username: "Le Quang Tu",
        avatar: null,
        solvedCount: 5,
        totalPenaltyMinutes: 120,
        problemResults: [
          { label: "A", solved: true, attempts: 1, wrongAttempts: 0, acTimeMinutes: 15, penaltyMinutes: 15 },
          { label: "B", solved: true, attempts: 2, wrongAttempts: 1, acTimeMinutes: 25, penaltyMinutes: 45 },
          { label: "C", solved: true, attempts: 1, wrongAttempts: 0, acTimeMinutes: 40, penaltyMinutes: 40 },
          { label: "D", solved: true, attempts: 1, wrongAttempts: 0, acTimeMinutes: 60, penaltyMinutes: 60 },
          { label: "E", solved: true, attempts: 3, wrongAttempts: 2, acTimeMinutes: 80, penaltyMinutes: 120 },
        ],
      },
      {
        rank: 42,
        userId: 102,
        username: "Minh Tran",
        avatar: null,
        solvedCount: 4,
        totalPenaltyMinutes: 110,
        problemResults: [
          { label: "A", solved: true, attempts: 1, wrongAttempts: 0, acTimeMinutes: 12, penaltyMinutes: 12 },
          { label: "B", solved: true, attempts: 3, wrongAttempts: 2, acTimeMinutes: 35, penaltyMinutes: 75 },
          { label: "C", solved: true, attempts: 1, wrongAttempts: 0, acTimeMinutes: 55, penaltyMinutes: 55 },
          { label: "D", solved: false, attempts: 3, wrongAttempts: 3, acTimeMinutes: null, penaltyMinutes: 0 },
          { label: "E", solved: true, attempts: 1, wrongAttempts: 0, acTimeMinutes: 90, penaltyMinutes: 90 },
        ],
      },
      {
        rank: 43,
        userId: 103,
        username: "Anh Nguyen",
        avatar: null,
        solvedCount: 3,
        totalPenaltyMinutes: 80,
        problemResults: [
          { label: "A", solved: true, attempts: 1, wrongAttempts: 0, acTimeMinutes: 15, penaltyMinutes: 15 },
          { label: "B", solved: true, attempts: 1, wrongAttempts: 0, acTimeMinutes: 30, penaltyMinutes: 30 },
          { label: "C", solved: true, attempts: 1, wrongAttempts: 0, acTimeMinutes: 50, penaltyMinutes: 50 },
          { label: "D", solved: false, attempts: 0, wrongAttempts: 0, acTimeMinutes: null, penaltyMinutes: 0 },
          { label: "E", solved: false, attempts: 0, wrongAttempts: 0, acTimeMinutes: null, penaltyMinutes: 0 },
        ],
      },
    ],
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getProblemBadgeClass = (result: any) => {
    if (!result.solved && result.wrongAttempts === 0) {
      return "bg-slate-100 dark:bg-slate-800 text-slate-400";
    }
    if (!result.solved && result.wrongAttempts > 0) {
      return "bg-rose-500 text-white";
    }
    if (result.solved && result.wrongAttempts === 0) {
      return "bg-emerald-500 text-white";
    }
    return "bg-amber-400 text-white";
  };

  const formatTime = (minutes: number | null) => {
    if (minutes === null) return "--";
    return `${minutes}m`;
  };

  return (
    <main className="flex-1 px-4 lg:px-20 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight">Xếp hạng trực tuyến</h2>
            <p className="text-slate-500 text-sm mt-1">Cập nhật kết quả thi đấu thời gian thực</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
              <Users className="w-5 h-5 text-primary" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">Thí sinh</span>
                <span className="font-bold text-slate-900 dark:text-white">{mockLeaderboard.totalParticipants}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
              <RefreshCw className="w-5 h-5 text-primary" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">Cập nhật</span>
                <span className="font-bold text-slate-900 dark:text-white">10 giây trước</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-250">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 w-16 text-center">Rank</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Thí sinh</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-center">Solved</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-center">Penalty</th>
                  {mockLeaderboard.rankings[0]?.problemResults.map((p) => (
                    <th
                      key={p.label}
                      className="px-4 py-4 text-xs font-bold uppercase text-slate-500 text-center w-24 border-l border-slate-200/50 dark:border-slate-700/50"
                    >
                      {p.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mockLeaderboard.rankings.map((ranking) => {
                  const isCurrentUser = ranking.rank === mockLeaderboard.myRank;
                  return (
                    <tr
                      key={ranking.userId}
                      className={`transition-colors ${
                        isCurrentUser
                          ? "bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/20 border-y border-primary/20"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                      }`}
                    >
                      <td
                        className={`px-6 py-4 text-center font-bold ${
                          isCurrentUser ? "text-primary" : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {ranking.rank}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className={`size-8 ${isCurrentUser ? "ring-2 ring-primary" : ""}`}>
                            <AvatarImage src={ranking.avatar || undefined} />
                            <AvatarFallback className={isCurrentUser ? "bg-primary text-white" : ""}>
                              {getInitials(ranking.username)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-${isCurrentUser ? "bold" : "medium"} text-slate-900 dark:text-white`}
                            >
                              {ranking.username}
                            </span>
                            {isCurrentUser && (
                              <Badge className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 uppercase">
                                Bạn
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge
                          className={`${
                            isCurrentUser ? "bg-primary text-white shadow-sm" : "bg-primary/10 text-primary"
                          } px-3 py-1 rounded-full text-sm font-bold`}
                        >
                          {ranking.solvedCount}
                        </Badge>
                      </td>
                      <td
                        className={`px-6 py-4 text-center text-sm font-${isCurrentUser ? "bold text-primary" : "medium text-slate-600 dark:text-slate-400"}`}
                      >
                        {ranking.totalPenaltyMinutes}
                      </td>
                      {ranking.problemResults.map((result) => (
                        <td
                          key={result.label}
                          className="px-4 py-4 text-center border-l border-slate-200/50 dark:border-slate-700/50"
                        >
                          <div
                            className={`${getProblemBadgeClass(result)} rounded-lg py-1.5 text-xs font-bold shadow-sm`}
                          >
                            {!result.solved && result.wrongAttempts === 0 ? (
                              "--"
                            ) : !result.solved ? (
                              `-${result.wrongAttempts}`
                            ) : (
                              <>
                                +{result.wrongAttempts + 1}{" "}
                                <span className="font-normal opacity-80">{formatTime(result.acTimeMinutes)}</span>
                              </>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-xs">
              <div className="size-3 bg-emerald-500 rounded-sm shadow-sm" />
              <span className="text-slate-600 dark:text-slate-400 font-medium">Accepted (Lần đầu)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="size-3 bg-amber-400 rounded-sm shadow-sm" />
              <span className="text-slate-600 dark:text-slate-400 font-medium">Accepted (Có sai sót)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="size-3 bg-rose-500 rounded-sm shadow-sm" />
              <span className="text-slate-600 dark:text-slate-400 font-medium">Lỗi nộp bài</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="size-3 bg-slate-200 dark:bg-slate-700 rounded-sm" />
              <span className="text-slate-600 dark:text-slate-400 font-medium">Chưa làm</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-500 text-sm">
            <p>Hiển thị 1-10 trên {mockLeaderboard.totalParticipants} thí sinh</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="size-8 p-0">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button className="bg-primary text-white size-8 p-0 font-bold shadow-sm">1</Button>
              <Button variant="ghost" size="sm" className="size-8 p-0">
                2
              </Button>
              <Button variant="ghost" size="sm" className="size-8 p-0">
                3
              </Button>
              <span className="px-1 text-slate-300">...</span>
              <Button variant="ghost" size="sm" className="size-8 p-0">
                25
              </Button>
              <Button variant="outline" size="sm" className="size-8 p-0">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ContestLeaderboardContent;
