import { useState } from "react";
import { Search, Send, Eye, Edit, Trash2, FileText, Plus, Upload, ChevronDown } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { useDeleteQuestion, useRequestPublish, useMyQuestions } from "../queries/useQuestion";
import { ApprovalStatus, QuestionSearchParams, QuestionType, type QuestionResponse } from "../types/question.type";
import { cn } from "@workspace/ui/lib/utils";
import { Pagination } from "@/shared/components/Pagination";
import { useNavigate } from "@tanstack/react-router";
import { getDifficultyBadge, getStatusBadge, getTypeBadge } from "../utils/question.utils";
import DeleteConfirmModal from "@/shared/components/DeleteConfirmModal";
import { DetailModal } from "./DetailModal";
import { FilterPopup, FilterValues } from "./FilterPopup";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const selectCls =
  "appearance-none pl-3 pr-8 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer";

const EMPTY_FILTERS: FilterValues = {
  subjectId: undefined,
  chapterId: undefined,
  lessonId: undefined,
  typeFilter: "",
  levelFilter: "",
};

const MyQuestionsContent: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | "">("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState<QuestionResponse | null>(null);
  const [viewingQuestion, setViewingQuestion] = useState<QuestionResponse | null>(null);
  const [filters, setFilters] = useState<FilterValues>(EMPTY_FILTERS);

  const params: QuestionSearchParams = {
    page,
    size: pageSize,
    keyword: search || undefined,
    questionType: filters.typeFilter || undefined,
    questionLevel: filters.levelFilter || undefined,
    approvalStatus: statusFilter || undefined,
    subjectId: filters.subjectId,
    chapterId: filters.chapterId,
    lessonId: filters.lessonId,
  };

  const { data, isLoading } = useMyQuestions(params);

  const allQuestions = data?.data ?? [];
  const totalPages = data?.page?.totalPages ?? 0;
  const totalElements = data?.page?.totalElements ?? allQuestions.length;

  const deleteQuestion = useDeleteQuestion();
  const requestPublish = useRequestPublish();

  const allSelectable = allQuestions.filter(
    (q) => q.approvalStatus === ApprovalStatus.NONE || q.approvalStatus === ApprovalStatus.REJECTED,
  );
  const allSelectableIds = allSelectable.map((q) => q.id);
  const allSelected = allSelectableIds.length > 0 && allSelectableIds.every((id) => selectedQuestions.includes(id));
  const someSelected = allSelectableIds.some((id) => selectedQuestions.includes(id));

  const resetPage = () => setPage(0);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    resetPage();
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(0);
    setSelectedQuestions([]);
  };

  const handleSelectQuestion = (id: number) => {
    const question = allQuestions.find((q) => q.id === id);
    if (
      question &&
      (question.approvalStatus === ApprovalStatus.NONE || question.approvalStatus === ApprovalStatus.REJECTED)
    ) {
      setSelectedQuestions((prev) => (prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id]));
    }
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(allSelectableIds);
    }
  };

  const handleRequestPublish = () => {
    if (selectedQuestions.length === 0) return;
    requestPublish.mutate(
      { questionIds: selectedQuestions },
      {
        onSuccess: () => {
          setSelectedQuestions([]);
          setIsDialogOpen(false);
        },
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!deletingQuestion) return;
    deleteQuestion.mutate(deletingQuestion.id, {
      onSuccess: () => setDeletingQuestion(null),
    });
  };

  const handleFilterChange = (values: FilterValues) => {
    setFilters(values);
    resetPage();
  };

  const handleFilterClear = () => {
    setFilters(EMPTY_FILTERS);
    resetPage();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Danh sách câu hỏi của tôi</h1>
              <p className="text-gray-500 text-lg mt-1">Chọn các câu hỏi để gửi yêu cầu đưa vào Question Bank</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate({ to: "/mentor/exam/generate-from-questions" })}
                variant="outline"
                size="lg"
                className="cursor-pointer bg-blue-700 hover:bg-white hover:text-blue-600 hover:border-blue-600 text-white text-md px-5 py-5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm shadow-blue-500/30"
              >
                <FileText className="h-4 w-4" />
                Tạo đề thi
              </Button>
              <Button
                size="lg"
                onClick={() => navigate({ to: "/mentor/question/import" })}
                className="cursor-pointer bg-blue-700 hover:bg-white hover:text-blue-600 hover:border-blue-600 text-white text-md px-5 py-5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm shadow-blue-500/30"
              >
                <Upload className="h-4 w-4" />
                Import
              </Button>
              <Button
                size="lg"
                onClick={() => navigate({ to: "/mentor/question/create" })}
                className="cursor-pointer bg-blue-700 hover:bg-white hover:text-blue-600 hover:border-blue-600 text-white text-md px-5 py-5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm shadow-blue-500/30"
              >
                <Plus className="h-4 w-4" />
                Tạo câu hỏi
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="w-full pl-9 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm transition-all shadow-sm"
              placeholder="Tìm kiếm nội dung câu hỏi..."
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as ApprovalStatus | "");
                resetPage();
              }}
              className={selectCls}
            >
              <option value="">Trạng thái: Tất cả</option>
              <option value={ApprovalStatus.NONE}>Nháp</option>
              <option value={ApprovalStatus.PENDING}>Chờ duyệt</option>
              <option value={ApprovalStatus.APPROVED}>Đã duyệt</option>
              <option value={ApprovalStatus.REJECTED}>Từ chối</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className={selectCls}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} / trang
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <FilterPopup value={filters} onChange={handleFilterChange} onClear={handleFilterClear} />
        </div>

        {isLoading ? (
          <div className="p-6 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : !allQuestions.length ? (
          <div className="p-16 text-center">
            <div className="flex flex-col items-center">
              <Send className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Không tìm thấy câu hỏi</h3>
              <p className="text-gray-600 mb-6">
                {search || filters.subjectId || filters.typeFilter || statusFilter
                  ? "Thử tìm kiếm với từ khóa hoặc bộ lọc khác"
                  : "Bạn chưa có câu hỏi nào"}
              </p>
            </div>
          </div>
        ) : (
          <>
            {someSelected && (
              <div className="mt-4 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <span className="text-sm text-blue-700 font-medium">
                  Đã chọn <span className="font-bold">{selectedQuestions.length}</span> câu hỏi
                  {selectedQuestions.length < allSelectableIds.length && (
                    <button
                      onClick={handleSelectAll}
                      className="ml-2 underline hover:no-underline text-blue-600 font-semibold"
                    >
                      Chọn tất cả {allSelectableIds.length} câu
                    </button>
                  )}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedQuestions([])}
                    className="cursor-pointer text-sm text-blue-500 hover:text-blue-700 font-medium"
                  >
                    Bỏ chọn tất cả
                  </button>
                  {selectedQuestions.length > 0 && (
                    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-5 flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          {requestPublish.isPending ? "Đang gửi..." : `Gửi yêu cầu duyệt (${selectedQuestions.length})`}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl">Xác nhận gửi yêu cầu phê duyệt</AlertDialogTitle>
                          <AlertDialogDescription className="text-md">
                            Bạn đang gửi <span className="font-semibold text-gray-900">{selectedQuestions.length}</span>{" "}
                            câu hỏi để phê duyệt. Sau khi gửi, các câu hỏi sẽ được xem xét bởi quản trị viên trước khi
                            được đưa vào Ngân hàng câu hỏi.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="p-5 text-md">Hủy</AlertDialogCancel>
                          <AlertDialogAction className="p-5 text-md" onClick={handleRequestPublish}>
                            Gửi yêu cầu
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white my-4 rounded-md border border-slate-300 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300 bg-gray-50">
                    <th className="text-left p-4 w-12">
                      <label className="relative flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = someSelected && !allSelected;
                          }}
                          title="Chọn tất cả"
                          onChange={handleSelectAll}
                          className="peer sr-only"
                        />
                        <div className="relative w-5 h-5 rounded-xl border-2 border-gray-300 flex items-center justify-center transition-all duration-200 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-indeterminate:bg-blue-400 peer-indeterminate:border-blue-400">
                          {allSelected && (
                            <svg
                              className="w-3 h-3 text-white"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {someSelected && !allSelected && <div className="absolute w-3 h-0.5 bg-white" />}
                        </div>
                      </label>
                    </th>
                    <th className="text-left p-4 font-semibold text-md text-gray-800 uppercase tracking-wider w-120">
                      NỘI DUNG CÂU HỎI
                    </th>
                    <th className="text-left p-4 font-semibold text-md text-gray-800 uppercase tracking-wider w-35">
                      MỨC ĐỘ
                    </th>
                    <th className="text-left p-4 font-semibold text-md text-gray-800 uppercase tracking-wider w-35">
                      LOẠI
                    </th>
                    <th className="text-left p-4 font-semibold text-md text-gray-800 uppercase tracking-wider w-60">
                      MÔN HỌC
                    </th>
                    <th className="text-left p-4 font-semibold text-md text-gray-800 uppercase tracking-wider w-35">
                      TRẠNG THÁI
                    </th>
                    <th className="text-center p-4 font-semibold text-md text-gray-800 uppercase tracking-wider w-35">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {allQuestions.map((question: QuestionResponse) => (
                    <tr
                      key={question.id}
                      className={cn(
                        "cursor-pointer border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors",
                        selectedQuestions.includes(question.id) && "bg-blue-50",
                      )}
                    >
                      <td className="p-4">
                        {question.approvalStatus === ApprovalStatus.NONE && (
                          <label className="relative flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedQuestions.includes(question.id)}
                              onChange={() => handleSelectQuestion(question.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="peer sr-only"
                            />
                            <div className="relative w-5 h-5 rounded-xl border-2 border-gray-400 flex items-center justify-center transition-all duration-200 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-disabled:opacity-40 peer-disabled:cursor-not-allowed">
                              {selectedQuestions.includes(question.id) && (
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={3}
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </label>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex-1 min-w-0">
                          <span className="line-clamp-1 text-md font-semibold text-slate-800 dark:text-blue-400 hover:underline">
                            {question.content}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm">{getDifficultyBadge(question.questionLevel)}</td>
                      <td className="p-4 text-sm text-gray-700">{getTypeBadge(question.questionType)}</td>
                      <td className="p-4 text-sm text-gray-700">{question.subject?.name}</td>
                      <td className="p-4 text-sm">{getStatusBadge(question.approvalStatus)}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            className="cursor-pointer p-2 text-slate-600 hover:text-primary transition-colors"
                            title="Xem chi tiết"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingQuestion(question);
                            }}
                          >
                            <Eye className="h-6 w-6" />
                          </button>
                          <button
                            className="cursor-pointer p-2 text-slate-600 hover:text-primary transition-colors"
                            title="Chỉnh sửa"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate({ to: `/mentor/question/${question.id}/edit` });
                            }}
                          >
                            <Edit className="h-6 w-6" />
                          </button>
                          <button
                            className="cursor-pointer p-2 text-slate-600 hover:text-red-600 transition-colors"
                            title="Xóa"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingQuestion(question);
                            }}
                          >
                            <Trash2 className="h-6 w-6" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Hiển thị{" "}
                <span className="font-semibold text-gray-900">
                  {totalElements === 0 ? 0 : page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalElements)}
                </span>{" "}
                trong <span className="font-semibold text-gray-900">{totalElements}</span> câu hỏi
              </p>
              {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
            </div>
          </>
        )}
      </div>

      {viewingQuestion && <DetailModal question={viewingQuestion} onClose={() => setViewingQuestion(null)} />}

      <DeleteConfirmModal
        open={!!deletingQuestion}
        onClose={() => setDeletingQuestion(null)}
        onConfirm={handleConfirmDelete}
        isPending={deleteQuestion.isPending}
        title="Xóa câu hỏi"
        itemName={
          deletingQuestion
            ? deletingQuestion.content.length > 60
              ? `${deletingQuestion.content.substring(0, 60)}...`
              : deletingQuestion.content
            : undefined
        }
      />
    </div>
  );
};

export default MyQuestionsContent;
