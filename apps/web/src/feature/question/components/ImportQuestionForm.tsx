import { useState, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Download, Upload, FileText, CheckCircle, AlertCircle, FileSpreadsheet, Info } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/Card";
import { Progress } from "@workspace/ui/components/Progress";
import { toast } from "@/shared/components/Sonner";
import { useImportQuestions } from "../queries/useQuestion";

const ImportQuestionForm: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importQuestions = useImportQuestions();

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error({
          title: "Lỗi",
          description: "Kích thước file tối đa 10MB",
        });
        return;
      }
      setUploadedFile(file);
      setImportSuccess(false);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith(".docx") || file.name.endsWith(".doc"))) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error({
          title: "Lỗi",
          description: "Kích thước file tối đa 10MB",
        });
        return;
      }
      setUploadedFile(file);
      setImportSuccess(false);
      setUploadProgress(0);
    } else {
      toast.error({
        title: "Lỗi",
        description: "Chỉ hỗ trợ file .docx và .doc",
      });
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

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
      await importQuestions.mutateAsync(uploadedFile);
      clearInterval(interval);
      setUploadProgress(100);
      setImportSuccess(true);
    } catch {
      clearInterval(interval);
      setUploadProgress(0);
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setImportSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadTemplate = () => {
    toast.info({
      title: "Tính năng đang phát triển",
      description: "Template sẽ sớm có sẵn để tải xuống",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate({ to: "/mentor/question/my" })} className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Button>
        <h1 className="text-3xl font-bold">Import ngân hàng câu hỏi</h1>
        <p className="text-muted-foreground mt-1">Nhập câu hỏi từ file Word (.docx) với định dạng chuẩn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Upload file</h2>
                  <p className="text-sm text-muted-foreground mt-1">Chọn file Word chứa ngân hàng câu hỏi</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="gap-2">
                  <Download className="h-4 w-4" />
                  Tải mẫu
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="relative rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary transition-colors cursor-pointer p-8"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.doc"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {!uploadedFile ? (
                  <div className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <FileSpreadsheet className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-medium mb-2">Click để chọn file hoặc kéo thả vào đây</p>
                    <p className="text-sm text-muted-foreground">Hỗ trợ: .docx, .doc (Tối đa 10MB)</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                      <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="font-medium mb-1">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                    {importSuccess && (
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Import thành công!</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {importQuestions.isPending && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Đang xử lý file...</span>
                    <span className="font-medium">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {importQuestions.isError && (
                <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">Có lỗi xảy ra khi import</p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      Vui lòng kiểm tra định dạng file và thử lại
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-6">
                <Button
                  onClick={handleUpload}
                  isDisabled={!uploadedFile || importQuestions.isPending || importSuccess}
                  className="gap-2 flex-1"
                >
                  <Upload className="h-4 w-4" />
                  {importQuestions.isPending ? "Đang xử lý..." : "Bắt đầu import"}
                </Button>
                {(uploadedFile || importSuccess) && !importQuestions.isPending && (
                  <Button variant="outline" onClick={handleReset}>
                    Chọn file khác
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {importSuccess && (
            <Card className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">Import thành công!</h3>
                    <p className="text-sm text-green-800 dark:text-green-200 mb-4">
                      Ngân hàng câu hỏi đã được nhập vào hệ thống. Bạn có thể xem danh sách câu hỏi hoặc tiếp tục import
                      file khác.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => navigate({ to: "/mentor/question/my" })}>
                        Xem danh sách câu hỏi
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleReset}>
                        Import thêm file
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Hướng dẫn</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">1</span>
                </div>
                <p className="text-muted-foreground">Tải file mẫu Word để xem định dạng yêu cầu</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">2</span>
                </div>
                <p className="text-muted-foreground">Mỗi câu hỏi bắt đầu với [Info:...] chứa metadata</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">3</span>
                </div>
                <p className="text-muted-foreground">MCQ: Liệt kê đáp án A, B, C, D và đánh dấu đúng</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">4</span>
                </div>
                <p className="text-muted-foreground">ESSAY: Chỉ cần câu hỏi và đáp án chi tiết</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <h2 className="text-lg font-semibold">Lưu ý</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• File phải theo đúng định dạng mẫu Word</p>
              <p>• Type: MCQ (trắc nghiệm) hoặc ESSAY (tự luận)</p>
              <p>• Level: EASY, MEDIUM, hoặc HARD</p>
              <p>• SubjectCode, LessonCode phải tồn tại</p>
              <p>• Kích thước file tối đa: 10MB</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ImportQuestionForm;
