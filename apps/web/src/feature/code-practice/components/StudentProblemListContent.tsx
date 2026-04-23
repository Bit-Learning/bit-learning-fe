import React, { useState, useMemo } from "react";
import { Heart, ChevronDown, Search } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { useProblems, useToggleFavorite } from "../queries/useCoding";
import Loader from "@workspace/ui/components/loader/TerminalLoader";
import { Pagination } from "@/shared/components/Pagination";
import { toast } from "@/shared/components/Sonner";
import type { ProblemBriefResponse, Difficulty } from "../types/coding.type";
import { ProblemStatsCard } from "./ProblemStatsCard";

const DIFF_LABEL: Record<string, string> = {
  EASY: "Dễ",
  MEDIUM: "Trung bình",
  HARD: "Khó",
};

const DIFF_COLOR: Record<string, string> = {
  EASY: "text-emerald-600",
  MEDIUM: "text-amber-500",
  HARD: "text-rose-500",
};

const difficultyOptions = [
  { value: "all" as const, label: "Độ khó: Tất cả" },
  { value: "EASY" as Difficulty, label: "Dễ" },
  { value: "MEDIUM" as Difficulty, label: "Trung bình" },
  { value: "HARD" as Difficulty, label: "Khó" },
] satisfies Array<{ value: "all" | Difficulty; label: string }>;

const TagPill: React.FC<{
  name: string;
  count: number;
  active: boolean;
  onClick: () => void;
}> = ({ name, count, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "inline-flex items-center gap-2 px-2 py-1 text-md font-medium whitespace-nowrap transition-colors cursor-pointer",
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

const StudentProblemListContent: React.FC = () => {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<"all" | Difficulty>("all");
  const [classLevel, setClassLevel] = useState<number | "all">("all");
  const [createdById, setCreatedById] = useState<number | "all">("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [showAllTags, setShowAllTags] = useState(false);
  const size = 20;

  const navigate = useNavigate();

  const { data: problemsData, isLoading } = useProblems({
    page,
    size,
    sort: "createdAt,desc",
    difficulty: difficulty !== "all" ? difficulty : undefined,
    classLevel: classLevel !== "all" ? classLevel : undefined,
    createdById: createdById !== "all" ? createdById : undefined,
  });

  const toggleFavorite = useToggleFavorite();

  const problems: ProblemBriefResponse[] = problemsData?.data || [];
  const pageInfo = problemsData?.page;
  const totalPages = pageInfo?.totalPages || 0;
  const totalElements = pageInfo?.totalElements || 0;

  const creators = useMemo(() => {
    const map = new Map<number, string>();
    problems.forEach((p) => {
      if (p.createdBy) {
        map.set(p.createdBy.id, `${p.createdBy.firstName} ${p.createdBy.lastName}`.trim());
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [problems]);

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
        if (!p.isPublic) return false;
        if (activeTag && !p.tags?.some((t) => t.name === activeTag)) return false;
        if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (createdById !== "all" && p.createdBy?.id !== createdById) return false;
        return true;
      }),
    [problems, activeTag, search],
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <nav className="text-md text-gray-500 flex items-center">
            <span onClick={() => navigate({ to: "/" })} className="hover:text-blue-600 cursor-pointer">
              Trang chủ
            </span>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-blue-600 font-medium">Danh sách bài tập</span>
          </nav>
          <span className="ml-auto text-md font-medium text-blue-600 whitespace-nowrap">
            <span>{totalElements}</span>
            <span className="ml-2">bài tập</span>
          </span>
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

        <div className="flex items-center gap-3 flex-wrap">
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

          <div className="relative">
            <select
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value as "all" | Difficulty);
                setPage(0);
              }}
              className="appearance-none pl-3 pr-8 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
            >
              {difficultyOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={classLevel}
              onChange={(e) => {
                setClassLevel(e.target.value === "all" ? "all" : Number(e.target.value));
                setPage(0);
              }}
              className="appearance-none pl-3 pr-8 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
            >
              <option value="all">Lớp: Tất cả</option>
              {[6, 7, 8, 9, 10, 11, 12].map((lvl) => (
                <option key={lvl} value={lvl}>
                  Lớp {lvl}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {creators.length > 0 && (
            <div className="relative">
              <select
                value={createdById}
                onChange={(e) => {
                  setCreatedById(e.target.value === "all" ? "all" : Number(e.target.value));
                  setPage(0);
                }}
                className="appearance-none pl-3 pr-8 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
              >
                <option value="all">Giảng viên: Tất cả</option>
                {creators.map(({ id, name }) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          )}
        </div>

        <div className="rounded-md border border-slate-200 overflow-hidden bg-white shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm uppercase tracking-wider text-slate-500 font-medium">
                <th className="px-4 py-3 text-left w-10">#</th>
                <th className="px-4 py-3 text-left">Bài tập</th>
                <th className="px-4 py-3 text-center w-48">Lớp</th>
                <th className="px-4 py-3 text-center w-48">Giảng viên</th>
                <th className="px-4 py-3 text-center w-36">Tỉ lệ đúng</th>
                <th className="px-4 py-3 text-right w-36">Độ khó</th>
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400 text-sm">
                    Không tìm thấy bài tập nào.
                  </td>
                </tr>
              ) : (
                filtered.map((problem, idx) => (
                  <tr
                    key={problem.id}
                    onClick={() => handleRowClick(problem.id)}
                    className={cn(
                      "border-b border-slate-100 last:border-b-0 cursor-pointer transition-colors hover:bg-blue-50 group",
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/50",
                    )}
                  >
                    <td className="px-4 py-3 text-sm text-slate-500">{idx + 1 + page * size}</td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-md font-semibold text-slate-800 group-hover:text-blue-500 transition-colors truncate">
                          {problem.title}
                        </span>
                        <p className="text-xs text-slate-500 mt-0.5 font-mono">
                          {problem.tags?.map((t) => t.name).join(", ") || problem.slug}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-md font-semibold text-slate-800 group-hover:text-blue-500 transition-colors truncate">
                        {problem.classLevel}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center text-sm text-blue-600">
                      {problem.createdBy ? (
                        `${problem.createdBy.firstName} ${problem.createdBy.lastName}`.trim()
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <ProblemStatsCard problemId={problem.id} />
                    </td>

                    <td className={cn("px-4 py-3 text-md font-medium text-right", DIFF_COLOR[problem.difficulty])}>
                      {DIFF_LABEL[problem.difficulty] ?? problem.difficulty}
                    </td>

                    <td className="px-4 py-3">
                      <div className="relative group/fav flex justify-center">
                        <button
                          onClick={(e) => handleFavorite(e, problem)}
                          className={cn(
                            "cursor-pointer flex items-center justify-center w-8 h-8 rounded transition-all",
                            problem.isFavorite
                              ? "text-rose-400 hover:text-rose-500"
                              : "text-slate-300 hover:text-slate-400 opacity-0 group-hover:opacity-100",
                          )}
                        >
                          <Heart className={cn("w-5 h-5", problem.isFavorite && "fill-rose-400")} />
                        </button>
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 text-white text-xs px-2 py-1 opacity-0 group-hover/fav:opacity-100 transition pointer-events-none z-10">
                          {problem.isFavorite ? "Yêu thích" : "Yêu thích"}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
