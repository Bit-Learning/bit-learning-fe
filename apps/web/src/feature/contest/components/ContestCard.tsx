import React, { JSX } from "react";
import {
  Star,
  CheckCircle,
  Code,
  Users,
  FileText,
  Timer,
  Calendar,
  Rocket,
  Database,
  Network,
  Target,
  CalendarDays,
  Radio,
  Award,
  Clock,
  LogIn,
} from "lucide-react";
import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import { Card } from "@workspace/ui/components/Card";
import { ContestListDTO, ContestStatus } from "../types/contest.type";

interface ContestCardProps {
  contest: ContestListDTO & {
    description?: string;
    durationMinutes?: number;
    progress?: number;
    timeLeft?: string;
    countdown?: {
      d?: number;
      h?: number;
      m?: number;
      s?: number;
    };
    myRank?: number | null;
    myScore?: {
      current: number;
      total: number;
    };
  };
}

const getContestIcon = (title: string) => {
  if (title.includes("Olympic") || title.includes("C++") || title.includes("Pascal")) return Code;
  if (title.includes("Python") || title.includes("Cấu trúc dữ liệu")) return Database;
  if (title.includes("Chứng chỉ")) return Network;
  if (title.includes("Thuật toán") || title.includes("quy hoạch")) return Target;
  return Code;
};

export const ContestCard: React.FC<ContestCardProps> = ({ contest }) => {
  const Icon = getContestIcon(contest.title);
  const isEnded = contest.status === ContestStatus.ENDED;
  const isOngoing = contest.status === ContestStatus.RUNNING;
  const isUpcoming = contest.status === ContestStatus.UPCOMING;

  const getStatusBadge = (): JSX.Element => {
    if (isOngoing) {
      return (
        <Badge className="bg-green-500 text-white text-[10px] font-black uppercase animate-pulse">
          <Radio className="w-3 h-3 mr-1" />
          Đang diễn ra
        </Badge>
      );
    }
    if (isUpcoming) {
      return (
        <Badge className="bg-blue-500 text-white text-[10px] font-black uppercase">
          <CalendarDays className="w-3 h-3 mr-1" />
          Sắp tới
        </Badge>
      );
    }
    return (
      <Badge className="bg-slate-400 text-white text-[10px] font-black uppercase">
        <CheckCircle className="w-3 h-3 mr-1" />
        Đã kết thúc
      </Badge>
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
  };

  return (
    <Card
      className={`group rounded-2xl p-6 transition-all hover:shadow-xl relative overflow-hidden flex flex-col ${
        isEnded
          ? "bg-white/60 dark:bg-slate-900/40 opacity-80 grayscale-[0.5] hover:grayscale-0 hover:opacity-100"
          : isOngoing
            ? "border-2 border-green-500/30"
            : ""
      }`}
    >
      <div className="absolute top-0 right-0 p-4 flex flex-col items-end gap-2">
        {getStatusBadge()}
        {contest.isRegistered && (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-bold uppercase border border-amber-200 dark:border-amber-800">
            <Star className="w-3 h-3 mr-1 fill-current" />
            Đã đăng ký
          </Badge>
        )}
      </div>

      <div className="flex items-start gap-4 mb-6">
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
            isEnded
              ? "bg-slate-100 dark:bg-slate-800"
              : isOngoing
                ? "bg-green-100 dark:bg-green-900/20"
                : "bg-blue-100 dark:bg-blue-900/20"
          }`}
        >
          <Icon className={`w-8 h-8 ${isEnded ? "text-slate-500" : isOngoing ? "text-green-600" : "text-blue-600"}`} />
        </div>
        <div className="pr-20">
          <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors leading-tight">
            {contest.title}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {contest.description || `${contest.problemCount} bài tập • ${contest.durationMinutes || 120} phút`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
          <Users className="w-5 h-5" />
          <span className="font-medium">
            {contest.participantCount.toLocaleString()} {contest.isRegistered && !isEnded ? "Đã đăng ký" : "Thí sinh"}
          </span>
        </div>
        {contest.problemCount ? (
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
            <FileText className="w-5 h-5" />
            <span className="font-medium">{contest.problemCount} Bài tập</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
            <Award className="w-5 h-5" />
            <span className="font-medium">Xem Kết quả</span>
          </div>
        )}
        {contest.durationMinutes && (
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
            <Timer className="w-5 h-5" />
            <span className="font-medium">{contest.durationMinutes} Phút</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
          {isUpcoming ? <Clock className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
          <span className="font-medium">{formatDate(isUpcoming ? contest.startTime : contest.endTime)}</span>
        </div>
      </div>

      {contest.progress && (
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-xs font-bold text-slate-500">
            <span>Tiến trình cuộc thi</span>
            <span className="text-green-600">Còn lại: {contest.timeLeft}</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${contest.progress}%` }}
            />
          </div>
        </div>
      )}

      {contest.countdown && !contest.progress && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-6">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Bắt đầu sau:</p>
          <div className="flex items-center gap-4 text-2xl font-bold tracking-tight text-blue-600">
            {contest.countdown.d && (
              <>
                <span>{String(contest.countdown.d).padStart(2, "0")}d</span>
                <span className="text-slate-300">:</span>
              </>
            )}
            <span>{String(contest.countdown.h || 0).padStart(2, "0")}h</span>
            <span className="text-slate-300">:</span>
            <span>{String(contest.countdown.m || 0).padStart(2, "0")}m</span>
            {contest.countdown.s !== undefined && (
              <>
                <span className="text-slate-300">:</span>
                <span>{String(contest.countdown.s).padStart(2, "0")}s</span>
              </>
            )}
          </div>
        </div>
      )}

      {contest.myScore && contest.myRank && (
        <div className="mb-6 flex gap-4">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Điểm số</p>
            <p className="text-2xl font-bold text-blue-600">
              {contest.myScore.current}/{contest.myScore.total}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Thứ hạng</p>
            <p className="text-2xl font-bold text-blue-600">
              #{contest.myRank}/{contest.participantCount.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      <div className="mt-auto">
        {isOngoing && (
          <Button className="w-full bg-blue-600 text-white font-bold py-5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20">
            <span>Vào phòng thi</span>
            <LogIn className="w-5 h-5 ml-2" />
          </Button>
        )}

        {isUpcoming && contest.isRegistered && (
          <Button
            className="w-full bg-slate-100 dark:bg-slate-800 text-blue-800 font-bold py-5 rounded-xl border border-blue-600/20 cursor-default"
            isDisabled
          >
            Đã sẵn sàng tham gia
          </Button>
        )}

        {isUpcoming && !contest.isRegistered && (
          <Button className="w-full border-2 border-blue-600 text-white font-bold py-5 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
            Đăng ký ngay
          </Button>
        )}

        {isEnded && (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 border-2 text-sm font-bold py-5 rounded-xl">
              Luyện tập lại
            </Button>
            <Button className="flex-1 bg-slate-800 text-white font-bold  py-5 rounded-xl text-sm hover:bg-slate-700">
              Xem Lời giải
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
