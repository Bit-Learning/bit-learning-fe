import { useEffect, useState } from "react";
import { CheckCircle, Eye, CheckCircle2, FileText, ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useGetPendingExams, useApproveExam, useRejectExam } from "../queries/useExam";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { ExamBriefResponse, ExamSearchParams, ExamType } from "../types/exam.type";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/Pagination";
import { ExamDetailModal } from "../components/ExamDetailModal";
import { ExamBankTab } from "../components/ExamBankTab";
import { Header } from "@/layout/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const TYPE_LABELS: Record<ExamType, { label: string; className: string }> = {
  EXAM: { label: "Đề thi", className: "bg-blue-100 text-blue-700" },
  PRACTICE: { label: "Luyện tập", className: "bg-violet-100 text-violet-700" },
};

const PENDING_PAGE_SIZE = 20;

const AdminExamApprovalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"pending" | "bank">("pending");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [detailExamId, setDetailExamId] = useState<number | null>(null);

  const [bankKeyword, setBankKeyword] = useState("");
  const [bankPagination, setBankPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const params: ExamSearchParams = {
    page,
    size: PENDING_PAGE_SIZE,
    sort: `createdAt,${sortDirection}`,
  };

  const { data: response, isLoading } = useGetPendingExams(params);
  const approveMutation = useApproveExam();
  const rejectMutation = useRejectExam();

  const exams: ExamBriefResponse[] = response?.data || [];
  const totalPages: number = response?.page?.totalPages || 0;
  const totalElements: number = response?.page?.totalElements || 0;

  useEffect(() => {
    setSelectedIds([]);
  }, [page, activeTab]);

  const handleTabChange = (tab: string) => {
    if (tab !== "pending" && tab !== "bank") return;
    setActiveTab(tab);
    setSelectedIds([]);
    setPage(0);
  };

  if (isLoading && activeTab === "pending") {
    return (
      <>
        <Header />
        <div className="flex flex-1 flex-col gap-6 p-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="flex flex-1 flex-col gap-2 sm:gap-6 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Quản lý đề thi</h1>
            <p className="text-muted-foreground text-sm">Phê duyệt đề thi mới và quản lý kho đề thi hiện có</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2 px-6 py-3 text-base font-medium">
              <CheckCircle className="h-4 w-4" />
              Chờ phê duyệt
              {totalElements > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {totalElements}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="bank" className="gap-2 px-6 py-3 text-base font-medium">
              <FileText className="h-4 w-4" />
              Kho đề thi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {exams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg">
                <CheckCircle2 className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">"Không có đề thi nào chờ phê duyệt"</h3>
                <p className="text-sm text-muted-foreground">Tất cả đề thi đã được xử lý</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Đề thi</TableHead>
                      <TableHead>Mã đề</TableHead>
                      <TableHead>Loại đề</TableHead>
                      <TableHead>Môn học</TableHead>
                      <TableHead>Giảng viên</TableHead>
                      <TableHead>
                        <button
                          className="flex items-center gap-1 hover:text-primary transition-colors uppercase"
                          onClick={() => setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"))}
                        >
                          Ngày tạo
                          {sortDirection === "desc" ? (
                            <ArrowDownIcon className="h-4 w-4" />
                          ) : (
                            <ArrowUpIcon className="h-4 w-4" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams.map((exam) => {
                      const isSelected = selectedIds.includes(exam.id);
                      const typeConf = TYPE_LABELS[exam.type];
                      return (
                        <TableRow key={exam.id} className={cn(isSelected && "bg-muted/50")}>
                          <TableCell>
                            <button
                              onClick={() => setDetailExamId(exam.id)}
                              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline text-left"
                            >
                              {exam.name}
                            </button>
                          </TableCell>
                          <TableCell>
                            <span className="py-1 bg-muted text-blue-600 dark:text-blue-400 rounded-md text-sm font-semibold font-mono">
                              {exam.code}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 mt-1 text-sm ">
                              <Badge className={typeConf.className}>{typeConf.label}</Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{exam.subject?.name || "Tin học"}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {exam.createdBy?.firstName + " " + exam.createdBy?.lastName}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {format(new Date(exam.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => setDetailExamId(exam.id)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{totalElements} đề thi chờ duyệt</p>
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="bank">
            <ExamBankTab
              keyword={bankKeyword}
              pagination={bankPagination}
              onPaginationChange={setBankPagination}
              onKeywordChange={setBankKeyword}
            />
          </TabsContent>
        </Tabs>
      </div>

      <ExamDetailModal
        examId={detailExamId}
        onClose={() => setDetailExamId(null)}
        onApprove={(ids) => approveMutation.mutate(ids, { onSuccess: () => setDetailExamId(null) })}
        onReject={(ids, reason) =>
          rejectMutation.mutate({ examIds: ids, rejectReason: reason }, { onSuccess: () => setDetailExamId(null) })
        }
        isApproving={approveMutation.isPending}
        isRejecting={rejectMutation.isPending}
      />
    </>
  );
};

export default AdminExamApprovalPage;
