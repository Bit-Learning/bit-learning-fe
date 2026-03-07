import React from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ChevronRight, Timer, BookOpen, CheckCircle2, Rocket, Edit3, AlertCircle } from "lucide-react";
// import { useStartQuizAttempt, useStartQuizSession } from "../hooks/useQuiz";

const ExamModeContent: React.FC = () => {
  const navigate = useNavigate();
  const { examId } = useParams({ from: "/_layout/exams/$examId_/mode" });
  console.log(examId);

  // const startAttemptMutation = useStartQuizAttempt();
  // const startSessionMutation = useStartQuizSession();

  // ===== HANDLERS =====
  const handleStartExam = async () => {
    // try {
    //   const response = await startAttemptMutation.mutateAsync({
    //     examId: Number(examId),
    //   });
    //
    //   const attemptId = response.data.data.id;
    //
    //   // Navigate to QuizAttemptPage with new attemptId
    //   navigate({
    //     to: "/quiz-attempts/$attemptId",
    //     params: { attemptId: String(attemptId) },
    //   });
    // } catch (error) {
    //   console.error("Failed to start attempt:", error);
    // }

    console.log("Start exam mode - API: POST /quiz-attempts", { examId });
    navigate({
      to: "/quiz-attempts/$attemptId",
      params: { attemptId: "1" },
    });
  };

  const handleStartPractice = async () => {
    // try {
    //   const response = await startSessionMutation.mutateAsync({
    //     examId: Number(examId),
    //     type: "PRACTICE",
    //   });
    //
    //   const sessionId = response.data.data.id;
    //
    //   // Navigate to QuizSessionPage with new sessionId
    //   navigate({
    //     to: "/quiz-sessions/$sessionId",
    //     params: { sessionId: String(sessionId) },
    //   });
    // } catch (error) {
    //   console.error("Failed to start session:", error);
    // }

    console.log("Start practice mode - API: POST /quiz-sessions", { examId, type: "PRACTICE" });
    navigate({
      to: "/quiz-sessions/$sessionId",
      params: { sessionId: "1" },
    });
  };

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-10 md:px-20 lg:px-40">
      <div className="max-w-250 w-full">
        <nav className="mb-8 flex items-center gap-2 text-sm font-medium text-slate-500">
          <a className="hover:text-primary transition-colors cursor-pointer">Trang chủ</a>
          <ChevronRight className="w-4 h-4" />
          <a className="hover:text-primary transition-colors cursor-pointer">Khóa học của tôi</a>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 dark:text-slate-100">Chọn chế độ làm bài</span>
        </nav>

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-slate-900 dark:text-white">
            Sẵn sàng để thử thách?
          </h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
            Lựa chọn chế độ phù hợp với mục tiêu hiện tại của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
              <img
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop"
                alt="Một người đang tập trung làm bài thi với đồng hồ cát"
              />
              <div className="absolute top-4 left-4 rounded-lg bg-red-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                Thử thách
              </div>
            </div>
            <div className="flex flex-1 flex-col p-6 lg:p-8">
              <div className="mb-4 flex items-center gap-3">
                <Timer className="w-8 h-8 text-primary" />
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Chế độ Thi</h3>
              </div>
              <ul className="mb-8 flex flex-1 flex-col gap-4 text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Có giới hạn thời gian làm bài nghiêm ngặt.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Xem kết quả và phân tích chi tiết sau khi nộp bài.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Phù hợp để đánh giá năng lực thực tế trước kỳ thi.</span>
                </li>
              </ul>
              <button
                className="cursor-pointer w-full rounded-xl bg-primary px-6 py-4 text-lg font-bold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
                onClick={handleStartExam}
              >
                Bắt đầu Thi
                <Rocket className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
              <img
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=400&fit=crop"
                alt="Một người đang đọc sách và ghi chép thư giãn"
              />
              <div className="absolute top-4 left-4 rounded-lg bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                Ôn tập
              </div>
            </div>
            <div className="flex flex-1 flex-col p-6 lg:p-8">
              <div className="mb-4 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-primary" />
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Chế độ Luyện tập</h3>
              </div>
              <ul className="mb-8 flex flex-1 flex-col gap-4 text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Không giới hạn thời gian, tự do nghiên cứu.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Xem lời giải chi tiết ngay lập tức sau mỗi câu hỏi.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Phù hợp để nắm vững kiến thức và rèn luyện kỹ năng.</span>
                </li>
              </ul>
              <button
                className="cursor-pointer w-full rounded-xl border-2 border-primary bg-primary/10 px-6 py-4 text-lg font-bold text-primary transition-all hover:bg-primary hover:text-white flex items-center justify-center gap-2"
                onClick={handleStartPractice}
              >
                Vào Luyện tập
                <Edit3 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16 rounded-2xl bg-slate-100 dark:bg-slate-800/50 p-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            <strong className="text-slate-900 dark:text-slate-100">Lưu ý:</strong> Kết quả ở chế độ Thi sẽ được lưu vào
            học bạ điện tử của bạn.{" "}
            <a className="text-primary hover:underline ml-1" href="#">
              Tìm hiểu thêm về quy chế thi.
            </a>
          </p>
        </div>
      </div>
    </main>
  );
};

export default ExamModeContent;
