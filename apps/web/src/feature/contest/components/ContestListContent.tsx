import React from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Trophy, Star, ChevronLeft, ChevronRight, LayoutDashboard } from "lucide-react";
import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import { ContestCard } from "./ContestCard";
import { ContestListDTO, ContestStatus } from "../types/contest.type";

interface Props {
  contests: ContestListDTO[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const ContestListContent: React.FC<Props> = ({ contests, currentPage, totalPages, onPageChange }) => {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const navigate = useNavigate();
  const isAll = pathname === "/contests";
  const isMine = pathname === "/contests/my";
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | ContestStatus>("ALL");
  const ongoingCount = contests.filter((c) => c.status === ContestStatus.RUNNING).length;
  const upcomingCount = contests.filter((c) => c.status === ContestStatus.UPCOMING).length;
  const endedCount = contests.filter((c) => c.status === ContestStatus.ENDED).length;

  const filteredContests = statusFilter === "ALL" ? contests : contests.filter((c) => c.status === statusFilter);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-360 mx-auto px-6 lg:px-16 py-8">
        <div className="flex gap-8">
          <aside className="w-72 shrink-0 space-y-6">
            <div className="bg-white rounded-md p-5 shadow-sm border border-gray-400">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-blue-600" />
                KỲ THI
              </h3>

              <div className="space-y-2">
                <div
                  onClick={() => navigate({ to: "/contests" })}
                  className={`flex mb-2 items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition ${
                    isAll ? "bg-blue-600 text-white shadow" : "hover:bg-gray-50 text-gray-600 border border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Danh sách kỳ thi </span>
                  </div>
                </div>

                <div
                  onClick={() => navigate({ to: "/contests/my" })}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition ${
                    isMine ? "bg-blue-600 text-white shadow" : "hover:bg-gray-50 text-gray-600 border border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Star className={`w-5 h-5 ${isMine ? "text-white" : "text-yellow-500"}`} />
                    <span>Kỳ thi Của tôi</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-md p-5 shadow-sm border border-gray-400">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 uppercase tracking-wide">Trạng thái</h3>

              <div className="space-y-1">
                {[
                  {
                    label: "Tất cả",
                    value: "ALL",
                    count: contests.length,
                    color: "",
                  },
                  {
                    label: "Đang diễn ra",
                    value: ContestStatus.RUNNING,
                    count: ongoingCount,
                    color: "text-green-600",
                  },
                  {
                    label: "Sắp tới",
                    value: ContestStatus.UPCOMING,
                    count: upcomingCount,
                    color: "text-blue-600",
                  },
                  {
                    label: "Đã kết thúc",
                    value: ContestStatus.ENDED,
                    count: endedCount,
                    color: "text-gray-500",
                  },
                ].map((item) => {
                  const isActive = statusFilter === item.value;

                  return (
                    <div
                      key={item.value}
                      onClick={() => setStatusFilter(item.value as any)}
                      className={`flex items-center justify-between px-4 font-semibold py-2.5 rounded-lg cursor-pointer transition ${
                        isActive ? "bg-blue-50 text-blue-600 font-bold" : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className={`text-sm ${item.color}`}>{item.label}</span>

                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {item.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          <div className="flex-1 space-y-6">
            <div className="flex flex-col md:flex-row  md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isMine ? "Danh sách kỳ thi đã đăng ký và tham gia" : "Danh sách kỳ thi Tin học"}
                </h1>

                <p className="text-gray-500 mt-1">
                  {isMine ? "Danh sách các kỳ thi bạn đã tham gia." : "Khám phá và tham gia các cuộc thi lập trình."}
                </p>
              </div>

              <div className="flex gap-2">
                {ongoingCount > 0 && (
                  <Badge className="bg-green-100 text-green-700 border-0">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1"></span>
                    {ongoingCount} Đang diễn ra
                  </Badge>
                )}
                {upcomingCount > 0 && (
                  <Badge className="bg-blue-100 text-blue-700 border-0">{upcomingCount} Sắp tới</Badge>
                )}
                {isMine && endedCount > 0 && (
                  <Badge className="bg-gray-100 text-gray-700 border-0">{endedCount} Đã kết thúc</Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredContests.map((contest) => (
                <ContestCard key={contest.contestId} contest={contest} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center pt-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                    isDisabled={currentPage === 0}
                  >
                    <ChevronLeft />
                  </Button>

                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    let page =
                      totalPages <= 5
                        ? i
                        : currentPage < 3
                          ? i
                          : currentPage > totalPages - 3
                            ? totalPages - 5 + i
                            : currentPage - 2 + i;

                    return (
                      <Button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={currentPage === page ? "bg-blue-600 text-white" : "bg-white border"}
                      >
                        {page + 1}
                      </Button>
                    );
                  })}

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
                    isDisabled={currentPage === totalPages - 1}
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
