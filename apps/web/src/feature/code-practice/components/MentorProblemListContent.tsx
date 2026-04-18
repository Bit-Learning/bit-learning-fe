import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Plus, Edit, Trash2, Eye, Code2, Send, CheckSquare, Square, ChevronDown } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { cn } from "@workspace/ui/lib/utils";
import { ApprovalStatus, Difficulty, type ProblemBriefResponse } from "../types/coding.type";
import { useDeleteProblem, useGetMyProblems, useRequestPublish } from "../queries/useCoding";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Pagination } from "@/shared/components/Pagination";
import DeleteConfirmModal from "@/shared/components/DeleteConfirmModal";

const difficultyConfig: Record<Difficulty, { label: string; className: string }> = {
  [Difficulty.EASY]: {
    label: "Dễ",
    className:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
  },
  [Difficulty.MEDIUM]: {
    label: "Trung bình",
    className:
      "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  },
  [Difficulty.HARD]: {
    label: "Khó",
    className:
      "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800",
  },
};

const approvalConfig: Record<ApprovalStatus, { label: string; className: string }> = {
  [ApprovalStatus.NONE]: {
    label: "Chưa gửi",
    className:
      "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  },
  [ApprovalStatus.PENDING]: {
    label: "Chờ duyệt",
    className:
      "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  },
  [ApprovalStatus.APPROVED]: {
    label: "Đã duyệt",
    className:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
  },
  [ApprovalStatus.REJECTED]: {
    label: "Bị từ chối",
    className:
      "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800",
  },
};

const TableSkeleton: React.FC = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-20 rounded" />
      </div>
    ))}
  </>
);

interface MentorProblemListProps {
  initialPage?: number;
}

const MentorProblemListContent: React.FC<MentorProblemListProps> = ({ initialPage = 0 }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [approvalFilter, setApprovalFilter] = useState<string>("all");
  const [deletingProblem, setDeletingProblem] = useState<ProblemBriefResponse | null>(null);
  const [page, setPage] = useState(initialPage);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const size = 20;

  const { data: problemsResponse, isLoading } = useGetMyProblems({
    page,
    size,
    sort: "createdAt,desc",
  });
  const deleteMutation = useDeleteProblem();
  const requestPublishMutation = useRequestPublish();

  const problems: ProblemBriefResponse[] = problemsResponse?.data || [];
  const totalPages: number = problemsResponse?.page?.totalPages || 0;

  const filteredProblems = problems.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase());
    const matchDifficulty = difficultyFilter === "all" || p.difficulty === difficultyFilter;
    const matchApproval = approvalFilter === "all" || p.approvalStatus === approvalFilter;
    return matchSearch && matchDifficulty && matchApproval;
  });

  const allSelected = filteredProblems.length > 0 && filteredProblems.every((p) => selectedIds.has(p.id));
  const someSelected = filteredProblems.some((p) => selectedIds.has(p.id));

  const toggleSelectAll = () => {
    allSelected ? setSelectedIds(new Set()) : setSelectedIds(new Set(filteredProblems.map((p) => p.id)));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleRequestPublish = async () => {
    await requestPublishMutation.mutateAsync(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleConfirmDelete = async () => {
    if (!deletingProblem) return;
    await deleteMutation.mutateAsync(deletingProblem.id);
    setDeletingProblem(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="p-6 lg:p-8 mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Ngân hàng bài tập
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Quản lý các thử thách lập trình cho học viên</p>
          </div>
          <Button
            onClick={() => navigate({ to: "/mentor/problem/create" })}
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Tạo bài tập mới
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all"
              placeholder="Tìm kiếm bài tập..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">Độ khó: Tất cả</option>
                <option value={Difficulty.EASY}>Dễ</option>
                <option value={Difficulty.MEDIUM}>Trung bình</option>
                <option value={Difficulty.HARD}>Khó</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={approvalFilter}
                onChange={(e) => setApprovalFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">Trạng thái: Tất cả</option>
                <option value={ApprovalStatus.NONE}>Chưa gửi</option>
                <option value={ApprovalStatus.PENDING}>Chờ duyệt</option>
                <option value={ApprovalStatus.APPROVED}>Đã duyệt</option>
                <option value={ApprovalStatus.REJECTED}>Bị từ chối</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="mb-4 flex items-center gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl px-4 py-3">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Đã chọn <span className="font-bold">{selectedIds.size}</span> bài tập
            </span>
            <div className="flex-1" />
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              Bỏ chọn
            </button>
            <Button
              onClick={handleRequestPublish}
              isDisabled={requestPublishMutation.isPending}
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {requestPublishMutation.isPending ? "Đang gửi..." : "Gửi yêu cầu duyệt"}
            </Button>
          </div>
        )}

        <div className="bg-white my-6 rounded-md border border-slate-300 overflow-hidden">
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
                      <th className="px-4 py-3.5 w-10">
                        <button
                          onClick={toggleSelectAll}
                          className="text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          {allSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : someSelected ? (
                            <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <div className="w-2 h-0.5 bg-blue-600 rounded" />
                            </div>
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Tiêu đề
                      </th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                        Độ khó
                      </th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Ngày tạo
                      </th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredProblems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <Code2 className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                          <p className="text-slate-500 dark:text-slate-400 mb-4 font-medium">Chưa có bài tập nào</p>
                          <Button
                            onClick={() => navigate({ to: "/mentor/problem/create" })}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Tạo Problem đầu tiên
                          </Button>
                        </td>
                      </tr>
                    ) : (
                      filteredProblems.map((problem) => {
                        const isSelected = selectedIds.has(problem.id);
                        const isDisabled = problem.approvalStatus !== ApprovalStatus.NONE;

                        return (
                          <tr
                            key={problem.id}
                            onClick={() => navigate({ to: `/mentor/problem/${problem.id}/` })}
                            className={cn(
                              "cursor-pointer transition-colors",
                              isSelected
                                ? "bg-blue-50/60 dark:bg-blue-950/20"
                                : "hover:bg-slate-50/80 dark:hover:bg-slate-800/30",
                            )}
                          >
                            <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => toggleSelect(problem.id)}
                                disabled={isDisabled}
                                className="text-slate-400 hover:text-blue-600 transition-colors"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-blue-600" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                                {problem.title}
                              </span>
                              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                                {problem.tags?.map((t) => t.name).join(", ") || problem.slug}
                              </p>
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <span
                                className={cn(
                                  "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                                  difficultyConfig[problem.difficulty].className,
                                )}
                              >
                                {difficultyConfig[problem.difficulty].label}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <span
                                className={cn(
                                  "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                                  approvalConfig[problem.approvalStatus].className,
                                )}
                              >
                                {approvalConfig[problem.approvalStatus].label}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              {format(new Date(problem.createdAt), "dd/MM/yyyy", { locale: vi })}
                            </td>
                            <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-center gap-1">
                                <button
                                  onClick={() => navigate({ to: `/mentor/problem/${problem.id}` })}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                                  title="Xem chi tiết"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => navigate({ to: `/mentor/problem/${problem.id}/edit` })}
                                  className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg transition-colors"
                                  title="Chỉnh sửa"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeletingProblem(problem)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                  title="Xóa"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-sm text-slate-500">{filteredProblems.length} bài tập</span>
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
