import React from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Trophy, Star, ChevronLeft, ChevronRight, LayoutDashboard, Search } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { ContestListDTO, ContestStatus } from "../types/contest.type";
import { ContestCard } from "./ContestCard";

interface Props {
  contests: ContestListDTO[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const ContestListContent: React.FC<Props> = ({ contests, currentPage, totalPages, onPageChange }) => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | ContestStatus>("ALL");

  const isAll = pathname === "/contests";
  const isMine = pathname === "/contests/my";

  const ongoingCount = contests.filter((c) => c.status === ContestStatus.RUNNING).length;
  const upcomingCount = contests.filter((c) => c.status === ContestStatus.UPCOMING).length;
  const endedCount = contests.filter((c) => c.status === ContestStatus.ENDED).length;

  const filteredContests = contests.filter((c) => {
    const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const hasProblem = c.problemCount > 0;

    return matchStatus && matchSearch && hasProblem;
  });

  const statusItems = [
    { label: "Tất cả", value: "ALL", count: contests.length, color: "" },
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
      color: "text-slate-500",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="relative overflow-hidden rounded-md bg-white border border-slate-200 p-10 shadow-sm mb-5">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Danh sách cuộc thi lập trình</h1>
            <p className="text-slate-500 text-base leading-relaxed">
              Tham gia các cuộc thi lập trình hấp dẫn, thử thách kỹ năng và nâng cao tư duy thuật toán của bạn.
            </p>
          </div>

          <div className="absolute top-4 right-8 opacity-[0.07] pointer-events-none select-none">
            <svg viewBox="0 0 120 120" className="w-36 h-36 text-blue-600 fill-current">
              <path d="M35 30 h50 v10 c0 15 -10 25 -25 25 s-25 -10 -25 -25 z" />
              <path d="M35 35 h-10 a10 10 0 0 0 10 10" fill="none" stroke="currentColor" strokeWidth="4" />
              <path d="M85 35 h10 a10 10 0 0 1 -10 10" fill="none" stroke="currentColor" strokeWidth="4" />
              <rect x="52" y="65" width="16" height="10" rx="2" />
              <rect x="40" y="75" width="40" height="8" rx="3" />
            </svg>
          </div>
        </div>
        <div className="flex gap-8 items-start">
          <aside className="w-64 shrink-0 space-y-4 sticky top-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-md font-black uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
                Kỳ thi
              </h3>
              <div className="space-y-1.5">
                <div
                  onClick={() => navigate({ to: "/contests" })}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all text-md font-semibold",
                    isAll
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-600 hover:bg-slate-50 border border-slate-200",
                  )}
                >
                  <LayoutDashboard className="w-4 h-4" /> Danh sách kỳ thi
                </div>
                <div
                  onClick={() => navigate({ to: "/contests/my" })}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all text-md font-semibold",
                    isMine
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-600 hover:bg-slate-50 border border-slate-200",
                  )}
                >
                  <Star className={cn("w-4 h-4", isMine ? "text-white" : "text-amber-400")} /> Kỳ thi của tôi
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-md font-black uppercase tracking-wider text-slate-800 mb-3">Trạng thái</h3>
              <div className="space-y-0.5">
                {statusItems.map((item) => {
                  const isActive = statusFilter === item.value;
                  return (
                    <div
                      key={item.value}
                      onClick={() => setStatusFilter(item.value as any)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all text-sm font-semibold",
                        isActive ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50",
                      )}
                    >
                      <span className={cn(!isActive && item.color)}>{item.label}</span>
                      <span
                        className={cn(
                          "text-sm px-2 py-0.5 rounded-full font-bold",
                          isActive ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500",
                        )}
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm cuộc thi..."
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
              />
            </div>

            {filteredContests.length === 0 ? (
              <div className="text-center py-20 text-slate-400 text-sm">Không tìm thấy cuộc thi nào.</div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {filteredContests.map((contest) => (
                  <ContestCard key={contest.contestId} contest={contest} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center pt-4">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    const page =
                      totalPages <= 5
                        ? i
                        : currentPage < 3
                          ? i
                          : currentPage > totalPages - 3
                            ? totalPages - 5 + i
                            : currentPage - 2 + i;
                    return (
                      <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-colors",
                          currentPage === page
                            ? "bg-blue-600 text-white shadow"
                            : "border border-slate-200 text-slate-600 hover:bg-slate-100",
                        )}
                      >
                        {page + 1}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
