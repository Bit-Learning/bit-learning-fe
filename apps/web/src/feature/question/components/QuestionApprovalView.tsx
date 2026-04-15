import { useState, useMemo } from "react";
import { FileText, Eye, Search, Edit } from "lucide-react";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { useMyPublishRequestsAll } from "../queries/useQuestion";
import { QuestionType, ApprovalStatus, type QuestionResponse } from "../types/question.type";
import { Pagination } from "@/shared/components/Pagination";
import { getTypeBadge, getStatusBadge, getDifficultyBadge, levelColors, statusConfig } from "../utils/question.utils";
import { DetailModal } from "./DetailModal";
import { EditAndResubmitModal } from "./EditAndResubmitModal";

const PAGE_SIZE = 10;

const normalize = (str: string) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default function QuestionApprovalTableView() {
  const [page, setPage] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionResponse | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<QuestionResponse | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | undefined>(undefined);

  const { data: myRequestsData, isLoading, refetch } = useMyPublishRequestsAll();

  const rawData = useMemo(
    () =>
      (myRequestsData ?? []).filter(
        (q) => q.approvalStatus === ApprovalStatus.PENDING || q.approvalStatus === ApprovalStatus.REJECTED,
      ),
    [myRequestsData],
  );

  const subjects = useMemo(() => {
    const seen = new Map<number, { id: number; name: string }>();
    rawData.forEach((q) => {
      if (q.subject && !seen.has(q.subject.id)) seen.set(q.subject.id, { id: q.subject.id, name: q.subject.name });
    });
    return Array.from(seen.values());
  }, [rawData]);

  const filteredQuestions = useMemo(
    () =>
      rawData.filter((q) => {
        const matchSearch = !search || normalize(q.content).includes(normalize(search));
        const matchSubject = !selectedSubjectId || q.subject?.id === selectedSubjectId;
        const matchType = typeFilter === "all" || q.questionType === typeFilter;
        const matchStatus = statusFilter === "all" || q.approvalStatus === statusFilter;
        return matchSearch && matchSubject && matchType && matchStatus;
      }),
    [rawData, search, selectedSubjectId, typeFilter, statusFilter],
  );

  const totalPages = Math.ceil(filteredQuestions.length / PAGE_SIZE);
  const pagedQuestions = filteredQuestions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const resetPage = () => setPage(0);
  const handleSubjectSelect = (id: number | undefined) => {
    setSelectedSubjectId(id);
    resetPage();
  };
  const handleFilterChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value);
    resetPage();
  };
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  const selectCls =
    "px-3 py-3.5 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary shadow-sm min-w-35";

  return (
    <div className="bg-slate-50 mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Yêu cầu phê duyệt</h1>
        <p className="text-lg text-slate-500 mt-1">Theo dõi trạng thái phê duyệt các câu hỏi.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
            placeholder="Tìm kiếm câu hỏi..."
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
          />
        </div>
        <select value={typeFilter} onChange={handleFilterChange(setTypeFilter)} className={selectCls}>
          <option value="all">Loại: Tất cả</option>
          <option value={QuestionType.MCQ}>Trắc nghiệm</option>
          <option value={QuestionType.ESSAY}>Tự luận</option>
        </select>
        <select value={statusFilter} onChange={handleFilterChange(setStatusFilter)} className={selectCls}>
          <option value="all">Trạng thái: Tất cả</option>
          <option value={ApprovalStatus.PENDING}>Chờ duyệt</option>
          <option value={ApprovalStatus.REJECTED}>Từ chối</option>
        </select>
        <select
          value={selectedSubjectId?.toString() ?? "all"}
          onChange={(e) => handleSubjectSelect(e.target.value === "all" ? undefined : Number(e.target.value))}
          className={selectCls}
        >
          <option value="all">Tất cả môn học</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

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
            {search || selectedSubjectId || typeFilter !== "all" || statusFilter !== "all"
              ? "Thử tìm kiếm với từ khóa hoặc bộ lọc khác"
              : "Chưa có yêu cầu phê duyệt nào"}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-md border border-slate-300 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-300">
                <tr>
                  <th className="px-6 py-4 text-left text-md font-semibold text-slate-800 uppercase tracking-wider w-24">
                    ID
                  </th>
                  <th className="text-left p-4 font-semibold text-md text-gray-800 uppercase tracking-wider w-100">
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
                  <th className="text-center p-4 font-semibold text-md text-gray-800 uppercase tracking-wider w-48">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pagedQuestions.map((question: QuestionResponse) => (
                  <tr
                    key={question.id}
                    onClick={() => setSelectedQuestion(question)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-md font-medium text-slate-900">{question.id}</td>
                    <td className="px-6 py-4">
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-gray-900 text-md">{question.content}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{getDifficultyBadge(question.questionLevel)}</td>
                    <td className="p-4 text-sm text-gray-700">{getTypeBadge(question.questionType)}</td>
                    <td className="p-4 text-sm text-gray-700">{question.subject?.name}</td>
                    <td className="p-4 text-sm">{getStatusBadge(question.approvalStatus)}</td>
                    <td className="px-2 py-4">
                      <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {question.approvalStatus === ApprovalStatus.REJECTED && (
                          <>
                            <button
                              title="Xem chi tiết lý do từ chối"
                              className="cursor-pointer p-2 text-slate-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                              onClick={() => setSelectedQuestion(question)}
                            >
                              <Eye className="h-6 w-6" />
                            </button>
                            <button
                              title="Sửa & Gửi lại"
                              onClick={() => setEditingQuestion(question)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-md font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                            >
                              <Edit className="w-5 h-5" />
                              Gửi lại
                            </button>
                          </>
                        )}
                        {question.approvalStatus === ApprovalStatus.PENDING && (
                          <button
                            title="Xem chi tiết"
                            className="cursor-pointer p-2 text-slate-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                            onClick={() => setSelectedQuestion(question)}
                          >
                            <Eye className="h-6 w-6" />
                          </button>
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
        <DetailModal question={selectedQuestion} onClose={() => setSelectedQuestion(null)} formatDate={formatDate} />
      )}
      {editingQuestion && (
        <EditAndResubmitModal
          question={editingQuestion}
          onClose={() => setEditingQuestion(null)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
