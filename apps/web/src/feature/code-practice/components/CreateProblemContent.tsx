import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@workspace/ui/components/Button";
import { Input } from "@workspace/ui/components/Input";
import { Textarea } from "@workspace/ui/components/Textarea";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Label } from "@workspace/ui/components/label";
import { Difficulty, ParamType, ParamTypeInfo } from "../types/coding.type";
import {
  useCreateProblem,
  useGenerateCodeTemplates,
  useBulkCreateTestCases,
  useProblemDetail,
  useUpdateProblem,
} from "../queries/useCoding";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import TagMultiSelect from "../components/TagMultiSelect";

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

const functionParamSchema = z.object({
  name: z.string().min(1, "Tên tham số không được để trống"),
  type: z.nativeEnum(ParamType),
});

const generateTemplateSchema = z.object({
  functionName: z
    .string()
    .min(1, "Tên hàm không được để trống")
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Tên hàm không hợp lệ"),
  returnType: z.nativeEnum(ParamType),
  parameters: z.array(functionParamSchema).min(1, "Cần ít nhất 1 tham số"),
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
  const [testCasesJson, setTestCasesJson] = useState("");
  const [jsonFormatError, setJsonFormatError] = useState<string | null>(null);
  const navigate = useNavigate();

  const isEditMode = mode === "edit" && !!problemId;

  const createProblemMutation = useCreateProblem();
  const updateProblemMutation = useUpdateProblem();
  const generateTemplatesMutation = useGenerateCodeTemplates();
  const bulkCreateTestCasesMutation = useBulkCreateTestCases();

  const { data: problemData, isLoading: isProblemLoading } = useProblemDetail(problemId || "", undefined, {
    enabled: isEditMode,
  });

  const combinedForm = useForm<CombinedFormData>({
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

  const { fields, append, remove } = useFieldArray({
    control: combinedForm.control,
    name: "parameters",
  });

  useEffect(() => {
    if (isEditMode && problemData && !isProblemLoading) {
      combinedForm.setValue("title", problemData.title);
      combinedForm.setValue("slug", problemData.slug);
      combinedForm.setValue("description", problemData.description);
      combinedForm.setValue("difficulty", problemData.difficulty);
      combinedForm.setValue("timeLimitMs", problemData.timeLimitMs);
      combinedForm.setValue("memoryLimitMb", problemData.memoryLimitMb);
      combinedForm.setValue("isPublic", problemData.isPublic);
      combinedForm.setValue("tags", problemData.tags);
      combinedForm.setValue("constraints", problemData.constraints ?? "");
    }
  }, [isEditMode, problemData, isProblemLoading, combinedForm]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    combinedForm.setValue("title", title);
    if (!isEditMode) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      combinedForm.setValue("slug", slug);
    }
  };

  const handleFormatJson = () => {
    if (!testCasesJson.trim()) return;
    let raw = testCasesJson.trim();
    try {
      const parsed = JSON.parse(raw);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      const normalized = arr.map((item) => ({
        input: String(item.input ?? ""),
        expectedOutput: String(item.expectedOutput ?? ""),
        isSample: typeof item.isSample === "boolean" ? item.isSample : false,
      }));
      setTestCasesJson(JSON.stringify(normalized, null, 2));
      setJsonFormatError(null);
      return;
    } catch {}
    try {
      const match = raw.match(/testCases\s*:\s*(\[[\s\S]*\])/);
      if (match) raw = match[1] || "";
      const jsonLike = raw
        .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
        .replace(/:\s*'([^']*)'/g, ': "$1"')
        .replace(/,\s*([}\]])/g, "$1");
      const parsed = JSON.parse(jsonLike);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      const normalized = arr.map((item) => ({
        input: String(item.input ?? ""),
        expectedOutput: String(item.expectedOutput ?? ""),
        isSample: typeof item.isSample === "boolean" ? item.isSample : false,
      }));
      setTestCasesJson(JSON.stringify(normalized, null, 2));
      setJsonFormatError(null);
    } catch {
      setJsonFormatError("Không thể tự động định dạng, vui lòng nhập đúng JSON");
    }
  };

  const onSubmitCombined = async (data: CombinedFormData) => {
    if (!isEditMode) {
      if (!testCasesJson.trim()) {
        setJsonFormatError("Vui lòng nhập test cases trước khi tạo bài toán");
        return;
      }
      try {
        const parsed = JSON.parse(testCasesJson);
        if (!Array.isArray(parsed)) throw new Error();
        const isNormalized = parsed.every(
          (item) =>
            typeof item.input === "string" &&
            typeof item.expectedOutput === "string" &&
            typeof item.isSample === "boolean",
        );
        if (!isNormalized) {
          setJsonFormatError("Vui lòng nhấn 'Định dạng JSON' trước khi tạo bài toán");
          return;
        }
      } catch {
        setJsonFormatError("JSON không hợp lệ, vui lòng định dạng lại trước khi tạo");
        return;
      }
    }

    try {
      const problemDataPayload: ProblemFormData = {
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

      if (isEditMode && problemId) {
        await updateProblemMutation.mutateAsync({ problemId, data: problemDataPayload });
        navigate({ to: "/mentor/problem" });
        return;
      }

      const response = await createProblemMutation.mutateAsync(problemDataPayload);
      const newProblemId = response.data.data?.id;
      if (!newProblemId) throw new Error("Không thể lấy ID bài toán");

      const templateData: GenerateTemplateFormData = {
        functionName: data.functionName,
        returnType: data.returnType,
        parameters: data.parameters,
      };
      await generateTemplatesMutation.mutateAsync({ problemId: newProblemId, data: templateData });

      const testCases = JSON.parse(testCasesJson);
      await bulkCreateTestCasesMutation.mutateAsync({
        problemId: newProblemId,
        data: { testCases, replaceExisting: false },
      });

      navigate({ to: "/mentor/problem" });
    } catch (error) {
      console.error("Lỗi khi xử lý bài toán:", error);
      if (error instanceof SyntaxError) {
        setJsonFormatError("JSON test cases không hợp lệ");
      }
    }
  };

  const isPending =
    createProblemMutation.isPending ||
    updateProblemMutation.isPending ||
    generateTemplatesMutation.isPending ||
    bulkCreateTestCasesMutation.isPending;

  if (isEditMode && isProblemLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
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
          className="gap-2 mb-4 border-gray-200 bg-white shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
          onClick={() =>
            navigate({
              to: isEditMode ? `/mentor/problem/${problemId}/` : "/mentor/problem",
            })
          }
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
          <form onSubmit={combinedForm.handleSubmit(onSubmitCombined)} className="space-y-10">
            {/* Thông tin cơ bản */}
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
                  {...combinedForm.register("title")}
                  onChange={handleTitleChange}
                  placeholder="Ví dụ: Tổng hai số"
                  className="h-12 text-base border-2 border-gray-300 focus:border-blue-500"
                />
                {combinedForm.formState.errors.title && (
                  <p className="text-sm text-red-500 mt-2">{combinedForm.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="slug" className="text-base font-semibold text-gray-900 mb-3 block">
                  Đường dẫn (Slug) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="slug"
                  {...combinedForm.register("slug")}
                  placeholder="tong-hai-so"
                  className="h-12 text-base border-2 border-gray-300 focus:border-blue-500"
                  disabled={!!isEditMode}
                />
                {combinedForm.formState.errors.slug && (
                  <p className="text-sm text-red-500 mt-2">{combinedForm.formState.errors.slug.message}</p>
                )}
                {isEditMode && <p className="text-sm text-gray-500 mt-2">Slug không thể thay đổi khi chỉnh sửa</p>}
              </div>

              <div>
                <Label htmlFor="description" className="text-base font-semibold text-gray-900 mb-3 block">
                  Mô tả đề bài <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  {...combinedForm.register("description")}
                  rows={8}
                  placeholder="Nhập mô tả chi tiết về đề bài, yêu cầu, ví dụ..."
                  className="text-base border-2 border-gray-300 focus:border-blue-500"
                />
                {combinedForm.formState.errors.description && (
                  <p className="text-sm text-red-500 mt-2">{combinedForm.formState.errors.description.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="constraints" className="text-base font-semibold text-gray-900 mb-3 block">
                  Ràng buộc
                </Label>
                <Textarea
                  id="constraints"
                  {...combinedForm.register("constraints")}
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
                    {...combinedForm.register("difficulty")}
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
                    {...combinedForm.register("timeLimitMs", { valueAsNumber: true })}
                    className="h-12 text-base border-2 border-gray-300 focus:border-blue-500"
                  />
                  {combinedForm.formState.errors.timeLimitMs && (
                    <p className="text-sm text-red-500 mt-2">{combinedForm.formState.errors.timeLimitMs.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="memoryLimitMb" className="text-base font-semibold text-gray-900 mb-3 block">
                    Giới hạn bộ nhớ (MB) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="memoryLimitMb"
                    type="number"
                    {...combinedForm.register("memoryLimitMb", { valueAsNumber: true })}
                    className="h-12 text-base border-2 border-gray-300 focus:border-blue-500"
                  />
                  {combinedForm.formState.errors.memoryLimitMb && (
                    <p className="text-sm text-red-500 mt-2">{combinedForm.formState.errors.memoryLimitMb.message}</p>
                  )}
                </div>
              </div>

              {/* Tags - TagMultiSelect thay thế input tự nhập */}
              <div>
                <Label className="text-base font-semibold text-gray-900 mb-3 block">Thẻ tag</Label>
                <TagMultiSelect
                  value={combinedForm.watch("tags")}
                  onChange={(tags) => combinedForm.setValue("tags", tags)}
                  placeholder="Chọn tags..."
                  className="text-base"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  {...combinedForm.register("isPublic")}
                  className="w-5 h-5 text-blue-600 rounded border-2 border-gray-300 focus:ring-blue-500"
                />
                <Label htmlFor="isPublic" className="cursor-pointer text-base font-medium text-gray-700">
                  Công khai (hiển thị cho tất cả người dùng)
                </Label>
              </div>
            </div>

            {/* Code templates - chỉ khi create */}
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
                    {...combinedForm.register("functionName")}
                    placeholder="solution"
                    className="h-12 text-base border-2 border-gray-300 focus:border-blue-500"
                  />
                  {combinedForm.formState.errors.functionName && (
                    <p className="text-sm text-red-500 mt-2">{combinedForm.formState.errors.functionName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="returnType" className="text-base font-semibold text-gray-900 mb-3 block">
                    Kiểu dữ liệu trả về <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="returnType"
                    {...combinedForm.register("returnType")}
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
                            {...combinedForm.register(`parameters.${index}.name`)}
                            placeholder="Tên tham số (vd: nums, target)"
                            className="h-12 text-base border-2 border-gray-300 focus:border-blue-500"
                          />
                        </div>
                        <div className="flex-1">
                          <select
                            {...combinedForm.register(`parameters.${index}.type`)}
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
                  {combinedForm.formState.errors.parameters && (
                    <p className="text-sm text-red-500 mt-2">{combinedForm.formState.errors.parameters.message}</p>
                  )}
                </div>
              </div>
            )}

            {!isEditMode && (
              <div className="space-y-6">
                <div className="border-b-2 border-gray-200 pb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Test Cases <span className="text-red-500">*</span>
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Nhập các test cases theo định dạng JSON</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label htmlFor="testcases" className="text-base font-semibold text-gray-900">
                      Dữ liệu JSON <span className="text-red-500">*</span>
                    </Label>
                    <Button
                      type="button"
                      onClick={handleFormatJson}
                      variant="outline"
                      className="h-10 px-4 text-sm font-semibold border-2 border-gray-300 hover:bg-gray-50"
                      isDisabled={!testCasesJson.trim()}
                    >
                      Định dạng JSON
                    </Button>
                  </div>
                  <Textarea
                    id="testcases"
                    value={testCasesJson}
                    onChange={(e) => {
                      setTestCasesJson(e.target.value);
                      setJsonFormatError(null);
                    }}
                    rows={15}
                    placeholder={`[\n  {\n    "input": "1\\\\n2",\n    "expectedOutput": "3",\n    "isSample": true\n  }\n]`}
                    className={`font-mono text-base border-2 focus:border-blue-500 ${jsonFormatError ? "border-red-300 focus:border-red-500" : "border-gray-300"}`}
                  />
                  {jsonFormatError && <p className="text-sm text-red-500 mt-2">❌ {jsonFormatError}</p>}
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 p-5 rounded-lg">
                  <p className="font-semibold text-base text-blue-900 mb-3">📋 Hướng dẫn định dạng:</p>
                  <ul className="list-disc list-inside space-y-2 text-base text-blue-800">
                    <li>
                      Mỗi test case cần có: <code className="bg-blue-100 px-2 py-0.5 rounded">input</code>,{" "}
                      <code className="bg-blue-100 px-2 py-0.5 rounded">expectedOutput</code>
                    </li>
                    <li>
                      <code className="bg-blue-100 px-2 py-0.5 rounded">isSample</code> (tùy chọn): true để hiển thị cho
                      người dùng
                    </li>
                    <li>
                      Dữ liệu input/output phân tách bằng <code className="bg-blue-100 px-2 py-0.5 rounded">\n</code>{" "}
                      cho nhiều dòng
                    </li>
                  </ul>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="cursor-pointer w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold"
              isDisabled={isPending}
            >
              {isPending ? "Đang xử lý..." : isEditMode ? "💾 Cập nhật bài toán" : "🚀 Tạo bài toán"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateProblemContent;
