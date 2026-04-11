import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Plus, Edit, Trash2, Eye, Code2 } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { cn } from "@workspace/ui/lib/utils";
import { Difficulty, ProblemBriefResponse } from "../types/coding.type";
import { useDeleteProblem, useGetMyProblems } from "../queries/useCoding";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Pagination } from "@/shared/components/Pagination";
import DeleteConfirmModal from "@/shared/components/DeleteConfirmModal";

const TableSkeleton: React.FC = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <Skeleton key={i} className="h-16 w-full" />
    ))}
  </div>
);

interface MentorProblemListProps {
  initialPage?: number;
}

const MentorProblemListContent: React.FC<MentorProblemListProps> = ({ initialPage = 0 }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [visibility, setVisibility] = useState<string>("all");
  const [deletingProblem, setDeletingProblem] = useState<ProblemBriefResponse | null>(null);
  const [page, setPage] = useState(initialPage);

  const size = 20;

  const { data: problemsResponse, isLoading } = useGetMyProblems({
    page,
    size,
    sort: "createdAt,desc",
  });

  const deleteMutation = useDeleteProblem();

  const problems = problemsResponse?.data || [];
  const totalPages = problemsResponse?.page?.totalPages || 0;

  const filteredProblems = problems.filter((p: ProblemBriefResponse) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase());
    const matchDifficulty = difficulty === "all" || p.difficulty === difficulty;
    const matchVisibility =
      visibility === "all" || (visibility === "public" && p.isPublic) || (visibility === "private" && !p.isPublic);
    return matchSearch && matchDifficulty && matchVisibility;
  });

  const handleConfirmDelete = async () => {
    if (!deletingProblem) return;
    await deleteMutation.mutateAsync(deletingProblem.id);
    setDeletingProblem(null);
  };

  const getDifficultyBadge = (difficulty: Difficulty) => {
    const configs = {
      EASY: { label: "Dễ", className: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" },
      MEDIUM: {
        label: "Trung bình",
        className: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
      },
      HARD: { label: "Khó", className: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400" },
    };
    return configs[difficulty];
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Ngân hàng bài tập</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg mt-1">
              Quản lý và cập nhật các thử thách lập trình cho học viên
            </p>
          </div>
          <Button
            onClick={() => navigate({ to: "/mentor/problem/create" })}
            className="cursor-pointer bg-blue-700 hover:bg-white hover:text-blue-600 hover:border-blue-600 text-white text-md px-5 py-5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm shadow-blue-500/30"
          >
            <Plus className="w-5 h-5" />
            Tạo bài tập mới
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
              placeholder="Tìm kiếm bài tập..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-3 py-3.5 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary shadow-sm min-w-35"
          >
            <option value="all">Độ khó: Tất cả</option>
            <option value="EASY">Dễ</option>
            <option value="MEDIUM">Trung bình</option>
            <option value="HARD">Khó</option>
          </select>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="px-3 py-3.5 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary shadow-sm min-w-35"
          >
            <option value="all">Trạng thái: Tất cả</option>
            <option value="public">Công khai</option>
            <option value="private">Nháp</option>
          </select>
        </div>

        <div className="bg-white my-6 rounded-md border border-slate-300 overflow-hidden">
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton />
            </div>
          ) : (
            <>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4 text-md font-semibold text-slate-800 dark:text-slate-400 uppercase tracking-wider">
                      Tiêu đề
                    </th>
                    <th className="p-4 text-md font-semibold text-slate-800 dark:text-slate-400 uppercase tracking-wider text-center">
                      Độ khó
                    </th>
                    <th className="p-4 text-md font-semibold text-slate-800 dark:text-slate-400 uppercase tracking-wider text-center">
                      Trạng thái
                    </th>
                    <th className="p-4 text-md font-semibold text-slate-800 dark:text-slate-400 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="p-4 text-md font-semibold text-slate-800 dark:text-slate-400 uppercase tracking-wider text-center">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProblems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <Code2 className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                        <p className="text-slate-500 dark:text-slate-400 mb-4">Chưa có problem nào</p>
                        <Button
                          onClick={() => navigate({ to: "/mentor/problem/create" })}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Tạo Problem đầu tiên
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    filteredProblems.map((problem: ProblemBriefResponse) => (
                      <tr
                        key={problem.id}
                        onClick={() => navigate({ to: `/mentor/problem/${problem.id}/` })}
                        className="cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="p-4">
                          <span className="text-md font-bold text-blue-600 hover:underline">{problem.title}</span>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {problem.tags?.map((t) => t.name).join(", ") || problem.slug}
                          </p>
                        </td>
                        <td className="p-4 text-center">
                          <Badge
                            variant="outline"
                            className={cn("font-medium border-0", getDifficultyBadge(problem.difficulty).className)}
                          >
                            {getDifficultyBadge(problem.difficulty).label}
                          </Badge>
                        </td>
                        <td className="p-4 text-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-medium border-0",
                              problem.isPublic
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
                            )}
                          >
                            {problem.isPublic ? "Công khai" : "Nháp"}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                          {format(new Date(problem.createdAt), "dd 'thg' M, yyyy", { locale: vi })}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate({ to: `/mentor/problem/${problem.id}` });
                              }}
                              className="cursor-pointer p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate({ to: `/mentor/problem/${problem.id}/edit` });
                              }}
                              className="cursor-pointer p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
                              title="Sửa"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingProblem(problem);
                              }}
                              className="cursor-pointer p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                  <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        open={!!deletingProblem}
        onClose={() => setDeletingProblem(null)}
        onConfirm={handleConfirmDelete}
        isPending={deleteMutation.isPending}
        title="Xóa bài tập"
        itemName={deletingProblem?.title}
      />
    </div>
  );
};

export default MentorProblemListContent;
