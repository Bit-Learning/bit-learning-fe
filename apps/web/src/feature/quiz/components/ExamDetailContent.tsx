import React, { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ChevronRight,
  Timer,
  RefreshCw,
  Award,
  Lock,
  PlayCircle,
  HelpCircle,
  BarChart3,
  Clock,
  BookOpen,
  AlertCircle,
  Star,
} from "lucide-react";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Button } from "@workspace/ui/components/Button";
// import { useExam } from "../hooks/useExam";
// import { useQuizAttemptsByExam, useStartQuizAttempt } from "../hooks/useQuiz";
import type { QuizAttemptBriefResponse, QuizAttemptStatus } from "../types/quiz.type";
import { ExamResponse } from "@/feature/exam/types/exam.type";
import { ApprovalStatus, QuestionLevel, QuestionType } from "@/feature/question/types/question.type";

const mockExam: ExamResponse = {
  id: 1,
  name: "Kiểm tra Giữa kỳ 1 - Tin học 12",
  code: "TIN12-GK1",
  durationInMinutes: 45,
  totalScore: 10,
  publishedAt: "2023-10-01T08:00:00Z",
  isPublished: true,
  matrixVersion: {
    id: 1,
    versionNo: 1,
    name: "Chương trình Tin học 12 - Học kỳ 1",
  },
  subject: {
    id: 1,
    name: "Tin học",
    code: "TIN",
  },
  examQuestions: Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    questionNo: i + 1,
    score: 0.25,
    optionsShuffled: false,
    question: {
      id: i + 1,
      content: `Câu hỏi ${i + 1}`,
      canonicalAnswer: undefined,
      questionType: "MCQ" as QuestionType,
      questionLevel: "MEDIUM" as QuestionLevel,
      subject: { id: 1, name: "Tin học", code: "TIN" },
      chapter: { id: 1, name: "Tin học", code: "TIN" },
      lesson: { id: 1, name: "Bài 1", code: "L1" },
      tags: [],
      options: [
        { id: i * 4 + 1, content: "Đáp án A", isCorrect: false, orderNo: 1 },
        { id: i * 4 + 2, content: "Đáp án B", isCorrect: true, orderNo: 2 },
        { id: i * 4 + 3, content: "Đáp án C", isCorrect: false, orderNo: 3 },
        { id: i * 4 + 4, content: "Đáp án D", isCorrect: false, orderNo: 4 },
      ],
      isActive: true,
      isPublic: true,
      approvalStatus: "APPROVED" as ApprovalStatus,
      createdAt: "2023-09-15T08:00:00Z",
      updatedAt: "2023-09-15T08:00:00Z",
    },
  })),
  createdAt: "2023-09-15T08:00:00Z",
  updatedAt: "2023-09-20T10:30:00Z",
};

const mockAttempts: QuizAttemptBriefResponse[] = [
  {
    id: 1,
    exam: {
      id: 1,
      name: "Kiểm tra Giữa kỳ 1 - Tin học 12",
      code: "TIN12-GK1",
      durationInMinutes: 45,
      totalScore: 10,
      totalQuestions: 40,
      isPublished: true,
      createdAt: "2023-09-15T08:00:00Z",
    },
    status: "SUBMITTED" as QuizAttemptStatus,
    startTime: "2023-10-12T14:00:00Z",
    submittedAt: "2023-10-12T14:45:12Z",
    score: 8.5,
  },
];

const ExamDetailContent: React.FC = () => {
  const navigate = useNavigate();
  const { examId } = useParams({ from: "/_layout/exams/$examId" });

  const [showStartConfirm, setShowStartConfirm] = useState(false);

  // const { data: exam, isLoading } = useExam(Number(examId), { enabled: !!examId });
  // const { data: attemptsData } = useQuizAttemptsByExam(Number(examId), {
  //   page: 0,
  //   size: 100,
  // });
  // const startMutation = useStartQuizAttempt();
  // const attempts = attemptsData?.content?.filter(a => a.exam.id === Number(examId)) || [];

  const exam = mockExam;
  const attempts = mockAttempts;

  const maxAttempts = 3;
  const remainingAttempts = maxAttempts - attempts.length;
  const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a) => a.score || 0)) : null;
  const canStartExam = exam.isPublished && remainingAttempts > 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (start: string, end: string) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const diffMs = endTime - startTime;
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleStartExam = async () => {
    // try {
    //   const response = await startMutation.mutateAsync({
    //     examId: exam.id,
    //   });
    //
    //   navigate({
    //     to: "/quiz-attempts/$attemptId",
    //     params: { attemptId: String(response.data.data.id) },
    //   });
    // } catch (error) {
    //   console.error("Failed to start attempt:", error);
    // }

    navigate({
      to: "/exams/$examId/mode",
      params: { examId: String(exam.id) },
    });
  };

  return (
    <div className="max-w-300 mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <nav className="flex items-center gap-2 mb-8 text-sm font-medium text-slate-500 dark:text-slate-400">
        <a className="hover:text-primary cursor-pointer">Trang chủ</a>
        <ChevronRight className="w-4 h-4" />
        <a className="hover:text-primary cursor-pointer">Khóa học</a>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 dark:text-slate-100">Chi tiết đề thi</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <header className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight leading-tight text-slate-900 dark:text-slate-100">
              {exam.name}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Phạm vi kiến thức: {exam.matrixVersion?.name}. Đề thi bao gồm các câu hỏi trắc nghiệm khách quan và bài
              tập tình huống thực tế về Mạng máy tính, Internet và Hệ điều hành.
            </p>
          </header>

          <section className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Hướng dẫn và Quy định
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#f8f6f6] dark:bg-slate-700/50">
                <Timer className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-bold text-sm">Thời gian làm bài</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{exam.durationInMinutes} phút không nghỉ</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#f8f6f6] dark:bg-slate-700/50">
                <RefreshCw className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-bold text-sm">Số lần làm lại</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Tối đa {maxAttempts} lần</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#f8f6f6] dark:bg-slate-700/50">
                <Star className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-bold text-sm">Cách tính điểm</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Lấy điểm cao nhất</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#f8f6f6] dark:bg-slate-700/50">
                <Lock className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-bold text-sm">Bảo mật</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Không quay phim, chụp ảnh đề</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Lịch sử làm bài</h2>
            {attempts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse bg-white dark:bg-slate-800/50 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <th className="py-3 px-4 text-sm font-semibold">Lần thi</th>
                      <th className="py-3 px-4 text-sm font-semibold">Ngày hoàn thành</th>
                      <th className="py-3 px-4 text-sm font-semibold text-center">Thời gian</th>
                      <th className="py-3 px-4 text-sm font-semibold text-right">Điểm số</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {attempts.map((attempt, index) => (
                      <tr key={attempt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="py-4 px-4 text-sm font-medium">Lần {index + 1}</td>
                        <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-400">
                          {formatDate(attempt.submittedAt || attempt.startTime)}
                        </td>
                        <td className="py-4 px-4 text-sm text-center text-slate-600 dark:text-slate-400">
                          {attempt.submittedAt && formatDuration(attempt.startTime, attempt.submittedAt)}
                        </td>
                        <td className="py-4 px-4 text-sm text-right font-bold text-green-600">{attempt.score} / 10</td>
                      </tr>
                    ))}
                    {remainingAttempts > 0 && (
                      <tr>
                        <td className="py-4 px-4 text-sm text-slate-400 italic" colSpan={4}>
                          Bạn vẫn còn {remainingAttempts} lần làm bài nữa.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    Bạn chưa có lần thi nào. Hãy bắt đầu làm bài ngay!
                  </p>
                </CardContent>
              </Card>
            )}
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 bg-primary/10 dark:bg-primary/20 border-b border-primary/20">
                <h3 className="font-bold text-primary flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Tóm tắt đề thi
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Số lượng câu hỏi</span>
                    <span className="font-bold">{exam.examQuestions.length} câu</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Tổng điểm</span>
                    <span className="font-bold">{exam.totalScore.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Điểm tối thiểu đạt</span>
                    <span className="font-bold">5.0</span>
                  </div>
                </div>
                <hr className="border-slate-100 dark:border-slate-700" />
                <div className="space-y-3">
                  {canStartExam ? (
                    <>
                      <button
                        className="w-full rounded-xl bg-blue-600 px-6 py-3 text-lg font-bold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                        onClick={handleStartExam}
                      >
                        <PlayCircle className="w-5 h-5" />
                        Bắt đầu làm bài ngay
                      </button>
                      <p className="text-xs text-center text-slate-500">
                        Bằng việc bấm bắt đầu, đồng hồ sẽ tính giờ ngay lập tức.
                      </p>
                    </>
                  ) : !exam.isPublished ? (
                    <Button className="w-full" isDisabled>
                      <Lock className="w-5 h-5 mr-2" />
                      Đề thi chưa mở
                    </Button>
                  ) : (
                    <div className="text-center space-y-2">
                      <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Bạn đã hết lượt thi ({maxAttempts}/{maxAttempts})
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button className="w-full p-4 flex items-center justify-center gap-2 text-slate-500 hover:text-primary cursor-pointer transition-colors text-sm font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
              <HelpCircle className="w-5 h-5" />
              Bạn cần trợ giúp?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamDetailContent;
