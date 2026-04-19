import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@workspace/ui/components/Button";
import { Textarea } from "@workspace/ui/components/Textarea";
import { Label } from "@workspace/ui/components/label";
import { ArrowLeft, ChevronDown, Globe, Lock, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import { Difficulty, ParamType, ParamTypeInfo } from "../types/coding.type";
import {
  useCreateProblem,
  useGenerateCodeTemplates,
  useBulkCreateTestCases,
  useProblemDetail,
  useUpdateProblem,
} from "../queries/useCoding";
import { useGetAllTags } from "../queries/useTag";
import TagMultiSelect from "../components/TagMultiSelect";
import TestCaseInput, {
  defaultTestCaseInputState,
  resolveTestCases,
  type TestCaseInputState,
} from "../components/TestCaseInput";

const problemSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  slug: z
    .string()
    .min(1, "Slug không được để trống")
    .regex(/^[a-z0-9-]+$/, "Slug chỉ chứa chữ thường, số và dấu gạch ngang"),
  description: z.string().min(1, "Mô tả không được để trống"),
  constraints: z.string().optional(),
  difficulty: z.nativeEnum(Difficulty),
  timeLimitMs: z.number().min(100, "Thời gian tối thiểu 100ms").max(30000, "Thời gian tối đa 30000ms"),
  memoryLimitMb: z.number().min(8, "Bộ nhớ tối thiểu 8MB").max(512, "Bộ nhớ tối đa 512MB"),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).min(1, "Vui lòng chọn ít nhất 1 thẻ"),
});

const generateTemplateSchema = z.object({
  functionName: z
    .string()
    .min(1, "Tên hàm không được để trống")
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Tên hàm không hợp lệ"),
  returnType: z.nativeEnum(ParamType),
  parameters: z
    .array(
      z.object({
        name: z.string().min(1, "Tên tham số không được để trống"),
        type: z.nativeEnum(ParamType),
      }),
    )
    .min(1, "Cần ít nhất 1 tham số"),
});

const combinedSchema = problemSchema.merge(generateTemplateSchema);

type ProblemFormData = z.infer<typeof problemSchema>;
type GenerateTemplateFormData = z.infer<typeof generateTemplateSchema>;
type CombinedFormData = z.infer<typeof combinedSchema>;

const SectionCard: React.FC<{
  title: string;
  subtitle: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => (
  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
    <div className="flex items-start gap-4 mb-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
    {children}
  </div>
);

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? <p className="text-sm text-red-500 mt-1.5">{message}</p> : null;

const inputCls =
  "h-11 text-sm w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400";

const selectCls =
  "h-11 text-sm block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none cursor-pointer";

interface CreateProblemContentProps {
  mode?: "create" | "edit";
  problemId?: string;
}

const CreateProblemContent: React.FC<CreateProblemContentProps> = ({ mode = "create", problemId }) => {
  const [tcState, setTcState] = useState<TestCaseInputState>(defaultTestCaseInputState);
  const [tcError, setTcError] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const navigate = useNavigate();
  const isEditMode = mode === "edit" && !!problemId;

  const createProblemMutation = useCreateProblem();
  const updateProblemMutation = useUpdateProblem();
  const generateTemplatesMutation = useGenerateCodeTemplates();
  const bulkCreateTestCasesMutation = useBulkCreateTestCases();

  const { data: allTags = [] } = useGetAllTags();
  const { data: problemData, isLoading: isProblemLoading } = useProblemDetail(problemId ?? "", undefined, {
    enabled: isEditMode,
  });

  const form = useForm<CombinedFormData>({
    resolver: zodResolver(combinedSchema) as Resolver<CombinedFormData>,
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      constraints: "",
      difficulty: Difficulty.EASY,
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      isPublic: false,
      tags: [],
      functionName: "solution",
      returnType: ParamType.INT,
      parameters: [{ name: "nums", type: ParamType.INT }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "parameters" });

  useEffect(() => {
    if (!isEditMode || !problemData || isProblemLoading) return;
    form.setValue("title", problemData.title);
    form.setValue("slug", problemData.slug);
    form.setValue("description", problemData.description);
    form.setValue("difficulty", problemData.difficulty);
    form.setValue("timeLimitMs", problemData.timeLimitMs);
    form.setValue("memoryLimitMb", problemData.memoryLimitMb);
    form.setValue("isPublic", problemData.isPublic);
    form.setValue("constraints", problemData.constraints ?? "");
    form.setValue(
      "tags",
      (problemData.tags ?? []).map((t: any) => {
        const name = typeof t === "string" ? t : t.name;
        return allTags.find((tag) => tag.name === name)?.id ?? name;
      }),
    );
  }, [isEditMode, problemData, isProblemLoading, form, allTags]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue("title", title);
    if (!isEditMode) {
      form.setValue(
        "slug",
        title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim(),
      );
    }
  };

  const onSubmit = async (data: CombinedFormData) => {
    setTcError(null);

    const problemPayload: ProblemFormData = {
      title: data.title,
      slug: data.slug,
      description: data.description,
      constraints: data.constraints || undefined,
      difficulty: data.difficulty,
      timeLimitMs: data.timeLimitMs,
      memoryLimitMb: data.memoryLimitMb,
      isPublic: data.isPublic,
      tags: data.tags,
    };

    const templatePayload: GenerateTemplateFormData = {
      functionName: data.functionName,
      returnType: data.returnType,
      parameters: data.parameters,
    };

    if (isEditMode) {
      try {
        await updateProblemMutation.mutateAsync({ problemId: problemId!, data: problemPayload });
        await generateTemplatesMutation.mutateAsync({ problemId: problemId!, data: templatePayload });
        navigate({ to: "/mentor/problem" });
      } catch (err) {
        console.error(err);
      }
      return;
    }

    const { testCases, error } = resolveTestCases(tcState);
    if (error) {
      setTcError(error);
      return;
    }

    try {
      const response = await createProblemMutation.mutateAsync(problemPayload);
      const newProblemId = response.data.data?.id;
      if (!newProblemId) throw new Error("Không thể lấy ID bài toán");

      await generateTemplatesMutation.mutateAsync({ problemId: newProblemId, data: templatePayload });
      await bulkCreateTestCasesMutation.mutateAsync({
        problemId: newProblemId,
        data: { testCases, replaceExisting: false },
      });
      navigate({ to: "/mentor/problem" });
    } catch (err) {
      console.error(err);
    }
  };

  const isPending =
    createProblemMutation.isPending ||
    updateProblemMutation.isPending ||
    generateTemplatesMutation.isPending ||
    bulkCreateTestCasesMutation.isPending;
  if (isEditMode && isProblemLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-blue-600 dark:text-slate-200 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="outline"
          size="lg"
          className="mb-3 gap-2 border-gray-400 bg-white shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
          onClick={() => navigate({ to: isEditMode ? `/mentor/problem/${problemId}/` : "/mentor/problem" })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <div className="flex items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isEditMode ? "Chỉnh sửa bài tập" : "Tạo bài tập mới"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {isEditMode ? "Cập nhật thông tin và cấu hình bài tập" : "Điền thông tin để tạo thử thách lập trình mới"}
            </p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <SectionCard title="Thông tin cơ bản" subtitle="Tiêu đề, mô tả và các thông số của bài tập">
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Tiêu đề <span className="text-red-500">*</span>
                  </Label>
                  <input
                    {...form.register("title")}
                    onChange={handleTitleChange}
                    placeholder="Nhập tên bài tập..."
                    className={inputCls}
                  />
                  <FieldError message={form.formState.errors.title?.message} />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Slug <span className="text-red-500">*</span>
                  </Label>
                  <input {...form.register("slug")} placeholder="" className={cn(inputCls, "font-mono text-xs")} />
                  <FieldError message={form.formState.errors.slug?.message} />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Mô tả bài toán <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  {...form.register("description")}
                  placeholder="Mô tả đề bài, ví dụ, yêu cầu đầu vào/đầu ra..."
                  className="min-h-35 text-sm rounded-lg border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <FieldError message={form.formState.errors.description?.message} />
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Ràng buộc</Label>
                <Textarea
                  {...form.register("constraints")}
                  placeholder="Ví dụ: 1 ≤ n ≤ 10^5"
                  className="min-h-20 text-sm rounded-lg border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Độ khó <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <select {...form.register("difficulty")} className={selectCls}>
                      <option value={Difficulty.EASY}>Dễ</option>
                      <option value={Difficulty.MEDIUM}>Trung bình</option>
                      <option value={Difficulty.HARD}>Khó</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Thời gian (ms) <span className="text-red-500">*</span>
                  </Label>
                  <input
                    type="number"
                    {...form.register("timeLimitMs", { valueAsNumber: true })}
                    className={inputCls}
                  />
                  <FieldError message={form.formState.errors.timeLimitMs?.message} />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Bộ nhớ (MB) <span className="text-red-500">*</span>
                  </Label>
                  <input
                    type="number"
                    {...form.register("memoryLimitMb", { valueAsNumber: true })}
                    className={inputCls}
                  />
                  <FieldError message={form.formState.errors.memoryLimitMb?.message} />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Thẻ</Label>
                <TagMultiSelect
                  value={form.watch("tags")}
                  onChange={(tags) => form.setValue("tags", tags)}
                  placeholder="Chọn thẻ..."
                />
                <FieldError message={form.formState.errors.tags?.message} />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title={isEditMode ? "Cấu hình Code Templates" : "Tạo mẫu Code tự động"}
            subtitle="Hệ thống tự động tạo template cho Python, Java, C++, JavaScript"
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Tên hàm <span className="text-red-500">*</span>
                  </Label>
                  <input
                    {...form.register("functionName")}
                    placeholder="solution"
                    className={cn(inputCls, "font-mono")}
                  />
                  <FieldError message={form.formState.errors.functionName?.message} />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Kiểu trả về <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <select {...form.register("returnType")} className={selectCls}>
                      {Object.values(ParamType).map((type) => (
                        <option key={type} value={type}>
                          {ParamTypeInfo[type].displayName} ({ParamTypeInfo[type].javaType})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Tham số đầu vào <span className="text-red-500">*</span>
                  </Label>
                  <button
                    type="button"
                    onClick={() => append({ name: "", type: ParamType.INT })}
                    className="cursor-pointer flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm tham số
                  </button>
                </div>
                <div className="space-y-2.5">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2.5 items-start">
                      <span className="w-7 h-11 flex items-center justify-center text-xs font-mono text-slate-400 shrink-0">
                        {index + 1}.
                      </span>
                      <div className="flex-1">
                        <input
                          {...form.register(`parameters.${index}.name`)}
                          placeholder="Tên tham số (vd: nums)"
                          className={cn(inputCls, "font-mono")}
                        />
                        <FieldError message={form.formState.errors.parameters?.[index]?.name?.message} />
                      </div>
                      <div className="flex-1 relative">
                        <select {...form.register(`parameters.${index}.type`)} className={selectCls}>
                          {Object.values(ParamType).map((type) => (
                            <option key={type} value={type}>
                              {ParamTypeInfo[type].displayName}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="h-11 w-11 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <FieldError message={form.formState.errors.parameters?.message} />
              </div>
            </div>
          </SectionCard>

          {!isEditMode && (
            <SectionCard title="Test Cases" subtitle="Thêm các trường hợp kiểm thử cho bài tập">
              <TestCaseInput
                state={tcState}
                onChange={(s) => {
                  setTcState(s);
                  setTcError(null);
                }}
                error={tcError}
                jsonError={jsonError}
                onSetJsonError={setJsonError}
              />
            </SectionCard>
          )}

          <div className="flex gap-3 justify-end pb-8">
            <Button
              type="button"
              onClick={() => navigate({ to: "/mentor/problem" })}
              className="cursor-pointer px-6 py-5 text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              isDisabled={isPending}
              className="cursor-pointer px-6 py-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg"
            >
              {isPending ? "Đang xử lý..." : isEditMode ? "Cập nhật bài tập" : "Tạo bài tập"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProblemContent;
