import React from "react";
import { FileText, Users, Timer, Calendar, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import { ContestListDTO, ContestStatus } from "../types/contest.type";

interface ContestCardProps {
  contest: ContestListDTO & {
    durationMinutes?: number;
    progress?: number;
    timeLeft?: string;
    countdown?: { d?: number; h?: number; m?: number; s?: number };
    myRank?: number | null;
    myScore?: { current: number; total: number };
  };
}

export const ContestCard: React.FC<ContestCardProps> = ({ contest }) => {
  const isRunning = contest.status === ContestStatus.RUNNING;
  const isUpcoming = contest.status === ContestStatus.UPCOMING;
  const isEnded = contest.status === ContestStatus.ENDED;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });

  const iconColor = isRunning ? "text-green-600" : isUpcoming ? "text-blue-600" : "text-slate-400";

  return (
    <Link to="/contests/$id/info" params={{ id: contest.contestId }}>
      <div className="bg-white border rounded-md p-6 group transition-all shadow-sm hover:shadow-md hover:border-blue-200 flex flex-col gap-4 cursor-pointer h-full">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-sm font-semibold",
              isRunning
                ? "bg-green-100 text-green-700"
                : isUpcoming
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-500",
            )}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                isRunning ? "bg-green-500 animate-pulse" : isUpcoming ? "bg-blue-500" : "bg-slate-400",
              )}
            />
            {isRunning ? "Đang diễn ra" : isUpcoming ? "Sắp diễn ra" : "Đã kết thúc"}
          </span>
        </div>

        <h3
          className={cn(
            "text-xl font-bold leading-snug transition-colors",
            isEnded ? "text-slate-500 group-hover:text-slate-700" : "text-slate-900 group-hover:text-blue-600",
          )}
        >
          {contest.title}
        </h3>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {!!contest.problemCount && (isRunning || isEnded) && (
            <div className="flex items-center gap-2 text-md text-slate-600">
              <FileText className={cn("w-4 h-4 shrink-0", iconColor)} />
              <span>
                <span className="font-semibold text-slate-800">{contest.problemCount}</span> bài tập
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-md text-slate-600">
            <Users className={cn("w-4 h-4 shrink-0", iconColor)} />
            <span>
              <span className="font-semibold text-slate-800">{contest.participantCount.toLocaleString()}</span> thí sinh
            </span>
          </div>
          {!!contest.durationMinutes && (
            <div className="flex items-center gap-2 text-md text-slate-600">
              <Timer className={cn("w-4 h-4 shrink-0", iconColor)} />
              <span>
                <span className="font-semibold text-slate-800">{contest.durationMinutes}</span> phút
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-md text-slate-600">
            <Calendar className={cn("w-4 h-4 shrink-0", iconColor)} />
            <span className="font-semibold text-slate-800">
              {formatDate(isUpcoming ? contest.startTime : contest.endTime)}
            </span>
          </div>
        </div>

        {isRunning && contest.progress !== undefined && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-500">
              <span>Tiến trình</span>
              <span className="text-green-600">Còn lại: {contest.timeLeft}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${contest.progress}%` }}
              />
            </div>
          </div>
        )}

        {isUpcoming && contest.countdown && contest.problemCount > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1">Bắt đầu sau</p>
            <div className="flex items-baseline gap-2 text-blue-600 font-black text-xl">
              {contest.countdown.d !== undefined && (
                <>
                  <span>{String(contest.countdown.d).padStart(2, "0")}d</span>
                  <span className="text-slate-300 text-base">:</span>
                </>
              )}
              <span>{String(contest.countdown.h ?? 0).padStart(2, "0")}h</span>
              <span className="text-slate-300 text-base">:</span>
              <span>{String(contest.countdown.m ?? 0).padStart(2, "0")}m</span>
            </div>
          </div>
        )}

        {isEnded && contest.myScore && contest.myRank && (
          <div className="flex gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Điểm số</p>
              <p className="text-2xl font-black text-blue-600">
                {contest.myScore.current}
                <span className="text-md text-slate-400">/{contest.myScore.total}</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Thứ hạng</p>
              <p className="text-2xl font-black text-blue-600">
                #{contest.myRank}
                <span className="text-md text-slate-400">/{contest.participantCount.toLocaleString()}</span>
              </p>
            </div>
          </div>
        )}

        <div className="mt-auto pt-2">
          <div
            className={cn(
              "w-full py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all",
              isRunning
                ? "text-white bg-green-600 group-hover:bg-green-700"
                : isUpcoming
                  ? "text-white bg-blue-500 group-hover:bg-blue-600"
                  : "text-blue-600 border-2 border-blue-600 group-hover:bg-blue-50",
            )}
          >
            {isRunning ? "Xem cuộc thi" : isUpcoming ? "Xem chi tiết" : "Xem kết quả"}
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
};
