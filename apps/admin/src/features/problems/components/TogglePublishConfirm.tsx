import { ProblemBriefResponse } from "../types/problem.type";
import { Button } from "@/components/ui/button";

interface TogglePublishConfirmProps {
  problem: ProblemBriefResponse | null;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const TogglePublishConfirm: React.FC<TogglePublishConfirmProps> = ({
  problem,
  isPending,
  onConfirm,
  onClose,
}) => {
  if (!problem) return null;
  const willHide = problem.isPublic;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              {willHide ? "Xác nhận ẩn bài tập" : "Xác nhận hiển thị bài tập"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {willHide
                ? `Bài tập "${problem.title}" sẽ bị ẩn và người dùng sẽ không thể truy cập.`
                : `Bài tập "${problem.title}" sẽ được hiển thị công khai.`}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            className={`px-4 py-2 text-sm font-medium text-white flex items-center gap-2 ${
              willHide ? "bg-red-500 hover:bg-red-600" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {isPending && (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {willHide ? "Ẩn bài tập" : "Hiển thị"}
          </Button>
        </div>
      </div>
    </div>
  );
};
