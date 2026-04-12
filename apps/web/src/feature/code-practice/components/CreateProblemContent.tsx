import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@workspace/ui/components/Button";
import { Input } from "@workspace/ui/components/Input";
import { Textarea } from "@workspace/ui/components/Textarea";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Label } from "@workspace/ui/components/label";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
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
  tags: z.array(z.string()).default([]),
});

const generateTemplateSchema = z.object({
  functionName: z
    .string()
    .min(1, "Tên hàm không được để trống")
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Tên hàm không hợp lệ"),
  returnType: z.nativeEnum(ParamType),
  parameters: z
    .array(z.object({ name: z.string().min(1, "Tên tham số không được để trống"), type: z.nativeEnum(ParamType) }))
    .min(1, "Cần ít nhất 1 tham số"),
});

const combinedSchema = problemSchema.merge(generateTemplateSchema);

type ProblemFormData = z.infer<typeof problemSchema>;
type GenerateTemplateFormData = z.infer<typeof generateTemplateSchema>;
type CombinedFormData = z.infer<typeof combinedSchema>;

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

    if (isEditMode) {
      try {
        await updateProblemMutation.mutateAsync({ problemId: problemId!, data: problemPayload });
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

      const templatePayload: GenerateTemplateFormData = {
        functionName: data.functionName,
        returnType: data.returnType,
        parameters: data.parameters,
      };

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
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-5">
        <Button
          variant="outline"
          size="lg"
          className="mb-3 gap-2 border-gray-400 bg-white shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
          onClick={() => navigate({ to: isEditMode ? `/mentor/problem/${problemId}/` : "/mentor/problem" })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditMode ? "Chỉnh sửa Bài Toán" : "Tạo Bài Toán Mới"}
        </h1>
        <p className="text-md text-gray-600">
          {isEditMode
            ? "Cập nhật thông tin bài toán và code templates"
            : "Tạo bài toán lập trình với tính năng tự động tạo mẫu code"}
        </p>
      </div>

      <Card className="border-2 border-gray-200">
        <CardContent className="px-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            <div className="space-y-6">
              <div className="border-b-2 border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-gray-900">Thông tin cơ bản</h2>
              </div>

              <div>
                <Label htmlFor="title" className="text-base font-semibold text-gray-900 mb-3 block">
                  Tiêu đề <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  onChange={handleTitleChange}
                  placeholder="Ví dụ: Tổng hai số"
                  className="h-12 text-base border-2 border-gray-300 focus:border-blue-500"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500 mt-2">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="slug" className="text-base font-semibold text-gray-900 mb-3 block">
                  Đường dẫn (Slug) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="slug"
                  {...form.register("slug")}
                  placeholder="tong-hai-so"
                  className="h-12 text-base border-2 border-gray-300 focus:border-blue-500"
                  disabled={isEditMode}
                />
                {form.formState.errors.slug && (
                  <p className="text-sm text-red-500 mt-2">{form.formState.errors.slug.message}</p>
                )}
                {isEditMode && <p className="text-sm text-gray-500 mt-2">Slug không thể thay đổi khi chỉnh sửa</p>}
              </div>

              <div>
                <Label htmlFor="description" className="text-base font-semibold text-gray-900 mb-3 block">
                  Mô tả đề bài <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  rows={8}
                  placeholder="Nhập mô tả chi tiết về đề bài, yêu cầu, ví dụ..."
                  className="text-base border-2 border-gray-300 focus:border-blue-500"
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500 mt-2">{form.formState.errors.description.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="constraints" className="text-base font-semibold text-gray-900 mb-3 block">
                  Ràng buộc
                </Label>
                <Textarea
                  id="constraints"
                  {...form.register("constraints")}
                  rows={4}
                  placeholder="Ví dụ: 1 ≤ n ≤ 10^5, -10^9 ≤ nums[i] ≤ 10^9"
                  className="text-base border-2 border-gray-300 focus:border-blue-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="difficulty" className="text-base font-semibold text-gray-900 mb-3 block">
                    Độ khó <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="difficulty"
                    {...form.register("difficulty")}
                    className="h-12 text-base block w-full rounded-md border-2 border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={Difficulty.EASY}>Dễ</option>
                    <option value={Difficulty.MEDIUM}>Trung bình</option>
                    <option value={Difficulty.HARD}>Khó</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="timeLimitMs" className="text-base font-semibold text-gray-900 mb-3 block">
                    Giới hạn thời gian (ms) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="timeLimitMs"
                    type="number"
                    {...form.register("timeLimitMs", { valueAsNumber: true })}
                    className="h-12 text-base border-2 border-gray-300 focus:border-blue-500"
                  />
                  {form.formState.errors.timeLimitMs && (
                    <p className="text-sm text-red-500 mt-2">{form.formState.errors.timeLimitMs.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="memoryLimitMb" className="text-base font-semibold text-gray-900 mb-3 block">
                    Giới hạn bộ nhớ (MB) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="memoryLimitMb"
                    type="number"
                    {...form.register("memoryLimitMb", { valueAsNumber: true })}
                    className="h-12 text-base border-2 border-gray-300 focus:border-blue-500"
                  />
                  {form.formState.errors.memoryLimitMb && (
                    <p className="text-sm text-red-500 mt-2">{form.formState.errors.memoryLimitMb.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold text-gray-900 mb-3 block">Thẻ</Label>
                <TagMultiSelect
                  value={form.watch("tags")}
                  onChange={(tags) => form.setValue("tags", tags)}
                  placeholder="Chọn tags..."
                  className="text-base"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  {...form.register("isPublic")}
                  className="w-5 h-5 text-blue-600 rounded border-2 border-gray-300 focus:ring-blue-500"
                />
                <Label htmlFor="isPublic" className="cursor-pointer text-base font-medium text-gray-700">
                  Công khai (hiển thị cho tất cả người dùng)
                </Label>
              </div>
            </div>

            {!isEditMode && (
              <div className="space-y-6">
                <div className="border-b-2 border-gray-200 pb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Tạo mẫu Code tự động</h2>
                  <p className="text-sm text-gray-600 mt-1">Python, Java, C++, JavaScript</p>
                </div>

                <div>
                  <Label htmlFor="functionName" className="text-base font-semibold text-gray-900 mb-3 block">
                    Tên hàm <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="functionName"
                    {...form.register("functionName")}
                    placeholder="solution"
                    className="h-12 text-base border-2 border-gray-300 focus:border-blue-500"
                  />
                  {form.formState.errors.functionName && (
                    <p className="text-sm text-red-500 mt-2">{form.formState.errors.functionName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="returnType" className="text-base font-semibold text-gray-900 mb-3 block">
                    Kiểu dữ liệu trả về <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="returnType"
                    {...form.register("returnType")}
                    className="h-12 text-base block w-full rounded-md border-2 border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.values(ParamType).map((type) => (
                      <option key={type} value={type}>
                        {ParamTypeInfo[type].displayName} ({ParamTypeInfo[type].javaType})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-base font-semibold text-gray-900">
                      Tham số đầu vào <span className="text-red-500">*</span>
                    </Label>
                    <Button
                      type="button"
                      onClick={() => append({ name: "", type: ParamType.INT })}
                      className="cursor-pointer h-9 px-5 bg-orange-600 hover:bg-orange-700 text-white text-base font-semibold"
                    >
                      + Thêm tham số
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-4 items-start">
                        <div className="flex-1">
                          <Input
                            {...form.register(`parameters.${index}.name`)}
                            placeholder="Tên tham số (vd: nums, target)"
                            className="h-12 text-base border-2 border-gray-300 focus:border-blue-500"
                          />
                        </div>
                        <div className="flex-1">
                          <select
                            {...form.register(`parameters.${index}.type`)}
                            className="h-12 text-base block w-full rounded-md border-2 border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {Object.values(ParamType).map((type) => (
                              <option key={type} value={type}>
                                {ParamTypeInfo[type].displayName}
                              </option>
                            ))}
                          </select>
                        </div>
                        <Button
                          type="button"
                          onClick={() => remove(index)}
                          isDisabled={fields.length === 1}
                          variant="outline"
                          className="cursor-pointer h-12 px-5 text-base font-semibold text-red-600 border-2 border-gray-300 hover:bg-red-50"
                        >
                          Xóa
                        </Button>
                      </div>
                    ))}
                  </div>
                  {form.formState.errors.parameters && (
                    <p className="text-sm text-red-500 mt-2">{form.formState.errors.parameters.message}</p>
                  )}
                </div>
              </div>
            )}

            {!isEditMode && (
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
            )}

            <Button
              type="submit"
              className="cursor-pointer w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold"
              isDisabled={isPending}
            >
              {isPending ? "Đang xử lý..." : isEditMode ? "Cập nhật bài toán" : "Tạo bài toán"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateProblemContent;
