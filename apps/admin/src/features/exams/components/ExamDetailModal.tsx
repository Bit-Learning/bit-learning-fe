import { useState } from "react";
import { FileText, Clock, User, AlertCircle, CheckCircle2, XCircle, Loader2, X } from "lucide-react";
import { useExam } from "../queries/useExam";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { ExamType } from "../types/exam.type";
import { toast } from "@/components/Sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/components/ui/button";

const TYPE_LABELS: Record<ExamType, { label: string; className: string }> = {
  EXAM: {
    label: "Đề thi",
    className:
      "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  },
  PRACTICE: {
    label: "Luyện tập",
    className:
      "bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800",
  },
};

interface DetailModalProps {
  examId: number | null;
  onClose: () => void;
  onApprove: (ids: number[]) => void;
  onReject: (ids: number[], reason: string) => void;
  isApproving: boolean;
  isRejecting: boolean;
}

export const ExamDetailModal: React.FC<DetailModalProps> = ({
  examId,
  onClose,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}) => {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const { data: exam, isLoading } = useExam(examId!, { enabled: !!examId });

  if (!examId) return null;

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) {
      toast.error({ title: "Lỗi", description: "Vui lòng nhập lý do từ chối" });
      return;
    }
    onReject([examId], rejectReason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Chi tiết đề thi</p>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-md">
                {isLoading ? "Đang tải..." : exam?.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : exam ? (
            <>
              <div className="flex flex-wrap gap-2">
                {exam.type && (
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                      TYPE_LABELS[exam.type].className,
                    )}
                  >
                    {TYPE_LABELS[exam.type].label}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <Clock className="w-3 h-3" />
                  {exam.durationInMinutes} phút
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {exam.totalScore} điểm
                </span>
                {exam.subject && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400">
                    {exam.subject.name}
                  </span>
                )}
              </div>

              {exam.createdBy && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <User className="w-4 h-4 shrink-0" />
                  <span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {exam.createdBy?.firstName + " " + exam.createdBy?.lastName}
                    </span>
                    {" · "}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Mã đề</p>
                  <p className="text-sm font-semibold font-mono text-blue-600 dark:text-blue-400">{exam.code}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Số câu hỏi</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {exam.examQuestions?.length ?? 0} câu
                  </p>
                </div>
              </div>

              {exam.examQuestions?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Danh sách câu hỏi (3 câu đầu)
                  </p>
                  <div className="space-y-2">
                    {exam.examQuestions.slice(0, 3).map((eq) => (
                      <div
                        key={eq.id}
                        className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-700"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-mono text-slate-400 shrink-0">#{eq.questionNo}</p>
                          <p className="text-xs text-slate-700 dark:text-slate-300 flex-1 line-clamp-2">
                            {eq.question?.content || "—"}
                          </p>
                          <span className="text-xs font-medium text-slate-500 shrink-0">{eq.score}đ</span>
                        </div>
                      </div>
                    ))}
                    {exam.examQuestions.length > 3 && (
                      <p className="text-xs text-slate-400 text-center">+{exam.examQuestions.length - 3} câu khác</p>
                    )}
                  </div>
                </div>
              )}

              {showRejectForm && (
                <div className="bg-rose-50 dark:bg-rose-950/20 rounded-xl p-4 border border-rose-200 dark:border-rose-900">
                  <p className="text-sm font-medium text-rose-700 dark:text-rose-400 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Lý do từ chối <span className="text-red-500">*</span>
                  </p>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Mô tả lý do từ chối đề thi này..."
                    rows={3}
                    className="w-full text-sm rounded-lg border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-800 px-3 py-2.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none placeholder:text-slate-400"
                  />
                </div>
              )}
            </>
          ) : null}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            {exam && format(new Date(exam.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
          </span>
          <div className="flex gap-2">
            {showRejectForm ? (
              <>
                <button
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectReason("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-white dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <Button
                  onClick={handleRejectConfirm}
                  disabled={isRejecting}
                  className="cursor-pointer px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium flex items-center gap-2"
                >
                  {isRejecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Xác nhận từ chối
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setShowRejectForm(true)}
                  className="cursor-pointer px-4 py-2 bg-white dark:bg-slate-700 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-sm font-medium flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Từ chối
                </Button>
                <Button
                  onClick={() => onApprove([examId])}
                  disabled={isApproving}
                  className="cursor-pointer px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium flex items-center gap-2"
                >
                  {isApproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Phê duyệt
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
