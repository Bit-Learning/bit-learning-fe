import { useEffect } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Plus, Trash2, AlertCircle, Check, Save, ChevronDown } from "lucide-react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/Button";
import { Input } from "@workspace/ui/components/Input";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/Card";
import { Label } from "@workspace/ui/components/label";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { toast } from "@/shared/components/Sonner";
import { useCreateQuestion, useUpdateQuestion, useQuestion } from "../queries/useQuestion";
import { QuestionRequest, QuestionType, QuestionLevel } from "../types/question.type";
import { useSubjectsList } from "@/feature/matrix/queries/useSubject";
import { useLessonsBySubject } from "@/feature/matrix/queries/useLesson";

const optionSchema = z.object({
  label: z.string(),
  content: z.string().min(1, "Vui lòng nhập nội dung đáp án"),
  isCorrect: z.boolean(),
  orderNo: z.number(),
});

const formSchema = z
  .object({
    content: z.string().min(1, "Vui lòng nhập nội dung câu hỏi"),
    canonicalAnswer: z.string().optional(),
    questionType: z.enum(QuestionType),
    questionLevel: z.enum(QuestionLevel),
    subjectId: z.number().optional(),
    lessonId: z.number().optional(),
    tagIds: z.array(z.number()).optional(),
    options: z.array(optionSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.questionType === "MCQ") {
      const hasCorrect = data.options?.some((o) => o.isCorrect);
      if (!hasCorrect) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["options"],
          message: "Phải chọn ít nhất 1 đáp án đúng",
        });
      }
    }
  });

type FormValues = z.infer<typeof formSchema>;

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-red-500 mt-1">{message}</p> : null;

const SelectField = ({
  label,
  required,
  hint,
  error,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
}) => (
  <div>
    <Label htmlFor={props.id}>
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    <div className="relative mt-1.5">
      <select
        {...props}
        className="w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    </div>
    {hint && !error && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    <FieldError message={error} />
  </div>
);

const TextareaField = ({
  label,
  required,
  error,
  rows = 4,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  required?: boolean;
  error?: string;
}) => (
  <div>
    <Label htmlFor={props.id}>
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    <textarea
      {...props}
      rows={rows}
      className="w-full mt-1.5 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
    />
    <FieldError message={error} />
  </div>
);

interface Props {
  mode?: "create" | "edit";
}

const QuestionFormContent: React.FC<Props> = ({ mode = "create" }) => {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const questionId = mode === "edit" && (params as any).id ? Number((params as any).id) : undefined;

  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const { data: existingQuestion, isLoading: loadingQuestion } = useQuestion(questionId!, {
    enabled: mode === "edit" && !!questionId,
  });
  const { data: subjects } = useSubjectsList();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      canonicalAnswer: "",
      questionType: "MCQ" as QuestionType,
      questionLevel: "EASY" as QuestionLevel,
      subjectId: undefined,
      lessonId: undefined,
      tagIds: [],
      options: [
        { label: "A", content: "", isCorrect: false, orderNo: 0 },
        { label: "B", content: "", isCorrect: false, orderNo: 1 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const questionType = form.watch("questionType");
  const subjectId = form.watch("subjectId");
  const { data: lessons } = useLessonsBySubject(subjectId, { size: 50 });
  useEffect(() => {
    if (mode === "edit" && existingQuestion) {
      form.reset({
        content: existingQuestion.content,
        canonicalAnswer: existingQuestion.canonicalAnswer || "",
        questionType: existingQuestion.questionType,
        questionLevel: existingQuestion.questionLevel,
        subjectId: existingQuestion.subject?.id,
        lessonId: existingQuestion.lesson?.id,
        tagIds: existingQuestion.tags?.map((t) => t.id) || [],
        options:
          existingQuestion.options?.map((opt) => ({
            label: opt.label || "",
            content: opt.content,
            isCorrect: opt.isCorrect,
            orderNo: opt.orderNo,
          })) || [],
      });
    }
  }, [mode, existingQuestion]);

  useEffect(() => {
    if (mode === "create") {
      form.setValue("lessonId", undefined);
    }
  }, [subjectId]);

  const addOption = () => {
    const labels = ["A", "B", "C", "D", "E", "F"];
    append({
      label: labels[fields.length] || `${fields.length + 1}`,
      content: "",
      isCorrect: false,
      orderNo: fields.length,
    });
  };

  const removeOption = (index: number) => {
    if (fields.length <= 2) {
      toast.error({ title: "Lỗi", description: "Phải có ít nhất 2 đáp án!" });
      return;
    }
    remove(index);
  };

  const setCorrectOption = (index: number) => {
    fields.forEach((_, i) => form.setValue(`options.${i}.isCorrect`, i === index));
  };

  const handleSubmit = form.handleSubmit((data) => {
    const requestData: QuestionRequest = {
      ...data,
      options: data.questionType === "MCQ" ? data.options : undefined,
    };

    if (mode === "edit" && questionId) {
      updateQuestion.mutate(
        { id: questionId, data: requestData },
        { onSuccess: () => navigate({ to: `/mentor/question/${questionId}` }) },
      );
    } else {
      createQuestion.mutate(requestData, {
        onSuccess: () => navigate({ to: "/mentor/question/my" }),
      });
    }
  });

  const backTo = mode === "edit" ? `/mentor/question/${questionId}` : "/mentor/question/my";
  const isSubmitting = mode === "edit" ? updateQuestion.isPending : createQuestion.isPending;

  if (mode === "edit" && loadingQuestion) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-10 w-64 mb-8" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="outline"
          size="lg"
          className="gap-2 mb-2 border-gray-300 bg-white shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
          onClick={() => navigate({ to: backTo })}
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <h1 className="text-3xl font-bold">{mode === "edit" ? "Chỉnh sửa câu hỏi" : "Tạo câu hỏi mới"}</h1>
        <p className="text-muted-foreground mt-1">
          {mode === "edit" ? "Cập nhật thông tin câu hỏi" : "Điền thông tin để tạo câu hỏi mới"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Thông tin cơ bản</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                id="questionType"
                label="Loại câu hỏi"
                required
                value={form.watch("questionType")}
                onChange={(e) => form.setValue("questionType", e.target.value as QuestionType)}
                error={form.formState.errors.questionType?.message}
              >
                <option value="MCQ">Trắc nghiệm</option>
                <option value="ESSAY">Tự luận</option>
              </SelectField>

              <SelectField
                id="questionLevel"
                label="Độ khó"
                required
                value={form.watch("questionLevel")}
                onChange={(e) => form.setValue("questionLevel", e.target.value as QuestionLevel)}
                error={form.formState.errors.questionLevel?.message}
              >
                <option value="EASY">Dễ</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HARD">Khó</option>
              </SelectField>
            </div>

            <SelectField
              id="subjectId"
              label="Môn học"
              value={form.watch("subjectId") || ""}
              onChange={(e) => form.setValue("subjectId", e.target.value ? Number(e.target.value) : undefined)}
              error={form.formState.errors.subjectId?.message}
            >
              <option value="">-- Chọn môn học --</option>
              {subjects?.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </SelectField>

            <SelectField
              id="lessonId"
              label="Bài học"
              value={form.watch("lessonId") || ""}
              onChange={(e) => form.setValue("lessonId", e.target.value ? Number(e.target.value) : undefined)}
              disabled={!subjectId}
              hint={!subjectId ? "Vui lòng chọn môn học trước" : undefined}
              error={form.formState.errors.lessonId?.message}
            >
              <option value="">-- Chọn bài học --</option>
              {lessons?.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.name}
                </option>
              ))}
            </SelectField>

            <TextareaField
              id="content"
              label="Nội dung câu hỏi"
              required
              rows={4}
              placeholder="Nhập nội dung câu hỏi..."
              {...form.register("content")}
              error={form.formState.errors.content?.message}
            />

            <TextareaField
              id="canonicalAnswer"
              label="Đáp án / Hướng dẫn giải"
              rows={5}
              placeholder="Nhập đáp án chi tiết hoặc hướng dẫn giải..."
              {...form.register("canonicalAnswer")}
              error={form.formState.errors.canonicalAnswer?.message}
            />
          </CardContent>
        </Card>

        {questionType === "MCQ" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-lg font-semibold">Các đáp án</h2>
              <Button type="button" variant="outline" size="sm" onClick={addOption} className="gap-2">
                <Plus className="h-4 w-4" />
                Thêm đáp án
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Click vào checkbox để chọn đáp án đúng. Chỉ được chọn 1 đáp án đúng duy nhất.
                </p>
              </div>

              {(form.formState.errors.options as any)?.message && (
                <FieldError message={(form.formState.errors.options as any).message} />
              )}

              {fields.map((field, index) => {
                const isCorrect = form.watch(`options.${index}.isCorrect`);
                return (
                  <div
                    key={field.id}
                    className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isCorrect}
                          onChange={() => setCorrectOption(index)}
                          className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        />
                        {isCorrect && <Check className="h-4 w-4 text-green-600" />}
                      </div>
                      <span className="font-semibold text-sm w-6">{field.label}</span>
                      <div className="flex-1">
                        <Input
                          {...form.register(`options.${index}.content`)}
                          placeholder={`Nhập nội dung đáp án ${field.label}...`}
                        />
                        <FieldError message={form.formState.errors.options?.[index]?.content?.message} />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      isDisabled={fields.length <= 2}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" size="lg" variant="outline" onClick={() => navigate({ to: backTo })}>
            Hủy
          </Button>
          <Button type="submit" size="lg" className="gap-2" isDisabled={isSubmitting}>
            {mode === "edit" ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isSubmitting ? "Đang xử lý..." : mode === "edit" ? "Lưu thay đổi" : "Tạo câu hỏi"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuestionFormContent;
