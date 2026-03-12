import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Download,
  Eye,
  FileText,
  Search,
  Settings,
  Sparkles,
  CheckSquare,
  Square,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Input } from "@workspace/ui/components/Input";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/Card";
import { Label } from "@workspace/ui/components/label";
import { Checkbox } from "@workspace/ui/components/Checkbox";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { toast } from "@/shared/components/Sonner";
import { useSearchQuestions, useMyQuestions } from "@/feature/question/queries/useQuestion";
import { useGenerateExamFromQuestions, useExam, useDownloadExam } from "../queries/useExam";
import type { QuestionLevel } from "@/feature/question/types/question.type";

const GenerateExamFromQuestionsContent: React.FC = () => {
  const navigate = useNavigate();

  const [questionSource, setQuestionSource] = useState<"system" | "user">("system");
  const [examName, setExamName] = useState("");
  const [examCode, setExamCode] = useState("");
  const [durationInMinutes, setDurationInMinutes] = useState(30);
  const [totalScore, setTotalScore] = useState(10);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [generatedExamId, setGeneratedExamId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  const { data: systemResponse, isLoading: systemLoading } = useSearchQuestions(
    { keyword: searchTerm, page: currentPage, size: pageSize },
    { enabled: questionSource === "system" },
  );

  const { data: userResponse, isLoading: userLoading } = useMyQuestions(
    { page: currentPage, size: pageSize },
    { enabled: questionSource === "user" },
  );

  const response = questionSource === "system" ? systemResponse : userResponse;
  const isLoading = questionSource === "system" ? systemLoading : userLoading;
  const questions = response?.data || [];
  const pagination = response?.page;

  const { data: examData } = useExam(generatedExamId!, { enabled: !!generatedExamId });
  const generateExam = useGenerateExamFromQuestions();
  const downloadExam = useDownloadExam();

  const isExamGenerated = !!generatedExamId && !!examData;

  const handleGenerate = () => {
    if (!examName || !examCode) {
      toast.error({ title: "Lỗi", description: "Vui lòng nhập tên và mã đề thi" });
      return;
    }

    if (selectedQuestions.size === 0) {
      toast.error({ title: "Lỗi", description: "Vui lòng chọn ít nhất 1 câu hỏi" });
      return;
    }

    if (generateExam.isPending) return;

    const payload = {
      questionIds: Array.from(selectedQuestions),
      name: examName,
      code: examCode,
      shuffleOptions,
      durationInMinutes,
      totalScore,
    };

    generateExam.mutate(payload, {
      onSuccess: (response) => {
        setGeneratedExamId(response.data.data!.id);
        toast.success({
          title: "Thành công",
          description: "Đã tạo đề thi thành công!",
        });
      },
    });
  };

  const handleToggleQuestion = (questionId: number) => {
    if (isExamGenerated) return;

    setSelectedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (isExamGenerated) return;
    const allIds = questions.map((q) => q.id);
    setSelectedQuestions(new Set(allIds));
  };

  const handleDeselectAll = () => {
    if (isExamGenerated) return;
    setSelectedQuestions(new Set());
  };

  const handleSourceChange = (source: "system" | "user") => {
    if (isExamGenerated) return;
    setQuestionSource(source);
    setSelectedQuestions(new Set());
    setCurrentPage(0);
  };

  const handleDownload = (format: "pdf" | "docx") => {
    if (!examData) return;
    downloadExam.mutate({ id: examData.id, format, name: examData.name });
  };

  const handleCreateNew = () => {
    setGeneratedExamId(null);
    setExamName("");
    setExamCode("");
    setDurationInMinutes(90);
    setTotalScore(10);
    setShuffleOptions(true);
    setSelectedQuestions(new Set());
    setSearchTerm("");
    setCurrentPage(0);
  };

  const getLevelColor = (level: QuestionLevel) => {
    const colors = {
      EASY: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      HARD: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[level];
  };

  const getTypeColor = (type: string) => {
    return type === "MCQ"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
  };

  return (
    <div className="mx-auto p-8">
      <div className="mb-6">
        <Button
          variant="outline"
          size="lg"
          className="gap-2 mb-2 border-gray-300 bg-white shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
          onClick={() => navigate({ to: "/mentor/exam/my" })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách
        </Button>
        <h1 className="text-3xl font-bold mb-2">Tạo đề thi từ ngân hàng câu hỏi</h1>
        <p className="text-muted-foreground">Chọn câu hỏi và tạo đề thi tùy chỉnh</p>
      </div>

      {isExamGenerated && (
        <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-green-100 dark:bg-green-900 p-2">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-1">
                  Đề thi đã được tạo thành công!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                  Bạn có thể xem chi tiết, tải xuống đề thi hoặc tạo đề thi mới bên dưới.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateNew}
                  className="border-green-600 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/50"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Tạo đề thi mới
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className={isExamGenerated ? "opacity-60" : ""}>
            <CardHeader>
              <h2 className="text-lg font-semibold">Nguồn câu hỏi</h2>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button
                variant={questionSource === "system" ? "default" : "outline"}
                size="lg"
                onClick={() => handleSourceChange("system")}
                className="flex-1"
                isDisabled={isExamGenerated}
              >
                Ngân hàng hệ thống
              </Button>
              <Button
                variant={questionSource === "user" ? "default" : "outline"}
                size="lg"
                onClick={() => handleSourceChange("user")}
                className="flex-1"
                isDisabled={isExamGenerated}
              >
                Câu hỏi của tôi
              </Button>
            </CardContent>
          </Card>

          <Card className={isExamGenerated ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    Danh sách câu hỏi ({questionSource === "system" ? "Hệ thống" : "Của tôi"})
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Đã chọn: {selectedQuestions.size} câu hỏi</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll} isDisabled={isExamGenerated}>
                    <CheckSquare className="h-4 w-4 mr-1" />
                    Chọn tất cả
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDeselectAll} isDisabled={isExamGenerated}>
                    <Square className="h-4 w-4 mr-1" />
                    Bỏ chọn
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm câu hỏi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  disabled={isExamGenerated}
                />
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : !questions.length ? (
                <div className="py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Không tìm thấy câu hỏi nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {questions.map((question) => (
                    <div
                      key={question.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isExamGenerated
                          ? "border-gray-200 dark:border-gray-800 cursor-not-allowed"
                          : selectedQuestions.has(question.id)
                            ? "border-primary bg-primary/5 cursor-pointer"
                            : "border-gray-200 dark:border-gray-800 hover:border-gray-300 cursor-pointer"
                      }`}
                      onClick={() => !isExamGenerated && handleToggleQuestion(question.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          isSelected={selectedQuestions.has(question.id)}
                          onChange={() => handleToggleQuestion(question.id)}
                          className="mt-1"
                          isDisabled={isExamGenerated}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <p className="text-sm font-medium line-clamp-2 flex-1">{question.content}</p>
                            <div className="flex gap-2 shrink-0">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(question.questionType)}`}
                              >
                                {question.questionType === "MCQ" ? "Trắc nghiệm" : "Tự luận"}
                              </span>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getLevelColor(question.questionLevel)}`}
                              >
                                {question.questionLevel === "EASY"
                                  ? "Dễ"
                                  : question.questionLevel === "MEDIUM"
                                    ? "TB"
                                    : "Khó"}
                              </span>
                            </div>
                          </div>
                          {(question.subject || question.lesson) && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {question.subject && <span>{question.subject.name}</span>}
                              {question.subject && question.lesson && <span>•</span>}
                              {question.lesson && <span>{question.lesson.name}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    isDisabled={currentPage === 0 || isExamGenerated}
                  >
                    Trước
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Trang {currentPage + 1} / {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => p + 1)}
                    isDisabled={currentPage >= pagination.totalPages - 1 || isExamGenerated}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {!isExamGenerated && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Cài đặt đề thi</h2>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="examName">
                    Tên đề thi <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="examName"
                    placeholder="VD: Đề thi HK1 - Đề số 1"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="examCode">
                    Mã đề thi <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="examCode"
                    placeholder="VD: DE-TOAN-10-HK1-01"
                    value={examCode}
                    onChange={(e) => setExamCode(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="duration">
                    Thời gian (phút) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={durationInMinutes}
                    onChange={(e) => setDurationInMinutes(Number(e.target.value))}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="totalScore">
                    Tổng điểm <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="totalScore"
                    type="number"
                    min="0"
                    step="0.5"
                    value={totalScore}
                    onChange={(e) => setTotalScore(Number(e.target.value))}
                    className="mt-1.5"
                  />
                </div>

                <div className="flex items-center gap-2 border-t pt-4">
                  <Checkbox
                    id="shuffleOptions"
                    isSelected={shuffleOptions}
                    onChange={(isSelected) => setShuffleOptions(!!isSelected)}
                  />
                  <Label htmlFor="shuffleOptions" className="cursor-pointer text-sm">
                    Xáo trộn thứ tự đáp án
                  </Label>
                </div>

                <Button
                  onClick={handleGenerate}
                  isDisabled={generateExam.isPending || selectedQuestions.size === 0}
                  size="lg"
                  className="w-full gap-2 mt-4"
                >
                  <Sparkles className="h-4 w-4" />
                  {generateExam.isPending ? "Đang tạo đề..." : "Tạo đề thi"}
                </Button>

                {selectedQuestions.size > 0 && (
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                    <p className="text-sm text-blue-800 dark:text-blue-200">Đã chọn {selectedQuestions.size} câu hỏi</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {examData && (
            <Card className="border-primary shadow-lg">
              <CardHeader className="bg-linear-to-r from-primary/10 to-primary/5 border-b">
                <div className="flex items-center gap-2 mb-2">
                  <div className="rounded-full bg-primary/20 p-1.5">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">Đề thi đã tạo</h2>
                </div>
                <p className="text-sm font-medium text-foreground">{examData.name}</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-sm text-muted-foreground">Mã đề</span>
                    <span className="font-semibold text-primary">{examData.code}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-sm text-muted-foreground">Số câu hỏi</span>
                    <span className="font-semibold">{examData.examQuestions.length} câu</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-sm text-muted-foreground">Tổng điểm</span>
                    <span className="font-semibold">{examData.totalScore} điểm</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Thời gian</span>
                    <span className="font-semibold">{examData.durationInMinutes} phút</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="default"
                    size="lg"
                    onClick={() => navigate({ to: `/mentor/exam/${examData.id}` })}
                    className="w-full gap-2 shadow-md"
                  >
                    <Eye className="h-4 w-4" />
                    Xem đầy đủ
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleDownload("pdf")}
                      className="gap-2"
                      isDisabled={downloadExam.isPending}
                    >
                      <Download className="h-4 w-4" />
                      Tải PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleDownload("docx")}
                      className="gap-2"
                      isDisabled={downloadExam.isPending}
                    >
                      <Download className="h-4 w-4" />
                      Tải Word
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateExamFromQuestionsContent;
