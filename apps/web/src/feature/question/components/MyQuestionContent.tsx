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
import { QuestionLevel, QuestionType, type QuestionResponse } from "../types/question.type";
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
    return matchDifficulty && matchType;
  });

  const handleSelectQuestion = (id: number) => {
    setSelectedQuestions((prev) => (prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    if (selectedQuestions.length === filteredQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(filteredQuestions.map((q) => q.id));
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
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Danh sách câu hỏi của tôi</h1>
              <p className="text-gray-600 mt-1">Chọn các câu hỏi để gửi yêu cầu đưa vào Question Bank</p>
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
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Tạo đề thi
              </Button>
              <Button size="lg" onClick={() => navigate({ to: "/mentor/matrix/import" })} className="gap-2">
                <Upload className="h-4 w-4" />
                Import
              </Button>
              <Button size="lg" onClick={() => navigate({ to: "/mentor/question/create" })} className="gap-2">
                <Plus className="h-4 w-4" />
                Tạo câu hỏi
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm nội dung câu hỏi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left p-4 w-12">
                        <input
                          type="checkbox"
                          checked={
                            selectedQuestions.length === filteredQuestions.length && filteredQuestions.length > 0
                          }
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        />
                      </th>
                      <th className="text-left p-4 font-semibold text-xs text-gray-600 uppercase tracking-wider">
                        NỘI DUNG CÂU HỎI
                      </th>
                      <th className="text-left p-4 font-semibold text-xs text-gray-600 uppercase tracking-wider">
                        MỨC ĐỘ
                      </th>
                      <th className="text-left p-4 font-semibold text-xs text-gray-600 uppercase tracking-wider">
                        LOẠI
                      </th>
                      <th className="text-left p-4 font-semibold text-xs text-gray-600 uppercase tracking-wider">
                        MÔN HỌC
                      </th>
                      <th className="text-center p-4 font-semibold text-xs text-gray-600 uppercase tracking-wider">
                        HÀNH ĐỘNG
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
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
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
                                Cập nhật{" "}
                                {new Date(question.updatedAt || question.createdAt).toLocaleDateString("vi-VN")}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">{getDifficultyBadge(question.questionLevel)}</td>
                        <td className="p-4 text-sm text-gray-700">{getTypeBadge(question.questionType)}</td>
                        <td className="p-4 text-sm text-gray-700">{question.subject?.name || "Tin học 10"}</td>
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
    </div>
  );
};

export default MyQuestionsContent;
