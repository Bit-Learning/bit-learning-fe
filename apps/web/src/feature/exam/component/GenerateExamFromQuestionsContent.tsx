import { useState, useMemo } from "react";
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
import {
  useSearchQuestions,
  useMyQuestions,
  useMyQuestionsAll,
  useSearchQuestionsAll,
} from "@/feature/question/queries/useQuestion";
import { useGenerateExamFromQuestions, useExam, useDownloadExam } from "../queries/useExam";
import { useSubjectsList } from "@/feature/matrix/queries/useSubject";
import { ApprovalStatus, type QuestionLevel } from "@/feature/question/types/question.type";
import type { ExamType } from "../types/exam.type";
import { getDifficultyBadge, getTypeBadge } from "@/feature/question/utils/question.utils";

const DEFAULT_DURATION = 30;
const DEFAULT_SCORE = 10;

const GenerateExamFromQuestionsContent: React.FC = () => {
  const navigate = useNavigate();

  const [questionSource, setQuestionSource] = useState<"system" | "user">("system");
  const [examName, setExamName] = useState("");
  const [examCode, setExamCode] = useState("");
  const [durationInMinutes, setDurationInMinutes] = useState(DEFAULT_DURATION);
  const [totalScore, setTotalScore] = useState(DEFAULT_SCORE);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [examType, setExamType] = useState<ExamType>("EXAM");
  const [enrollKey, setEnrollKey] = useState("");
  const [generatedExamId, setGeneratedExamId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubjectId, setFilterSubjectId] = useState<number | "">("");
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  // const { data: systemResponse, isLoading: systemLoading } = useSearchQuestions(
  //   { keyword: searchTerm, page: currentPage, size: pageSize },
  //   { enabled: questionSource === "system" },
  // );

  // const { data: userResponse, isLoading: userLoading } = useMyQuestions(
  //   { page: currentPage, size: pageSize },
  //   { enabled: questionSource === "user" },
  // );
  const { data: systemResponse, isLoading: systemLoading } = useSearchQuestionsAll();

  const { data: userResponse, isLoading: userLoading } = useMyQuestionsAll();

  const { data: subjectsData } = useSubjectsList();

  const rawQuestions =
    (questionSource === "system"
      ? (systemResponse || []).filter((q) => q.approvalStatus === ApprovalStatus.APPROVED)
      : (userResponse || []).filter((q) => q.approvalStatus === ApprovalStatus.APPROVED)) || [];
  const isLoading = questionSource === "system" ? systemLoading : userLoading;

  const questions = useMemo(() => {
    if (!filterSubjectId) return rawQuestions;
    return rawQuestions.filter((q) => q.subject?.id === filterSubjectId);
  }, [rawQuestions, filterSubjectId]);

  const totalPages = Math.ceil(questions.length / pageSize);
  const pagedQuestions = questions.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const { data: examData } = useExam(generatedExamId!, { enabled: !!generatedExamId });
  const generateExam = useGenerateExamFromQuestions();
  const downloadExam = useDownloadExam();

  const isExamGenerated = !!generatedExamId && !!examData;

  const handleGenerate = () => {
    if (!examName.trim() || !examCode.trim()) {
      toast.error({ title: "Lỗi", description: "Vui lòng nhập tên và mã đề thi" });
      return;
    }
    if (examType === "EXAM" && !enrollKey.trim()) {
      toast.error({ title: "Lỗi", description: "Đề thi chính thức bắt buộc phải có mật khẩu vào thi" });
      return;
    }
    if (selectedQuestions.size === 0) {
      toast.error({ title: "Lỗi", description: "Vui lòng chọn ít nhất 1 câu hỏi" });
      return;
    }
    if (generateExam.isPending) return;

    generateExam.mutate(
      {
        questionIds: Array.from(selectedQuestions),
        name: examName,
        code: examCode,
        shuffleOptions,
        durationInMinutes,
        totalScore,
        type: examType,
        enrollKey: enrollKey.trim() || undefined,
      },
      {
        onSuccess: (response) => {
          const id = response.data.data?.id;
          if (id) setGeneratedExamId(id);
        },
      },
    );
  };

  const handleToggleQuestion = (questionId: number) => {
    if (isExamGenerated) return;
    setSelectedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
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
    setFilterSubjectId("");
    setSearchTerm("");
  };

  const handleDownload = (format: "pdf" | "docx") => {
    if (!examData) return;
    downloadExam.mutate({ id: examData.id, format, name: examData.name });
  };

  const handleCreateNew = () => {
    setGeneratedExamId(null);
    setExamName("");
    setExamCode("");
    setDurationInMinutes(DEFAULT_DURATION);
    setTotalScore(DEFAULT_SCORE);
    setShuffleOptions(true);
    setExamType("EXAM");
    setEnrollKey("");
    setSelectedQuestions(new Set());
    setSearchTerm("");
    setFilterSubjectId("");
    setCurrentPage(0);
  };

  return (
    <div className="mx-auto p-8 bg-slate-50 dark:bg-slate-950">
      <div className="mb-6">
        <Button
          variant="outline"
          size="lg"
          className="mb-2 gap-2 border-gray-400 bg-white shadow-sm transition-all hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSourceChange("system")}
                    disabled={isExamGenerated}
                    className={`cursor-pointer px-5 py-2 rounded-lg text-md font-medium transition-colors ${
                      questionSource === "system"
                        ? "bg-primary text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    Ngân hàng hệ thống
                  </button>
                  <button
                    onClick={() => handleSourceChange("user")}
                    disabled={isExamGenerated}
                    className={`cursor-pointer px-5 py-2 rounded-lg text-md font-medium transition-colors ${
                      questionSource === "user"
                        ? "bg-primary text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    Câu hỏi của tôi
                  </button>
                </div>

                {!isExamGenerated && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeselectAll}
                      className="cursor-pointer flex items-center gap-1 text-sm text-slate-500 hover:underline"
                    >
                      <Square className="h-4 w-4" />
                      Bỏ chọn
                    </button>
                  </div>
                )}
              </div>

              {!isExamGenerated && (
                <div className="flex gap-2 mt-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Tìm kiếm câu hỏi..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(0);
                      }}
                      className="pl-9"
                    />
                  </div>

                  {subjectsData && subjectsData.length > 0 && (
                    <select
                      value={filterSubjectId}
                      onChange={(e) => {
                        setFilterSubjectId(e.target.value ? Number(e.target.value) : "");
                        setSelectedQuestions(new Set());
                      }}
                      className="px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary min-w-37.5"
                    >
                      <option value="">Tất cả môn</option>
                      {subjectsData.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Không có câu hỏi nào</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pagedQuestions.map((question) => {
                    const isSelected = selectedQuestions.has(question.id);
                    return (
                      <div
                        key={question.id}
                        onClick={() => handleToggleQuestion(question.id)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isExamGenerated ? "cursor-default opacity-60" : "cursor-pointer hover:border-primary/50"
                        } ${isSelected ? "border-primary bg-primary/5" : "border-slate-200 dark:border-slate-700"}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 shrink-0">
                            {isSelected ? (
                              <CheckSquare className="h-5 w-5 text-primary" />
                            ) : (
                              <Square className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-md font-medium text-slate-900 dark:text-white line-clamp-2">
                              {question.content}
                            </p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className={`text-xs`}>{getTypeBadge(question.questionType)}</span>
                              <span className={`text-xs`}>{getDifficultyBadge(question.questionLevel)}</span>
                              {question.lesson && (
                                <span className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                  {question.lesson.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {totalPages > 1 && (
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
                    Trang {currentPage + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => p + 1)}
                    isDisabled={currentPage >= totalPages - 1 || isExamGenerated}
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

                <div className="border-t pt-4 space-y-4">
                  <div>
                    <Label htmlFor="examType">Loại đề thi</Label>
                    <select
                      id="examType"
                      value={examType}
                      onChange={(e) => setExamType(e.target.value as ExamType)}
                      className="w-full mt-1.5 px-3 py-2 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value="EXAM">Đề thi chính thức</option>
                      <option value="PRACTICE">Đề luyện tập</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="enrollKey">
                      Mật khẩu vào thi{" "}
                      {examType === "EXAM" ? (
                        <span className="text-red-500">*</span>
                      ) : (
                        <span className="text-slate-400 text-xs font-normal">(tuỳ chọn)</span>
                      )}
                    </Label>
                    <Input
                      id="enrollKey"
                      placeholder={
                        examType === "EXAM" ? "Bắt buộc với đề chính thức" : "Để trống nếu không cần mật khẩu"
                      }
                      value={enrollKey}
                      onChange={(e) => setEnrollKey(e.target.value)}
                      className={`mt-1.5 ${examType === "EXAM" && !enrollKey.trim() ? "border-red-300 focus:ring-red-400" : ""}`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
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
                  isDisabled={
                    generateExam.isPending || selectedQuestions.size === 0 || (examType === "EXAM" && !enrollKey.trim())
                  }
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
              <CardHeader className="border-b">
                <div className="flex items-center gap-2 mb-2">
                  <div className="rounded-full bg-primary/20 p-1.5">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">Đề thi đã tạo</h2>
                </div>
                <p className="text-lg font-bold text-foreground">{examData.name}</p>
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
