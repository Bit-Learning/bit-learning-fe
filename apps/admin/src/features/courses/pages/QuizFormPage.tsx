import React, { useEffect } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft, Plus } from "lucide-react";
import { Controller, useFieldArray, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateLectureQuiz, useLectureQuiz, useUpdateLecture, useUpdateLectureQuiz } from "../queries/useLecture";
import type { CreateLectureQuizRequest, UpdateLectureQuizRequest } from "../types/lecture.type";
import { cn } from "@/shared/lib/utils";
import { QuestionCard } from "../components/QuestionCard";
import DurationPicker from "@/components/DurationPicker";

const answerSchema = z.object({
  id: z.coerce.number().optional(),
  answerText: z.string().min(1, "Vui lòng nhập nội dung đáp án"),
  isCorrect: z.boolean(),
  orderIndex: z.coerce.number(),
});

const questionSchema = z.object({
  id: z.coerce.number().optional(),
  questionText: z.string().min(1, "Vui lòng nhập nội dung câu hỏi"),
  orderIndex: z.coerce.number(),
  answers: z.array(answerSchema).min(2, "Cần ít nhất 2 đáp án"),
});

const quizSchema = z.object({
  title: z.string().min(1, "Tên bài học là bắt buộc"),
  description: z.string().optional(),
  passPercent: z.coerce.number().min(0, "Tối thiểu 0").max(1, "Tối đa 1"),
  maxAttempts: z.coerce.number().min(1, "Tối thiểu 1 lần"),
  duration: z.number().min(1, "Thời lượng phải lớn hơn 0"),
  questions: z.array(questionSchema).min(1, "Cần ít nhất 1 câu hỏi"),
});

type QuizFormValues = z.infer<typeof quizSchema>;

interface QuizSearchParams {
  mode?: "create" | "edit";
  sectionId?: number;
  courseId?: number;
  lectureId?: number;
  orderIndex?: number;
}

export const QuizFormPage: React.FC = () => {
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false }) as QuizSearchParams;
  const { mode = "create", sectionId, courseId, lectureId, orderIndex } = searchParams;
  const isEditMode = mode === "edit" && !!lectureId;

  const { data: quizData, isLoading: quizLoading } = useLectureQuiz(isEditMode ? lectureId! : 0);
  const createQuizMutation = useCreateLectureQuiz();
  const updateLectureMutation = useUpdateLecture();
  const updateQuizMutation = useUpdateLectureQuiz();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema) as Resolver<QuizFormValues>,
    defaultValues: {
      title: "",
      description: "",
      passPercent: 0.8,
      maxAttempts: 999,
      duration: 600,
      questions: [
        {
          questionText: "",
          orderIndex: 1,
          answers: [
            { answerText: "", isCorrect: true, orderIndex: 1 },
            { answerText: "", isCorrect: false, orderIndex: 2 },
          ],
        },
      ],
    },
  });

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({ control, name: "questions" });

  useEffect(() => {
    if (isEditMode && quizData) {
      reset({
        title: quizData.lecture?.title || "",
        description: quizData.lecture?.description || "",
        passPercent: quizData.passPercent,
        maxAttempts: quizData.maxAttempts,
        duration: 600,
        questions:
          quizData.quizzes?.map((q) => ({
            id: q.id,
            questionText: q.questionText,
            orderIndex: q.orderIndex,
            answers:
              q.answers?.map((a) => ({
                id: a.id,
                answerText: a.answerText,
                isCorrect: a.isCorrect,
                orderIndex: a.orderIndex,
              })) || [],
          })) || [],
      });
    }
  }, [isEditMode, quizData, reset]);

  useEffect(() => {
    if (!sectionId) navigate({ to: "/courses" });
  }, [sectionId, navigate]);

  const handleCancel = () => {
    if (courseId) navigate({ to: "/courses/$id", params: { id: String(courseId) } });
  };

  const onSubmit = async (data: QuizFormValues) => {
    if (!sectionId) return;
    try {
      if (isEditMode && lectureId) {
        await updateLectureMutation.mutateAsync({
          id: lectureId,
          data: {
            sectionId,
            title: data.title,
            description: data.description,
            isPreviewable: false,
            orderIndex: orderIndex || 1,
          },
        });
        const updatePayload: UpdateLectureQuizRequest = {
          passPercent: data.passPercent,
          maxAttempts: data.maxAttempts,
          duration: data.duration,
          quizzes: data.questions.map((q) => ({
            id: q.id,
            questionText: q.questionText,
            orderIndex: q.orderIndex,
            answers: q.answers.map((a) => ({
              id: a.id,
              answerText: a.answerText,
              isCorrect: a.isCorrect,
              orderIndex: a.orderIndex,
            })),
          })),
        };
        await updateQuizMutation.mutateAsync({ id: lectureId, data: updatePayload });
      } else {
        const payload: CreateLectureQuizRequest = {
          lecture: {
            sectionId,
            title: data.title,
            description: data.description,
            isPreviewable: false,
            orderIndex: orderIndex || 1,
          },
          quizzes: data.questions.map((q) => ({
            questionText: q.questionText,
            orderIndex: q.orderIndex,
            answers: q.answers,
          })),
          passPercent: data.passPercent,
          maxAttempts: data.maxAttempts,
          duration: data.duration,
        };
        await createQuizMutation.mutateAsync(payload);
      }
      navigate({ to: "/courses/$id", params: { id: String(courseId) } });
    } catch (error) {
      console.error("Failed to save quiz:", error);
    }
  };

  if (!sectionId) return null;

  if (isEditMode && quizLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="mt-4 text-gray-600">Đang tải bài kiểm tra...</p>
        </div>
      </div>
    );
  }

  const isSubmitting = createQuizMutation.isPending || updateLectureMutation.isPending || updateQuizMutation.isPending;

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Button variant="outline" size="lg" className="gap-2" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <h1 className="mt-4 text-3xl font-bold">{isEditMode ? "Chỉnh sửa bài kiểm tra" : "Tạo bài kiểm tra mới"}</h1>
          <p className="mt-2 text-gray-600">
            {isEditMode ? "Chỉnh sửa câu hỏi và đáp án" : "Tạo bài kiểm tra với nhiều câu hỏi và đáp án"}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-5 text-lg font-semibold">Thông tin bài học</h3>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Tên bài học *</Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="VD: Bài kiểm tra chương 1"
                  className={cn("h-11 w-full text-base", errors.title && "border-red-500")}
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Input
                  id="description"
                  {...register("description")}
                  placeholder="Mô tả ngắn về bài kiểm tra"
                  className="h-11 w-full text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="passPercent">Điểm đạt (0–1) *</Label>
                  <Input
                    id="passPercent"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    {...register("passPercent")}
                    placeholder="0.8 (80%)"
                    className={cn("h-11 w-full text-base", errors.passPercent && "border-red-500")}
                  />
                  {errors.passPercent && <p className="text-sm text-red-500">{errors.passPercent.message}</p>}
                </div>
                <div className="space-y-2">
                  <Controller
                    control={control}
                    name="duration"
                    render={({ field }) => (
                      <DurationPicker
                        value={field.value}
                        onChange={field.onChange}
                        label="Thời lượng làm bài *"
                        error={(errors as any).duration?.message}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Câu hỏi ({questionFields.length})</h3>
              <Button
                type="button"
                size="lg"
                onClick={() =>
                  appendQuestion({
                    questionText: "",
                    orderIndex: questionFields.length + 1,
                    answers: [
                      { answerText: "", isCorrect: true, orderIndex: 1 },
                      { answerText: "", isCorrect: false, orderIndex: 2 },
                    ],
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm câu hỏi
              </Button>
            </div>

            {questionFields.map((question, questionIndex) => (
              <QuestionCard
                key={question.id}
                questionIndex={questionIndex}
                control={control}
                register={register}
                errors={errors}
                setValue={setValue}
                onRemove={() => removeQuestion(questionIndex)}
                canRemove={questionFields.length > 1}
              />
            ))}
          </div>

          <div className="flex justify-end gap-3 border-t pt-6">
            <Button type="button" size="lg" variant="outline" onClick={handleCancel}>
              Hủy
            </Button>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode
                  ? "Đang lưu..."
                  : "Đang tạo..."
                : isEditMode
                  ? "Lưu thay đổi"
                  : "Tạo bài kiểm tra"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
