import React, { useState, useMemo } from "react";
import { Heart, ChevronDown, Search } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { useProblems, useToggleFavorite } from "../queries/useCoding";
import Loader from "@workspace/ui/components/loader/TerminalLoader";
import { Pagination } from "@/shared/components/Pagination";
import { toast } from "@/shared/components/Sonner";
import type { ProblemBriefResponse } from "../types/coding.type";
import { ProblemStatsCard } from "./ProblemStatsCard";

const DIFF_LABEL: Record<string, string> = {
  EASY: "Dễ",
  MEDIUM: "Vừa",
  HARD: "Khó",
};
const DIFF_COLOR: Record<string, string> = {
  EASY: "text-emerald-600",
  MEDIUM: "text-amber-500",
  HARD: "text-rose-500",
};

const TagPill: React.FC<{
  name: string;
  count: number;
  active: boolean;
  onClick: () => void;
}> = ({ name, count, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "inline-flex items-center gap-2 px-2 py-1 text-lg font-medium whitespace-nowrap transition-colors cursor-pointer ",
      active ? "text-blue-500" : "text-slate-500 hover:text-blue-500",
    )}
  >
    {name}
    <span
      className={cn(
        "px-2.5 py-0.5 text-sm rounded-sm",
        active ? "bg-blue-100 text-blue-500" : "bg-slate-200 hover:text-blue-500",
      )}
    >
      {count}
    </span>
  </button>
);

const InlineTag: React.FC<{ label: string }> = ({ label }) => (
  <span className="px-2 py-0.5 text-sm rounded bg-slate-100 text-slate-500 border border-slate-200 whitespace-nowrap">
    {label}
  </span>
);

const StudentProblemListContent: React.FC = () => {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<"all" | "EASY" | "MEDIUM" | "HARD">("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [showAllTags, setShowAllTags] = useState(false);
  const size = 20;

  const navigate = useNavigate();

  const { data: problemsData, isLoading } = useProblems({ page, size, sort: "createdAt,desc" });
  const toggleFavorite = useToggleFavorite();

  const problems: ProblemBriefResponse[] = problemsData?.data || [];
  const pageInfo = problemsData?.page;
  const totalPages = pageInfo?.totalPages || 0;
  const totalElements = pageInfo?.totalElements || 0;

  const tagMap = useMemo(() => {
    const map: Record<string, number> = {};
    problems.forEach((p) => p.tags?.forEach((t) => (map[t.name] = (map[t.name] || 0) + 1)));
    return map;
  }, [problems]);

  const sortedTags = useMemo(() => Object.entries(tagMap).sort((a, b) => b[1] - a[1]), [tagMap]);

  const VISIBLE_TAGS = 8;
  const visibleTags = showAllTags ? sortedTags : sortedTags.slice(0, VISIBLE_TAGS);

  const filtered = useMemo(
    () =>
      problems.filter((p) => {
        if (difficulty !== "all" && p.difficulty !== difficulty) return false;
        if (activeTag && !p.tags?.some((t) => t.name === activeTag)) return false;
        if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }),
    [problems, difficulty, activeTag, search],
  );

  const handleFavorite = (e: React.MouseEvent, problem: ProblemBriefResponse) => {
    e.stopPropagation();
    const willFavorite = !problem.isFavorite;
    toggleFavorite.mutate(problem.id, {
      onSuccess: () => {
        toast[willFavorite ? "success" : "info"]({
          title: willFavorite ? "Đã thêm vào yêu thích" : "Đã xóa khỏi yêu thích",
          description: problem.title,
        });
      },
    });
  };

  const handleRowClick = (id: string) => navigate({ to: `/problem/${id}` });

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative overflow-hidden h-60 md:h-72 flex items-end">
        <img src="problem.png" alt="hero" className="absolute inset-0 w-full h-full object-cover" />
      </div>
      <div className="bg-white border-b border-gray-200 shadow-sm mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="text-md text-gray-500 flex items-center">
            <span onClick={() => navigate({ to: "/" })} className="hover:text-blue-600 cursor-pointer">
              Trang chủ
            </span>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-blue-600 font-medium">Danh sách bài tập</span>
          </nav>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
        {sortedTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {visibleTags.map(([name, count]) => (
              <TagPill
                key={name}
                name={name}
                count={count}
                active={activeTag === name}
                onClick={() => setActiveTag((prev) => (prev === name ? null : name))}
              />
            ))}
            {sortedTags.length > VISIBLE_TAGS && (
              <button
                onClick={() => setShowAllTags((v) => !v)}
                className="inline-flex items-center gap-1 px-2 py-1 text-md text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
              >
                {showAllTags ? "Thu gọn" : `+${sortedTags.length - VISIBLE_TAGS} nữa`}
                <ChevronDown className={cn("w-3 h-3 transition-transform", showAllTags && "rotate-180")} />
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-50">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Tìm kiếm bài tập..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
            />
          </div>

          <div className="flex bg-white border-2 rounded-md border-slate-200 overflow-hidden">
            {(
              [
                { value: "all", label: "Tất cả" },
                { value: "EASY", label: "Dễ" },
                { value: "MEDIUM", label: "Vừa" },
                { value: "HARD", label: "Khó" },
              ] as const
            ).map(({ value, label }) => {
              const active = difficulty === value;
              return (
                <button
                  key={value}
                  onClick={() => {
                    setDifficulty(value);
                    setPage(0);
                  }}
                  className={cn(
                    "px-3 py-3 text-md font-medium transition-colors cursor-pointer whitespace-nowrap border-r border-slate-200 last:border-r-0",
                    active
                      ? value === "EASY"
                        ? "bg-emerald-50 text-emerald-600"
                        : value === "MEDIUM"
                          ? "bg-amber-50 text-amber-500"
                          : value === "HARD"
                            ? "bg-rose-50 text-rose-500"
                            : "bg-slate-100 text-slate-700"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <span className="ml-auto text-lg text-slate-500 whitespace-nowrap">
            <span className="text-slate-700 font-bold">{filtered.length}</span>
            <span className="mx-1 text-slate-400">/</span>
            <span className="text-slate-700 font-bold">{totalElements}</span>
            <span className="ml-2">bài tập</span>
          </span>
        </div>

        <div className="rounded-md border border-slate-200 overflow-hidden bg-white shadow-sm">
          <div className="grid grid-cols-[40px_1fr_110px_100px_50px] items-center px-5 py-2.5 bg-slate-50 border-b border-slate-200 text-lg uppercase tracking-wider text-slate-600 font-medium">
            <span>#</span>
            <span>Bài tập</span>
            <span className="text-center">Tỉ lệ đúng</span>
            <span className="text-right">Độ khó</span>
            <span />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">Không tìm thấy bài tập nào.</div>
          ) : (
            filtered.map((problem, idx) => (
              <div
                key={problem.id}
                onClick={() => handleRowClick(problem.id)}
                className={cn(
                  "grid grid-cols-[40px_1fr_110px_100px_60px] items-center px-5 py-3.5 border-b border-slate-100 last:border-b-0 cursor-pointer transition-colors hover:bg-blue-50 group",
                  idx % 2 === 0 ? "bg-white" : "bg-slate-50/50",
                )}
              >
                <span className="text-lg text-slate-600">{idx + 1 + page * size}</span>

                <div className="flex flex-col gap-1.5 min-w-0 pr-4">
                  <span className="text-lg font-bold text-slate-800 group-hover:text-blue-500 transition-colors truncate">
                    {problem.title}
                  </span>
                  {problem.tags && problem.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {problem.tags.map((tag) => (
                        <InlineTag key={tag.id} label={tag.name} />
                      ))}
                    </div>
                  )}
                </div>

                <ProblemStatsCard problemId={problem.id} />
                <span className={cn("text-lg font-medium text-right", DIFF_COLOR[problem.difficulty])}>
                  {DIFF_LABEL[problem.difficulty] ?? problem.difficulty}
                </span>

                <div className="relative group">
                  <button
                    onClick={(e) => handleFavorite(e, problem)}
                    className={cn(
                      "cursor-pointer flex items-center justify-center w-10 h-10 ms-3 rounded transition-all",
                      problem.isFavorite
                        ? "text-rose-400 hover:text-rose-500"
                        : "text-slate-300 hover:text-slate-400 opacity-0 group-hover:opacity-100",
                    )}
                  >
                    <Heart className={cn("w-6 h-6", problem.isFavorite && "fill-rose-400")} />
                  </button>

                  <div
                    className="absolute top-full mb-2 left-2 -translate-x-1/2
                  whitespace-nowrap rounded bg-slate-800 text-white
                  text-sm px-2 py-1 opacity-0 group-hover:opacity-100
                  transition pointer-events-none"
                  >
                    {problem.isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center pt-2">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProblemListContent;
