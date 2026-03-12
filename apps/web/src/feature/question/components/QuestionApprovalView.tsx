import { useState } from "react";
import { CheckCircle, XCircle, FileText, Eye } from "lucide-react";
import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/Card";
import { useMyPublishRequests, usePendingApproval } from "../queries/useQuestion";
import { QuestionLevel, QuestionType, ApprovalStatus, type QuestionResponse } from "../types/question.type";
import { cn } from "@workspace/ui/lib/utils";

const levelColors: Record<QuestionLevel, string> = {
  [QuestionLevel.EASY]: "bg-green-100 text-green-700",
  [QuestionLevel.MEDIUM]: "bg-yellow-100 text-yellow-700",
  [QuestionLevel.HARD]: "bg-red-100 text-red-700",
};

const statusConfig: Record<ApprovalStatus, { color: string; label: string; bgColor: string }> = {
  [ApprovalStatus.NONE]: {
    color: "text-slate-700",
    label: "Chưa gửi",
    bgColor: "bg-slate-100",
  },
  [ApprovalStatus.PENDING]: {
    color: "text-blue-700",
    label: "Chờ duyệt",
    bgColor: "bg-blue-100",
  },
  [ApprovalStatus.APPROVED]: {
    color: "text-green-700",
    label: "Đã duyệt",
    bgColor: "bg-green-100",
  },
  [ApprovalStatus.REJECTED]: {
    color: "text-red-700",
    label: "Từ chối",
    bgColor: "bg-red-100",
  },
};

const tabs = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ duyệt" },
  { id: "approved", label: "Đã duyệt" },
];

export default function QuestionApprovalTableView() {
  const [activeMenu, setActiveMenu] = useState("my-requests");
  const [activeTab, setActiveTab] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionResponse | null>(null);

  const getStatusFilter = () => {
    if (activeTab === "pending") return ApprovalStatus.PENDING;
    if (activeTab === "approved") return ApprovalStatus.APPROVED;
    return undefined;
  };

  const searchParams = {
    keyword,
    page,
    size: 10,
    sort: "createdAt,desc",
  };

  const { data: myRequests, isLoading: loadingMyRequests } = useMyPublishRequests(
    { ...searchParams, status: getStatusFilter() },
    { enabled: activeMenu === "my-requests" },
  );

  const { data: pendingQuestions, isLoading: loadingPending } = usePendingApproval(searchParams, {
    enabled: activeMenu === "pending",
  });

  const currentData = activeMenu === "my-requests" ? myRequests : pendingQuestions;
  const isLoading = loadingMyRequests || loadingPending;
  const questions = currentData?.data || [];
  const pagination = currentData?.page;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="flex bg-slate-50 mx-auto p-8">
      <main className="flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <div className="mb-2">
            <h1 className="text-3xl font-bold">Yêu cầu phê duyệt của tôi</h1>
            <p className="text-sm text-slate-500">Theo dõi trạng thái phê duyệt các câu hỏi bạn đã đóng góp.</p>
          </div>
          <div className="flex items-center gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "cursor-pointer px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  activeTab === tab.id ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-slate-500">Đang tải...</div>
            </div>
          ) : questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileText className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Không có câu hỏi nào</h3>
              <p className="text-sm text-slate-500">
                {keyword ? "Thử tìm kiếm với từ khóa khác" : "Chưa có yêu cầu phê duyệt nào"}
              </p>
            </div>
          ) : (
            <div className="bg-white my-6 rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-32">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Nội dung câu hỏi
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-32">
                      Ngày gửi
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-40">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider w-50">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {questions.map((question: QuestionResponse, index: number) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">{question.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xl">
                          <div className="text-sm font-medium text-slate-900 mb-2 line-clamp-2">{question.content}</div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={cn("text-xs font-medium", levelColors[question.questionLevel])}>
                              {question.questionLevel === QuestionLevel.EASY && "Dễ"}
                              {question.questionLevel === QuestionLevel.MEDIUM && "Trung bình"}
                              {question.questionLevel === QuestionLevel.HARD && "Khó"}
                            </Badge>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs text-slate-600">
                              {question.questionType === QuestionType.MCQ ? "Trắc nghiệm" : "Tự luận"}
                            </span>
                            {question.lesson && (
                              <>
                                <span className="text-xs text-slate-500">•</span>
                                <span className="text-xs text-slate-600">{question.lesson.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">{formatDate(question.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              question.approvalStatus === ApprovalStatus.PENDING && "bg-yellow-500",
                              question.approvalStatus === ApprovalStatus.APPROVED && "bg-green-500",
                              question.approvalStatus === ApprovalStatus.REJECTED && "bg-red-500",
                            )}
                          />
                          <Badge
                            className={cn(
                              "text-xs font-medium",
                              statusConfig[question.approvalStatus].bgColor,
                              statusConfig[question.approvalStatus].color,
                            )}
                          >
                            {statusConfig[question.approvalStatus].label}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-2 py-4">
                        <div className="flex items-center justify-center gap-3">
                          {question.approvalStatus === ApprovalStatus.REJECTED && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                              onClick={() => setSelectedQuestion(question)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {question.approvalStatus === ApprovalStatus.APPROVED && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                              onClick={() => setSelectedQuestion(question)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          {question.approvalStatus === ApprovalStatus.PENDING && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-slate-100"
                              onClick={() => setSelectedQuestion(question)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 ml-4 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <span className="text-sm">Sửa & Gửi lại</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {pagination && pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    Hiển thị <span className="font-medium">{pagination.page + 1}</span> đến{" "}
                    <span className="font-medium">{pagination.totalPages}</span> trong{" "}
                    <span className="font-medium">{pagination.totalElements}</span> yêu cầu
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      isDisabled={pagination.first}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      &lt;
                    </Button>
                    <Button variant="default" size="sm" className="min-w-8">
                      {pagination.page + 1}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      isDisabled={pagination.last}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      &gt;
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {selectedQuestion && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedQuestion(null)}
        >
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="border-b border-slate-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-3">Chi tiết câu hỏi</CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={cn("text-xs", levelColors[selectedQuestion.questionLevel])}>
                      {selectedQuestion.questionLevel}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {selectedQuestion.questionType}
                    </Badge>
                    <Badge
                      className={cn(
                        "text-xs",
                        statusConfig[selectedQuestion.approvalStatus].bgColor,
                        statusConfig[selectedQuestion.approvalStatus].color,
                      )}
                    >
                      {statusConfig[selectedQuestion.approvalStatus].label}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedQuestion(null)}>
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Nội dung câu hỏi</h3>
                <p className="text-slate-900">{selectedQuestion.content}</p>
              </div>

              {selectedQuestion.canonicalAnswer && (
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Đáp án mẫu</h3>
                  <p className="text-slate-900">{selectedQuestion.canonicalAnswer}</p>
                </div>
              )}

              {selectedQuestion.options && selectedQuestion.options.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Các lựa chọn</h3>
                  <div className="space-y-2">
                    {selectedQuestion.options.map((option) => (
                      <div
                        key={option.id}
                        className={cn(
                          "p-3 rounded border",
                          option.isCorrect ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <span className="font-semibold min-w-6">{option.label}</span>
                          <div className="flex-1">
                            <p>{option.content}</p>
                            {option.isCorrect && (
                              <Badge className="mt-2" variant="outline">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Đáp án đúng
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-1">Môn học</h3>
                  <p className="text-sm text-slate-900">{selectedQuestion.subject?.name || "Chưa có"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-1">Bài học</h3>
                  <p className="text-sm text-slate-900">{selectedQuestion.lesson?.name || "Chưa có"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-1">Ngày tạo</h3>
                  <p className="text-sm text-slate-900">{formatDate(selectedQuestion.createdAt)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-1">Cập nhật</h3>
                  <p className="text-sm text-slate-900">{formatDate(selectedQuestion.updatedAt)}</p>
                </div>
              </div>

              {selectedQuestion.tags && selectedQuestion.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedQuestion.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
