import React from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Star, LayoutDashboard, Search } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { ContestListDTO, ContestStatus } from "../types/contest.type";
import { ContestCard } from "./ContestCard";
import { Pagination } from "@/shared/components/Pagination";

interface Props {
  contests: ContestListDTO[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  search: string;
  onSearchChange: (value: string) => void;
  status: "ALL" | ContestStatus;
  onStatusChange: (value: "ALL" | ContestStatus) => void;
}

export const ContestListContent: React.FC<Props> = ({
  contests,
  currentPage,
  totalPages,
  onPageChange,
  search,
  onSearchChange,
  status,
  onStatusChange,
}) => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const isAll = pathname === "/contests";
  const isMine = pathname === "/contests/my";

  const ongoingCount = contests.filter((c) => c.status === ContestStatus.RUNNING).length;
  const upcomingCount = contests.filter((c) => c.status === ContestStatus.UPCOMING).length;
  const endedCount = contests.filter((c) => c.status === ContestStatus.ENDED).length;

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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-5">
        <div className="flex gap-8 items-start">
          <aside className="w-64 shrink-0 space-y-4 sticky top-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-md font-black uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
                Cuộc thi
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
                  <LayoutDashboard className="w-4 h-4" /> Danh sách cuộc thi
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
                  <Star className={cn("w-4 h-4", isMine ? "text-white" : "text-amber-400")} /> Cuộc thi của tôi
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-md font-black uppercase tracking-wider text-slate-800 mb-3">Trạng thái</h3>
              <div className="space-y-0.5">
                {statusItems.map((item) => {
                  const isActive = status === item.value;
                  return (
                    <div
                      key={item.value}
                      onClick={() => onStatusChange(item.value as any)}
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
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Tìm kiếm cuộc thi..."
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
              />
            </div>

            {contests.length === 0 ? (
              <div className="text-center py-20 text-slate-400 text-sm">Không tìm thấy cuộc thi nào.</div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {contests.map((contest) => (
                  <ContestCard key={contest.contestId} contest={contest} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center pt-6">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
