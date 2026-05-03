import { useState } from "react";
import { useParams, useNavigate, useSearch } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  Rocket,
  Shuffle,
  ArrowUpDown,
  Edit,
  AlertCircle,
  PartyPopper,
} from "lucide-react";
import { useGenerateExam } from "../queries/useExam";
import type { ExamGenerateRequest, ExamType } from "../types/exam.type";
import { useMatrixDetail, useMatrixVersions } from "@/feature/matrix/queries/useMatrix";
import { useSearchQuestions } from "@/feature/question/queries/useQuestion";
import { QuestionLevel, QuestionType } from "@/feature/question/types/question.type";
import { toast } from "@/shared/components/Sonner";

type Step = "check" | "setup" | "complete";

interface LessonRequirement {
  lessonId: number;
  lessonName: string;
  requirements: {
    type: "MCQ" | "ESSAY";
    difficulty: "EASY" | "MEDIUM" | "HARD";
    required: number;
    available: number;
  }[];
  isValid: boolean;
}

const GenerateExamFlow: React.FC = () => {
  const { id } = useParams({ from: "/mentor/matrix/$id/generate" });
  const navigate = useNavigate();
  const matrixId = parseInt(id);
  const { versionId } = useSearch({ from: "/mentor/matrix/$id/generate" });

  const [currentStep, setCurrentStep] = useState<Step>("check");
  const [examName, setExamName] = useState("");
  const [examCode, setExamCode] = useState("");
  const [shuffleAnswers, setShuffleAnswers] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [examType, setExamType] = useState<ExamType>("EXAM");
  const [enrollKey, setEnrollKey] = useState("");

  const { data: matrix } = useMatrixDetail(matrixId);
  const { data: versions } = useMatrixVersions(matrixId);
  const { mutate: generateExam, isPending: isGenerating } = useGenerateExam();

  const selectedVersion = versions?.find((v) => v.id === versionId);

  const { data: questionsData, isLoading } = useSearchQuestions(
    { keyword: "", page: 0, size: 9999, subjectId: matrix?.subject.id },
    { enabled: currentStep === "check" },
  );
  const allQuestions = questionsData?.data || [];

  const checkRequirements = (): LessonRequirement[] => {
    if (!selectedVersion?.matrixDetails) return [];

    return selectedVersion.matrixDetails.map((detail) => {
      const lessonQuestions = allQuestions.filter((q) => q.lesson?.id === detail.lesson.id);

      const requirements = [
        {
          type: "MCQ" as const,
          difficulty: "EASY" as const,
          required: detail.easyMCQ,
          available: lessonQuestions.filter(
            (q) => q.questionType === QuestionType.MCQ && q.questionLevel === QuestionLevel.EASY,
          ).length,
        },
        {
          type: "MCQ" as const,
          difficulty: "MEDIUM" as const,
          required: detail.mediumMCQ,
          available: lessonQuestions.filter(
            (q) => q.questionType === QuestionType.MCQ && q.questionLevel === QuestionLevel.MEDIUM,
          ).length,
        },
        {
          type: "MCQ" as const,
          difficulty: "HARD" as const,
          required: detail.hardMCQ,
          available: lessonQuestions.filter(
            (q) => q.questionType === QuestionType.MCQ && q.questionLevel === QuestionLevel.HARD,
          ).length,
        },
        {
          type: "ESSAY" as const,
          difficulty: "EASY" as const,
          required: detail.easyEssay,
          available: lessonQuestions.filter(
            (q) => q.questionType === QuestionType.ESSAY && q.questionLevel === QuestionLevel.EASY,
          ).length,
        },
        {
          type: "ESSAY" as const,
          difficulty: "MEDIUM" as const,
          required: detail.mediumEssay,
          available: lessonQuestions.filter(
            (q) => q.questionType === QuestionType.ESSAY && q.questionLevel === QuestionLevel.MEDIUM,
          ).length,
        },
        {
          type: "ESSAY" as const,
          difficulty: "HARD" as const,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-blue-600 dark:text-slate-200 font-medium">Đang kiểm tra câu hỏi...</p>
        </div>
      </div>
    );
  }

  const renderStepIndicator = () => (
    <div className="flex items-center gap-4 mb-8">
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-md font-bold ${
            currentStep === "check" ? "bg-blue-800 text-white" : "bg-green-500 text-white"
          }`}
        >
          {currentStep !== "check" ? <Check className="h-4 w-4" /> : "1"}
        </div>
        <span
          className={`text-md font-bold ${currentStep === "check" ? "text-slate-900 dark:text-slate-100" : "text-green-600"}`}
        >
          Kiểm tra dữ liệu
        </span>
      </div>
      <div className={`h-px w-12 ${currentStep === "check" ? "bg-slate-200 dark:bg-slate-800" : "bg-green-200"}`} />

      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-md font-bold ${
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
          className={`text-md ${
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

      <div className={`flex items-center gap-2 ${currentStep === "complete" ? "" : "opacity-50"}`}>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-md font-bold ${
            currentStep === "complete"
              ? "bg-green-500 text-white"
              : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
          }`}
        >
          {currentStep === "complete" ? <Check className="h-4 w-4" /> : "3"}
        </div>
        <span className="text-md font-medium">Hoàn tất</span>
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

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden mb-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th className="px-6 py-4 text-md font-bold uppercase tracking-wider text-slate-800">Bài học / Chủ đề</th>
              <th className="px-6 py-4 text-md font-bold uppercase tracking-wider text-slate-800">Trạng thái</th>
              <th className="px-6 py-4 text-md font-bold uppercase tracking-wider text-slate-800">Chi tiết số lượng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {requirements.map((req) => (
              <tr key={req.lessonId} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-md font-semibold text-slate-900 dark:text-white">{req.lessonName}</p>
                </td>
                <td className="px-6 py-4">
                  {req.isValid ? (
                    <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-sm font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle className="h-4 w-4" /> Đạt yêu cầu
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-sm font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      <AlertCircle className="h-4 w-4" /> Thiếu câu hỏi
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {req.requirements.map((r, idx) => (
                      <p key={idx} className="text-md text-slate-600 dark:text-slate-400">
                        {r.type} {r.difficulty === "EASY" ? "Dễ" : r.difficulty === "MEDIUM" ? "TB" : "Khó"}:{" "}
                        <span
                          className={`font-bold ${r.available >= r.required ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                        >
                          {r.available}
                        </span>
                        <span>/</span>
                        <span className="font-bold">{r.required} </span>
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

      <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-8">
        <button
          onClick={() => navigate({ to: "/mentor/matrix/$id", params: { id } })}
          className="cursor-pointer px-6 py-2.5 text-md font-bold text-slate-600 rounded-lg border border-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </button>
        <button
          onClick={() => {
            setExamName(`Đề thi - ${matrix?.subject?.name} - ${new Date().toLocaleDateString("vi-VN")}`);
            setExamCode(`${matrix?.code}-A`);
            setCurrentStep("setup");
          }}
          disabled={!allValid}
          className="cursor-pointer bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-lg text-md font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25"
        >
          Tiếp tục thiết lập đề thi <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </>
  );

  const renderSetupStep = () => (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Tạo đề thi tự động</h1>
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
            <label className="block text-md font-semibold text-slate-700 dark:text-slate-300 mb-2">Tên đề thi</label>
            <input
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 dark:text-white font-medium outline-none"
              type="text"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-md font-semibold text-slate-700 dark:text-slate-300 mb-2">Mã đề thi</label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 dark:text-white uppercase outline-none"
                type="text"
                value={examCode}
                onChange={(e) => setExamCode(e.target.value.toUpperCase())}
              />
            </div>
            <div>
              <label className="block text-md font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Thời gian làm bài
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
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
            <label className="block text-md font-semibold text-slate-700 dark:text-slate-300 mb-2">
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
                <label className="text-md font-medium text-slate-700 dark:text-slate-300">
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
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ArrowUpDown className="h-5 w-5 text-slate-400" />
                <label className="text-md font-medium text-slate-700 dark:text-slate-300">
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
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-md font-semibold text-slate-700 dark:text-slate-300 mb-2">Loại đề thi</label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as ExamType)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 dark:text-white outline-none"
              >
                <option value="EXAM">Đề thi</option>
                <option value="PRACTICE">Luyện tập</option>
              </select>
            </div>
            <div>
              <label className="block text-md font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Mật khẩu vào thi{" "}
                {examType === "EXAM" ? (
                  <span className="text-red-500">*</span>
                ) : (
                  <span className="text-slate-400 text-sm font-normal">(tuỳ chọn)</span>
                )}
              </label>
              <input
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:border-blue-500 transition-all text-slate-900 dark:text-white outline-none dark:bg-slate-800 ${
                  examType === "EXAM" && !enrollKey.trim()
                    ? "border-red-300 dark:border-red-700 focus:ring-red-400"
                    : "border-slate-200 dark:border-slate-700 focus:ring-blue-500"
                }`}
                type="text"
                placeholder={examType === "EXAM" ? "Bắt buộc với đề chính thức" : "Để trống nếu không cần mật khẩu"}
                value={enrollKey}
                onChange={(e) => setEnrollKey(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <button
          onClick={() => setCurrentStep("check")}
          className="cursor-pointer px-6 py-2.5 text-md font-bold text-slate-600 rounded-lg border border-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Quay lại
        </button>
        <button
          onClick={() => {
            if (!selectedVersion || !examName || !examCode) return;
            if (examType === "EXAM" && !enrollKey.trim()) {
              toast.error({
                title: "Lỗi",
                description: "Đề thi bắt buộc phải có mật khẩu vào thi",
              });
              return;
            }

            const request: ExamGenerateRequest = {
              matrixVersionId: selectedVersion.id,
              name: examName,
              code: examCode,
              shuffleOptions: shuffleAnswers,
              durationInMinutes: matrix?.duration,
              totalScore: matrix?.totalScore,
              type: examType,
              enrollKey: enrollKey.trim(),
            };

            setCurrentStep("complete");

            generateExam(request, {
              onSuccess: (data) => {
                const examId = data.data.data?.id;
                setCurrentStep("complete");
                setTimeout(() => {
                  navigate({ to: "/mentor/exam/$id", params: { id: String(examId) } });
                }, 3000);
              },
              onError: () => {
                setCurrentStep("setup");
              },
            });
          }}
          disabled={!examName || !examCode || isGenerating || (examType === "EXAM" && !enrollKey.trim())}
          className="cursor-pointer bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-10 py-3 rounded-xl text-md font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25 hover:scale-[1.02] active:scale-95"
        >
          Bắt đầu tạo đề thi
        </button>
      </div>
    </>
  );

  const renderCompleteStep = () => (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Đang tạo đề thi...</h1>
        <p className="text-slate-600 dark:text-slate-400">Hệ thống đang xử lý yêu cầu của bạn, vui lòng chờ.</p>
      </div>

      {renderStepIndicator()}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center gap-6 min-h-64">
        {isGenerating ? (
          <>
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-100 dark:border-blue-900/30 rounded-full" />
              <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute inset-0" />
              <Rocket className="h-8 w-8 text-blue-600 absolute inset-0 m-auto" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900 dark:text-white mb-1">Đang tạo đề thi</p>
              <p className="text-md text-slate-700 dark:text-slate-400">
                Hệ thống đang chọn ngẫu nhiên câu hỏi theo ma trận...
              </p>
            </div>
            <div className="flex gap-1.5">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <PartyPopper className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900 dark:text-white mb-1">Tạo đề thi thành công!</p>
              <p className="text-md text-slate-500 dark:text-slate-400">Đang chuyển hướng...</p>
            </div>
          </>
        )}
      </div>
    </>
  );

  return (
    <main className="flex-1 bg-slate-50 dark:bg-slate-950 p-8 min-h-screen">
      <div className=" mx-auto">
        {currentStep === "check" && renderCheckStep()}
        {currentStep === "setup" && renderSetupStep()}
        {currentStep === "complete" && renderCompleteStep()}
      </div>
    </main>
  );
};

export default GenerateExamFlow;
