import { cn } from "@workspace/ui/lib/utils";
import { SendHorizonal, X, CheckCircle, Loader2, AlertTriangle } from "lucide-react";

interface ApprovalModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  isSuccess: boolean;
  itemName?: string;
  type?: "problem" | "exam";
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  open,
  onClose,
  onConfirm,
  isPending,
  isSuccess,
  itemName,
  type = "problem",
}) => {
  if (!open) return null;

  const noun = type === "exam" ? "đề thi" : "bài tập";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isPending && onClose()} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        {isSuccess ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-base font-bold text-gray-900 dark:text-slate-100">Gửi yêu cầu thành công!</p>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {itemName && <span className="font-medium text-gray-700 dark:text-slate-300">"{itemName}" </span>}
              đã được gửi đến quản trị viên. Bạn sẽ nhận thông báo khi có kết quả.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">Gửi yêu cầu phê duyệt</h2>
              <button
                onClick={onClose}
                disabled={isPending}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {itemName && (
              <p className="text-md text-gray-500 dark:text-slate-400 mb-4">
                {noun.charAt(0).toUpperCase() + noun.slice(1)}:{" "}
                <span className="font-semibold text-gray-800 dark:text-slate-200">"{itemName}"</span>
              </p>
            )}

            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 mb-5">
              <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                Sau khi gửi, {noun} sẽ <span className="font-semibold">bị khóa chỉnh sửa</span> cho đến khi quản trị
                viên hoàn tất xem xét .
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isPending}
                className="cursor-pointer flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Huỷ
              </button>
              <button
                onClick={onConfirm}
                disabled={isPending}
                className={cn(
                  "cursor-pointer flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all",
                  isPending ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]",
                )}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <SendHorizonal className="h-4 w-4" />
                    Xác nhận gửi
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ApprovalModal;
