import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Plus, Edit, Trash2, Eye, Code2 } from "lucide-react";
import { Input } from "@workspace/ui/components/Input";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { cn } from "@workspace/ui/lib/utils";
import { Difficulty, ProblemBriefResponse } from "../types/coding.type";
import { useProblems, useDeleteProblem } from "../queries/useCoding";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);

  const size = 15;

  const { data: problemsResponse, isLoading } = useProblems({
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

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
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
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Ngân hàng bài tập</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Quản lý và cập nhật các thử thách lập trình cho học viên
            </p>
          </div>
          <Button
            onClick={() => navigate({ to: "/mentor/problem/create" })}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Plus className="w-5 h-5" />
            Tạo bài tập mới
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <div className="flex-1 min-w-75 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Tìm kiếm bài tập..."
                />
              </div>
              <div className="w-48">
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full h-9 px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500/50 text-sm text-slate-600 dark:text-slate-300 outline-none"
                >
                  <option value="all">Độ khó: Tất cả</option>
                  <option value="EASY">Dễ</option>
                  <option value="MEDIUM">Trung bình</option>
                  <option value="HARD">Khó</option>
                </select>
              </div>
              <div className="w-48">
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full h-9 px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500/50 text-sm text-slate-600 dark:text-slate-300 outline-none"
                >
                  <option value="all">Trạng thái: Tất cả</option>
                  <option value="public">Công khai</option>
                  <option value="private">Nháp</option>
                </select>
              </div>
              <Button variant="outline" className="text-slate-600 dark:text-slate-300">
                Làm mới
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4">
                <TableSkeleton />
              </div>
            ) : (
              <>
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Tiêu đề
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                        Độ khó
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                        Trạng thái
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Ngày tạo
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
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
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <a
                              onClick={() => navigate({ to: `/mentor/problems/${problem.id}` })}
                              className="text-sm font-semibold text-blue-600 hover:underline cursor-pointer"
                            >
                              {problem.title}
                            </a>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {problem.tags?.join(", ") || problem.slug}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Badge
                              variant="outline"
                              className={cn("font-medium border-0", getDifficultyBadge(problem.difficulty).className)}
                            >
                              {getDifficultyBadge(problem.difficulty).label}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-center">
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
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {format(new Date(problem.createdAt), "dd 'thg' M, yyyy", { locale: vi })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate({ to: `/mentor/problem/${problem.id}` })}
                                className="p-1.5 h-auto text-slate-400 hover:text-blue-600"
                                aria-label="Xem"
                              >
                                <Eye className="w-5 h-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate({ to: `/mentor/problem/${problem.id}/edit` })}
                                className="p-1.5 h-auto text-slate-400 hover:text-amber-500"
                                aria-label="Sửa"
                              >
                                <Edit className="w-5 h-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteId(problem.id)}
                                className="p-1.5 h-auto text-slate-400 hover:text-red-500"
                                aria-label="Xóa"
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-center">
                    <nav className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePageChange(Math.max(0, page - 1))}
                        isDisabled={page === 0}
                        className="p-2 h-auto hover:bg-white dark:hover:bg-slate-700 text-slate-500"
                      >
                        <span className="text-lg leading-none">‹</span>
                      </Button>
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const pageNum = i;
                        return (
                          <Button
                            key={i}
                            variant={page === pageNum ? "default" : "ghost"}
                            size="icon"
                            onClick={() => handlePageChange(pageNum)}
                            className={cn(
                              "w-8 h-8 font-medium text-sm",
                              page === pageNum
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400",
                            )}
                          >
                            {pageNum + 1}
                          </Button>
                        );
                      })}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))}
                        isDisabled={page >= totalPages - 1}
                        className="p-2 h-auto hover:bg-white dark:hover:bg-slate-700 text-slate-500"
                      >
                        <span className="text-lg leading-none">›</span>
                      </Button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <Card className="relative max-w-md w-full mx-4 z-50">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-2 text-slate-800 dark:text-white">Xác nhận xóa</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Bạn có chắc chắn muốn xóa problem này? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setDeleteId(null)}>
                  Hủy
                </Button>
                <Button
                  onClick={handleDelete}
                  isDisabled={deleteMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MentorProblemListContent;
