import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Search, FileText, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Input } from "@workspace/ui/components/Input";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { Badge } from "@workspace/ui/components/Badge";
import { useMyQuestions, useDeleteQuestion } from "../queries/useQuestion";

const MyQuestionsContent: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: response, isLoading } = useMyQuestions({ page, size });
  const deleteQuestion = useDeleteQuestion();

  const questions = response?.data || [];
  const pagination = response?.page;

  const filteredQuestions = questions.filter((q) => {
    const matchSearch = q.content.toLowerCase().includes(search.toLowerCase());
    const matchDifficulty = difficultyFilter === "all" || q.questionLevel === difficultyFilter;
    const matchType = typeFilter === "all" || q.questionType === typeFilter;
    return matchSearch && matchDifficulty && matchType;
  });

  const handleDelete = (id: number, content: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa câu hỏi:\n"${content.substring(0, 50)}..."?`)) {
      deleteQuestion.mutate(id);
    }
  };

  const getDifficultyBadge = (level: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      EASY: { className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300", label: "Dễ" },
      MEDIUM: {
        className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
        label: "Trung bình",
      },
      HARD: { className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300", label: "Khó" },
    };
    const config = variants[level] || { className: "bg-gray-100 text-gray-700", label: level };
    return <span className={`px-2 py-1 rounded text-xs font-medium ${config.className}`}>{config.label}</span>;
  };

  const getTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      MCQ: "Trắc nghiệm",
      ESSAY: "Tự luận",
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Danh sách câu hỏi Tin học</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Quản lý và cập nhật ngân hàng câu hỏi môn Tin học của bạn.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate({ to: "/mentor/question/generate-from-questions" })}
                variant="outline"
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Tạo đề thi
              </Button>
              <Button onClick={() => navigate({ to: "/mentor/question/create" })} className="gap-2">
                <Plus className="h-4 w-4" />
                Tạo câu hỏi
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm nội dung câu hỏi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-800"
                />
              </div>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Độ khó: Tất cả</option>
                <option value="EASY">Dễ</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HARD">Khó</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
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
                <FileText className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {search ? "Không tìm thấy câu hỏi" : "Chưa có câu hỏi nào"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {search ? "Thử tìm kiếm với từ khóa khác" : "Bắt đầu bằng cách tạo câu hỏi đầu tiên của bạn"}
                </p>
                {!search && (
                  <Button onClick={() => navigate({ to: "/mentor/question/create" })} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Tạo câu hỏi
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left p-4 font-semibold text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        NỘI DUNG CÂU HỎI
                      </th>
                      <th className="text-left p-4 font-semibold text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        MỨC ĐỘ
                      </th>
                      <th className="text-left p-4 font-semibold text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        LOẠI
                      </th>
                      <th className="text-left p-4 font-semibold text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        MÔN HỌC
                      </th>
                      <th className="text-center p-4 font-semibold text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        HÀNH ĐỘNG
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800">
                    {filteredQuestions.map((question, index) => (
                      <tr
                        key={question.id}
                        className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-start gap-3">
                            <span className="text-primary font-semibold whitespace-nowrap">
                              Câu {index + 1 + page * size}:
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="line-clamp-2 text-gray-900 dark:text-white">{question.content}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Cập nhật{" "}
                                {new Date(question.updatedAt || question.createdAt).toLocaleDateString("vi-VN")}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">{getDifficultyBadge(question.questionLevel)}</td>
                        <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                          {getTypeBadge(question.questionType)}
                        </td>
                        <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                          {question.subject?.name || "Tin học 10"}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 dark:text-gray-400 dark:hover:text-primary dark:hover:bg-gray-700 rounded transition-colors"
                              onClick={() =>
                                navigate({ to: "/mentor/question/$id", params: { id: question.id.toString() } })
                              }
                              title="Xem"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 dark:text-gray-400 dark:hover:text-primary dark:hover:bg-gray-700 rounded transition-colors"
                              onClick={() =>
                                navigate({ to: "/mentor/question/$id/edit", params: { id: question.id.toString() } })
                              }
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded transition-colors"
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

              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Hiển thị <span className="font-semibold text-gray-900 dark:text-white">{page * size + 1}</span> đến{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Math.min((page + 1) * size, pagination?.totalElements || filteredQuestions.length)}
                  </span>{" "}
                  trong{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {pagination?.totalElements || filteredQuestions.length}
                  </span>{" "}
                  câu hỏi
                </p>

                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      ‹
                    </button>

                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum = i;
                      if (pagination.totalPages > 5) {
                        if (page > 2 && page < pagination.totalPages - 3) {
                          pageNum = page - 2 + i;
                        } else if (page >= pagination.totalPages - 3) {
                          pageNum = pagination.totalPages - 5 + i;
                        }
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`min-w-8 h-8 px-3 rounded ${
                            page === pageNum
                              ? "bg-primary text-white"
                              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}

                    {pagination.totalPages > 5 && page < pagination.totalPages - 3 && (
                      <>
                        <span className="px-2 text-gray-600 dark:text-gray-400">...</span>
                        <button
                          onClick={() => setPage(pagination.totalPages - 1)}
                          className="min-w-8 h-8 px-3 rounded text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          {pagination.totalPages}
                        </button>
                      </>
                    )}

                    <button
                      className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= pagination.totalPages - 1}
                    >
                      ›
                    </button>
                  </div>
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
