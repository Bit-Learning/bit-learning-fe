import { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  Info,
  Rocket,
  Shuffle,
  ArrowUpDown,
  Edit,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useGenerateExam } from "../queries/useExam";
import type { ExamGenerateRequest } from "../types/exam.type";
import { useMatrixDetail, useMatrixVersions } from "@/feature/matrix/queries/useMatrix";
import { useSearchQuestions } from "@/feature/question/queries/useQuestion";
import { QuestionLevel, QuestionType } from "@/feature/question/types/question.type";

type Step = "check" | "setup" | "complete";

interface LessonRequirement {
  lessonId: number;
  lessonName: string;
  requirements: {
    type: "MCQ" | "Essay";
    difficulty: "easy" | "medium" | "hard";
    required: number;
    available: number;
  }[];
  isValid: boolean;
}

const GenerateExamFlow: React.FC = () => {
  const { id } = useParams({ from: "/mentor/matrix/$id/generate" });
  const navigate = useNavigate();
  const matrixId = parseInt(id);

  const [currentStep, setCurrentStep] = useState<Step>("check");
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);

  // Form state for step 2
  const [examName, setExamName] = useState("");
  const [examCode, setExamCode] = useState("");
  const [shuffleAnswers, setShuffleAnswers] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);

  const { data: matrix } = useMatrixDetail(matrixId);
  const { data: versions } = useMatrixVersions(matrixId);
  const { mutate: generateExam, isPending: isGenerating } = useGenerateExam();

  // Get all questions to check availability
  const { data: questionsData } = useSearchQuestions({ page: 0, size: 1000 }, { enabled: currentStep === "check" });

  const allQuestions = questionsData?.data || [];
  const selectedVersion = versions?.find((v) => v.id === selectedVersionId) || versions?.[0];

  // Check requirements
  const checkRequirements = (): LessonRequirement[] => {
    if (!selectedVersion?.matrixDetails) return [];

    return selectedVersion.matrixDetails.map((detail) => {
      const lessonQuestions = allQuestions.filter((q) => q.lesson?.id === detail.lesson.id);

      const requirements = [
        // MCQ
        {
          type: "MCQ" as const,
          difficulty: "easy" as const,
          required: detail.easyMCQ,
          available: lessonQuestions.filter(
            (q) => q.questionType === QuestionType.MCQ && q.questionLevel === QuestionLevel.EASY,
          ).length,
        },
        {
          type: "MCQ" as const,
          difficulty: "medium" as const,
          required: detail.mediumMCQ,
          available: lessonQuestions.filter(
            (q) => q.questionType === QuestionType.MCQ && q.questionLevel === QuestionLevel.MEDIUM,
          ).length,
        },
        {
          type: "MCQ" as const,
          difficulty: "hard" as const,
          required: detail.hardMCQ,
          available: lessonQuestions.filter(
            (q) => q.questionType === QuestionType.MCQ && q.questionLevel === QuestionLevel.HARD,
          ).length,
        },
        // Essay
        {
          type: "Essay" as const,
          difficulty: "easy" as const,
          required: detail.easyEssay,
          available: lessonQuestions.filter(
            (q) => q.questionType === QuestionType.ESSAY && q.questionLevel === QuestionLevel.EASY,
          ).length,
        },
        {
          type: "Essay" as const,
          difficulty: "medium" as const,
          required: detail.mediumEssay,
          available: lessonQuestions.filter(
            (q) => q.questionType === QuestionType.ESSAY && q.questionLevel === QuestionLevel.MEDIUM,
          ).length,
        },
        {
          type: "Essay" as const,
          difficulty: "hard" as const,
          required: detail.hardEssay,
          available: lessonQuestions.filter(
            (q) => q.questionType === QuestionType.ESSAY && q.questionLevel === QuestionLevel.HARD,
          ).length,
        },
      ].filter((r) => r.required > 0);

      const isValid = requirements.every((r) => r.available >= r.required);

      return {
        lessonId: detail.lesson.id,
        lessonName: detail.lesson.name,
        requirements,
        isValid,
      };
    });
  };

  const requirements = checkRequirements();
  const allValid = requirements.every((r) => r.isValid);

  const renderStepIndicator = () => (
    <div className="flex items-center gap-4 mb-8">
      {/* Step 1 */}
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            currentStep === "check"
              ? "bg-blue-800 text-white"
              : currentStep === "setup" || currentStep === "complete"
                ? "bg-green-500 text-white"
                : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
          }`}
        >
          {currentStep === "setup" || currentStep === "complete" ? <Check className="h-4 w-4" /> : "1"}
        </div>
        <span
          className={`text-sm font-bold ${
            currentStep === "check" ? "text-slate-900 dark:text-slate-100" : "text-green-600"
          }`}
        >
          Kiểm tra dữ liệu
        </span>
      </div>
      <div className={`h-px w-12 ${currentStep === "check" ? "bg-slate-200 dark:bg-slate-800" : "bg-green-200"}`} />

      {/* Step 2 */}
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            currentStep === "setup"
              ? "bg-blue-800 text-white shadow-lg shadow-blue-500/20"
              : currentStep === "complete"
                ? "bg-green-500 text-white"
                : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
          }`}
        >
          {currentStep === "complete" ? <Check className="h-4 w-4" /> : "2"}
        </div>
        <span
          className={`text-sm ${
            currentStep === "setup"
              ? "font-bold text-slate-900 dark:text-slate-100"
              : currentStep === "complete"
                ? "font-bold text-green-600"
                : "font-medium opacity-50"
          }`}
        >
          Thiết lập thông số
        </span>
      </div>
      <div className={`h-px w-12 ${currentStep === "complete" ? "bg-green-200" : "bg-slate-200 dark:bg-slate-800"}`} />

      {/* Step 3 */}
      <div className={`flex items-center gap-2 ${currentStep === "complete" ? "" : "opacity-50"}`}>
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-sm font-bold">
          3
        </div>
        <span className="text-sm font-medium">Hoàn tất</span>
      </div>
    </div>
  );

  const renderCheckStep = () => (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Kiểm tra độ sẵn sàng của Ngân hàng câu hỏi
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Dựa trên cấu trúc:{" "}
          <span className="font-semibold text-slate-900 dark:text-slate-200">
            Phiên bản {selectedVersion?.versionNo} - {selectedVersion?.name || "Không có tên"}
          </span>
        </p>
      </div>

      {renderStepIndicator()}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mb-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Bài học / Chủ đề</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Chi tiết số lượng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {requirements.map((req) => (
              <tr key={req.lessonId} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{req.lessonName}</p>
                </td>
                <td className="px-6 py-4">
                  {req.isValid ? (
                    <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      Đạt yêu cầu
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      Thiếu câu hỏi
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {req.requirements.map((r, idx) => (
                      <p key={idx} className="text-sm text-slate-600 dark:text-slate-400">
                        {r.type} {r.difficulty === "easy" ? "Dễ" : r.difficulty === "medium" ? "TB" : "Khó"}: Cần{" "}
                        <span className="font-bold">{r.required}</span>, có{" "}
                        <span
                          className={`font-bold ${r.available >= r.required ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                        >
                          {r.available}
                        </span>{" "}
                        câu
                      </p>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {allValid ? (
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-xl p-4 mb-10 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <p className="text-sm font-bold text-green-800 dark:text-green-300">
            ✓ Ngân hàng câu hỏi đáp ứng đủ điều kiện để sinh đề thi.
          </p>
        </div>
      ) : (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-4 mb-10 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <p className="text-sm font-bold text-red-800 dark:text-red-300">
            ✗ Ngân hàng câu hỏi chưa đủ. Vui lòng bổ sung câu hỏi cho các bài học còn thiếu.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-8">
        <button
          onClick={() => navigate({ to: "/mentor/matrix/$id", params: { id } })}
          className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>
        <button
          onClick={() => {
            setExamName(`Đề thi Giữa kỳ 1 - ${matrix?.subject?.name} - ${new Date().toLocaleDateString("vi-VN")}`);
            setExamCode(`${matrix?.code}-GK1-A`);
            setCurrentStep("setup");
          }}
          disabled={!allValid}
          className="bg-blue-800 hover:bg-blue-800-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25"
        >
          Tiếp tục thiết lập đề thi
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </>
  );

  const renderSetupStep = () => (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Sinh đề thi tự động</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Vui lòng hoàn tất các thông số cần thiết để hệ thống bắt đầu tạo đề.
        </p>
      </div>

      {renderStepIndicator()}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Thông tin cơ bản của đề thi</h2>
        </div>
        <div className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tên đề thi</label>
            <input
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 dark:text-white font-medium outline-none"
              type="text"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Mã đề thi</label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 dark:text-white uppercase outline-none"
                type="text"
                value={examCode}
                onChange={(e) => setExamCode(e.target.value.toUpperCase())}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Thời gian làm bài
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 dark:text-white outline-none"
                  type="text"
                  value={`${matrix?.duration || 0} phút`}
                  disabled
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500">
                  <Edit className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Tổng điểm (Từ ma trận)
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold cursor-not-allowed outline-none"
              disabled
              type="text"
              value={matrix?.totalScore || 0}
            />
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shuffle className="h-5 w-5 text-slate-400" />
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Xáo trộn thứ tự đáp án (MCQ)
                </label>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  checked={shuffleAnswers}
                  onChange={(e) => setShuffleAnswers(e.target.checked)}
                  className="sr-only peer"
                  type="checkbox"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-800-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ArrowUpDown className="h-5 w-5 text-slate-400" />
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Xáo trộn thứ tự câu hỏi
                </label>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="sr-only peer"
                  type="checkbox"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-800-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-800-50 dark:bg-blue-800-900/20 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 mb-10 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
        <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
          Hệ thống sẽ dựa trên cấu trúc{" "}
          <strong className="font-bold underline decoration-blue-200">Phiên bản {selectedVersion?.versionNo}</strong> để
          tiến hành lựa chọn ngẫu nhiên các câu hỏi từ ngân hàng đã kiểm duyệt, đảm bảo phân bổ độ khó theo yêu cầu.
        </p>
      </div>

      <div className="flex items-center justify-between pt-4">
        <button
          onClick={() => setCurrentStep("check")}
          className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại
        </button>
        <button
          onClick={() => {
            if (!selectedVersion || !examName || !examCode) return;

            const request: ExamGenerateRequest = {
              matrixVersionId: selectedVersion.id,
              name: examName,
              code: examCode,
              shuffleOptions: shuffleAnswers,
              durationInMinutes: matrix?.duration,
              totalScore: matrix?.totalScore,
            };

            generateExam(request, {
              onSuccess: () => {
                navigate({ to: "/mentor/matrix/$id", params: { id } });
              },
            });
          }}
          disabled={!examName || !examCode || isGenerating}
          className="bg-blue-800 hover:bg-blue-800-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-10 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25 hover:scale-[1.02] active:scale-95"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Đang sinh đề thi...
            </>
          ) : (
            <>
              <Rocket className="h-5 w-5" />
              Bắt đầu sinh đề thi
            </>
          )}
        </button>
      </div>
    </>
  );

  return (
    <main className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {currentStep === "check" && renderCheckStep()}
        {currentStep === "setup" && renderSetupStep()}
      </div>
    </main>
  );
};

export default GenerateExamFlow;
