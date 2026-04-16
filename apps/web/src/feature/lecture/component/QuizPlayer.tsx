import { Button } from "@workspace/ui/components/Button";
import { CheckCircle, ChevronLeft, ChevronRight, XCircle } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useLectureQuiz } from "../queries/useLecture";
import { useIsLectureCompleted, useMarkAsCompleted } from "../queries/useLearning";

interface QuizPlayerProps {
  lectureId: number;
  hasAccess?: boolean;
  onComplete?: () => void;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ lectureId, hasAccess = false, onComplete }) => {
  const { data: quizData, isLoading } = useLectureQuiz(lectureId);
  const { data: isCompleted } = useIsLectureCompleted(lectureId);
  const { mutate: markAsCompleted } = useMarkAsCompleted();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSubmit = () => {
    if (!quizData) return;

    let correctCount = 0;
    quizData.quizzes.forEach((quiz) => {
      const selectedAnswerId = selectedAnswers[quiz.id];
      const correctAnswer = quiz.answers.find((a) => a.isCorrect);
      if (selectedAnswerId === correctAnswer?.id) {
        correctCount++;
      }
    });

    const percentage = (correctCount / quizData.quizzes.length) * 100;
    setScore(percentage);
    setSubmitted(true);

    const isPassed = percentage >= quizData.passPercent * 100;
    if (isPassed && hasAccess) {
      markAsCompleted(lectureId, {
        onSuccess: () => {
          onComplete?.();
        },
      });
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);
    setCurrentQuestionIndex(0);
  };

  const handleNext = () => {
    if (quizData && currentQuestionIndex < quizData.quizzes.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="mt-4 text-gray-400">Đang tải quiz...</p>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="flex h-full items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
        <p className="text-gray-400">Không tìm thấy quiz</p>
      </div>
    );
  }

  const currentQuiz = quizData.quizzes[currentQuestionIndex];
  if (!currentQuiz) {
    return (
      <div className="flex h-full items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
        <p className="text-gray-400">Câu hỏi không tồn tại</p>
      </div>
    );
  }

  const selectedAnswerId = selectedAnswers[currentQuiz.id];
  const isPassed = score >= quizData.passPercent * 100;
  const allAnswered = Object.keys(selectedAnswers).length === quizData.quizzes.length;

  return (
    <div className="flex h-full flex-col bg-gray-200 p-8">
      <div className="mx-auto w-full flex-1">
        <div className="mb-6 overflow-hidden border rounded-xs bg-white">
          <div className="border-b border-gray-200 p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{quizData.lecture.title}</h2>
                {quizData.lecture.description && (
                  <p className="mt-1 text-sm text-gray-600">{quizData.lecture.description}</p>
                )}
              </div>
              {isCompleted && (
                <span className="flex shrink-0 items-center gap-1.5 bg-green-100 px-3 py-1.5 text-md font-bold text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  Đã hoàn thành
                </span>
              )}
            </div>
            <div className="mt-4 flex gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <span>Điểm đạt:</span>
                <span className="font-semibold text-green-600">{quizData.passPercent * 100}%</span>
              </div>
            </div>
          </div>

          {submitted && (
            <div className={`border-b p-8 ${isPassed ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
              <div className="flex items-center gap-4">
                {isPassed ? (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className={`text-xl font-bold ${isPassed ? "text-green-900" : "text-red-900"}`}>
                    {isPassed ? "Chúc mừng! Bạn đã vượt qua bài quiz" : "Chưa đạt yêu cầu"}
                  </h3>
                  <p className={`text-sm ${isPassed ? "text-green-700" : "text-red-700"}`}>
                    Điểm của bạn: <strong>{Math.floor(score)}%</strong> / {quizData.passPercent * 100}%
                  </p>
                </div>
                {!isPassed && (
                  <Button onPress={handleRetry} className="bg-red-600 text-white hover:bg-red-700">
                    Thử lại
                  </Button>
                )}
                {isPassed && hasAccess && !isCompleted && (
                  <Button
                    onPress={() => markAsCompleted(lectureId, { onSuccess: () => onComplete?.() })}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    Đánh dấu hoàn thành
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                Câu hỏi {currentQuestionIndex + 1} / {quizData.quizzes.length}
              </span>
              <div className="flex gap-1">
                {quizData.quizzes.map((quiz, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-2 w-8 rounded-full transition-all ${
                      idx === currentQuestionIndex
                        ? "bg-blue-600"
                        : selectedAnswers[quiz.id]
                          ? "bg-green-500"
                          : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="p-8">
            <h3 className="mb-6 text-xl font-semibold text-gray-900">{currentQuiz.questionText}</h3>

            <div className="space-y-3">
              {currentQuiz.answers.map((answer, idx) => {
                const isSelected = selectedAnswerId === answer.id;
                const isCorrect = answer.isCorrect;
                const showResult = submitted;

                let borderColor = "border-gray-300";
                let bgColor = "bg-white";
                let textColor = "text-gray-900";

                if (showResult) {
                  if (isCorrect) {
                    borderColor = "border-green-500";
                    bgColor = "bg-green-50";
                    textColor = "text-green-900";
                  } else if (isSelected && !isCorrect) {
                    borderColor = "border-red-500";
                    bgColor = "bg-red-50";
                    textColor = "text-red-900";
                  }
                } else if (isSelected) {
                  borderColor = "border-blue-500";
                  bgColor = "bg-blue-50";
                  textColor = "text-blue-900";
                }

                return (
                  <label
                    key={answer.id}
                    className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${borderColor} ${bgColor} ${
                      submitted ? "cursor-default" : "hover:border-blue-400 hover:shadow-md"
                    }`}
                  >
                    <div className="flex h-8 w-8 items-center justify-center">
                      <input
                        type="radio"
                        name={`quiz-${currentQuiz.id}`}
                        checked={isSelected}
                        onChange={() =>
                          !submitted &&
                          setSelectedAnswers((prev) => ({
                            ...prev,
                            [currentQuiz.id]: answer.id,
                          }))
                        }
                        disabled={submitted}
                        className="h-5 w-5 cursor-pointer accent-blue-600"
                      />
                    </div>
                    <span className={`flex-1 font-medium ${textColor}`}>
                      <span className="mr-2 text-gray-500">{String.fromCharCode(65 + idx)}.</span>
                      {answer.answerText}
                    </span>
                    {showResult && isCorrect && <CheckCircle className="h-6 w-6 text-green-600" />}
                    {showResult && isSelected && !isCorrect && <XCircle className="h-6 w-6 text-red-600" />}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <Button
                onPress={handlePrev}
                isDisabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronLeft className="h-5 w-5" />
                Câu trước
              </Button>

              {!submitted && currentQuestionIndex === quizData.quizzes.length - 1 && allAnswered ? (
                <Button
                  onPress={handleSubmit}
                  className="bg-emerald-600 px-8 text-white hover:from-green-700 hover:to-emerald-700"
                >
                  Nộp bài
                </Button>
              ) : (
                <Button
                  onPress={handleNext}
                  isDisabled={currentQuestionIndex === quizData.quizzes.length - 1}
                  className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40"
                >
                  Câu tiếp
                  <ChevronRight className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPlayer;
