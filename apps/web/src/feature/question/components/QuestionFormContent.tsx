import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Plus, Trash2, AlertCircle, Check, Save, ChevronDown } from "lucide-react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/Card";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { toast } from "@/shared/components/Sonner";
import { useCreateQuestion, useUpdateQuestion, useQuestion, useUploadQuestionMedia } from "../queries/useQuestion";
import { QuestionRequest, QuestionType, QuestionLevel } from "../types/question.type";
import { useSubjectsList } from "@/feature/matrix/queries/useSubject";
import { useChaptersBySubject, useChapterDetail } from "@/feature/matrix/queries/useChapter";
import { useLessonsByChapter, useLessonDetail } from "@/feature/matrix/queries/useLesson";
import MediaUploadPanel from "./MediaUploadPanel";
import { questionApi } from "../api/question.api";

const optionSchema = z.object({
  label: z.string(),
  content: z.string(),
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
      data.options?.forEach((opt, i) => {
        if (!opt.content || opt.content.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["options", i, "content"],
            message: "Vui lòng nhập nội dung đáp án",
          });
        }
      });

      const hasCorrect = data.options?.some((o) => o.isCorrect);
      if (!hasCorrect) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["options"], message: "Phải chọn ít nhất 1 đáp án đúng" });
      }
    }
    if (data.questionType === "ESSAY") {
      if (!data.canonicalAnswer || data.canonicalAnswer.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["canonicalAnswer"],
          message: "Vui lòng nhập đáp án cho câu tự luận",
        });
      }
    }
  });

type FormValues = z.infer<typeof formSchema>;

const labelCls = "block text-md font-semibold text-slate-700 dark:text-slate-300 mb-2";
const selectCls =
  "w-full appearance-none px-4 py-3 pr-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed";
const textareaCls =
  "w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none";

interface Props {
  mode?: "create" | "edit";
}

const QuestionFormContent: React.FC<Props> = ({ mode = "create" }) => {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const questionId = mode === "edit" && (params as any).id ? Number((params as any).id) : undefined;

  const [chapterId, setChapterId] = useState<number | undefined>(undefined);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const originalSubjectIdRef = useRef<number | undefined>(undefined);
  const isInitialized = useRef(false);

  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();

  const { data: existingQuestion, isLoading: loadingQuestion } = useQuestion(questionId!, {
    enabled: mode === "edit" && !!questionId,
  });
  const { data: subjects } = useSubjectsList();

  const { data: existingLessonDetail } = useLessonDetail(mode === "edit" ? existingQuestion?.lesson?.id : undefined);
  const { data: chapterDetail } = useChapterDetail(mode === "edit" ? existingLessonDetail?.chapterId : undefined);

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

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "options" });
  const questionType = form.watch("questionType");
  const subjectId = form.watch("subjectId");

  const { data: chapters } = useChaptersBySubject(subjectId);
  const { data: lessonsByChapter } = useLessonsByChapter(chapterId);
  const lessons = lessonsByChapter ?? chapterDetail?.lessons ?? [];

  useEffect(() => {
    if (mode !== "edit" || !existingQuestion || isInitialized.current) return;
    originalSubjectIdRef.current = existingQuestion.subject?.id;
    isInitialized.current = true;
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
  }, [existingQuestion]);

  useEffect(() => {
    if (mode !== "edit" || !chapterDetail) return;
    setChapterId(chapterDetail.id);
  }, [chapterDetail]);

  useEffect(() => {
    if (mode !== "edit" || !lessons.length || !existingQuestion?.lesson?.id) return;
    form.setValue("lessonId", existingQuestion.lesson.id);
  }, [lessons]);

  useEffect(() => {
    if (!isInitialized.current) return;
    if (subjectId === originalSubjectIdRef.current) return;
    setChapterId(undefined);
    form.setValue("lessonId", undefined);
  }, [subjectId]);

  const prevChapterIdRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!isInitialized.current) {
      prevChapterIdRef.current = chapterId;
      return;
    }
    if (chapterId !== prevChapterIdRef.current) {
      form.setValue("lessonId", undefined);
    }
    prevChapterIdRef.current = chapterId;
  }, [chapterId]);

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
        { onSuccess: () => navigate({ to: "/mentor/question/my" }) },
      );
    } else {
      createQuestion.mutate(requestData, {
        onSuccess: async (response) => {
          const newId = response?.data?.data?.id ?? response?.data?.data?.id ?? (response as any)?.id;

          if (newId && pendingFile) {
            try {
              await questionApi.uploadQuestionMedia(newId, pendingFile);
              toast.success({ title: "Thành công", description: "Tạo câu hỏi và upload media thành công" });
            } catch {
              toast.error({
                title: "Lỗi",
                description: "Tạo câu hỏi thành công nhưng upload media thất bại",
              });
            }
          } else {
            toast.success({ title: "Thành công", description: "Tạo câu hỏi thành công" });
          }
          navigate({ to: "/mentor/question/my" });
        },
      });
    }
  });

  const backTo = "/mentor/question/my";
  const isSubmitting = createQuestion.isPending || updateQuestion.isPending;

  if (mode === "edit" && loadingQuestion) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-10 w-64 mb-8" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const chapterDisabled = !subjectId;
  const lessonDisabled = !subjectId || !chapterId;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <Button
          variant="outline"
          size="lg"
          className="mb-2 gap-2 border-gray-400 bg-white shadow-sm transition-all hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
          onClick={() => navigate({ to: backTo })}
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {mode === "edit" ? "Chỉnh sửa câu hỏi" : "Tạo câu hỏi mới"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-base">
          {mode === "edit" ? "Cập nhật thông tin câu hỏi" : "Điền đầy đủ thông tin để tạo câu hỏi mới"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-2 border-slate-300 rounded-md">
          <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Thông tin cơ bản</h2>
            <p className="text-sm text-slate-500 mt-0.5">Phân loại và gắn nhãn câu hỏi</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>
                  Loại câu hỏi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.watch("questionType")}
                    onChange={(e) => form.setValue("questionType", e.target.value as QuestionType)}
                    className={selectCls}
                  >
                    <option value="MCQ">Trắc nghiệm (MCQ)</option>
                    <option value="ESSAY">Tự luận (Essay)</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                {form.formState.errors.questionType && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {form.formState.errors.questionType.message}
                  </p>
                )}
              </div>
              <div>
                <label className={labelCls}>
                  Độ khó <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.watch("questionLevel")}
                    onChange={(e) => form.setValue("questionLevel", e.target.value as QuestionLevel)}
                    className={selectCls}
                  >
                    <option value="EASY">Dễ</option>
                    <option value="MEDIUM">Trung bình</option>
                    <option value="HARD">Khó</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                {form.formState.errors.questionLevel && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {form.formState.errors.questionLevel.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className={labelCls}>Môn học</label>
              <div className="relative">
                <select
                  value={form.watch("subjectId") || ""}
                  onChange={(e) => form.setValue("subjectId", e.target.value ? Number(e.target.value) : undefined)}
                  className={selectCls}
                >
                  <option value="">-- Chọn môn học --</option>
                  {subjects?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={`${labelCls} ${chapterDisabled ? "opacity-50" : ""}`}>Chương</label>
                <div className="relative">
                  <select
                    value={chapterId || ""}
                    onChange={(e) => setChapterId(e.target.value ? Number(e.target.value) : undefined)}
                    disabled={chapterDisabled}
                    className={selectCls}
                  >
                    <option value="">-- Chọn chương --</option>
                    {chapters?.map((c, i) => (
                      <option key={i} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                {!subjectId && <p className="text-xs text-slate-400 mt-1.5">Vui lòng chọn môn học trước</p>}
              </div>

              <div>
                <label className={`${labelCls} ${lessonDisabled ? "opacity-50" : ""}`}>Bài học</label>
                <div className="relative">
                  <select
                    value={form.watch("lessonId") || ""}
                    onChange={(e) => form.setValue("lessonId", e.target.value ? Number(e.target.value) : undefined)}
                    disabled={lessonDisabled}
                    className={selectCls}
                  >
                    <option value="">-- Chọn bài học --</option>
                    {lessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                {!subjectId && <p className="text-xs text-slate-400 mt-1.5">Vui lòng chọn môn học trước</p>}
                {subjectId && !chapterId && <p className="text-xs text-slate-400 mt-1.5">Vui lòng chọn chương trước</p>}
                {form.formState.errors.lessonId && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {form.formState.errors.lessonId.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <MediaUploadPanel
          questionId={mode === "edit" ? questionId : undefined}
          currentMediaUrl={mode === "edit" ? (existingQuestion?.mediaUrl ?? null) : null}
          currentMediaType={mode === "edit" ? (existingQuestion?.mediaType ?? null) : null}
          onFileSelect={mode === "create" ? (file) => setPendingFile(file) : undefined}
        />

        <Card className="border-2 border-slate-300 rounded-md">
          <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Nội dung câu hỏi</h2>
            <p className="text-sm text-slate-500 mt-0.5">Nhập câu hỏi và đáp án chi tiết</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className={labelCls}>
                Câu hỏi <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Nhập nội dung câu hỏi..."
                {...form.register("content")}
                className={textareaCls}
              />
              {form.formState.errors.content && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {form.formState.errors.content.message}
                </p>
              )}
            </div>
            <div>
              <label className={labelCls}>
                Đáp án / Hướng dẫn giải
                {form.watch("questionType") === "ESSAY" && <span className="text-red-500"> *</span>}
              </label>
              <textarea
                rows={5}
                placeholder="Nhập đáp án chi tiết hoặc hướng dẫn giải..."
                {...form.register("canonicalAnswer")}
                className={textareaCls}
              />
              {form.formState.errors.canonicalAnswer && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {form.formState.errors.canonicalAnswer.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {questionType === "MCQ" && (
          <Card className="border-2 border-slate-300 rounded-md">
            <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Các đáp án</h2>
                <p className="text-sm text-slate-500 mt-0.5">Tick vào đáp án đúng</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addOption} className="gap-2 shrink-0">
                <Plus className="h-4 w-4" />
                Thêm đáp án
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2.5 p-3.5 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Chỉ được chọn <strong>1 đáp án đúng</strong> duy nhất bằng cách tick vào checkbox.
                </p>
              </div>
              {(form.formState.errors.options as any)?.message && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {(form.formState.errors.options as any).message}
                </p>
              )}
              <div className="space-y-3">
                {fields.map((field, index) => {
                  const isCorrect = form.watch(`options.${index}.isCorrect`);
                  return (
                    <div
                      key={field.id}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-lg border transition-all ${isCorrect ? "border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-700" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"}`}
                    >
                      <input
                        type="checkbox"
                        checked={isCorrect}
                        onChange={() => setCorrectOption(index)}
                        className="h-5 w-5 rounded border-slate-300 text-green-600 focus:ring-green-500 cursor-pointer shrink-0"
                      />
                      <span
                        className={`text-sm font-bold w-5 shrink-0 ${isCorrect ? "text-green-700 dark:text-green-400" : "text-slate-500"}`}
                      >
                        {field.label}
                      </span>
                      <input
                        {...form.register(`options.${index}.content`)}
                        placeholder={`Nhập nội dung đáp án ${field.label}...`}
                        className={`flex-1 px-3 py-2.5 rounded-md border text-base outline-none transition-all ${isCorrect ? "border-green-300 bg-green-50 dark:bg-green-900/10 dark:border-green-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-400" : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"}`}
                      />
                      {isCorrect && (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-700 dark:text-green-400 shrink-0">
                          <Check className="h-3.5 w-3.5" /> Đúng
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        disabled={fields.length <= 2}
                        className="text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-3 pt-2 pb-8">
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={() => navigate({ to: backTo })}
            className="px-6 py-5 border-slate-400"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            size="lg"
            className="px-8 py-5 gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
            isDisabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang xử lý...
              </span>
            ) : (
              <>
                {mode === "edit" ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {mode === "edit" ? "Lưu thay đổi" : "Tạo câu hỏi"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuestionFormContent;
