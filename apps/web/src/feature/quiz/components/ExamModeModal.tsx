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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-2">Chọn chế độ làm bài</h2>
          {examName && (
            <p className="text-slate-600 dark:text-slate-400">
              Đề thi: <span className="font-semibold">{examName}</span>
            </p>
          )}
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Lựa chọn chế độ phù hợp với mục tiêu học tập của bạn
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Exam Mode */}
            <div className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-xl hover:border-red-300 dark:hover:border-red-800">
              <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                <img
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop"
                  alt="Chế độ thi"
                />
                <div className="absolute top-4 left-4 rounded-lg bg-red-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                  Thử thách
                </div>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Timer className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Chế độ Thi</h3>
                </div>

                <ul className="mb-6 flex flex-1 flex-col gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>Có giới hạn thời gian làm bài nghiêm ngặt</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>Xem kết quả chi tiết sau khi nộp bài</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>Phù hợp để đánh giá năng lực thực tế</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>Điểm số được lưu vào hồ sơ học tập</span>
                  </li>
                </ul>

                <Button
                  size="lg"
                  onClick={onSelectExamMode}
                  isDisabled={isStartingExam || isStartingPractice}
                  className="w-full gap-2 bg-linear-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg shadow-red-500/30"
                >
                  {isStartingExam ? (
                    <>Đang khởi tạo...</>
                  ) : (
                    <>
                      Bắt đầu Thi
                      <Rocket className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Practice Mode */}
            <div className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-800">
              <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                <img
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=400&fit=crop"
                  alt="Chế độ luyện tập"
                />
                <div className="absolute top-4 left-4 rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                  Ôn tập
                </div>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Chế độ Luyện tập</h3>
                </div>

                <ul className="mb-6 flex flex-1 flex-col gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>Không giới hạn thời gian làm bài</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>Xem lời giải ngay sau mỗi câu hỏi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>Phù hợp để nắm vững kiến thức</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>Không ảnh hưởng đến điểm số chính thức</span>
                  </li>
                </ul>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={onSelectPracticeMode}
                  isDisabled={isStartingExam || isStartingPractice}
                  className="w-full gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white"
                >
                  {isStartingPractice ? (
                    <>Đang khởi tạo...</>
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

          {/* Notice */}
          <div className="mt-6 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900 dark:text-amber-200">
                <p className="font-semibold mb-1">Lưu ý quan trọng:</p>
                <p className="text-amber-800 dark:text-amber-300">
                  Kết quả ở <span className="font-semibold">Chế độ Thi</span> sẽ được lưu vào học bạ điện tử của bạn.
                  Chỉ chọn chế độ này khi bạn đã sẵn sàng làm bài chính thức.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamModeModal;
