import { useState, useMemo } from "react";
import { CheckCircle, XCircle, FileText, Eye, X } from "lucide-react";
import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/Card";
import { Input } from "@workspace/ui/components/Input";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { useMyPublishRequestsAll, usePendingApprovalAll } from "../queries/useQuestion";
import {
  QuestionLevel,
  QuestionType,
  ApprovalStatus,
  QuestionMediaType,
  type QuestionResponse,
} from "../types/question.type";
import { cn } from "@workspace/ui/lib/utils";
import { Pagination } from "@/shared/components/Pagination";
import MediaUploadPanel from "./MediaUploadPanel";

const PAGE_SIZE = 10;

const normalize = (str: string) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const levelColors: Record<QuestionLevel, string> = {
  [QuestionLevel.EASY]: "bg-green-100 text-green-700",
  [QuestionLevel.MEDIUM]: "bg-yellow-100 text-yellow-700",
  [QuestionLevel.HARD]: "bg-red-100 text-red-700",
};

const statusConfig: Record<ApprovalStatus, { color: string; label: string; bgColor: string }> = {
  [ApprovalStatus.NONE]: { color: "text-slate-700", label: "Chưa gửi", bgColor: "bg-slate-100" },
  [ApprovalStatus.PENDING]: { color: "text-blue-700", label: "Chờ duyệt", bgColor: "bg-blue-100" },
  [ApprovalStatus.APPROVED]: { color: "text-green-700", label: "Đã duyệt", bgColor: "bg-green-100" },
  [ApprovalStatus.REJECTED]: { color: "text-red-700", label: "Từ chối", bgColor: "bg-red-100" },
};

const menus = [
  { id: "my-requests", label: "Yêu cầu của tôi" },
  { id: "pending", label: "Chờ phê duyệt" },
];

export default function QuestionApprovalTableView() {
  const [activeMenu, setActiveMenu] = useState("my-requests");
  const [page, setPage] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionResponse | null>(null);

  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | undefined>(undefined);

  const { data: myRequestsData, isLoading: loadingMyRequests } = useMyPublishRequestsAll();
  const { data: pendingData, isLoading: loadingPending } = usePendingApprovalAll();

  const rawData = activeMenu === "my-requests" ? (myRequestsData ?? []) : (pendingData ?? []);
  const isLoading = activeMenu === "my-requests" ? loadingMyRequests : loadingPending;

  const subjects = useMemo(() => {
    const seen = new Map<number, { id: number; name: string }>();
    rawData.forEach((q) => {
      if (q.subject && !seen.has(q.subject.id)) {
        seen.set(q.subject.id, { id: q.subject.id, name: q.subject.name });
      }
    });
    return Array.from(seen.values());
  }, [rawData]);

  const filteredQuestions = useMemo(() => {
    return rawData.filter((q) => {
      const matchSearch = !search || normalize(q.content).includes(normalize(search));
      const matchSubject = !selectedSubjectId || q.subject?.id === selectedSubjectId;
      const matchDifficulty = difficultyFilter === "all" || q.questionLevel === difficultyFilter;
      const matchType = typeFilter === "all" || q.questionType === typeFilter;
      const matchStatus = statusFilter === "all" || q.approvalStatus === statusFilter;
      return matchSearch && matchSubject && matchDifficulty && matchType && matchStatus;
    });
  }, [rawData, search, selectedSubjectId, difficultyFilter, typeFilter, statusFilter]);

  const totalPages = Math.ceil(filteredQuestions.length / PAGE_SIZE);
  const pagedQuestions = filteredQuestions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const resetPage = () => setPage(0);

  const handleMenuChange = (id: string) => {
    setActiveMenu(id);
    resetPage();
    setSearch("");
    setDifficultyFilter("all");
    setTypeFilter("all");
    setStatusFilter("all");
    setSelectedSubjectId(undefined);
  };

  const handleSubjectSelect = (id: number | undefined) => {
    setSelectedSubjectId(id);
    resetPage();
  };

  const handleFilterChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value);
    resetPage();
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="bg-slate-50 mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Yêu cầu phê duyệt</h1>
          <p className="text-sm text-slate-500 mt-1">Theo dõi trạng thái phê duyệt các câu hỏi.</p>
        </div>
        <div className="flex items-center gap-2">
          {menus.map((m) => (
            <button
              key={m.id}
              onClick={() => handleMenuChange(m.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                activeMenu === m.id ? "bg-slate-200 text-slate-900" : "text-slate-600 hover:bg-slate-100",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subject pill tabs */}
      {subjects.length > 0 && (
        <div className="mb-5 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleSubjectSelect(undefined)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              !selectedSubjectId
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-300 hover:border-slate-400 hover:text-slate-900"
            }`}
          >
            Tất cả
          </button>
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => handleSubjectSelect(subject.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                selectedSubjectId === subject.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-600 border-slate-300 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {subject.name}
            </button>
          ))}
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Input
            placeholder="Tìm kiếm câu hỏi..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
            className="pl-4 py-5 border-2"
          />
        </div>
        <select
          value={difficultyFilter}
          onChange={handleFilterChange(setDifficultyFilter)}
          className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Độ khó: Tất cả</option>
          <option value="EASY">Dễ</option>
          <option value="MEDIUM">Trung bình</option>
          <option value="HARD">Khó</option>
        </select>
        <select
          value={typeFilter}
          onChange={handleFilterChange(setTypeFilter)}
          className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Loại: Tất cả</option>
          <option value="MCQ">Trắc nghiệm</option>
          <option value="ESSAY">Tự luận</option>
        </select>
        <select
          value={statusFilter}
          onChange={handleFilterChange(setStatusFilter)}
          className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Trạng thái: Tất cả</option>
          <option value="NONE">Chưa gửi</option>
          <option value="PENDING">Chờ duyệt</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="REJECTED">Từ chối</option>
        </select>
        <select
          value={selectedSubjectId?.toString() ?? "all"}
          onChange={(e) => handleSubjectSelect(e.target.value === "all" ? undefined : Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Tất cả môn học</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Active filter chip */}
      {selectedSubject && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-slate-500">Đang lọc:</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {selectedSubject.name}
            <button onClick={() => handleSubjectSelect(undefined)} className="ml-0.5 hover:text-blue-600">
              <X className="h-3 w-3" />
            </button>
          </span>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <FileText className="w-16 h-16 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Không có câu hỏi nào</h3>
          <p className="text-sm text-slate-500">
            {search || selectedSubjectId || difficultyFilter !== "all" || typeFilter !== "all" || statusFilter !== "all"
              ? "Thử tìm kiếm với từ khóa hoặc bộ lọc khác"
              : "Chưa có yêu cầu phê duyệt nào"}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-md border-2 border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-400">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800 uppercase tracking-wider w-32">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800 uppercase tracking-wider">
                    Nội dung câu hỏi
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800 uppercase tracking-wider w-36">
                    Ngày gửi
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-800 uppercase tracking-wider w-40">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-800 uppercase tracking-wider w-52">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pagedQuestions.map((question: QuestionResponse) => (
                  <tr key={question.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{question.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xl">
                        <div className="text-sm font-medium text-slate-900 mb-2 line-clamp-2">{question.content}</div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-xs text-slate-800">
                            {question.questionType === QuestionType.MCQ ? "Trắc nghiệm" : "Tự luận"}
                          </span>
                          {question.lesson && (
                            <>
                              <span className="text-xs text-slate-500">•</span>
                              <span className="text-xs text-slate-800">{question.lesson.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-800">{formatDate(question.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            question.approvalStatus === ApprovalStatus.PENDING && "bg-yellow-500",
                            question.approvalStatus === ApprovalStatus.APPROVED && "bg-green-500",
                            question.approvalStatus === ApprovalStatus.REJECTED && "bg-red-500",
                            question.approvalStatus === ApprovalStatus.NONE && "bg-slate-400",
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
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                              onClick={() => setSelectedQuestion(question)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 hover:bg-blue-50 hover:text-blue-600">
                              Sửa & Gửi lại
                            </Button>
                          </>
                        )}
                        {(question.approvalStatus === ApprovalStatus.APPROVED ||
                          question.approvalStatus === ApprovalStatus.PENDING) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => setSelectedQuestion(question)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Hiển thị{" "}
              <span className="font-semibold">
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filteredQuestions.length)}
              </span>{" "}
              trong <span className="font-semibold">{filteredQuestions.length}</span> câu hỏi
            </p>
            {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
          </div>
        </>
      )}

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
                    <Badge className={cn("text-xs font-medium", levelColors[selectedQuestion.questionLevel])}>
                      {selectedQuestion.questionLevel === QuestionLevel.EASY && "Dễ"}
                      {selectedQuestion.questionLevel === QuestionLevel.MEDIUM && "Trung bình"}
                      {selectedQuestion.questionLevel === QuestionLevel.HARD && "Khó"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {selectedQuestion.questionType === QuestionType.MCQ ? "Trắc nghiệm" : "Tự luận"}
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
            <CardContent className="px-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Nội dung câu hỏi</h3>
                <p className="text-slate-900">{selectedQuestion.content}</p>
              </div>
              {selectedQuestion.mediaUrl && (
                <MediaUploadPanel
                  questionId={selectedQuestion.id}
                  currentMediaUrl={selectedQuestion.mediaUrl}
                  currentMediaType={selectedQuestion.mediaType ?? null}
                  readonly
                />
              )}
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
                          <div className="flex-1 flex items-center justify-between gap-2">
                            <p>{option.content}</p>

                            {option.isCorrect && (
                              <Badge variant="outline" className="font-bold">
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
