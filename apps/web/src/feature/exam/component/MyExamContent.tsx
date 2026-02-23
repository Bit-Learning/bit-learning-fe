import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Search, Download, Eye, FileText, Clock, Award, Calendar } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Input } from "@workspace/ui/components/Input";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { useMyExams, useDownloadExam } from "../queries/useExam";

const MyExamsContent: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const { data: response, isLoading } = useMyExams({ page, size, search });
  const downloadExam = useDownloadExam();

  const exams = response?.data || [];
  const pagination = response?.page;

  const handleDownload = (examId: number, examName: string, format: "pdf" | "docx") => {
    downloadExam.mutate({ id: examId, format, name: examName });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Đề thi của tôi</h1>
          <p className="text-muted-foreground">Quản lý các đề thi bạn đã tạo</p>
        </div>
        <Button onClick={() => navigate({ to: "/mentor/question/generate-from-questions" })} className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo đề thi mới
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên hoặc mã đề thi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      ) : !exams.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">{search ? "Không tìm thấy đề thi" : "Chưa có đề thi nào"}</h3>
            <p className="text-muted-foreground mb-6">
              {search ? "Thử tìm kiếm với từ khóa khác" : "Bắt đầu bằng cách tạo đề thi đầu tiên"}
            </p>
            {!search && (
              <Button onClick={() => navigate({ to: "/mentor/question/generate-from-questions" })} className="gap-2">
                <Plus className="h-4 w-4" />
                Tạo đề thi mới
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Tìm thấy <span className="font-semibold">{pagination?.totalElements || 0}</span> đề thi
            </p>
          </div>

          <div className="space-y-4">
            {exams.map((exam) => (
              <Card key={exam.id} className="hover:shadow-lg transition-all duration-200 hover:border-primary/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold truncate">{exam.name}</h3>
                        {exam.isPublished && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Đã công bố
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">Mã đề: {exam.code}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Thời gian</p>
                            <p className="text-sm font-semibold">{exam.durationInMinutes} phút</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900">
                            <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Tổng điểm</p>
                            <p className="text-sm font-semibold">{exam.totalScore}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                            <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Câu hỏi</p>
                            <p className="text-sm font-semibold">{exam.totalQuestions || 0} câu</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                            <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Ngày tạo</p>
                            <p className="text-sm font-semibold">
                              {new Date(exam.createdAt).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate({ to: `/exams/${exam.id}` })}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Xem chi tiết
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(exam.id, exam.name, "pdf")}
                      className="gap-2"
                      isDisabled={downloadExam.isPending}
                    >
                      <Download className="h-4 w-4" />
                      Tải PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(exam.id, exam.name, "docx")}
                      className="gap-2"
                      isDisabled={downloadExam.isPending}
                    >
                      <Download className="h-4 w-4" />
                      Tải Word
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button variant="outline" onClick={() => setPage((p) => Math.max(0, p - 1))} isDisabled={page === 0}>
                Trước
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {page + 1} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                isDisabled={page >= pagination.totalPages - 1}
              >
                Sau
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyExamsContent;
