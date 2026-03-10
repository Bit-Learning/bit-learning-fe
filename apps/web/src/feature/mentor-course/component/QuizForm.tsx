import { useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { Card } from "@workspace/ui/components/Card";
import { Input } from "@workspace/ui/components/Input";
import { Label } from "@workspace/ui/components/label";
import { cn } from "@workspace/ui/lib/utils";
import { ArrowLeft, Plus } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useLectureQuiz } from "@/feature/lecture/queries/useLecture";
import { useAppDispatch } from "@/shared/redux/store";
import { useCreateLectureQuiz, useUpdateLecture, useUpdateLectureQuiz } from "../queries/useLecture";
import { resetMLectureStateAction, selectCreateQuizContext, selectEditQuizContext } from "../stores/mlecture.store";
import type { CreateLectureQuizRequest, QuizUpdateRequest } from "../types/mlecture.api";
import { QuestionCard } from "./QuestionCard";

interface QuizFormData {
  title: string;
  description: string;
  passPercent: number;
  maxAttempts: number;
  questions: Array<{
    id?: number;
    questionText: string;
    orderIndex: number;
    answers: Array<{
      id?: number;
      answerText: string;
      isCorrect: boolean;
      orderIndex: number;
    }>;
  }>;
}

export const QuizForm = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const createContext = useSelector(selectCreateQuizContext);
  const editContext = useSelector(selectEditQuizContext);

  const isEditMode = !!editContext?.lectureId;
  const context = isEditMode ? editContext : createContext;

  const { data: quizData, isLoading: quizLoading } = useLectureQuiz(isEditMode ? editContext?.lectureId : 0);

  const createQuizMutation = useCreateLectureQuiz();
  const updateLectureMutation = useUpdateLecture();
  const updateQuizMutation = useUpdateLectureQuiz();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuizFormData>({
    defaultValues: {
      title: "",
      description: "",
      passPercent: 0.8,
      maxAttempts: 3,
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
  } = useFieldArray({
    control,
    name: "questions",
  });

  useEffect(() => {
    if (isEditMode && quizData) {
      reset({
        title: quizData.lecture?.title || "",
        description: quizData.lecture?.description || "",
        passPercent: quizData.passPercent,
        maxAttempts: quizData.maxAttempts,
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
    if (!context?.sectionId) {
      navigate({ to: "/mentor/course/list" });
    }
  }, [context, navigate]);

  const handleFormSubmit = async (data: QuizFormData) => {
    if (!context?.sectionId) return;

    try {
      if (isEditMode && editContext?.lectureId) {
        await updateLectureMutation.mutateAsync({
          id: editContext.lectureId,
          data: {
            sectionId: context.sectionId,
            title: data.title,
            description: data.description,
            isPreviewable: false,
            orderIndex: editContext.orderIndex || 1,
          },
        });

        const quizzes: QuizUpdateRequest[] = data.questions.map((q) => ({
          id: q.id,
          questionText: q.questionText,
          orderIndex: q.orderIndex,
          answers: q.answers.map((a) => ({
            id: a.id,
            answerText: a.answerText,
            isCorrect: a.isCorrect,
            orderIndex: a.orderIndex,
          })),
        }));

        await updateQuizMutation.mutateAsync({
          id: editContext.lectureId,
          quizzes,
        });
      } else {
        const quizData: CreateLectureQuizRequest = {
          lecture: {
            sectionId: context.sectionId,
            title: data.title,
            description: data.description,
            isPreviewable: false,
            orderIndex: context.orderIndex || 1,
          },
          quizzes: data.questions.map((q) => ({
            questionText: q.questionText,
            orderIndex: q.orderIndex,
            answers: q.answers,
          })),
          passPercent: data.passPercent,
          maxAttempts: data.maxAttempts,
        };

        await createQuizMutation.mutateAsync(quizData);
      }

      dispatch(resetMLectureStateAction());
      navigate({ to: `/mentor/course/${context.courseId}` });
    } catch (error) {
      console.error("Failed to save quiz:", error);
    }
  };

  const handleCancel = () => {
    if (context?.courseId) {
      navigate({ to: `/mentor/course/${context.courseId}` });
    }
    dispatch(resetMLectureStateAction());
  };

  const addQuestion = () => {
    appendQuestion({
      questionText: "",
      orderIndex: questionFields.length + 1,
      answers: [
        { answerText: "", isCorrect: true, orderIndex: 1 },
        { answerText: "", isCorrect: false, orderIndex: 2 },
      ],
    });
  };

  if (!context?.sectionId) {
    return null;
  }

  if (isEditMode && quizLoading) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
        <p className="mt-4 text-gray-600">Đang tải bài kiểm tra...</p>
      </div>
    );
  }

  const isSubmitting = createQuizMutation.isPending || updateLectureMutation.isPending || updateQuizMutation.isPending;

  return (
    <div className="mx-auto p-8">
      <div className="mb-6">
        <Button variant="outline" size="sm" onClick={handleCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <h1 className="mt-4 text-3xl font-bold">{isEditMode ? "Chỉnh sửa bài kiểm tra" : "Tạo bài kiểm tra mới"}</h1>
        <p className="mt-2 text-gray-600">
          {isEditMode ? "Chỉnh sửa câu hỏi và đáp án của bài kiểm tra" : "Tạo bài kiểm tra với nhiều câu hỏi và đáp án"}
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Thông tin bài học</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Tên bài học *</Label>
              <Input
                id="title"
                {...register("title", { required: "Tên bài học là bắt buộc" })}
                placeholder="VD: Bài kiểm tra chương 1"
                className={cn(errors.title && "border-red-500")}
              />
              {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Input id="description" {...register("description")} placeholder="Mô tả ngắn về bài kiểm tra" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="passPercent">Điểm đạt (%) *</Label>
                <Input
                  id="passPercent"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  {...register("passPercent", {
                    required: "Điểm đạt là bắt buộc",
                    min: { value: 0, message: "Tối thiểu 0" },
                    max: { value: 1, message: "Tối đa 1" },
                    valueAsNumber: true,
                  })}
                  placeholder="0.8 (80%)"
                  className={cn(errors.passPercent && "border-red-500")}
                />
                {errors.passPercent && <p className="mt-1 text-sm text-red-500">{errors.passPercent.message}</p>}
              </div>

              <div>
                <Label htmlFor="maxAttempts">Số lần làm tối đa *</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  min="1"
                  {...register("maxAttempts", {
                    required: "Số lần làm là bắt buộc",
                    min: { value: 1, message: "Tối thiểu 1 lần" },
                    valueAsNumber: true,
                  })}
                  placeholder="3"
                  className={cn(errors.maxAttempts && "border-red-500")}
                />
                {errors.maxAttempts && <p className="mt-1 text-sm text-red-500">{errors.maxAttempts.message}</p>}
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Câu hỏi ({questionFields.length})</h3>
            <Button type="button" onClick={addQuestion} size="sm">
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
              onRemove={() => removeQuestion(questionIndex)}
              canRemove={questionFields.length > 1}
            />
          ))}
        </div>

        <div className="flex justify-end gap-3 border-t pt-6">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
          <Button type="submit" isDisabled={isSubmitting}>
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
  );
};
