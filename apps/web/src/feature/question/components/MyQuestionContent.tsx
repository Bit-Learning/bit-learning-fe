import { useState } from "react";
import { Search, Send, Eye, Edit, Trash2, FileText, Plus, Upload } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Input } from "@workspace/ui/components/Input";
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
import { useMyQuestions, useDeleteQuestion, useRequestPublish } from "../queries/useQuestion";
import { ApprovalStatus, QuestionLevel, QuestionType, type QuestionResponse } from "../types/question.type";
import { cn } from "@workspace/ui/lib/utils";
import { Pagination } from "@/shared/components/Pagination";
import { useNavigate } from "@tanstack/react-router";

const MyQuestionsContent: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: response, isLoading } = useMyQuestions({
    keyword: search,
    page,
    size,
  });

  const deleteQuestion = useDeleteQuestion();
  const requestPublish = useRequestPublish();

  const questions = response?.data || [];
  const pagination = response?.page;

  const filteredQuestions = questions.filter((q) => {
    const matchDifficulty = difficultyFilter === "all" || q.questionLevel === difficultyFilter;
    const matchType = typeFilter === "all" || q.questionType === typeFilter;
    const matchStatus = statusFilter === "all" || q.approvalStatus === statusFilter;
    return matchDifficulty && matchType && matchStatus;
  });

  const handleSelectQuestion = (id: number) => {
    const question = questions.find((q) => q.id === id);
    if (
      question &&
      (question.approvalStatus === ApprovalStatus.NONE || question.approvalStatus === ApprovalStatus.REJECTED)
    ) {
      setSelectedQuestions((prev) => (prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id]));
    }
  };

  const handleSelectAll = () => {
    const selectableQuestions = filteredQuestions.filter(
      (q) => q.approvalStatus === ApprovalStatus.NONE || q.approvalStatus === ApprovalStatus.REJECTED,
    );

    if (selectedQuestions.length === selectableQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(selectableQuestions.map((q) => q.id));
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

  const handleDelete = (id: number, content: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa câu hỏi:\n"${content.substring(0, 50)}..."?`)) {
      deleteQuestion.mutate(id);
    }
  };

  const getDifficultyBadge = (level: QuestionLevel) => {
    const variants: Record<QuestionLevel, { className: string; label: string }> = {
      [QuestionLevel.EASY]: { className: "bg-green-100 text-green-700", label: "Dễ" },
      [QuestionLevel.MEDIUM]: { className: "bg-yellow-100 text-yellow-700", label: "Trung bình" },
      [QuestionLevel.HARD]: { className: "bg-red-100 text-red-700", label: "Khó" },
    };
    const config = variants[level];
    return <span className={`px-2 py-1 rounded text-xs font-medium ${config.className}`}>{config.label}</span>;
  };

  const getStatusBadge = (status: ApprovalStatus) => {
    const variants: Record<ApprovalStatus, { className: string; label: string }> = {
      [ApprovalStatus.NONE]: { className: "bg-gray-100 text-gray-700", label: "Chưa gửi" },
      [ApprovalStatus.PENDING]: { className: "bg-blue-100 text-blue-700", label: "Chờ duyệt" },
      [ApprovalStatus.APPROVED]: { className: "bg-green-100 text-green-700", label: "Đã duyệt" },
      [ApprovalStatus.REJECTED]: { className: "bg-red-100 text-red-700", label: "Từ chối" },
    };
    const config = variants[status];
    return <span className={`px-2 py-1 rounded text-xs font-medium ${config.className}`}>{config.label}</span>;
  };

  const getTypeBadge = (type: QuestionType) => {
    const labels: Record<QuestionType, string> = {
      [QuestionType.MCQ]: "Trắc nghiệm",
      [QuestionType.ESSAY]: "Tự luận",
    };
    return labels[type];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Danh sách câu hỏi của tôi</h1>
              <p className="text-gray-600 text-sm mt-1">Chọn các câu hỏi để gửi yêu cầu đưa vào Question Bank</p>
            </div>
            <div className="flex gap-3">
              {selectedQuestions.length > 0 && (
                <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button className="gap-2">
                      <Send className="h-4 w-4" />
                      Gửi phê duyệt ({selectedQuestions.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xác nhận gửi yêu cầu phê duyệt</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn đang gửi <span className="font-semibold text-gray-900">{selectedQuestions.length}</span> câu
                        hỏi để phê duyệt. Sau khi gửi, các câu hỏi sẽ được xem xét bởi quản trị viên trước khi được đưa
                        vào Question Bank.
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
              <Button
                onClick={() => navigate({ to: "/mentor/question/generate-from-questions" })}
                variant="outline"
                size="lg"
                className="cursor-pointer bg-blue-700 hover:bg-blue-500 text-white px-5 py-5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm shadow-blue-500/30"
              >
                <FileText className="h-4 w-4" />
                Tạo đề thi
              </Button>
              <Button
                size="lg"
                onClick={() => navigate({ to: "/mentor/matrix/import" })}
                className="cursor-pointer bg-blue-700 hover:bg-blue-500 text-white px-5 py-5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm shadow-blue-500/30"
              >
                <Upload className="h-4 w-4" />
                Import
              </Button>
              <Button
                size="lg"
                onClick={() => navigate({ to: "/mentor/question/create" })}
                className="cursor-pointer bg-blue-700 hover:bg-blue-500 text-white px-5 py-5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm shadow-blue-500/30"
              >
                <Plus className="h-4 w-4" />
                Tạo câu hỏi
              </Button>
            </div>
          </div>
        </div>
        <div className="bg-white px-6 py-4 rounded-md border-2 border-slate-400 overflow-hidden">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
              <Input
                placeholder="Tìm kiếm nội dung câu hỏi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 py-5 border-2"
              />
            </div>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Độ khó: Tất cả</option>
              <option value="EASY">Dễ</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HARD">Khó</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Loại: Tất cả</option>
              <option value="MCQ">Trắc nghiệm</option>
              <option value="ESSAY">Tự luận</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Trạng thái: Tất cả</option>
              <option value="NONE">Chưa gửi</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REJECTED">Từ chối</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : !filteredQuestions.length ? (
          <div className="p-16 text-center">
            <div className="flex flex-col items-center">
              <Send className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Không tìm thấy câu hỏi</h3>
              <p className="text-gray-600 mb-6">
                {search ? "Thử tìm kiếm với từ khóa khác" : "Bạn chưa có câu hỏi nào"}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white my-6 rounded-md border-2 border-slate-400 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300 bg-gray-50">
                    <th className="text-left p-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.length === filteredQuestions.length && filteredQuestions.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </th>
                    <th className="text-left p-4 font-semibold text-xs text-gray-800 uppercase tracking-wider">
                      NỘI DUNG CÂU HỎI
                    </th>
                    <th className="text-left p-4 font-semibold text-xs text-gray-800 uppercase tracking-wider">
                      MỨC ĐỘ
                    </th>
                    <th className="text-left p-4 font-semibold text-xs text-gray-800 uppercase tracking-wider">LOẠI</th>
                    <th className="text-left p-4 font-semibold text-xs text-gray-800 uppercase tracking-wider">
                      MÔN HỌC
                    </th>
                    <th className="text-left p-4 font-semibold text-xs text-gray-800 uppercase tracking-wider">
                      TRẠNG THÁI
                    </th>
                    <th className="text-center p-4 font-semibold text-xs text-gray-800 uppercase tracking-wider">
                      THAO TÁC
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredQuestions.map((question: QuestionResponse, index: number) => (
                    <tr
                      key={question.id}
                      className={cn(
                        "border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors",
                        selectedQuestions.includes(question.id) && "bg-blue-50",
                      )}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedQuestions.includes(question.id)}
                          onChange={() => handleSelectQuestion(question.id)}
                          disabled={
                            question.approvalStatus === ApprovalStatus.PENDING ||
                            question.approvalStatus === ApprovalStatus.APPROVED
                          }
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-primary font-semibold whitespace-nowrap">
                            Câu {index + 1 + page * size}:
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="line-clamp-2 text-gray-900">{question.content}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Cập nhật {new Date(question.updatedAt || question.createdAt).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{getDifficultyBadge(question.questionLevel)}</td>
                      <td className="p-4 text-sm text-gray-700">{getTypeBadge(question.questionType)}</td>
                      <td className="p-4 text-sm text-gray-700">{question.subject?.name}</td>
                      <td className="p-4">{getStatusBadge(question.approvalStatus)}</td>

                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded transition-colors"
                            title="Xem"
                            onClick={() =>
                              navigate({
                                to: "/mentor/question/$id",
                                params: { id: question.id.toString() },
                              })
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded transition-colors"
                            title="Chỉnh sửa"
                            onClick={() =>
                              navigate({
                                to: "/mentor/question/$id/edit",
                                params: { id: question.id.toString() },
                              })
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            onClick={() => handleDelete(question.id, question.content)}
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
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
                Hiển thị <span className="font-semibold text-gray-900">1</span> đến{" "}
                <span className="font-semibold text-gray-900">4</span> trong{" "}
                <span className="font-semibold text-gray-900">
                  {pagination?.totalElements || filteredQuestions.length}
                </span>{" "}
                câu hỏi
              </p>

              {pagination && pagination.totalPages > 1 && (
                <Pagination currentPage={page} totalPages={pagination.totalPages} onPageChange={setPage} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyQuestionsContent;
