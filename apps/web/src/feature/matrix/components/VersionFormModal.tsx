import { useState } from "react";
import { X, Pencil, Sparkles, ChevronLeft } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import ManualVersionForm from "./ManualVersionForm";
import AutoGenerateForm from "./AutoGenerateForm";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  matrixId: number;
  totalScore: number;
  subjectId: number;
}

type Mode = "select" | "manual" | "auto";

const VersionFormModal: React.FC<Props> = ({ isOpen, onClose, matrixId, totalScore, subjectId }) => {
  const [mode, setMode] = useState<Mode>("select");

  const handleClose = () => {
    setMode("select");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl my-8 flex flex-col max-h-[calc(100vh-4rem)]">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            {mode !== "select" && (
              <button
                onClick={() => setMode("select")}
                className="cursor-pointer text-slate-500 hover:text-slate-700 dark:hover:text-blue-700 transition-colors"
              >
                <ChevronLeft />
              </button>
            )}
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {mode === "select" && "Tạo phiên bản ma trận mới"}
                {mode === "manual" && "Nhập thủ công"}
                {mode === "auto" && "Tự động từ ngân hàng câu hỏi"}
              </h2>
              {mode !== "select" && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {mode === "manual"
                    ? "Nhập tay số lượng và điểm cho từng bài học"
                    : "Hệ thống tự phân bổ câu hỏi từ ngân hàng theo cấu hình"}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {mode === "select" && (
            <div className="p-8">
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 text-center">
                Chọn cách bạn muốn tạo phiên bản mới
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 max-w-3xl mx-auto">
                <button
                  onClick={() => setMode("manual")}
                  className="cursor-pointer group text-left rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6 hover:border-blue-600 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                    <Pencil className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">Nhập thủ công</h3>
                  <p className="text-md text-slate-500 dark:text-slate-400 leading-relaxed">
                    Chọn bài học và nhập số lượng câu hỏi + điểm số cho từng mức độ theo ý muốn
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {["Linh hoạt", "Kiểm soát toàn phần"].map((tag) => (
                      <span
                        key={tag}
                        className="text-md px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>

                <button
                  onClick={() => setMode("auto")}
                  className="cursor-pointer group text-left rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6 hover:border-blue-600 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                    <Sparkles className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">Tự động</h3>
                  <p className="text-md text-slate-500 dark:text-slate-400 leading-relaxed">
                    Chỉ cần nhập tổng số câu và cấu hình phân bổ
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {["Nhanh chóng", "Cân bằng tự động"].map((tag) => (
                      <span
                        key={tag}
                        className="text-md px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              </div>
            </div>
          )}

          {mode === "manual" && (
            <ManualVersionForm
              matrixId={matrixId}
              totalScore={totalScore}
              subjectId={subjectId}
              onClose={handleClose}
            />
          )}

          {mode === "auto" && (
            <AutoGenerateForm matrixId={matrixId} totalScore={totalScore} subjectId={subjectId} onClose={handleClose} />
          )}
        </div>
      </div>
    </div>
  );
};

export default VersionFormModal;
