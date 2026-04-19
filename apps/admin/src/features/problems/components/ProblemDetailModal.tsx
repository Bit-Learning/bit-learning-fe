import React, { useState } from "react";
import { X, Code2, Clock, User, Tag, AlertCircle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Difficulty, ProblemDetailResponse } from "../types/problem.type";
import { useProblemDetail } from "../queries/useProblem";
import { toast } from "@/components/Sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";

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

interface DetailModalProps {
  problemId: string | null;
  onClose: () => void;
  mode?: "view" | "approval";
  onApprove?: (ids: string[]) => void;
  onReject?: (ids: string[], reason: string) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  problemId,
  onClose,
  mode = "approval",
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}) => {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const { data: problem, isLoading } = useProblemDetail(problemId ?? "", undefined, {
    enabled: !!problemId,
  });

  if (!problemId) return null;

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) {
      toast.error({ title: "Lỗi", description: "Vui lòng nhập lý do từ chối" });
      return;
    }
    onReject?.([problemId], rejectReason.trim());
    setRejectReason("");
    setShowRejectForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Chi tiết bài tập</p>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-md">
                {isLoading ? "Đang tải..." : problem?.title}
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
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : problem ? (
            <>
              <div className="flex flex-wrap gap-2">
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                    difficultyConfig[problem.difficulty].className,
                  )}
                >
                  {difficultyConfig[problem.difficulty].label}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <Clock className="w-3 h-3" />
                  {problem.timeLimitMs}ms
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {problem.memoryLimitMb}MB
                </span>
                {problem.tags?.map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"
                  >
                    <Tag className="w-3 h-3" />
                    {t.name}
                  </span>
                ))}
              </div>

              {(problem as any).createdBy && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <User className="w-4 h-4 shrink-0" />
                  <span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {problem.createdBy?.firstName + " " + problem.createdBy?.lastName}
                    </span>
                    {" · "}
                  </span>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Mô tả
                </p>
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700 whitespace-pre-wrap">
                  {problem.description}
                </div>
              </div>

              {(problem as any).constraints && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Ràng buộc
                  </p>
                  <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700 font-mono whitespace-pre-wrap">
                    {(problem as any).constraints}
                  </div>
                </div>
              )}

              {(problem as ProblemDetailResponse).sampleTestcases?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Ví dụ
                  </p>
                  <div className="space-y-2">
                    {(problem as ProblemDetailResponse).sampleTestcases.slice(0, 3).map((tc, i) => (
                      <div key={tc.id} className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-700">
                          <p className="text-xs text-slate-400 mb-1">Input {i + 1}</p>
                          <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto">
                            {tc.input}
                          </pre>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-700">
                          <p className="text-xs text-slate-400 mb-1">Output {i + 1}</p>
                          <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto">
                            {tc.expectedOutput}
                          </pre>
                        </div>
                      </div>
                    ))}
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
                    placeholder="Mô tả lý do từ chối bài tập này..."
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
            {problem && format(new Date(problem.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
          </span>
          {mode === "approval" && (
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
                    onClick={() => onApprove?.([problemId])}
                    disabled={isApproving}
                    className="cursor-pointer px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium flex items-center gap-2"
                  >
                    {isApproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Phê duyệt
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
