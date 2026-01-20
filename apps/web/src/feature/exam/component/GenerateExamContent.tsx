import { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Download, Eye, FileText, Settings, Sparkles, BookOpen, Award, Clock } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Input } from "@workspace/ui/components/Input";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/Card";
import { Label } from "@workspace/ui/components/label";
import { Checkbox } from "@workspace/ui/components/Checkbox";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { toast } from "@workspace/ui/components/Sonner";
import { useLatestVersion, useMatrixDetail } from "@/feature/matrix/queries/useMatrix";
import { useGenerateExam, useGenerateExamFromUserQuestions, useExam, useDownloadExam } from "../queries/useExam";
import { useSelector } from "react-redux";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";

const GenerateExamContent: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const matrixId = (params as any).id ? Number((params as any).id) : undefined;
  const { userInfo } = useSelector(selectAuthStateInfo);

  const [examName, setExamName] = useState("");
  const [examCode, setExamCode] = useState("");
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [questionSource, setQuestionSource] = useState<"system" | "user">("system");
  const [generatedExamId, setGeneratedExamId] = useState<number | null>(null);

  const { data: matrix, isLoading: matrixLoading } = useMatrixDetail(matrixId!);
  const { data: latestVersion, isLoading: versionLoading } = useLatestVersion(matrixId!);
  const { data: examData, isLoading: examLoading } = useExam(generatedExamId!, { enabled: !!generatedExamId });

  const generateExam = useGenerateExam();
  const generateExamFromUserQuestions = useGenerateExamFromUserQuestions();
  const downloadExam = useDownloadExam();

  const handleGenerate = () => {
    if (!latestVersion) {
      toast.error({ title: "Lỗi", description: "Không tìm thấy version của ma trận" });
      return;
    }

    if (!examName || !examCode) {
      toast.error({ title: "Lỗi", description: "Vui lòng nhập tên và mã đề thi" });
      return;
    }

    const basePayload = {
      matrixVersionId: latestVersion.id,
      name: examName,
      code: examCode,
      shuffleOptions,
    };

    if (questionSource === "user") {
      if (!userInfo?.id) {
        toast.error({ title: "Lỗi", description: "Vui lòng đăng nhập lại" });
        return;
      }
      generateExamFromUserQuestions.mutate(
        { ...basePayload, createdBy: userInfo.id },
        { onSuccess: (response) => setGeneratedExamId(response.data.data!.id) },
      );
    } else {
      generateExam.mutate(basePayload, {
        onSuccess: (response) => setGeneratedExamId(response.data.data!.id),
      });
    }
  };

  const handleDownload = (format: "pdf" | "docx") => {
    if (!examData) return;
    downloadExam.mutate({ id: examData.id, format, name: examData.name });
  };

  if (matrixLoading || versionLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!matrix || !latestVersion) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-lg text-muted-foreground">Không tìm thấy ma trận hoặc version</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isGenerating = generateExam.isPending || generateExamFromUserQuestions.isPending;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate({ to: "/matrices" })} className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Button>
        <h1 className="text-3xl font-bold mb-2">Tạo đề thi từ ma trận</h1>
        <p className="text-muted-foreground">
          Tự động tạo đề thi từ ma trận: <span className="font-semibold">{matrix.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Thông tin ma trận</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Môn học</p>
                  <p className="font-medium">{matrix.subject.name}</p>
                  <p className="text-xs text-muted-foreground">{matrix.subject.code}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                  <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Version</p>
                  <p className="font-medium">
                    v{latestVersion.versionNo} - {latestVersion.name}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Tổng điểm</p>
                    <p className="font-semibold">{matrix.totalScore}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Thời gian</p>
                    <p className="font-semibold">{matrix.duration} phút</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Cài đặt tạo đề</h2>
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

              <div className="space-y-3 border-t pt-4">
                <Label>Nguồn câu hỏi</Label>
                <div className="space-y-2">
                  <div
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      questionSource === "system"
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 dark:border-gray-800 hover:border-gray-300"
                    }`}
                    onClick={() => setQuestionSource("system")}
                  >
                    <p className="font-medium text-sm">Câu hỏi hệ thống</p>
                    <p className="text-xs text-muted-foreground">Tất cả câu hỏi trong ngân hàng</p>
                  </div>
                  <div
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      questionSource === "user"
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 dark:border-gray-800 hover:border-gray-300"
                    }`}
                    onClick={() => setQuestionSource("user")}
                  >
                    <p className="font-medium text-sm">Câu hỏi của tôi</p>
                    <p className="text-xs text-muted-foreground">Chỉ câu hỏi do tôi tạo</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t pt-4">
                <Checkbox
                  id="shuffleOptions"
                  isSelected={shuffleOptions}
                  onChange={(isSelected) => setShuffleOptions(isSelected)}
                >
                  Xáo trộn thứ tự đáp án
                </Checkbox>
                <Label htmlFor="shuffleOptions" className="cursor-pointer text-sm">
                  Xáo trộn thứ tự đáp án
                </Label>
              </div>

              <Button onClick={handleGenerate} isDisabled={isGenerating} className="w-full gap-2 mt-4">
                <Sparkles className="h-4 w-4" />
                {isGenerating ? "Đang tạo đề..." : "Tạo đề thi"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Xem trước đề thi</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {examData ? `Đã tạo ${examData.examQuestions.length} câu hỏi` : 'Nhấn "Tạo đề thi" để xem kết quả'}
                  </p>
                </div>
                {examData && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate({ to: `/exams/${examData.id}` })}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Xem đầy đủ
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload("pdf")}
                      className="gap-2"
                      isDisabled={downloadExam.isPending}
                    >
                      <Download className="h-4 w-4" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload("docx")}
                      className="gap-2"
                      isDisabled={downloadExam.isPending}
                    >
                      <Download className="h-4 w-4" />
                      Word
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {examLoading ? (
                <div className="py-16 text-center">
                  <p className="text-muted-foreground">Đang tải đề thi...</p>
                </div>
              ) : !examData ? (
                <div className="py-16 text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Chưa có đề thi nào</h3>
                  <p className="text-muted-foreground">Cấu hình các tùy chọn bên trái và nhấn "Tạo đề thi"</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center border-b pb-4">
                    <h3 className="text-2xl font-bold mb-2">{examData.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {examData.subject && `Môn: ${examData.subject.name} • `}
                      Mã đề: {examData.code}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Thời gian: {examData.durationInMinutes} phút | Tổng điểm: {examData.totalScore}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {examData.examQuestions.length}
                      </div>
                      <div className="text-xs text-muted-foreground">Câu hỏi</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{examData.totalScore}</div>
                      <div className="text-xs text-muted-foreground">Tổng điểm</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {examData.durationInMinutes}
                      </div>
                      <div className="text-xs text-muted-foreground">Phút</div>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-150 overflow-y-auto">
                    {examData.examQuestions.slice(0, 5).map((eq) => (
                      <div key={eq.id} className="p-3 border rounded-lg">
                        <p className="text-sm font-medium mb-1">
                          <span className="font-bold">Câu {eq.questionNo}:</span> {eq.question.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {eq.score} điểm • {eq.question.questionType}
                        </p>
                      </div>
                    ))}
                    {examData.examQuestions.length > 5 && (
                      <p className="text-sm text-center text-muted-foreground">
                        ... và {examData.examQuestions.length - 5} câu hỏi khác
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GenerateExamContent;
