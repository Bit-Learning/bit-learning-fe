import React, { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import PageMeta from "@/shared/components/seo/page-meta";
import { ContestListContent } from "../components/ContestListContent";
import { ContestStatus } from "../types/contest.type";
import { useContestList } from "../queries/useContest";
import Loader from "@workspace/ui/components/loader/TerminalLoader";

export const ContestListPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(0);

  const { data: contestsData, isLoading, error } = useContestList();

  const contests = useMemo(() => {
    if (!contestsData?.data) return [];

    return contestsData.data.map((contest) => {
      const now = new Date();
      const startTime = new Date(contest.startTime);
      const endTime = new Date(contest.endTime);
      const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / 60000);

      let progress: number | undefined;
      let timeLeft: string | undefined;
      let countdown: { d?: number; h?: number; m?: number; s?: number } | undefined;

      if (contest.status === ContestStatus.RUNNING) {
        const totalDuration = endTime.getTime() - startTime.getTime();
        const elapsed = now.getTime() - startTime.getTime();
        progress = Math.floor((elapsed / totalDuration) * 100);

        const remaining = Math.floor((endTime.getTime() - now.getTime()) / 1000);
        const hours = Math.floor(remaining / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);
        timeLeft = `${hours}h ${minutes}m`;
      }

      if (contest.status === ContestStatus.UPCOMING) {
        const remaining = Math.floor((startTime.getTime() - now.getTime()) / 1000);
        const days = Math.floor(remaining / 86400);
        const hours = Math.floor((remaining % 86400) / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);
        const seconds = remaining % 60;

        countdown = {
          d: days > 0 ? days : undefined,
          h: hours,
          m: minutes,
          s: seconds,
        };
      }

      return {
        ...contest,
        durationMinutes,
        progress,
        timeLeft,
        countdown,
      };
    });
  }, [contestsData]);

  const totalPages = contestsData?.page?.totalPages || 0;

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Không thể tải dữ liệu</h2>
          <p className="text-gray-600 mb-4">Vui lòng thử lại sau</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Kỳ thi Tin học - Bitlearning" description="Danh sách các kỳ thi lập trình" />
      <ContestListContent
        contests={contests}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
};
