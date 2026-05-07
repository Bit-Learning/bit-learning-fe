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
      year: "numeric",
    });

  const iconColor = isRunning ? "text-green-600" : isUpcoming ? "text-blue-600" : "text-slate-400";

  return (
    <Link to="/contests/$id/info" params={{ id: contest.contestId }}>
      <div className="group bg-white border mb-4 border-slate-200 rounded-xl px-5 py-6 flex items-center gap-5 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer">
        <div className="shrink-0">
          <img
            src="/logocontest.png"
            alt={contest.title}
            className={cn("w-20 h-20 rounded-lg object-cover", isEnded && "opacity-80 grayscale")}
          />
        </div>

        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-sm font-semibold shrink-0",
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
            <h3
              className={cn(
                "text-lg font-semibold leading-snug transition-colors text-slate-900 group-hover:text-blue-600",
              )}
            >
              {contest.title}
            </h3>
          </div>

          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <Users className={cn("w-3.5 h-3.5 shrink-0", iconColor)} />
              <span>
                <span className="font-semibold text-slate-700">{contest.participantCount.toLocaleString()}</span> thí
                sinh
              </span>
            </div>
            {!!contest.durationMinutes && (
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <Timer className={cn("w-3.5 h-3.5 shrink-0", iconColor)} />
                <span>
                  <span className="font-semibold text-slate-700">{contest.durationMinutes}</span> phút
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-sm">
              <Calendar className={cn("w-3.5 h-3.5 shrink-0", iconColor)} />
              {isEnded ? (
                <span className="text-slate-500">
                  Kết thúc lúc: <span className="font-semibold text-slate-700">{formatDate(contest.endTime)}</span>
                </span>
              ) : (
                <span className="text-slate-500">
                  Bắt đầu lúc: <span className="font-semibold text-slate-700">{formatDate(contest.startTime)}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          {isRunning && contest.progress !== undefined && (
            <div className="w-32">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Tiến trình</span>
                <span className="text-green-600 font-medium">{contest.timeLeft}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${contest.progress}%` }} />
              </div>
            </div>
          )}

          {isUpcoming && contest.countdown && contest.problemCount > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5 text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-0.5">Bắt đầu sau</p>
              <p className="text-sm font-bold text-blue-600">
                {contest.countdown.d !== undefined && <>{String(contest.countdown.d).padStart(2, "0")}d : </>}
                {String(contest.countdown.h ?? 0).padStart(2, "0")}h :{" "}
                {String(contest.countdown.m ?? 0).padStart(2, "0")}m
              </p>
            </div>
          )}

          {isEnded && contest.myScore && contest.myRank && (
            <div className="flex gap-4 text-right">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Điểm số</p>
                <p className="text-lg font-bold text-blue-600">
                  {contest.myScore.current}
                  <span className="text-xs text-slate-400">/{contest.myScore.total}</span>
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Thứ hạng</p>
                <p className="text-lg font-bold text-blue-600">
                  #{contest.myRank}
                  <span className="text-xs text-slate-400">/{contest.participantCount.toLocaleString()}</span>
                </p>
              </div>
            </div>
          )}

          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
              isRunning
                ? "bg-green-600 text-white group-hover:bg-green-700"
                : isUpcoming
                  ? "bg-blue-600 text-white group-hover:bg-blue-700"
                  : "text-blue-600 border border-blue-200 group-hover:bg-blue-50",
            )}
          >
            {isRunning ? "Xem cuộc thi" : isUpcoming ? "Xem chi tiết" : "Xem kết quả"}
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </Link>
  );
};
