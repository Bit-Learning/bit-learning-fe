import React, { useState, useRef } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Plus, Trash2, Upload, FileJson, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { Difficulty, ParamType, ParamTypeInfo } from "../types/problem.type";
import {
  useCreateProblem,
  useGenerateCodeTemplates,
  useBulkCreateTestCases,
  useImportTestCasesFromFile,
} from "../queries/useProblem";
import { useAddProblem, useContestProblems } from "../queries/useContest";

const schema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  slug: z
    .string()
    .min(1, "Slug không được để trống")
    .regex(/^[a-z0-9-]+$/, "Slug chỉ chứa chữ thường, số và dấu gạch ngang"),
  description: z.string().min(1, "Mô tả không được để trống"),
  constraints: z.string().optional(),
  difficulty: z.nativeEnum(Difficulty),
  timeLimitMs: z.number().min(100).max(30000),
  memoryLimitMb: z.number().min(8).max(512),
  functionName: z
    .string()
    .min(1, "Tên hàm không được để trống")
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Tên hàm không hợp lệ"),
  returnType: z.nativeEnum(ParamType),
  parameters: z.array(z.object({ name: z.string().min(1, "Bắt buộc"), type: z.nativeEnum(ParamType) })).min(1),
});

type FormData = z.infer<typeof schema>;

type TestCaseMode = "json" | "file";

interface CreateContestProblemProps {
  contestId: string;
  onBack: () => void;
  onSuccess: () => void;
}

const CreateContestProblem: React.FC<CreateContestProblemProps> = ({ contestId, onBack, onSuccess }) => {
  const [testCasesJson, setTestCasesJson] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [testCaseMode, setTestCaseMode] = useState<TestCaseMode>("json");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createProblem = useCreateProblem();
  const generateTemplates = useGenerateCodeTemplates();
  const bulkCreateTestCases = useBulkCreateTestCases();
  const importTestCases = useImportTestCasesFromFile();
  const addProblem = useAddProblem();
  const { data: contestProblems } = useContestProblems(contestId);

  const form = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      constraints: "",
      difficulty: Difficulty.EASY,
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      functionName: "solution",
      returnType: ParamType.INT,
      parameters: [{ name: "nums", type: ParamType.INT }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "parameters",
  });

  const removeVietnameseTones = (str: string): string => {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    return str;
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue("title", title);
    const slug = removeVietnameseTones(title)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    form.setValue("slug", slug);
  };

  const handleFormatJson = () => {
    if (!testCasesJson.trim()) return;
    try {
      const parsed = JSON.parse(testCasesJson);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      const normalized = arr.map((item) => ({
        input: String(item.input ?? ""),
        expectedOutput: String(item.expectedOutput ?? ""),
        isSample: typeof item.isSample === "boolean" ? item.isSample : false,
      }));
      setTestCasesJson(JSON.stringify(normalized, null, 2));
      setJsonError(null);
    } catch {
      setJsonError("JSON không hợp lệ, vui lòng kiểm tra lại");
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setUploadedFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file);
  };

  const onSubmit = async (data: FormData) => {
    if (testCaseMode === "json") {
      if (!testCasesJson.trim()) {
        setJsonError("Vui lòng nhập test cases");
        return;
      }
      try {
        const parsed = JSON.parse(testCasesJson);
        if (!Array.isArray(parsed)) throw new Error();
      } catch {
        setJsonError("JSON không hợp lệ");
        return;
      }
    } else {
      if (!uploadedFile) {
        setJsonError("Vui lòng chọn file test cases");
        return;
      }
    }

    try {
      const createRes = await createProblem.mutateAsync({
        title: data.title,
        slug: data.slug,
        description: data.description,
        constraints: data.constraints || undefined,
        difficulty: data.difficulty,
        timeLimitMs: data.timeLimitMs,
        memoryLimitMb: data.memoryLimitMb,
        isPublic: false,
      });

      const newProblemId = createRes.data.data?.id;
      if (!newProblemId) throw new Error("Không thể lấy ID bài toán");

      await generateTemplates.mutateAsync({
        problemId: newProblemId,
        data: {
          functionName: data.functionName,
          returnType: data.returnType,
          parameters: data.parameters,
        },
      });

      if (testCaseMode === "json") {
        const testCases = JSON.parse(testCasesJson);
        await bulkCreateTestCases.mutateAsync({
          problemId: newProblemId,
          data: { testCases, replaceExisting: false },
        });
      } else {
        await importTestCases.mutateAsync({
          problemId: newProblemId,
          file: uploadedFile!,
          replaceExisting,
        });
      }

      await addProblem.mutateAsync({
        contestId,
        request: {
          problemId: newProblemId,
          orderIndex: (contestProblems?.length || 0) + 1,
        },
      });

      onSuccess();
    } catch (error) {
      console.error("Lỗi tạo bài toán:", error);
    }
  };

  const isPending =
    createProblem.isPending ||
    generateTemplates.isPending ||
    bulkCreateTestCases.isPending ||
    importTestCases.isPending ||
    addProblem.isPending;

  const difficultyOptions = [
    { value: Difficulty.EASY, label: "Dễ", color: "text-green-600 bg-green-50 border-green-200" },
    { value: Difficulty.MEDIUM, label: "Trung bình", color: "text-orange-600 bg-orange-50 border-orange-200" },
    { value: Difficulty.HARD, label: "Khó", color: "text-red-600 bg-red-50 border-red-200" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 px-8 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
          <span className="text-gray-300">|</span>
          <h1 className="text-base font-bold text-gray-900">Tạo bài tập mới</h1>
          <Badge variant="outline" className="text-xs font-medium text-orange-600 bg-orange-50 border-orange-200">
            Không công khai
          </Badge>
        </div>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isPending}
          className="gap-2 bg-primary hover:bg-blue-700 text-white min-w-36"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Tạo &amp; thêm vào thi
            </>
          )}
        </Button>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-8 py-8 space-y-8">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="px-6 space-y-6">
            <SectionTitle>Thông tin cơ bản</SectionTitle>

            <FieldGroup label="Tiêu đề" required error={form.formState.errors.title?.message}>
              <Input
                {...form.register("title")}
                onChange={handleTitleChange}
                placeholder="Ví dụ: Tổng hai số"
                className="h-11 border-gray-300 focus:border-primary"
              />
            </FieldGroup>

            <FieldGroup label="Đường dẫn (Slug)" required error={form.formState.errors.slug?.message}>
              <Input
                {...form.register("slug")}
                placeholder="tong-hai-so"
                className="h-11 border-gray-300 focus:border-primary font-mono text-sm"
              />
            </FieldGroup>

            <FieldGroup label="Mô tả đề bài" required error={form.formState.errors.description?.message}>
              <Textarea
                {...form.register("description")}
                rows={7}
                placeholder="Nhập mô tả chi tiết về đề bài, yêu cầu, ví dụ..."
                className="border-gray-300 focus:border-primary"
              />
            </FieldGroup>

            <FieldGroup label="Ràng buộc">
              <Textarea
                {...form.register("constraints")}
                rows={3}
                placeholder="Ví dụ: 1 ≤ n ≤ 10^5, -10^9 ≤ nums[i] ≤ 10^9"
                className="border-gray-300 focus:border-primary font-mono text-sm"
              />
            </FieldGroup>

            <div className="grid grid-cols-3 gap-5">
              <FieldGroup label="Độ khó" required>
                <div className="flex gap-2">
                  {difficultyOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => form.setValue("difficulty", opt.value)}
                      className={cn(
                        "flex-1 py-3 text-xs font-bold rounded-lg border-2 transition-all",
                        form.watch("difficulty") === opt.value
                          ? opt.color + " border-current"
                          : "text-gray-500 bg-white border-gray-200 hover:border-gray-300",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </FieldGroup>

              <FieldGroup label="Giới hạn thời gian (ms)" required error={form.formState.errors.timeLimitMs?.message}>
                <Input
                  type="number"
                  {...form.register("timeLimitMs", { valueAsNumber: true })}
                  className="h-11 border-gray-300 focus:border-primary"
                />
              </FieldGroup>

              <FieldGroup label="Giới hạn bộ nhớ (MB)" required error={form.formState.errors.memoryLimitMb?.message}>
                <Input
                  type="number"
                  {...form.register("memoryLimitMb", { valueAsNumber: true })}
                  className="h-11 border-gray-300 focus:border-primary"
                />
              </FieldGroup>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="px-6 space-y-6">
            <SectionTitle subtitle="Tự động tạo template cho Python, Java, C++, JavaScript">
              Cấu hình Code Template
            </SectionTitle>

            <div className="grid grid-cols-2 gap-5">
              <FieldGroup label="Tên hàm" required error={form.formState.errors.functionName?.message}>
                <Input
                  {...form.register("functionName")}
                  placeholder="solution"
                  className="h-11 border-gray-300 focus:border-primary font-mono"
                />
              </FieldGroup>

              <FieldGroup label="Kiểu trả về" required>
                <select
                  {...form.register("returnType")}
                  className="h-11 w-full rounded-md border-2 border-gray-300 px-3 text-sm focus:border-primary focus:outline-none"
                >
                  {Object.values(ParamType).map((type) => (
                    <option key={type} value={type}>
                      {ParamTypeInfo[type].displayName} ({ParamTypeInfo[type].javaType})
                    </option>
                  ))}
                </select>
              </FieldGroup>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-semibold text-gray-900">
                  Tham số đầu vào <span className="text-red-500">*</span>
                </Label>
                <button
                  type="button"
                  onClick={() => append({ name: "", type: ParamType.INT })}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm tham số
                </button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-3 items-center">
                    <Input
                      {...form.register(`parameters.${index}.name`)}
                      placeholder="Tên tham số (vd: nums, target)"
                      className="h-10 border-gray-300 focus:border-primary font-mono text-sm flex-1"
                    />
                    <select
                      {...form.register(`parameters.${index}.type`)}
                      className="h-10 rounded-md border-2 border-gray-300 px-3 text-sm focus:border-primary focus:outline-none flex-1"
                    >
                      {Object.values(ParamType).map((type) => (
                        <option key={type} value={type}>
                          {ParamTypeInfo[type].displayName}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="px-6 space-y-5">
            <SectionTitle subtitle="Nhập test cases theo JSON hoặc import từ file">Test Cases</SectionTitle>

            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
              {(["json", "file"] as TestCaseMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTestCaseMode(m)}
                  className={cn(
                    "px-5 py-2 text-sm font-semibold rounded-md transition-all",
                    testCaseMode === m ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700",
                  )}
                >
                  {m === "json" ? (
                    <span className="flex items-center gap-2">
                      <FileJson className="w-4 h-4" />
                      Nhập JSON
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Import file
                    </span>
                  )}
                </button>
              ))}
            </div>

            {testCaseMode === "json" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-gray-900">
                    Dữ liệu JSON <span className="text-red-500">*</span>
                  </Label>
                  <button
                    type="button"
                    onClick={handleFormatJson}
                    disabled={!testCasesJson.trim()}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Định dạng JSON
                  </button>
                </div>
                <Textarea
                  value={testCasesJson}
                  onChange={(e) => {
                    setTestCasesJson(e.target.value);
                    setJsonError(null);
                  }}
                  rows={14}
                  placeholder={`[\n  {\n    "input": "1\\n2",\n    "expectedOutput": "3",\n    "isSample": true\n  }\n]`}
                  className={cn(
                    "font-mono text-sm border-2",
                    jsonError ? "border-red-300 focus:border-red-500" : "border-gray-300 focus:border-primary",
                  )}
                />
                {jsonError && <p className="text-sm text-red-500">❌ {jsonError}</p>}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-blue-700 space-y-1">
                  <p className="font-semibold mb-1.5">Hướng dẫn:</p>
                  <p>
                    • Mỗi test case cần có <code className="bg-blue-100 px-1 rounded">input</code> và{" "}
                    <code className="bg-blue-100 px-1 rounded">expectedOutput</code>
                  </p>
                  <p>
                    • <code className="bg-blue-100 px-1 rounded">isSample: true</code> để hiển thị cho người dùng
                  </p>
                  <p>
                    • Phân tách nhiều dòng bằng <code className="bg-blue-100 px-1 rounded">\n</code>
                  </p>
                </div>
              </div>
            )}

            {testCaseMode === "file" && (
              <div className="space-y-4">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all",
                    isDragging
                      ? "border-primary bg-blue-50"
                      : uploadedFile
                        ? "border-green-400 bg-green-50"
                        : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-white",
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.zip,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {uploadedFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                      <p className="font-semibold text-gray-900">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-500">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFile(null);
                        }}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 mt-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        Xóa file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-10 h-10 text-gray-400" />
                      <p className="font-semibold text-gray-700">
                        Kéo thả file vào đây hoặc <span className="text-primary">chọn file</span>
                      </p>
                      <p className="text-xs text-gray-400">Hỗ trợ .json, .txt</p>
                    </div>
                  )}
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setReplaceExisting(!replaceExisting)}
                    className={cn(
                      "w-10 h-6 rounded-full flex items-center transition-colors px-1",
                      replaceExisting ? "bg-primary" : "bg-gray-300",
                    )}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 bg-white rounded-full shadow transition-transform",
                        replaceExisting ? "translate-x-4" : "translate-x-0",
                      )}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Thay thế test cases hiện có</span>
                </label>

                {jsonError && <p className="text-sm text-red-500">❌ {jsonError}</p>}

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-sm text-amber-700 space-y-1">
                  <p className="font-semibold mb-1.5">Định dạng file hỗ trợ:</p>
                  <p>
                    • <strong>.json</strong>: Mảng JSON với các trường input, expectedOutput, isSample
                  </p>
                  <p>
                    • <strong>.zip</strong>: Chứa các cặp file .in và .out
                  </p>
                  <p>
                    • <strong>.txt</strong>: Định dạng phân tách theo dòng
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isPending}
          className="w-full h-12 text-base font-semibold bg-primary hover:bg-blue-700 text-white gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang tạo bài toán...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Tạo bài toán &amp; thêm vào kỳ thi
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

const SectionTitle: React.FC<{ children: React.ReactNode; subtitle?: string }> = ({ children, subtitle }) => (
  <div className="border-b border-gray-100 pb-4">
    <h2 className="text-lg font-bold text-gray-900">{children}</h2>
    {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
  </div>
);

const FieldGroup: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}> = ({ label, required, error, children }) => (
  <div className="space-y-2">
    <Label className="text-sm font-semibold text-gray-900">
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

export default CreateContestProblem;
