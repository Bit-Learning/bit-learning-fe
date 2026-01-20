import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Download, FileText, Clock, Award, BookOpen, Check } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/Card";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { useExam, useDownloadExam } from "../queries/useExam";
import { QuestionLevel } from "@workspace/lib/api/sdk/question.type";

const ExamDetailContent: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const examId = (params as any).id ? Number((params as any).id) : undefined;

  const { data: exam, isLoading } = useExam(examId!);
  const downloadExam = useDownloadExam();

  const getLevelLabel = (level: QuestionLevel) => {
    const labels = { EASY: "Dễ", MEDIUM: "Trung bình", HARD: "Khó" };
    return labels[level];
  };

  const getLevelColor = (level: QuestionLevel) => {
    const colors = {
      EASY: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      HARD: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[level];
  };

  const handleDownload = (format: "pdf" | "docx") => {
    if (!exam) return;
    downloadExam.mutate({ id: exam.id, format, name: exam.name });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-10 w-64 mb-8" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-lg text-muted-foreground">Không tìm thấy đề thi</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate({ to: "/exams/my-exams" })} className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{exam.name}</h1>
            <p className="text-muted-foreground">
              Mã đề: <span className="font-semibold">{exam.code}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleDownload("pdf")}
              className="gap-2"
              isDisabled={downloadExam.isPending}
            >
              <Download className="h-4 w-4" />
              Tải PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDownload("docx")}
              className="gap-2"
              isDisabled={downloadExam.isPending}
            >
              <Download className="h-4 w-4" />
              Tải Word
            </Button>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Thông tin đề thi</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {exam.examQuestions.length} câu hỏi • {exam.totalScore} điểm • {exam.durationInMinutes} phút
              </p>
            </div>
            {exam.isPublished && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Đã công bố
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{exam.examQuestions.length}</div>
              <div className="text-sm text-muted-foreground">Câu hỏi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{exam.totalScore}</div>
              <div className="text-sm text-muted-foreground">Tổng điểm</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{exam.durationInMinutes}</div>
              <div className="text-sm text-muted-foreground">Phút</div>
            </div>
            {exam.subject && (
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 truncate">
                  {exam.subject.name}
                </div>
                <div className="text-sm text-muted-foreground">Môn học</div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Danh sách câu hỏi
            </h3>
            {exam.examQuestions.map((examQuestion) => (
              <div key={examQuestion.id} className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <p className="font-medium mb-1">
                      <span className="font-bold">Câu {examQuestion.questionNo}:</span> {examQuestion.question.content}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Award className="h-3.5 w-3.5" />
                        {examQuestion.score} điểm
                      </span>
                      <span>•</span>
                      <span>{examQuestion.question.questionType === "MCQ" ? "Trắc nghiệm" : "Tự luận"}</span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(examQuestion.question.questionLevel)}`}
                  >
                    {getLevelLabel(examQuestion.question.questionLevel)}
                  </span>
                </div>

                {examQuestion.question.questionType === "MCQ" &&
                  examQuestion.question.options &&
                  examQuestion.question.options.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {examQuestion.question.options.map((option) => (
                        <div
                          key={option.id}
                          className={`flex items-start gap-2 p-2 rounded ${
                            option.isCorrect
                              ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900"
                              : ""
                          }`}
                        >
                          <span className="font-semibold text-sm">{option.label}.</span>
                          <span className={option.isCorrect ? "font-medium" : ""}>{option.content}</span>
                          {option.isCorrect && <Check className="h-4 w-4 text-green-600 dark:text-green-400 ml-auto" />}
                        </div>
                      ))}
                    </div>
                  )}

                {examQuestion.question.canonicalAnswer && (
                  <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                    <p className="text-sm">
                      <span className="font-semibold text-blue-700 dark:text-blue-300">Đáp án: </span>
                      {examQuestion.question.canonicalAnswer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamDetailContent;
