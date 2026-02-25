import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Edit, Trash2, BookOpen, GraduationCap, Tag, Calendar } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/Card";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { useQuestion, useDeleteQuestion } from "../queries/useQuestion";
import type { QuestionType, QuestionLevel } from "../types/question.type";

const QuestionDetailContent: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const questionId = (params as any).id ? Number((params as any).id) : undefined;

  const { data: question, isLoading } = useQuestion(questionId!, {
    enabled: !!questionId,
  });
  const deleteQuestion = useDeleteQuestion();

  const getQuestionTypeLabel = (type: QuestionType) => {
    return type === "MCQ" ? "Trắc nghiệm" : "Tự luận";
  };

  const getQuestionTypeColor = (type: QuestionType) => {
    return type === "MCQ"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
  };

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

  const handleDelete = () => {
    if (confirm(`Bạn có chắc chắn muốn xóa câu hỏi:\n"${question?.content.substring(0, 50)}..."?`)) {
      deleteQuestion.mutate(questionId!, {
        onSuccess: () => {
          navigate({ to: "/mentor/question" });
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-10 w-64 mb-8" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-lg text-muted-foreground">Không tìm thấy câu hỏi</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate({ to: "/mentor/question/my" })} className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Button>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Chi tiết câu hỏi</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate({ to: `/mentor/question/${questionId}/edit` })}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Chỉnh sửa
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              isDisabled={deleteQuestion.isPending}
            >
              <Trash2 className="h-4 w-4" />
              Xóa
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getQuestionTypeColor(question.questionType)}`}
              >
                {getQuestionTypeLabel(question.questionType)}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(question.questionLevel)}`}
              >
                {getLevelLabel(question.questionLevel)}
              </span>
              {question.isActive && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                  Hoạt động
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Nội dung câu hỏi</h3>
              <p className="text-lg leading-relaxed">{question.content}</p>
            </div>

            {question.questionType === "MCQ" && question.options && question.options.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Các đáp án</h3>
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      className={`rounded-lg border p-3 transition-colors ${
                        option.isCorrect
                          ? "border-green-500 bg-green-50 dark:bg-green-950/30 dark:border-green-900"
                          : "border-gray-200 dark:border-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-sm">{option.label}.</span>
                        <span className="flex-1">{option.content}</span>
                        {option.isCorrect && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-600 text-white">
                            Đáp án đúng
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {question.canonicalAnswer && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Đáp án / Hướng dẫn giải</h3>
                <div className="rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
                  <p className="whitespace-pre-wrap leading-relaxed">{question.canonicalAnswer}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Thông tin bổ sung</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {question.subject && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Môn học</p>
                    <p className="font-medium">{question.subject.name}</p>
                  </div>
                </div>
              )}

              {question.lesson && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                    <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bài học</p>
                    <p className="font-medium">{question.lesson.name}</p>
                  </div>
                </div>
              )}

              {question.chapter && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900">
                    <BookOpen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Chương</p>
                    <p className="font-medium">{question.chapter.name}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày tạo</p>
                  <p className="font-medium">{new Date(question.createdAt).toLocaleDateString("vi-VN")}</p>
                </div>
              </div>
            </div>

            {question.tags && question.tags.length > 0 && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">Tags</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {question.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuestionDetailContent;
