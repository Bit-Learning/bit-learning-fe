import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, Trash2, AlertCircle, Check } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Input } from "@workspace/ui/components/Input";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/Card";
import { Label } from "@workspace/ui/components/label";
import { toast } from "@workspace/ui/components/Sonner";
import { useCreateQuestion } from "../queries/useQuestion";
import type { QuestionRequest, OptionRequest, QuestionType, QuestionLevel } from "../types/question.type";
import { useSubjectsList } from "@/feature/matrix/queries/useSubject";

const CreateQuestionForm: React.FC = () => {
  const navigate = useNavigate();
  const createQuestion = useCreateQuestion();
  const { data: subjects } = useSubjectsList();

  const [formData, setFormData] = useState<QuestionRequest>({
    content: "",
    canonicalAnswer: "",
    questionType: "MCQ" as QuestionType,
    questionLevel: "EASY" as QuestionLevel,
    subjectId: undefined,
    lessonId: undefined,
    tagIds: [],
    options: [],
  });

  const [options, setOptions] = useState<OptionRequest[]>([
    { label: "A", content: "", isCorrect: false, orderNo: 0 },
    { label: "B", content: "", isCorrect: false, orderNo: 1 },
  ]);

  const handleInputChange = (field: keyof QuestionRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addOption = () => {
    const labels = ["A", "B", "C", "D", "E", "F"];
    const newLabel = labels[options.length] || `${options.length + 1}`;
    setOptions([...options, { label: newLabel, content: "", isCorrect: false, orderNo: options.length }]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      toast.error({
        title: "Lỗi",
        description: "Phải có ít nhất 2 đáp án!",
      });
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, field: keyof OptionRequest, value: any) => {
    const updated = options.map((opt, i) => {
      if (i === index) {
        if (field === "isCorrect" && value) {
          return { ...opt, [field]: value };
        }
        return { ...opt, [field]: value };
      }
      if (field === "isCorrect" && value) {
        return { ...opt, isCorrect: false };
      }
      return opt;
    });
    setOptions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.questionType === "MCQ") {
      const hasCorrectAnswer = options.some((opt) => opt.isCorrect);
      if (!hasCorrectAnswer) {
        toast.error({
          title: "Lỗi",
          description: "Vui lòng chọn ít nhất một đáp án đúng!",
        });
        return;
      }
      const emptyOption = options.find((opt) => !opt.content.trim());
      if (emptyOption) {
        toast.error({
          title: "Lỗi",
          description: "Vui lòng điền nội dung cho tất cả các đáp án!",
        });
        return;
      }
    }

    const requestData: QuestionRequest = {
      ...formData,
      options: formData.questionType === "MCQ" ? options : undefined,
    };

    createQuestion.mutate(requestData, {
      onSuccess: () => {
        navigate({ to: "/questions/my" });
      },
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate({ to: "/questions/my" })} className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Button>
        <h1 className="text-3xl font-bold">Tạo câu hỏi mới</h1>
        <p className="text-muted-foreground mt-1">Điền thông tin để tạo câu hỏi mới</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Thông tin cơ bản</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="questionType">
                  Loại câu hỏi <span className="text-red-500">*</span>
                </Label>
                <select
                  id="questionType"
                  value={formData.questionType}
                  onChange={(e) => handleInputChange("questionType", e.target.value as QuestionType)}
                  className="w-full mt-1.5 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="MCQ">Trắc nghiệm</option>
                  <option value="ESSAY">Tự luận</option>
                </select>
              </div>

              <div>
                <Label htmlFor="questionLevel">
                  Độ khó <span className="text-red-500">*</span>
                </Label>
                <select
                  id="questionLevel"
                  value={formData.questionLevel}
                  onChange={(e) => handleInputChange("questionLevel", e.target.value as QuestionLevel)}
                  className="w-full mt-1.5 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="EASY">Dễ</option>
                  <option value="MEDIUM">Trung bình</option>
                  <option value="HARD">Khó</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="subjectId">Môn học</Label>
              <select
                id="subjectId"
                value={formData.subjectId || ""}
                onChange={(e) => handleInputChange("subjectId", e.target.value ? Number(e.target.value) : undefined)}
                className="w-full mt-1.5 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Chọn môn học --</option>
                {subjects?.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="content">
                Nội dung câu hỏi <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                className="w-full mt-1.5 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-25"
                rows={4}
                placeholder="Nhập nội dung câu hỏi..."
                required
              />
            </div>

            <div>
              <Label htmlFor="canonicalAnswer">Đáp án / Hướng dẫn giải</Label>
              <textarea
                id="canonicalAnswer"
                value={formData.canonicalAnswer}
                onChange={(e) => handleInputChange("canonicalAnswer", e.target.value)}
                className="w-full mt-1.5 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-30"
                rows={5}
                placeholder="Nhập đáp án chi tiết hoặc hướng dẫn giải..."
              />
            </div>
          </CardContent>
        </Card>

        {formData.questionType === "MCQ" && (
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

              {options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={option.isCorrect}
                        onChange={(e) => updateOption(index, "isCorrect", e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                      {option.isCorrect && <Check className="h-4 w-4 text-green-600" />}
                    </div>
                    <span className="font-semibold text-sm w-6">{option.label}</span>
                    <Input
                      value={option.content}
                      onChange={(e) => updateOption(index, "content", e.target.value)}
                      placeholder={`Nhập nội dung đáp án ${option.label}...`}
                      className="flex-1"
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    isDisabled={options.length <= 2}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/questions" })}>
            Hủy
          </Button>
          <Button type="submit" className="gap-2" isDisabled={createQuestion.isPending}>
            <Plus className="h-4 w-4" />
            {createQuestion.isPending ? "Đang tạo..." : "Tạo câu hỏi"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuestionForm;
