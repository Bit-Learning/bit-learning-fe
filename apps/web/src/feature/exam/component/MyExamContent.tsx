import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Search, Download, Eye, FileText, Clock, MoreVertical } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Input } from "@workspace/ui/components/Input";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { useMyExams, useDownloadExam } from "../queries/useExam";
import { Pagination } from "@/shared/components/Pagination";

const MyExamsContent: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const { data: response, isLoading } = useMyExams({ page, size, search });
  const downloadExam = useDownloadExam();

  const exams = response?.data || [];
  const pagination = response?.page;

  const handleDownload = (examId: number, examName: string, format: "pdf" | "docx") => {
    downloadExam.mutate({ id: examId, format, name: examName });
    setOpenMenuId(null);
  };

  const getStatusBadge = (isPublished: boolean) => {
    if (isPublished) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
          Đã xuất bản
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
        Nháp
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Đề thi của tôi</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý các đề thi bạn đã tạo cho học sinh</p>
            </div>
            <Button onClick={() => navigate({ to: "/mentor/question/generate-from-questions" })} className="gap-2">
              <Plus className="h-4 w-4" />
              Tạo đề thi mới
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc mã đề thi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-800"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : !exams.length ? (
            <div className="p-16 text-center">
              <div className="flex flex-col items-center">
                <FileText className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {search ? "Không tìm thấy đề thi" : "Chưa có đề thi nào"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {search ? "Thử tìm kiếm với từ khóa khác" : "Bắt đầu bằng cách tạo đề thi đầu tiên"}
                </p>
                {!search && (
                  <Button
                    onClick={() => navigate({ to: "/mentor/question/generate-from-questions" })}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Tạo đề thi mới
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left p-4 font-semibold text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        THÔNG TIN ĐỀ THI
                      </th>
                      <th className="text-left p-4 font-semibold text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        MÃ ĐỀ
                      </th>
                      <th className="text-left p-4 font-semibold text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        THỜI GIAN
                      </th>
                      <th className="text-left p-4 font-semibold text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        THÁNG ĐIỂM
                      </th>
                      <th className="text-left p-4 font-semibold text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        TRẠNG THÁI
                      </th>
                      <th className="text-center p-4 font-semibold text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        THAO TÁC
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800">
                    {exams.map((exam) => (
                      <tr
                        key={exam.id}
                        className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 shrink-0">
                              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-white line-clamp-1">{exam.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Cập nhật {new Date(exam.createdAt).toLocaleDateString("vi-VN")}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{exam.code}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{exam.durationInMinutes} ph</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{exam.totalScore}</span>
                        </td>
                        <td className="p-4">{getStatusBadge(exam.isPublished)}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1 relative">
                            <button
                              className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 dark:text-gray-400 dark:hover:text-primary dark:hover:bg-gray-700 rounded transition-colors"
                              onClick={() => navigate({ to: `/mentor/exam/${exam.id}` })}
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Hiển thị <span className="font-semibold text-gray-900 dark:text-white">{page * size + 1}</span> đến{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Math.min((page + 1) * size, pagination?.totalElements || exams.length)}
                  </span>{" "}
                  trong{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {pagination?.totalElements || exams.length}
                  </span>{" "}
                  đề thi
                </p>

                {pagination && pagination.totalPages > 1 && (
                  <Pagination currentPage={page} totalPages={pagination.totalPages} onPageChange={setPage} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyExamsContent;
