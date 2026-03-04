import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Save,
  Plus,
  Trash2,
  Clock,
  HardDrive,
  Loader2,
  Info,
  FileText,
  Tag,
  Eye,
  CheckCircle2,
  Code2,
  GripVertical,
} from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Input } from "@workspace/ui/components/Input";
import { Textarea } from "@workspace/ui/components/Textarea";
import { Badge } from "@workspace/ui/components/Badge";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Label } from "@workspace/ui/components/label";
import { cn } from "@workspace/ui/lib/utils";
import { Difficulty, Language } from "../types/coding.type";
import {
  useCreateProblem,
  useUpdateProblem,
  useCreateTestCase,
  useCreateCodeTemplate,
  useProblemDetail,
} from "../queries/useCoding";
import { useNavigate, useParams } from "@tanstack/react-router";

const formSchema = z.object({
  title: z.string().min(3, "Tiêu đề ít nhất 3 ký tự").max(200),
  slug: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Chỉ chứa chữ thường, số và dấu -"),
  description: z.string().min(50, "Mô tả ít nhất 50 ký tự"),
  difficulty: z.nativeEnum(Difficulty),
  timeLimitMs: z.number().min(100).max(30000),
  memoryLimitMb: z.number().min(16).max(1024),
  isPublic: z.boolean(),
  tags: z.array(z.string()),
  codeTemplates: z.array(
    z.object({
      language: z.nativeEnum(Language),
      templateCode: z.string().min(1),
    }),
  ),
});

type FormValues = z.infer<typeof formSchema>;

const defaultTemplates: Record<Language, string> = {
  [Language.CPP]: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Your code here

    return 0;
}`,
  [Language.JAVA]: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Your code here
    }
}`,
  [Language.PYTHON]: `# Your code here
`,
  [Language.JAVASCRIPT]: `const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Your code here
`,
};

const languageOptions = [
  { value: Language.CPP, label: "C++", icon: "⚡" },
  { value: Language.JAVA, label: "Java", icon: "☕" },
  { value: Language.PYTHON, label: "Python", icon: "🐍" },
  { value: Language.JAVASCRIPT, label: "JavaScript", icon: "🟨" },
];

const CreateProblemContent: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const problemId = params?.id;
  const isEditMode = !!problemId;

  const [currentTag, setCurrentTag] = useState("");

  const createProblem = useCreateProblem();
  const updateProblem = useUpdateProblem();
  const createTestCase = useCreateTestCase();
  const createCodeTemplate = useCreateCodeTemplate();

  const { data: existingProblem, isLoading: isLoadingProblem } = useProblemDetail(problemId || "", Language.PYTHON, {
    enabled: isEditMode,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      difficulty: Difficulty.EASY,
      timeLimitMs: 1000,
      memoryLimitMb: 256,
      isPublic: false,
      tags: [],
      codeTemplates: [{ language: Language.PYTHON, templateCode: defaultTemplates[Language.PYTHON] }],
    },
  });

  const {
    fields: templateFields,
    append: appendTemplate,
    remove: removeTemplate,
  } = useFieldArray({
    control: form.control,
    name: "codeTemplates",
  });

  // Load existing data when in edit mode
  useEffect(() => {
    if (isEditMode && existingProblem) {
      form.reset({
        title: existingProblem.title,
        slug: existingProblem.slug,
        description: existingProblem.description,
        difficulty: existingProblem.difficulty,
        timeLimitMs: existingProblem.timeLimitMs,
        memoryLimitMb: existingProblem.memoryLimitMb,
        isPublic: existingProblem.isPublic,
        tags: existingProblem.tags || [],
        codeTemplates: [{ language: Language.PYTHON, templateCode: existingProblem.codeTemplate }],
      });
    }
  }, [existingProblem, isEditMode, form]);

  const watchTitle = form.watch("title");
  const watchTags = form.watch("tags");

  const generateSlug = () => {
    const slug = watchTitle
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    form.setValue("slug", slug);
  };

  const addTag = () => {
    if (currentTag && !watchTags.includes(currentTag)) {
      form.setValue("tags", [...watchTags, currentTag]);
      setCurrentTag("");
    }
  };

  const removeTag = (tag: string) => {
    form.setValue(
      "tags",
      watchTags.filter((t) => t !== tag),
    );
  };

  const addLanguageTemplate = (lang: Language) => {
    const exists = templateFields.some((f) => f.language === lang);
    if (!exists) {
      appendTemplate({ language: lang, templateCode: defaultTemplates[lang] });
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      let finalProblemId = problemId;

      if (isEditMode) {
        // Update existing problem
        await updateProblem.mutateAsync({
          problemId: problemId!,
          data: {
            title: values.title,
            slug: values.slug,
            description: values.description,
            difficulty: values.difficulty,
            timeLimitMs: values.timeLimitMs,
            memoryLimitMb: values.memoryLimitMb,
            isPublic: values.isPublic,
            tags: values.tags,
          },
        });
      } else {
        // Create new problem
        const res = await createProblem.mutateAsync({
          title: values.title,
          slug: values.slug,
          description: values.description,
          difficulty: values.difficulty,
          timeLimitMs: values.timeLimitMs,
          memoryLimitMb: values.memoryLimitMb,
          isPublic: values.isPublic,
          tags: values.tags,
        });

        if (!res.data?.data?.id) {
          throw new Error("Failed to create problem: missing problem ID");
        }

        finalProblemId = res.data.data.id;
      }

      if (finalProblemId) {
        await Promise.all(
          values.codeTemplates.map((ct) => createCodeTemplate.mutateAsync({ problemId: finalProblemId!, data: ct })),
        );
      }

      navigate({ to: "/mentor/problem" });
    } catch (error) {
      console.error(error);
    }
  };

  const isSubmitting =
    createProblem.isPending || updateProblem.isPending || createTestCase.isPending || createCodeTemplate.isPending;

  if (isEditMode && isLoadingProblem) {
    return <div className="p-8">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-8 h-20 flex items-center justify-between">
          <div>
            <nav className="flex text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
              <span onClick={() => navigate({ to: "/mentor/problem" })} className="hover:text-blue-600 cursor-pointer">
                Bài tập thực hành
              </span>
              <span className="mx-2">/</span>
              <span className="text-slate-400 dark:text-slate-600">
                {isEditMode ? "Chỉnh sửa bài tập" : "Tạo bài tập mới"}
              </span>
            </nav>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              {isEditMode ? "Chỉnh sửa bài tập" : "Tạo bài tập mới"}
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-10 space-y-8">
        {/* Thông tin cơ bản */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <h2 className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-white">
              <Info className="w-5 h-5 text-blue-600" />
              Thông tin cơ bản
            </h2>
          </div>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tiêu đề bài tập</Label>
                <Input {...form.register("title")} placeholder="VD: Two Sum" className="bg-white dark:bg-slate-800" />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Slug (URL)</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={generateSlug} className="text-xs h-6">
                    Tạo tự động
                  </Button>
                </div>
                <Input {...form.register("slug")} placeholder="two-sum" className="bg-slate-50 dark:bg-slate-800/50" />
                {form.formState.errors.slug && (
                  <p className="text-sm text-red-500">{form.formState.errors.slug.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mức độ</Label>
              <div className="flex gap-3">
                <label className="flex-1 cursor-pointer">
                  <input
                    {...form.register("difficulty")}
                    type="radio"
                    value={Difficulty.EASY}
                    className="hidden peer"
                  />
                  <div className="text-center py-2.5 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-400 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-600 dark:peer-checked:bg-emerald-500/10 dark:peer-checked:text-emerald-400 transition-all">
                    Dễ
                  </div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input
                    {...form.register("difficulty")}
                    type="radio"
                    value={Difficulty.MEDIUM}
                    className="hidden peer"
                  />
                  <div className="text-center py-2.5 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-400 peer-checked:border-amber-500 peer-checked:bg-amber-50 peer-checked:text-amber-600 dark:peer-checked:bg-amber-500/10 dark:peer-checked:text-amber-400 transition-all">
                    Trung bình
                  </div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input
                    {...form.register("difficulty")}
                    type="radio"
                    value={Difficulty.HARD}
                    className="hidden peer"
                  />
                  <div className="text-center py-2.5 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-400 peer-checked:border-red-500 peer-checked:bg-red-50 peer-checked:text-red-600 dark:peer-checked:bg-red-500/10 dark:peer-checked:text-red-400 transition-all">
                    Khó
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Giới hạn thời gian (ms)
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="number"
                    {...form.register("timeLimitMs", { valueAsNumber: true })}
                    className="pl-10 bg-white dark:bg-slate-800"
                  />
                </div>
                {form.formState.errors.timeLimitMs && (
                  <p className="text-sm text-red-500">{form.formState.errors.timeLimitMs.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Giới hạn bộ nhớ (MB)</Label>
                <div className="relative">
                  <HardDrive className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="number"
                    {...form.register("memoryLimitMb", { valueAsNumber: true })}
                    className="pl-10 bg-white dark:bg-slate-800"
                  />
                </div>
                {form.formState.errors.memoryLimitMb && (
                  <p className="text-sm text-red-500">{form.formState.errors.memoryLimitMb.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nội dung đề bài */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <h2 className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-white">
              <FileText className="w-5 h-5 text-blue-600" />
              Nội dung đề bài
            </h2>
          </div>
          <CardContent className="p-6">
            <Textarea
              {...form.register("description")}
              rows={12}
              className="font-mono text-sm bg-white dark:bg-slate-900 resize-none"
              placeholder="Nhập mô tả chi tiết bài tập tại đây..."
            />
            <p className="mt-3 text-xs text-slate-400">
              Bạn có thể sử dụng Markdown để trình bày đề bài chuyên nghiệp hơn.
            </p>
            {form.formState.errors.description && (
              <p className="text-sm text-red-500 mt-2">{form.formState.errors.description.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Code Templates */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                <Code2 className="w-5 h-5 text-blue-600" />
                Code Templates
              </h2>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addLanguageTemplate(e.target.value as Language);
                    e.target.value = "";
                  }
                }}
                className="text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-3 py-1.5"
              >
                <option value="">Thêm ngôn ngữ</option>
                {languageOptions
                  .filter((l) => !templateFields.some((f) => f.language === l.value))
                  .map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.icon} {lang.label}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <CardContent className="p-6 space-y-4">
            {templateFields.map((field, index) => {
              const langOpt = languageOptions.find((l) => l.value === field.language);
              return (
                <Card key={field.id} className="bg-slate-50 dark:bg-slate-900/50">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-sm font-semibold flex items-center gap-2">
                      <span>{langOpt?.icon}</span>
                      {langOpt?.label}
                    </span>
                    {templateFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTemplate(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <Textarea
                      {...form.register(`codeTemplates.${index}.templateCode`)}
                      rows={12}
                      className="font-mono text-sm bg-slate-900 text-slate-300"
                    />
                    {form.formState.errors.codeTemplates?.[index]?.templateCode && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.codeTemplates[index]?.templateCode?.message}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>

        {/* Grid 2 columns */}
        <div className="grid grid-cols-2 gap-8">
          {/* Gắn thẻ */}
          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                <Tag className="w-5 h-5 text-blue-600" />
                Gắn thẻ
              </h2>
            </div>
            <CardContent className="p-6 space-y-3">
              <div className="flex gap-2">
                <Input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="array, dp..."
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  className="bg-white dark:bg-slate-800"
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {watchTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-slate-400 italic">Thêm các tag để phân loại bài tập.</p>
            </CardContent>
          </Card>

          {/* Cài đặt hiển thị */}
          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                <Eye className="w-5 h-5 text-blue-600" />
                Cài đặt hiển thị
              </h2>
            </div>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Công khai bài tập</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Mọi người đều có thể thấy bài tập này
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" {...form.register("isPublic")} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 pb-12">
          <Button variant="outline" onClick={() => navigate({ to: "/mentor/problem" })} className="px-8 py-3">
            Hủy
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            isDisabled={isSubmitting}
            className="px-10 py-5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/30 gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isEditMode ? "Cập nhật bài tập" : "Tạo bài tập"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateProblemContent;
