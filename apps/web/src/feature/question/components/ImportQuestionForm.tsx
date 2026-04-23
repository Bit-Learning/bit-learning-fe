import { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  HelpCircle,
  Eye,
  Edit2,
  Trash2,
  X,
  Save,
  AlertTriangle,
  RefreshCw,
  BookOpen,
  ChevronRight,
  Download,
} from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/Card";
import { Progress } from "@workspace/ui/components/Progress";
import { toast } from "@/shared/components/Sonner";
import {
  usePreviewImport,
  useUpdatePreviewQuestion,
  useDeletePreviewQuestion,
  useConfirmImport,
  useImportJobStatus,
} from "../queries/useImportJob";
import type { PreviewQuestionResponse, PreviewQuestionStatus } from "../types/import.type";
import { getDifficultyBadge, getTypeBadge } from "../utils/question.utils";
import { useCurriculumsList } from "@/feature/matrix/queries/useCurriculum";
import { useSubjectsByCurriculum } from "@/feature/matrix/queries/useSubject";
import { useChaptersBySubject } from "@/feature/matrix/queries/useChapter";
import { useLessonsByChapter } from "@/feature/matrix/queries/useLesson";

type ImportStep = "upload" | "preview" | "processing" | "completed";

interface EditState {
  content: string;
  options: { label: string; content: string; orderNo: number; correct: boolean }[] | null;
}

const GuideModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-slate-700">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Hướng dẫn import</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Các bước thực hiện</h3>
            {[
              "Chọn bộ sách, môn học, chương và bài học ở cột bên trái",
              "Upload file Word (.docx) và nhấn 'Xem trước'",
              "Xem lại danh sách câu hỏi, chỉnh sửa nội dung hoặc đáp án đúng nếu cần",
              "Xác nhận import — hệ thống sẽ tự động lưu dữ liệu",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-white">{i + 1}</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed mt-1">{step}</p>
              </div>
            ))}
          </div>

          <div className="border-t dark:border-slate-700 pt-4 space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Lưu ý định dạng file
            </h3>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <p>• File phải theo đúng định dạng mẫu Word (.docx / .doc)</p>
              <p>
                • Type: <span className="font-medium text-foreground">MCQ</span> (trắc nghiệm) hoặc{" "}
                <span className="font-medium text-foreground">ESSAY</span> (tự luận)
              </p>
              <p>
                • Level: <span className="font-medium text-foreground">EASY</span>,{" "}
                <span className="font-medium text-foreground">MEDIUM</span>, hoặc{" "}
                <span className="font-medium text-foreground">HARD</span>
              </p>
              <p>
                • Kích thước file tối đa: <span className="font-medium text-foreground">10MB</span>
              </p>
              <p>• Câu hỏi trùng lặp sẽ được tái sử dụng tự động</p>
            </div>
          </div>

          <div className="pt-1">
            <a
              href="https://docs.google.com/document/d/1xV_OeKjdjeY5WYccvm2Hil080e6vcoC_VB8bsqlw6fg/export?format=docx"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-colors"
            >
              <Download className="h-4 w-4" />
              Tải file mẫu (.docx)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const SelectField: React.FC<{
  label: string;
  value: number | null;
  disabled: boolean;
  placeholder: string;
  options: { id: number; name: string; code?: string }[];
  onChange: (val: number | null) => void;
  step: number;
  completedStep: boolean;
}> = ({ label, value, disabled, placeholder, options, onChange, completedStep }) => (
  <div className={`space-y-1.5 transition-opacity ${disabled ? "opacity-50" : ""}`}>
    <div className="flex items-center justify-between">
      <label className="text-sm font-semibold">
        {label} <span className="text-red-500">*</span>
      </label>
      {completedStep && value && <CheckCircle className="h-3.5 w-3.5 text-green-500" />}
    </div>
    <select
      className="w-full border rounded-xl px-3 py-2.5 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed transition-all"
      value={value ?? ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
    >
      <option value="">{placeholder}</option>
      {options?.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
          {o.code ? ` (${o.code})` : ""}
        </option>
      ))}
    </select>
  </div>
);

const ImportQuestionForm: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewImport = usePreviewImport();
  const updatePreviewQuestion = useUpdatePreviewQuestion();
  const deletePreviewQuestion = useDeletePreviewQuestion();
  const confirmImport = useConfirmImport();

  const [currentStep, setCurrentStep] = useState<ImportStep>("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importJobId, setImportJobId] = useState<number | null>(null);
  const [previewData, setPreviewData] = useState<{
    totalQuestions: number;
    duplicatedCount: number;
    questions: PreviewQuestionResponse[];
  } | null>(null);

  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [editState, setEditState] = useState<EditState>({ content: "", options: null });
  const [guideOpen, setGuideOpen] = useState(false);

  const [selectedCurriculumId, setSelectedCurriculumId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

  const { data: curriculums, isLoading: loadingCurriculums } = useCurriculumsList();
  const { data: subjects, isLoading: loadingSubjects } = useSubjectsByCurriculum(selectedCurriculumId ?? undefined);
  const { data: chapters, isLoading: loadingChapters } = useChaptersBySubject(selectedSubjectId ?? undefined);
  const { data: lessons, isLoading: loadingLessons } = useLessonsByChapter(selectedChapterId ?? undefined);

  const { data: jobStatus } = useImportJobStatus(importJobId, {
    enabled: currentStep === "processing" && !!importJobId,
  });

  const selectionComplete = !!selectedLessonId;
  const selectionSteps = [
    { done: !!selectedCurriculumId },
    { done: !!selectedSubjectId },
    { done: !!selectedChapterId },
    { done: !!selectedLessonId },
  ];

  useEffect(() => {
    if (jobStatus) {
      if (jobStatus.status === "DONE") {
        setCurrentStep("completed");
        toast.success({
          title: "Hoàn thành",
          description: `Đã import thành công ${jobStatus.importedQuestions}/${jobStatus.totalQuestions} câu hỏi`,
        });
      } else if (jobStatus.status === "FAILED") {
        setCurrentStep("preview");
        toast.error({
          title: "Lỗi",
          description: jobStatus.errorMessage || "Import thất bại",
        });
      }
    }
  }, [jobStatus]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error({ title: "Lỗi", description: "Kích thước file tối đa 10MB" });
        return;
      }
      setUploadedFile(file);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith(".docx") || file.name.endsWith(".doc"))) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error({ title: "Lỗi", description: "Kích thước file tối đa 10MB" });
        return;
      }
      setUploadedFile(file);
      setUploadProgress(0);
    } else {
      toast.error({ title: "Lỗi", description: "Chỉ hỗ trợ file .docx và .doc" });
    }
  };

  const handleUploadAndPreview = async () => {
    if (!uploadedFile || !selectedLessonId) return;
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    try {
      const response = await previewImport.mutateAsync({ file: uploadedFile, lessonId: selectedLessonId });
      clearInterval(interval);
      setUploadProgress(100);
      setImportJobId(response.data.data?.importJobId!);
      setPreviewData({
        totalQuestions: response.data.data?.totalQuestions!,
        duplicatedCount: response.data.data?.duplicatedCount!,
        questions: response.data.data?.questions!,
      });
      setCurrentStep("preview");
    } catch {
      clearInterval(interval);
      setUploadProgress(0);
    }
  };

  const openEdit = (question: PreviewQuestionResponse) => {
    setEditingQuestionId(question.id);
    setEditState({
      content: question.editedContent || question.originalContent,
      options:
        question.questionType === "MCQ" && question.options
          ? question.options.map((o) => ({ ...o, label: o.label || String.fromCharCode(64 + o.orderNo) }))
          : null,
    });
  };

  const closeEdit = () => {
    setEditingQuestionId(null);
    setEditState({ content: "", options: null });
  };

  const handleSetCorrectOption = (orderNo: number) => {
    setEditState((prev) => ({
      ...prev,
      options: prev.options?.map((o) => ({ ...o, correct: o.orderNo === orderNo })) ?? null,
    }));
  };

  const handleSaveEdit = async (questionId: number) => {
    if (!editState.content.trim()) return;
    try {
      await updatePreviewQuestion.mutateAsync({
        questionId,
        data: {
          editedContent: editState.content,
          status: "KEEP" as PreviewQuestionStatus,
          ...(editState.options ? { options: editState.options } : {}),
        },
      });
      setPreviewData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          questions: prev.questions.map((q) =>
            q.id === questionId
              ? {
                  ...q,
                  editedContent: editState.content,
                  status: "KEEP" as PreviewQuestionStatus,
                  ...(editState.options ? { options: editState.options! } : {}),
                }
              : q,
          ),
        };
      });
      closeEdit();
      toast.success({ title: "Đã lưu", description: "Câu hỏi đã được chỉnh sửa" });
    } catch {}
  };

  const handleToggleQuestionStatus = async (questionId: number, currentStatus: PreviewQuestionStatus) => {
    const newStatus = currentStatus === "KEEP" ? "DELETE" : "KEEP";
    try {
      await updatePreviewQuestion.mutateAsync({ questionId, data: { status: newStatus as PreviewQuestionStatus } });
      setPreviewData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          questions: prev.questions.map((q) =>
            q.id === questionId ? { ...q, status: newStatus as PreviewQuestionStatus } : q,
          ),
        };
      });
    } catch {}
  };

  const handleDeleteQuestion = async (questionId: number) => {
    try {
      await deletePreviewQuestion.mutateAsync(questionId);
      setPreviewData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          questions: prev.questions.map((q) =>
            q.id === questionId ? { ...q, status: "DELETE" as PreviewQuestionStatus } : q,
          ),
        };
      });
      toast.success({ title: "Đã xóa", description: "Câu hỏi sẽ không được import" });
    } catch {}
  };

  const handleConfirmImport = async () => {
    if (!importJobId) return;
    const keepQuestions = previewData?.questions.filter((q) => q.status === "KEEP") || [];
    if (keepQuestions.length === 0) {
      toast.error({ title: "Không thể import", description: "Không có câu hỏi nào được chọn để import" });
      return;
    }
    try {
      setCurrentStep("processing");
      await confirmImport.mutateAsync({ importJobId });
      toast.info({ title: "Đang xử lý", description: "Hệ thống đang import câu hỏi..." });
    } catch {
      setCurrentStep("preview");
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setImportJobId(null);
    setPreviewData(null);
    setCurrentStep("upload");
    setSelectedCurriculumId(null);
    setSelectedSubjectId(null);
    setSelectedChapterId(null);
    setSelectedLessonId(null);
    closeEdit();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getKeepCount = () => previewData?.questions.filter((q) => q.status === "KEEP").length || 0;
  const getDeleteCount = () => previewData?.questions.filter((q) => q.status === "DELETE").length || 0;

  return (
    <div className="mx-auto p-6 min-h-screen bg-gray-50 dark:bg-slate-950">
      <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />

      <div className="mb-6 flex items-start justify-between">
        <div>
          <Button
            variant="outline"
            size="lg"
            className="mb-3 gap-2 border-gray-300 bg-white shadow-sm transition-all hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md dark:bg-slate-900"
            onClick={() => navigate({ to: "/mentor/question/my" })}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold">Import ngân hàng câu hỏi</h1>
          <p className="text-muted-foreground mt-1">Nhập câu hỏi từ file Word (.docx) với định dạng chuẩn</p>
        </div>
        <Button
          variant="outline"
          className="gap-2 mt-1 border-gray-300 bg-white dark:bg-slate-900"
          onClick={() => setGuideOpen(true)}
        >
          <HelpCircle className="h-4 w-4 text-primary" />
          Hướng dẫn
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-5 items-start">
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-white dark:bg-slate-900 shadow-sm border-gray-200 dark:border-slate-700">
            <CardHeader className="">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold">Chọn bài học</h2>
                </div>
                <div className="flex items-center gap-1">
                  {selectionSteps.map((s, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors ${s.done ? "bg-primary" : "bg-gray-200 dark:bg-slate-700"}`}
                    />
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <SelectField
                label="Bộ sách / Chương trình"
                value={selectedCurriculumId}
                disabled={loadingCurriculums}
                placeholder={loadingCurriculums ? "Đang tải..." : "-- Chọn bộ sách --"}
                options={curriculums ?? []}
                onChange={(val) => {
                  setSelectedCurriculumId(val);
                  setSelectedSubjectId(null);
                  setSelectedChapterId(null);
                  setSelectedLessonId(null);
                }}
                step={1}
                completedStep={!!selectedCurriculumId}
              />

              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-px flex-1 bg-gray-100 dark:bg-slate-800" />
                <ChevronRight className="h-3 w-3" />
                <div className="h-px flex-1 bg-gray-100 dark:bg-slate-800" />
              </div>

              <SelectField
                label="Môn học"
                value={selectedSubjectId}
                disabled={!selectedCurriculumId || loadingSubjects}
                placeholder={
                  !selectedCurriculumId
                    ? "Chọn bộ sách trước"
                    : loadingSubjects
                      ? "Đang tải..."
                      : subjects?.length === 0
                        ? "Không có môn học"
                        : "-- Chọn môn học --"
                }
                options={subjects ?? []}
                onChange={(val) => {
                  setSelectedSubjectId(val);
                  setSelectedChapterId(null);
                  setSelectedLessonId(null);
                }}
                step={2}
                completedStep={!!selectedSubjectId}
              />

              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-px flex-1 bg-gray-100 dark:bg-slate-800" />
                <ChevronRight className="h-3 w-3" />
                <div className="h-px flex-1 bg-gray-100 dark:bg-slate-800" />
              </div>

              <SelectField
                label="Chương"
                value={selectedChapterId}
                disabled={!selectedSubjectId || loadingChapters}
                placeholder={
                  !selectedSubjectId
                    ? "Chọn môn học trước"
                    : loadingChapters
                      ? "Đang tải..."
                      : chapters?.length === 0
                        ? "Không có chương nào"
                        : "-- Chọn chương --"
                }
                options={chapters ?? []}
                onChange={(val) => {
                  setSelectedChapterId(val);
                  setSelectedLessonId(null);
                }}
                step={3}
                completedStep={!!selectedChapterId}
              />

              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-px flex-1 bg-gray-100 dark:bg-slate-800" />
                <ChevronRight className="h-3 w-3" />
                <div className="h-px flex-1 bg-gray-100 dark:bg-slate-800" />
              </div>

              <SelectField
                label="Bài học"
                value={selectedLessonId}
                disabled={!selectedChapterId || loadingLessons}
                placeholder={
                  !selectedChapterId
                    ? "Chọn chương trước"
                    : loadingLessons
                      ? "Đang tải..."
                      : lessons?.length === 0
                        ? "Không có bài học nào"
                        : "-- Chọn bài học --"
                }
                options={lessons ?? []}
                onChange={(val) => setSelectedLessonId(val)}
                step={4}
                completedStep={!!selectedLessonId}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4">
          {currentStep === "upload" && (
            <Card className="bg-white dark:bg-slate-900 shadow-sm border-gray-200 dark:border-slate-700">
              <CardHeader>
                <h2 className="text-base font-semibold">Tải lên file câu hỏi</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Hỗ trợ định dạng .docx và .doc, tối đa 10MB</p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div
                  className={`relative rounded-2xl border-2 border-dashed transition-all p-10 ${
                    !selectionComplete
                      ? "border-gray-200 dark:border-slate-700 opacity-50 cursor-not-allowed"
                      : uploadedFile
                        ? "border-blue-400 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 cursor-pointer"
                        : "border-gray-300 dark:border-slate-600 hover:border-primary hover:bg-primary/5 cursor-pointer"
                  }`}
                  onClick={() => selectionComplete && fileInputRef.current?.click()}
                  onDragOver={(e) => selectionComplete && handleDragOver(e)}
                  onDrop={(e) => selectionComplete && handleDrop(e)}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx,.doc"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={!selectionComplete}
                  />

                  {!uploadedFile ? (
                    <div className="text-center">
                      <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                        <FileSpreadsheet className="h-7 w-7 text-primary" />
                      </div>
                      <p className="font-semibold text-base mb-1">
                        {selectionComplete ? "Click để chọn file hoặc kéo thả vào đây" : "Vui lòng chọn bài học trước"}
                      </p>
                      <p className="text-sm text-muted-foreground">Hỗ trợ .docx và .doc</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                        <FileText className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="font-semibold text-base mb-1">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Click để chọn file khác</p>
                    </div>
                  )}
                </div>

                {previewImport.isPending && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Đang xử lý file...</span>
                      <span className="font-medium">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" fillClassName="bg-blue-500" />
                  </div>
                )}

                {previewImport.isError && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                        Có lỗi xảy ra khi xử lý file
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-0.5">
                        Vui lòng kiểm tra định dạng file và thử lại
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button
                    onClick={handleUploadAndPreview}
                    isDisabled={!uploadedFile || !selectionComplete || previewImport.isPending}
                    className="gap-2 flex-1 py-5 text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    {previewImport.isPending ? "Đang xử lý..." : "Xem trước câu hỏi"}
                  </Button>
                  {uploadedFile && !previewImport.isPending && (
                    <Button variant="outline" onClick={handleReset} className="py-5 text-sm">
                      Đặt lại
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === "preview" && (
            <Card className="bg-white dark:bg-slate-900 shadow-sm border-gray-200 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold">Xem trước câu hỏi</h2>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">Tổng:</span>
                        <span className="font-semibold">{previewData?.totalQuestions}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="font-semibold text-green-600">{getKeepCount()} giữ lại</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                        <span className="font-semibold text-red-500">{getDeleteCount()} xóa</span>
                      </div>
                      {(previewData?.duplicatedCount ?? 0) > 0 && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-orange-400" />
                          <span className="font-semibold text-orange-500">{previewData?.duplicatedCount} trùng</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                    Chọn file khác
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 -mr-1">
                  {previewData?.questions.map((question, index) => {
                    const isEditing = editingQuestionId === question.id;
                    return (
                      <div
                        key={question.id}
                        className={`p-4 rounded-xl border transition-all ${
                          question.status === "DELETE"
                            ? "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-60"
                            : question.reused
                              ? "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-700"
                              : question.duplicated
                                ? "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-700"
                                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
                            <span className="px-1.5 py-0.5 rounded text-xs font-medium">
                              {getTypeBadge(question.questionType)}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-xs font-medium">
                              {getDifficultyBadge(question.questionLevel)}
                            </span>
                            {question.reused && (
                              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                                Tái sử dụng
                              </span>
                            )}
                            {question.duplicated && !question.reused && (
                              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                                Trùng lặp
                              </span>
                            )}
                            {question.status === "DELETE" && (
                              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400">
                                Đã xóa
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {!isEditing && question.status !== "DELETE" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                  onClick={() => openEdit(question)}
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleDeleteQuestion(question.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                </Button>
                              </>
                            )}
                            {question.status === "DELETE" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={() => handleToggleQuestionStatus(question.id, question.status)}
                              >
                                <RefreshCw className="h-3.5 w-3.5 text-green-600" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {isEditing ? (
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Nội dung câu hỏi
                              </label>
                              <textarea
                                value={editState.content}
                                onChange={(e) => setEditState((s) => ({ ...s, content: e.target.value }))}
                                className="w-full p-3 border rounded-xl min-h-20 bg-white dark:bg-gray-800 text-sm font-mono"
                                placeholder="Nội dung câu hỏi..."
                              />
                            </div>
                            {editState.options && (
                              <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                  Đáp án — click để chọn đáp án đúng
                                </label>
                                <div className="space-y-2">
                                  {editState.options.map((opt) => (
                                    <div
                                      key={opt.orderNo}
                                      onClick={() => handleSetCorrectOption(opt.orderNo)}
                                      className={`flex items-center gap-3 p-2.5 rounded-lg border-2 cursor-pointer transition-all select-none ${
                                        opt.correct
                                          ? "border-green-500 bg-green-50 dark:bg-green-900/30"
                                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300"
                                      }`}
                                    >
                                      <div
                                        className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${opt.correct ? "border-green-500 bg-green-500" : "border-gray-400"}`}
                                      >
                                        {opt.correct && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                      </div>
                                      <span className="font-semibold text-sm shrink-0 w-5">{opt.label}.</span>
                                      <input
                                        type="text"
                                        value={opt.content}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setEditState((s) => ({
                                            ...s,
                                            options:
                                              s.options?.map((o) =>
                                                o.orderNo === opt.orderNo ? { ...o, content: val } : o,
                                              ) ?? null,
                                          }));
                                        }}
                                        className="flex-1 bg-transparent outline-none text-sm"
                                        placeholder={`Nội dung đáp án ${opt.label}`}
                                      />
                                      {opt.correct && <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveEdit(question.id)}
                                isDisabled={updatePreviewQuestion.isPending}
                                className="gap-1"
                              >
                                <Save className="h-3 w-3" />
                                {updatePreviewQuestion.isPending ? "Đang lưu..." : "Lưu"}
                              </Button>
                              <Button size="sm" variant="outline" onClick={closeEdit} className="gap-1">
                                <X className="h-3 w-3" />
                                Hủy
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-black dark:text-white mb-2.5">
                              {question.editedContent || question.originalContent}
                            </p>
                            {question.questionType === "MCQ" && question.options && question.options.length > 0 && (
                              <div className="space-y-1.5">
                                {question.options.map((option, idx) => (
                                  <div
                                    key={idx}
                                    className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                                      option.correct
                                        ? "bg-green-100 dark:bg-green-900/50 border-2 border-green-500 dark:border-green-600 font-medium"
                                        : "bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                                    }`}
                                  >
                                    <span className="font-semibold shrink-0">
                                      {option.label || String.fromCharCode(65 + idx)}.
                                    </span>
                                    <span className="flex-1">{option.content}</span>
                                    {option.correct && (
                                      <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400 shrink-0" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            {question.questionType === "ESSAY" && question.canonicalAnswer && (
                              <div className="mt-2.5 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                                <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">Đáp án:</p>
                                <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                                  {question.canonicalAnswer}
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2 mt-5 pt-4 border-t dark:border-slate-700">
                  <Button
                    onClick={handleConfirmImport}
                    isDisabled={confirmImport.isPending || getKeepCount() === 0}
                    className="gap-2 flex-1 py-5 text-sm"
                  >
                    <Upload className="h-4 w-4" />
                    {confirmImport.isPending ? "Đang xác nhận..." : `Xác nhận import (${getKeepCount()} câu hỏi)`}
                  </Button>
                  <Button variant="outline" className="py-5 text-sm" onClick={handleReset}>
                    Hủy
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === "processing" && (
            <Card className="bg-white dark:bg-slate-900 shadow-sm border-gray-200 dark:border-slate-700">
              <CardContent className="pt-8 pb-12">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-5 animate-pulse">
                    <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Đang xử lý import...</h3>
                  <p className="text-sm text-muted-foreground">Hệ thống đang import câu hỏi. Vui lòng đợi...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === "completed" && (
            <Card className="bg-white dark:bg-slate-900 shadow-sm border-green-200 dark:border-green-900">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-green-100 dark:bg-green-900 shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">Import thành công!</h3>
                    <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                      {jobStatus
                        ? `Đã import thành công ${jobStatus.importedQuestions}/${jobStatus.totalQuestions} câu hỏi vào hệ thống.`
                        : "Ngân hàng câu hỏi đã được nhập vào hệ thống."}
                    </p>
                    {jobStatus && jobStatus.failedQuestions > 0 && (
                      <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                        Có {jobStatus.failedQuestions} câu hỏi import thất bại.
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button className="py-4 text-sm" onClick={() => navigate({ to: "/mentor/question/my" })}>
                        Xem danh sách câu hỏi
                      </Button>
                      <Button className="py-4 text-sm" variant="outline" onClick={handleReset}>
                        Import thêm file
                      </Button>
                    </div>
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

export default ImportQuestionForm;
