import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FileCode,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Code2,
  Clock,
  HardDrive,
  Hash,
  GripVertical,
  CheckCircle2,
  Loader2,
  Lightbulb,
} from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Input } from "@workspace/ui/components/Input";
import { Textarea } from "@workspace/ui/components/Textarea";
import { Badge } from "@workspace/ui/components/Badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/Card";
import { Label } from "@workspace/ui/components/label";
import { cn } from "@workspace/ui/lib/utils";
import { Difficulty, Language } from "../types/coding.type";
import { useCreateProblem, useCreateTestCase, useCreateCodeTemplate } from "../queries/useCoding";
import { useNavigate } from "@tanstack/react-router";

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
  testCases: z
    .array(
      z.object({
        input: z.string().min(1, "Input không được trống"),
        expectedOutput: z.string().min(1, "Output không được trống"),
        isSample: z.boolean(),
      }),
    )
    .min(1, "Cần ít nhất 1 test case"),
  codeTemplates: z.array(
    z.object({
      language: z.nativeEnum(Language),
      templateCode: z.string().min(1),
    }),
  ),
});

type FormValues = z.infer<typeof formSchema>;

const difficultyOptions = [
  { value: Difficulty.EASY, label: "Easy", color: "text-emerald-500", bg: "bg-emerald-500" },
  { value: Difficulty.MEDIUM, label: "Medium", color: "text-amber-500", bg: "bg-amber-500" },
  { value: Difficulty.HARD, label: "Hard", color: "text-rose-500", bg: "bg-rose-500" },
];

const languageOptions = [
  { value: Language.CPP, label: "C++", icon: "⚡" },
  { value: Language.JAVA, label: "Java", icon: "☕" },
  { value: Language.PYTHON, label: "Python", icon: "🐍" },
  { value: Language.JAVASCRIPT, label: "JavaScript", icon: "🟨" },
];

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

const CreateProblemContent: React.FC = () => {
  const navigate = useNavigate();
  const [currentTag, setCurrentTag] = useState("");
  const [activeTab, setActiveTab] = useState("basic");

  const createProblem = useCreateProblem();
  const createTestCase = useCreateTestCase();
  const createCodeTemplate = useCreateCodeTemplate();

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
      testCases: [{ input: "", expectedOutput: "", isSample: true }],
      codeTemplates: [{ language: Language.CPP, templateCode: defaultTemplates[Language.CPP] }],
    },
  });

  const {
    fields: testCaseFields,
    append: appendTestCase,
    remove: removeTestCase,
  } = useFieldArray({
    control: form.control,
    name: "testCases",
  });

  const {
    fields: templateFields,
    append: appendTemplate,
    remove: removeTemplate,
  } = useFieldArray({
    control: form.control,
    name: "codeTemplates",
  });

  const watchTitle = form.watch("title");
  const watchTags = form.watch("tags");
  const watchDifficulty = form.watch("difficulty");
  const watchIsPublic = form.watch("isPublic");

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

      const problemId = res.data.data.id;

      await Promise.all(values.testCases.map((tc) => createTestCase.mutateAsync({ problemId, data: tc })));

      await Promise.all(values.codeTemplates.map((ct) => createCodeTemplate.mutateAsync({ problemId, data: ct })));

      // navigate(`/mentor/problems/${problemId}`);
    } catch (error) {
      console.error(error);
    }
  };

  const isSubmitting = createProblem.isPending || createTestCase.isPending || createCodeTemplate.isPending;

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/mentor/problem" })}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-linear-to-br from-violet-500 to-purple-600">
                <FileCode className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Tạo Problem mới</h1>
                <p className="text-sm text-muted-foreground">Thiết lập bài tập coding</p>
              </div>
            </div>
          </div>
          <Button onClick={form.handleSubmit(onSubmit)} isDisabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Lưu Problem
          </Button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-6">
            <div className="flex gap-2 border-b">
              <button
                type="button"
                onClick={() => setActiveTab("basic")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 border-b-2 transition-colors",
                  activeTab === "basic"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <FileCode className="w-4 h-4" />
                Thông tin
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("description")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 border-b-2 transition-colors",
                  activeTab === "description"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <Lightbulb className="w-4 h-4" />
                Mô tả
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("testcases")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 border-b-2 transition-colors",
                  activeTab === "testcases"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <CheckCircle2 className="w-4 h-4" />
                Test Cases
                <Badge variant="secondary" className="ml-1">
                  {testCaseFields.length}
                </Badge>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("templates")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 border-b-2 transition-colors",
                  activeTab === "templates"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <Code2 className="w-4 h-4" />
                Templates
              </button>
            </div>

            {activeTab === "basic" && (
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Tiêu đề *</Label>
                      <Input placeholder="Two Sum" {...form.register("title")} />
                      {form.formState.errors.title && (
                        <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>
                      )}
                    </div>

                    <div>
                      <Label>Slug *</Label>
                      <div className="flex gap-2">
                        <Input placeholder="two-sum" {...form.register("slug")} />
                        <Button type="button" variant="outline" onClick={generateSlug}>
                          Tạo tự động
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        URL: /problems/{form.watch("slug") || "slug"}
                      </p>
                      {form.formState.errors.slug && (
                        <p className="text-sm text-destructive mt-1">{form.formState.errors.slug.message}</p>
                      )}
                    </div>

                    <div>
                      <Label>Độ khó *</Label>
                      <select
                        {...form.register("difficulty")}
                        className="w-full h-9 px-3 py-1 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {difficultyOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <Label>Công khai</Label>
                        <p className="text-sm text-muted-foreground">Cho phép học viên nhìn thấy</p>
                      </div>
                      <input type="checkbox" {...form.register("isPublic")} className="h-5 w-5 rounded border-input" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Giới hạn & Tags</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Time Limit
                        </Label>
                        <div className="relative">
                          <Input type="number" {...form.register("timeLimitMs", { valueAsNumber: true })} />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            ms
                          </span>
                        </div>
                        {form.formState.errors.timeLimitMs && (
                          <p className="text-sm text-destructive mt-1">{form.formState.errors.timeLimitMs.message}</p>
                        )}
                      </div>

                      <div>
                        <Label className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4" />
                          Memory
                        </Label>
                        <div className="relative">
                          <Input type="number" {...form.register("memoryLimitMb", { valueAsNumber: true })} />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            MB
                          </span>
                        </div>
                        {form.formState.errors.memoryLimitMb && (
                          <p className="text-sm text-destructive mt-1">{form.formState.errors.memoryLimitMb.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Tags
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={currentTag}
                          onChange={(e) => setCurrentTag(e.target.value)}
                          placeholder="array, dp..."
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                        />
                        <Button type="button" variant="outline" onClick={addTag}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {watchTags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "description" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mô tả bài toán</CardTitle>
                  <CardDescription>Hỗ trợ Markdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    {...form.register("description")}
                    rows={20}
                    className="font-mono text-sm"
                    placeholder="## Mô tả&#10;..."
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "testcases" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Test Cases</h3>
                    <p className="text-sm text-muted-foreground">Thêm các test case để kiểm tra code</p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => appendTestCase({ input: "", expectedOutput: "", isSample: false })}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm Test Case
                  </Button>
                </div>

                {testCaseFields.map((field, index) => (
                  <Card key={field.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                          <CardTitle className="text-base">Test Case #{index + 1}</CardTitle>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              {...form.register(`testCases.${index}.isSample`)}
                              className="h-4 w-4 rounded border-input"
                            />
                            <Label className="text-sm text-muted-foreground">Sample</Label>
                          </div>
                        </div>
                        {testCaseFields.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeTestCase(index)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Input</Label>
                          <Textarea
                            {...form.register(`testCases.${index}.input`)}
                            rows={5}
                            className="font-mono text-sm"
                          />
                          {form.formState.errors.testCases?.[index]?.input && (
                            <p className="text-sm text-destructive mt-1">
                              {form.formState.errors.testCases[index]?.input?.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label>Expected Output</Label>
                          <Textarea
                            {...form.register(`testCases.${index}.expectedOutput`)}
                            rows={5}
                            className="font-mono text-sm"
                          />
                          {form.formState.errors.testCases?.[index]?.expectedOutput && (
                            <p className="text-sm text-destructive mt-1">
                              {form.formState.errors.testCases[index]?.expectedOutput?.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === "templates" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Code Templates</h3>
                    <p className="text-sm text-muted-foreground">Template code cho từng ngôn ngữ</p>
                  </div>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addLanguageTemplate(e.target.value as Language);
                        e.target.value = "";
                      }
                    }}
                    className="w-48 h-9 px-3 py-1 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
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

                {templateFields.map((field, index) => {
                  const langOpt = languageOptions.find((l) => l.value === field.language);
                  return (
                    <Card key={field.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <span>{langOpt?.icon}</span>
                            {langOpt?.label}
                          </CardTitle>
                          {templateFields.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeTemplate(index)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          {...form.register(`codeTemplates.${index}.templateCode`)}
                          rows={12}
                          className="font-mono text-sm bg-muted/50"
                        />
                        {form.formState.errors.codeTemplates?.[index]?.templateCode && (
                          <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.codeTemplates[index]?.templateCode?.message}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProblemContent;
