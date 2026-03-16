import React, { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useContestDetail } from "../queries/useContest";
import { ContestStatus } from "../types/contest.type";
import { ArrowLeft, Calendar, Edit2, Loader2, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContestOverview } from "../components/ContestOverview";
import { ContestProblems } from "../components/ContestProblems";
import { ContestParticipants } from "../components/ContestParticipants";
import { ContestLeaderboard } from "../components/ContestLeaderboard";
import { ContestSubmissions } from "../components/ContestSubmissions";
import { ContestClarifications } from "../components/ContestClarifications";

const ContestDetailPage: React.FC = () => {
  const { id } = useParams({ from: "/_authenticated/contests/$id" });
  const navigate = useNavigate();
  const { data: contest, isLoading } = useContestDetail(id);
  const [activeTab, setActiveTab] = useState("overview");

  const getStatusBadge = (status: ContestStatus) => {
    const config = {
      [ContestStatus.RUNNING]: {
        variant: "default" as const,
        className: "bg-green-500 text-white px-4 py-1",
        label: "Đang diễn ra",
        hasAnimation: true,
      },
      [ContestStatus.UPCOMING]: {
        variant: "secondary" as const,
        className: "bg-orange-500 text-white px-4 py-1",
        label: "Sắp tới",
        hasAnimation: false,
      },
      [ContestStatus.ENDED]: {
        variant: "outline" as const,
        className: "bg-gray-500 text-white px-4 py-1",
        label: "Đã kết thúc",
        hasAnimation: false,
      },
    };

    const { variant, className, label, hasAnimation } = config[status];

    return (
      <Badge variant={variant} className={className}>
        {hasAnimation && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse mr-1.5" />}
        {label}
      </Badge>
    );
  };

  const calculateTimeRemaining = () => {
    const end = new Date(contest?.endTime!);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Đã kết thúc";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const handleBack = () => {
    navigate({ to: "/contests" });
  };

  const handleEditContest = () => {
    navigate({
      to: "/contests/$id/edit",
      params: { id },
    });
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải cuộc thi...</p>
        </div>
      </div>
    );
  }
  if (!contest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy cuộc thi</p>
          <Button onClick={handleBack} variant="outline" className="mt-4">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="px-8 py-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <div className="mb-4">
            <Button variant="outline" onClick={handleBack} className="gap-2 border-gray-300">
              <ArrowLeft className="w-4 h-4" />
              Quay lại danh sách
            </Button>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">{contest?.title}</h2>

            {getStatusBadge(contest?.status!)}
            {contest?.status === ContestStatus.RUNNING && (
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium uppercase tracking-tight">
                  Thời gian còn lại: {calculateTimeRemaining()}
                </span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500">Mã cuộc thi: {contest?.slug}</p>
        </div>
        <div className="flex gap-3">
          {contest?.status === ContestStatus.RUNNING && (
            <Button variant="outline">
              <StopCircle className="w-4 h-4 mr-2" />
              Kết thúc sớm
            </Button>
          )}
          <Button onClick={handleEditContest}>
            <Edit2 className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
        </div>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-6 py-4 text-sm border-b-2 ${
            activeTab === "overview"
              ? "font-bold text-primary border-primary"
              : "font-medium text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          Tổng quan
        </button>

        <button
          onClick={() => setActiveTab("problems")}
          className={`px-6 py-4 text-sm border-b-2 ${
            activeTab === "problems"
              ? "font-bold text-primary border-primary"
              : "font-medium text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          Bài tập
        </button>

        <button
          onClick={() => setActiveTab("participants")}
          className={`px-6 py-4 text-sm border-b-2 ${
            activeTab === "participants"
              ? "font-bold text-primary border-primary"
              : "font-medium text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          Người đăng ký
        </button>

        <button
          onClick={() => setActiveTab("submissions")}
          className={`px-6 py-4 text-sm border-b-2 ${
            activeTab === "submissions"
              ? "font-bold text-primary border-primary"
              : "font-medium text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          Bài nộp
        </button>

        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`px-6 py-4 text-sm border-b-2 ${
            activeTab === "leaderboard"
              ? "font-bold text-primary border-primary"
              : "font-medium text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          Bảng xếp hạng
        </button>

        <button
          onClick={() => setActiveTab("qa")}
          className={`px-6 py-4 text-sm border-b-2 ${
            activeTab === "qa"
              ? "font-bold text-primary border-primary"
              : "font-medium text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          Hỏi đáp
        </button>
      </div>
      <div className="mt-6">
        {activeTab === "overview" && <ContestOverview contest={contest!} />}

        {activeTab === "problems" && <ContestProblems contestId={id} />}

        {activeTab === "participants" && <ContestParticipants contestId={id} />}

        {activeTab === "submissions" && <ContestSubmissions contestId={id} />}

        {activeTab === "leaderboard" && <ContestLeaderboard contestId={id} />}

        {activeTab === "qa" && <ContestClarifications contestId={id} />}
      </div>
    </div>
  );
};

export default ContestDetailPage;
