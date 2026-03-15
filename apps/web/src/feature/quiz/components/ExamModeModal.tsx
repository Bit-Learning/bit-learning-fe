import React from "react";
import { X, Timer, BookOpen, CheckCircle2, Rocket, Edit3, AlertCircle } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { cn } from "@workspace/ui/lib/utils";

interface ExamModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExamMode: () => void;
  onSelectPracticeMode: () => void;
  isStartingExam?: boolean;
  isStartingPractice?: boolean;
  examName?: string;
}

const ExamModeModal: React.FC<ExamModeModalProps> = ({
  isOpen,
  onClose,
  onSelectExamMode,
  onSelectPracticeMode,
  isStartingExam = false,
  isStartingPractice = false,
  examName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center z-10"
        >
          <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>

        <div className="p-8 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-2">Chọn chế độ làm bài</h2>
          {examName && (
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Đề thi: <span className="font-semibold">{examName}</span>
            </p>
          )}
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 overflow-hidden transition-all hover:shadow-xl hover:border-amber-300 dark:hover:border-amber-700">
              <div className="p-6 bg-amber-600 dark:bg-amber-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Timer className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Chế độ Thi</h3>
                    <p className="text-amber-100 text-sm">Kiểm tra năng lực</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <ul className="mb-6 flex-1 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Có giới hạn thời gian làm bài nghiêm ngặt</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Xem kết quả chi tiết sau khi nộp bài</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Phù hợp để đánh giá năng lực thực tế</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <span>Không thể tạm dừng hoặc làm lại</span>
                  </li>
                </ul>

                <Button
                  size="lg"
                  onClick={onSelectExamMode}
                  isDisabled={isStartingExam || isStartingPractice}
                  className="w-full gap-2 bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white shadow-lg h-12 text-base font-bold"
                >
                  {isStartingExam ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang khởi tạo...
                    </>
                  ) : (
                    <>
                      Bắt đầu Thi
                      <Rocket className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex flex-col rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10 overflow-hidden transition-all hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700">
              <div className="p-6 bg-blue-600 dark:bg-blue-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Chế độ Luyện tập</h3>
                    <p className="text-blue-100 text-sm">Học và ôn tập</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <ul className="mb-6 flex-1 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Không giới hạn thời gian làm bài</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Xem lời giải ngay sau mỗi câu hỏi</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Có thể đánh dấu câu khó để xem lại</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Phù hợp để nắm vững kiến thức</span>
                  </li>
                </ul>

                <Button
                  size="lg"
                  onClick={onSelectPracticeMode}
                  isDisabled={isStartingExam || isStartingPractice}
                  className="w-full gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white shadow-lg h-12 text-base font-bold"
                >
                  {isStartingPractice ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang khởi tạo...
                    </>
                  ) : (
                    <>
                      Vào Luyện tập
                      <Edit3 className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamModeModal;
