import React, { useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Star, Search } from "lucide-react";
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
}

export const ContestListContent: React.FC<Props> = ({
  contests,
  currentPage,
  totalPages,
  onPageChange,
  search,
  onSearchChange,
}) => {
  const [inputValue, setInputValue] = useState(search);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const isAll = pathname === "/contests";
  const isMine = pathname === "/contests/my";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border-b border-slate-200 flex items-center">
          <div
            onClick={() => navigate({ to: "/contests" })}
            className={cn(
              "flex items-center gap-2 px-5 py-3.5 text-sm font-semibold cursor-pointer border-b-2 transition-colors",
              isAll ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700",
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            Danh sách cuộc thi
          </div>
          <div
            onClick={() => navigate({ to: "/contests/my" })}
            className={cn(
              "flex items-center gap-2 px-5 py-3.5 text-sm font-semibold cursor-pointer border-b-2 transition-colors",
              isMine ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700",
            )}
          >
            <Star className={cn("w-4 h-4", isMine ? "text-blue-600" : "text-amber-400")} />
            Cuộc thi của tôi
          </div>
        </div>

        <div className="bg-white border-b border-slate-200 py-3 px-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSearchChange(inputValue);
              }}
              placeholder="Tìm kiếm, nhấn Enter để lọc..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <main className="py-4 space-y-3">
          {contests.length === 0 ? (
            <div className="text-center py-20 text-slate-400 text-sm">Không tìm thấy cuộc thi nào.</div>
          ) : (
            contests.map((contest) => <ContestCard key={contest.contestId} contest={contest} />)
          )}
          {totalPages > 1 && (
            <div className="flex justify-center pt-4">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
