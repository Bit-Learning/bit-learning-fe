import React from "react";
import { Star, Code, Users, FileText, Timer, Calendar, Clock, LogIn, Loader2 } from "lucide-react";
import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import { Card } from "@workspace/ui/components/Card";
import { ContestListDTO, ContestStatus } from "../types/contest.type";
import { Link } from "@tanstack/react-router";
import { useRegisterContest } from "../queries/useContest";

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

export const ContestCard: React.FC<ContestCardProps> = ({ contest }) => {
  const isEnded = contest.status === ContestStatus.ENDED;
  const isOngoing = contest.status === ContestStatus.RUNNING;
  const isUpcoming = contest.status === ContestStatus.UPCOMING;

  const registerMutation = useRegisterContest();

  const handleRegister = () => {
    registerMutation.mutate(contest.contestId);
  };

  const getStatusBadge = () => {
    if (isOngoing) {
      return <Badge className="bg-green-500 text-white text-xs font-semibold">Đang diễn ra</Badge>;
    }
    if (isUpcoming) {
      return <Badge className="bg-blue-500 text-white text-xs font-semibold">Sắp tới</Badge>;
    }
    return <Badge className="bg-gray-400 text-white text-xs font-semibold">Đã kết thúc</Badge>;
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
      className={`group rounded-md p-6 border-2 transition-all hover:shadow-xl relative overflow-hidden flex flex-col  ${
        isEnded
          ? "bg-gray-50 opacity-75 hover:opacity-100 border-gray-400"
          : isOngoing
            ? "bg-white border-green-500 shadow-md"
            : "bg-white border-gray-400"
      }`}
    >
      <div className="absolute top-0 right-0 p-4 flex flex-col items-end gap-2">
        {getStatusBadge()}
        {contest.isRegistered && (
          <Badge className="bg-yellow-100 text-yellow-700 text-xs font-semibold border border-yellow-200">
            <Star className="w-3 h-3 mr-1 fill-current" />
            Đã đăng ký
          </Badge>
        )}
      </div>

      <div className="flex items-start gap-4 mb-2 border-b pb-2 border-black ">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
            isEnded ? "bg-gray-100" : isOngoing ? "bg-green-100" : "bg-blue-100"
          }`}
        >
          <Code className={`w-7 h-7 ${isEnded ? "text-gray-500" : isOngoing ? "text-green-800" : "text-blue-800"}`} />
        </div>
        <div className="pr-20">
          <Link to="/contests/$id/problems" params={{ id: contest.contestId }}>
            <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors leading-tight">
              {contest.title}
            </h3>
          </Link>
          <p className="text-sm text-gray-500 mt-1">
            {contest.description || `${contest.problemCount} bài tập • ${contest.durationMinutes || 120} phút`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-2">
        <div className="flex items-center gap-2 text-gray-800 text-sm">
          <Users className="w-5 h-5" />
          <span className="font-medium">
            {contest.participantCount.toLocaleString()} {contest.isRegistered && !isEnded ? "Đã đăng ký" : "Thí sinh"}
          </span>
        </div>
        {contest.problemCount ? (
          <div className="flex items-center gap-2 text-gray-800 text-sm">
            <FileText className="w-5 h-5" />
            <span className="font-medium">{contest.problemCount} Bài tập</span>
          </div>
        ) : null}
        {contest.durationMinutes && (
          <div className="flex items-center gap-2 text-gray-800 text-sm">
            <Timer className="w-5 h-5" />
            <span className="font-medium">{contest.durationMinutes} Phút</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-800 text-sm">
          {isUpcoming ? <Clock className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
          <span className="font-medium">{formatDate(isUpcoming ? contest.startTime : contest.endTime)}</span>
        </div>
      </div>

      {contest.progress && (
        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-xs font-semibold text-gray-500">
            <span>Tiến trình cuộc thi</span>
            <span className="text-green-600">Còn lại: {contest.timeLeft}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${contest.progress}%` }}
            />
          </div>
        </div>
      )}

      {contest.countdown && !contest.progress && (
        <div className="p-4 bg-gray-50 rounded-lg mb-4">
          <p className="text-xs font-semibold text-gray-500 mb-1">Bắt đầu sau:</p>
          <div className="flex items-center gap-4 text-2xl font-bold text-blue-600">
            {contest.countdown.d && (
              <>
                <span>{String(contest.countdown.d).padStart(2, "0")}d</span>
                <span className="text-gray-300">:</span>
              </>
            )}
            <span>{String(contest.countdown.h || 0).padStart(2, "0")}h</span>
            <span className="text-gray-300">:</span>
            <span>{String(contest.countdown.m || 0).padStart(2, "0")}m</span>
          </div>
        </div>
      )}

      {contest.myScore && contest.myRank && (
        <div className="mb-3 flex gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Điểm số</p>
            <p className="text-2xl font-bold text-blue-600">
              {contest.myScore.current}/{contest.myScore.total}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Thứ hạng</p>
            <p className="text-2xl font-bold text-blue-600">
              #{contest.myRank}/{contest.participantCount.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      <div className="mt-auto">
        {isOngoing && contest.isRegistered && (
          <Link to="/contests/$id/problems" params={{ id: contest.contestId }}>
            <Button className="w-full bg-blue-600 text-white font-semibold py-5 rounded-lg hover:bg-blue-700">
              <span>Vào phòng thi</span>
              <LogIn className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        )}

        {isOngoing && !contest.isRegistered && (
          <Button
            className="w-full bg-white text-blue-800 font-bold py-5 rounded-lg border border-blue-400 cursor-default"
            isDisabled
          >
            Quá hạn đăng ký
          </Button>
        )}

        {isUpcoming && contest.isRegistered && (
          <div className="flex items-center gap-3">
            <Button
              className="w-full bg-white text-blue-800 font-bold py-5 rounded-lg border border-blue-400 cursor-default"
              isDisabled
            >
              Đã sẵn sàng tham gia
            </Button>
            <Link to="/contests/$id/problems" params={{ id: contest.contestId }}>
              <Button className="w-full bg-blue-600 text-white font-semibold py-5 rounded-lg hover:bg-blue-700">
                <span>Xem chi tiết</span>
                <LogIn className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        )}

        {isUpcoming && !contest.isRegistered && (
          <Button
            onClick={handleRegister}
            isDisabled={registerMutation.isPending}
            className="w-full border-2 border-blue-600 text-white font-semibold py-5 rounded-lg hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Đang đăng ký...
              </>
            ) : (
              "Đăng ký ngay"
            )}
          </Button>
        )}

        {isEnded && (
          <div>
            <Link to="/contests/$id/problems" params={{ id: contest.contestId }}>
              <Button className="w-full bg-blue-600 text-white font-semibold py-5 rounded-lg hover:bg-blue-700">
                <span>Xem chi tiết</span>
                <LogIn className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
};
