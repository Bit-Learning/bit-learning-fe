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
import { Pagination } from "@/shared/components/Pagination";

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
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Ngân hàng bài tập</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Quản lý và cập nhật các thử thách lập trình cho học viên
            </p>
          </div>
          <Button
            onClick={() => navigate({ to: "/mentor/problem/create" })}
            className="cursor-pointer bg-blue-700 hover:bg-blue-500 text-white px-5 py-5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm shadow-blue-500/30"
          >
            <Plus className="w-5 h-5" />
            Tạo bài tập mới
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 py-5 border-2"
              placeholder="Tìm kiếm bài tập..."
            />
          </div>
          <div>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Độ khó: Tất cả</option>
              <option value="EASY">Dễ</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HARD">Khó</option>
            </select>
          </div>
          <div>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Trạng thái: Tất cả</option>
              <option value="public">Công khai</option>
              <option value="private">Nháp</option>
            </select>
          </div>
        </div>

        <div className="bg-white my-6 rounded-md border-2 border-slate-200 overflow-hidden">
          <div className="px-0">
            {isLoading ? (
              <div className="p-4">
                <TableSkeleton />
              </div>
            ) : (
              <>
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="px-6 py-4 text-md font-semibold text-slate-800 dark:text-slate-400 uppercase tracking-wider">
                        Tiêu đề
                      </th>
                      <th className="px-6 py-4 text-md font-semibold text-slate-800 dark:text-slate-400 uppercase tracking-wider text-center">
                        Độ khó
                      </th>
                      <th className="px-6 py-4 text-md font-semibold text-slate-800 dark:text-slate-400 uppercase tracking-wider text-center">
                        Trạng thái
                      </th>
                      <th className="px-6 py-4 text-md font-semibold text-slate-800 dark:text-slate-400 uppercase tracking-wider">
                        Ngày tạo
                      </th>
                      <th className="px-6 py-4 text-md font-semibold text-slate-800 dark:text-slate-400 uppercase tracking-wider text-center">
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
                              onClick={() => navigate({ to: `/mentor/problem/${problem.id}/` })}
                              className="text-md font-bold text-blue-600 hover:underline cursor-pointer"
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
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate({ to: `/mentor/problem/${problem.id}/` })}
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

                {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
              </>
            )}
          </div>
        </div>
      </div>

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
