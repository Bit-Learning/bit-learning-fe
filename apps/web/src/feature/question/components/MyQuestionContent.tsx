import { useState, useMemo } from "react";
import { Search, Send, Eye, Edit, Trash2, FileText, Plus, Upload, X } from "lucide-react";
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
import { ApprovalStatus, type QuestionResponse } from "../types/question.type";
import { cn } from "@workspace/ui/lib/utils";
import { Pagination } from "@/shared/components/Pagination";
import { useNavigate } from "@tanstack/react-router";
import { getDifficultyBadge, getStatusBadge, getTypeBadge } from "../utils/question.utils";
import DeleteConfirmModal from "@/shared/components/DeleteConfirmModal";
import { DetailModal } from "./DetailModal";
import { QuestionSearchParams } from "../api/question.api";

const PAGE_SIZE = 20;

const normalize = (str: string) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const MyQuestionsContent: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState<QuestionResponse | null>(null);
  const [selectAllGlobal, setSelectAllGlobal] = useState(false);
  const [viewingQuestion, setViewingQuestion] = useState<QuestionResponse | null>(null);
  const params: QuestionSearchParams = {
    page,
    size: PAGE_SIZE,
    keyword: search || undefined,
  };

  const { data, isLoading, refetch } = useMyQuestions(params);

  const allQuestions = data?.data ?? [];
  const totalPages = data?.page?.totalPages ?? 0;

  const deleteQuestion = useDeleteQuestion();
  const requestPublish = useRequestPublish();

  const subjects = useMemo(() => {
    const seen = new Map<number, { id: number; name: string }>();
    allQuestions.forEach((q) => {
      if (q.subject && !seen.has(q.subject.id)) {
        seen.set(q.subject.id, { id: q.subject.id, name: q.subject.name });
      }
    });
    return Array.from(seen.values());
  }, [allQuestions]);

  const pagedQuestions = allQuestions;

  const allSelectable = allQuestions.filter(
    (q) => q.approvalStatus === ApprovalStatus.NONE || q.approvalStatus === ApprovalStatus.REJECTED,
  );
  const allSelectableIds = allSelectable.map((q) => q.id);
  const allSelected = allSelectableIds.length > 0 && allSelectableIds.every((id) => selectedQuestions.includes(id));
  const someSelected = allSelectableIds.some((id) => selectedQuestions.includes(id));

  const resetPage = () => setPage(0);

  const handleSubjectSelect = (id: number | undefined) => {
    setSelectedSubjectId(id);
    resetPage();
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    resetPage();
  };

  const handleFilterChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value);
    resetPage();
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
      setSelectAllGlobal(false);
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

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

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

        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="w-full pl-9 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm transition-all shadow-sm"
              placeholder="Tìm kiếm nội dung câu hỏi..."
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          {/* <select
            value={difficultyFilter}
            onChange={handleFilterChange(setDifficultyFilter)}
                className="appearance-none pl-3 pr-8 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
          >
            <option value="all">Độ khó: Tất cả</option>
            <option value="EASY">Dễ</option>
            <option value="MEDIUM">Trung bình</option>
            <option value="HARD">Khó</option>
          </select>
          <select
            value={typeFilter}
            onChange={handleFilterChange(setTypeFilter)}
                className="appearance-none pl-3 pr-8 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
          >
            <option value="all">Loại: Tất cả</option>
            <option value="MCQ">Trắc nghiệm</option>
            <option value="ESSAY">Tự luận</option>
          </select>
          <select
            value={statusFilter}
            onChange={handleFilterChange(setStatusFilter)}
                className="appearance-none pl-3 pr-8 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
          >
            <option value="all">Trạng thái: Tất cả</option>
            <option value={ApprovalStatus.NONE}>Chưa gửi</option>
            <option value={ApprovalStatus.PENDING}>Chờ duyệt</option>
            <option value={ApprovalStatus.APPROVED}>Đã duyệt</option>
            <option value={ApprovalStatus.REJECTED}>Từ chối</option>
          </select>
          <select
            value={selectedSubjectId?.toString() ?? "all"}
            onChange={(e) => handleSubjectSelect(e.target.value === "all" ? undefined : Number(e.target.value))}
            className="px-3 py-3.5 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary shadow-sm min-w-35"
          >
            <option value="all">Tất cả môn học</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select> */}
        </div>

        {/* {selectedSubject && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs text-gray-500">Đang lọc:</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {selectedSubject.name}
              <button onClick={() => handleSubjectSelect(undefined)} className="ml-0.5 hover:text-blue-600">
                <X className="h-3 w-3" />
              </button>
            </span>
          </div>
        )} */}

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
                {search ||
                selectedSubjectId ||
                difficultyFilter !== "all" ||
                typeFilter !== "all" ||
                statusFilter !== "all"
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
                        <Button className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          {requestPublish.isPending
                            ? "Đang gửi..."
                            : `Gửi yêu cầu duyệt (${setSelectedQuestions.length})`}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận gửi yêu cầu phê duyệt</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn đang gửi <span className="font-semibold text-gray-900">{selectedQuestions.length}</span>{" "}
                            câu hỏi để phê duyệt. Sau khi gửi, các câu hỏi sẽ được xem xét bởi quản trị viên trước khi
                            được đưa vào Question Bank.
                            <br />
                            <br />
                            Bạn có chắc chắn muốn tiếp tục?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction onClick={handleRequestPublish}>Gửi yêu cầu</AlertDialogAction>
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
                          onChange={handleSelectAll}
                          className="peer sr-only"
                        />

                        <div className="w-5 h-5 rounded-xl border-2 border-gray-300 flex items-center justify-center transition-all duration-200 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-indeterminate:bg-blue-400 peer-indeterminate:border-blue-400 ">
                          <svg
                            className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>

                          <div className="absolute w-3 h-0.5 bg-white opacity-0 peer-indeterminate:opacity-100" />
                        </div>
                      </label>
                    </th>
                    <th className="text-left p-4 font-semibold text-md text-gray-800 uppercase tracking-wider w-120">
                      NỘI DUNG CÂU HỎI
                    </th>
                    <th className="text-left p-4 font-semibold text-md text-gray-800 uppercase tracking-wider w-30">
                      MỨC ĐỘ
                    </th>
                    <th className="text-left p-4 font-semibold text-md text-gray-800 uppercase tracking-wider">LOẠI</th>
                    <th className="text-left p-4 font-semibold text-md text-gray-800 uppercase tracking-wider">
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
                  {pagedQuestions.map((question: QuestionResponse, index: number) => (
                    <tr
                      key={index}
                      className={cn(
                        "cursor-pointer border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors",
                        selectedQuestions.includes(question.id) && "bg-blue-50",
                      )}
                    >
                      <td className="p-4">
                        <label className="relative flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedQuestions.includes(question.id)}
                            onChange={() => handleSelectQuestion(question.id)}
                            onClick={(e) => e.stopPropagation()}
                            disabled={
                              question.approvalStatus === ApprovalStatus.PENDING ||
                              question.approvalStatus === ApprovalStatus.APPROVED
                            }
                            className="peer sr-only"
                          />

                          <div className="w-5 h-5 rounded-xl border-2 border-gray-400 flex items-center justify-center transition-all duration-200 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-disabled:opacity-40 peer-disabled:cursor-not-allowed">
                            <svg
                              className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </label>
                      </td>
                      <td className="p-4">
                        <div className="flex-1 min-w-0">
                          <p className="line-clamp-1 text-gray-900 text-md">{question.content}</p>{" "}
                          <p className="text-sm text-gray-500 mt-1">
                            Cập nhật {new Date(question.updatedAt || question.createdAt).toLocaleDateString("vi-VN")}
                          </p>
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
                            title="Xem"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingQuestion(question);
                            }}
                          >
                            <Eye className="h-6 w-6" />{" "}
                          </button>
                          {question.approvalStatus !== ApprovalStatus.APPROVED && (
                            <>
                              <button
                                className="cursor-pointer p-2 text-slate-600 hover:text-primary transition-colors"
                                title="Chỉnh sửa"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate({
                                    to: `/mentor/question/${question.id}/edit`,
                                  });
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
                            </>
                          )}
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
                  {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, allQuestions.length)}
                </span>{" "}
                trong <span className="font-semibold text-gray-900">{allQuestions.length}</span> câu hỏi
              </p>
              {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
            </div>
          </>
        )}
      </div>

      {viewingQuestion && (
        <DetailModal question={viewingQuestion} onClose={() => setViewingQuestion(null)} onDeleted={() => refetch()} />
      )}

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
