import { useState } from "react";
import { getCoreRowModel, type OnChangeFn, type PaginationState, useReactTable } from "@tanstack/react-table";
import { Search as SearchIcon, ChevronDown, FileText, Clock } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { DataTablePagination } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAllExams, usePublishExam } from "../queries/useExam";
import type { ExamBriefResponse, ExamType } from "../types/exam.type";
import { ExamDetailModal } from "./ExamDetailModal";
import { TogglePublishConfirm } from "./TogglePublishConfirm";

const TYPE_LABELS: Record<ExamType, { label: string; className: string }> = {
  EXAM: { label: "Đề thi", className: "bg-blue-100 text-blue-700" },
  PRACTICE: { label: "Luyện tập", className: "bg-violet-100 text-violet-700" },
};

type ExamBankTabProps = {
  keyword: string;
  examType: string;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  onKeywordChange: (keyword: string) => void;
  onExamTypeChange: (type: string) => void;
};

export function ExamBankTab({
  keyword,
  examType,
  pagination: tablePagination,
  onPaginationChange,
  onKeywordChange,
  onExamTypeChange,
}: ExamBankTabProps) {
  const page = tablePagination.pageIndex;
  const pageSize = tablePagination.pageSize;

  const [searchValue, setSearchValue] = useState(keyword);
  const [viewExamId, setViewExamId] = useState<number | null>(null);
  const [toggleExam, setToggleExam] = useState<ExamBriefResponse | null>(null);

  const publishExamMutation = usePublishExam();

  const { data: response, isLoading } = useAllExams({
    page,
    size: pageSize,
    search: keyword || undefined,
  });

  const exams: ExamBriefResponse[] = response?.data || [];
  const pagination = response?.page;

  const bankPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === "function" ? updater(tablePagination) : updater;
    onPaginationChange({
      pageIndex: next.pageSize !== tablePagination.pageSize ? 0 : next.pageIndex,
      pageSize: next.pageSize,
    });
  };

  const bankTable = useReactTable({
    data: exams,
    columns: [],
    state: { pagination: tablePagination },
    onPaginationChange: bankPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pagination?.totalPages ?? 0,
  });

  const handleSearch = () => {
    onKeywordChange(searchValue.trim());
  };

  const handleTogglePublish = () => {
    if (!toggleExam) return;
    publishExamMutation.mutate(
      { id: toggleExam.id, isPublished: !toggleExam.isPublished },
      { onSuccess: () => setToggleExam(null) },
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm đề thi theo tên..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9"
          />
        </div>
        <div className="relative">
          <select
            value={examType}
            onChange={(e) => onExamTypeChange(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 bg-background border border-input rounded-lg text-sm text-foreground outline-none focus:ring-2 focus:ring-ring cursor-pointer h-10"
          >
            <option value="">Loại: Tất cả</option>
            <option value="EXAM">Đề thi</option>
            <option value="PRACTICE">Luyện tập</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
        <Button onClick={handleSearch}>Tìm kiếm</Button>
      </div>

      {exams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {keyword || examType ? "Không tìm thấy đề thi" : "Chưa có đề thi nào"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {keyword || examType ? "Thử tìm kiếm với từ khóa hoặc bộ lọc khác" : "Chưa có đề thi nào được phê duyệt"}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Đề thi</TableHead>
                <TableHead>Mã đề</TableHead>
                <TableHead>Môn học</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Tác giả</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => {
                const typeConf = TYPE_LABELS[exam.type];
                return (
                  <TableRow key={exam.id}>
                    <TableCell>
                      <p className="font-medium line-clamp-1">{exam.name}</p>
                      <Badge className={`${typeConf.className} mt-1`}>{typeConf.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 bg-muted text-blue-600 dark:text-blue-400 rounded-md text-xs font-semibold font-mono">
                        {exam.code}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{exam.subject?.name || "Tin học"}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {exam.durationInMinutes} phút
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {exam.createdBy ? exam.createdBy.firstName + " " + exam.createdBy.lastName : "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(exam.createdAt), "dd/MM/yyyy", { locale: vi })}
                    </TableCell>
                    <TableCell>
                      {exam.isPublished ? (
                        <Badge className="bg-emerald-100 text-emerald-700">Hiển thị</Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-500">Đang ẩn</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex items-center justify-start gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-blue-100"
                          onClick={() => setViewExamId(exam.id)}
                        >
                          Chi tiết
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setToggleExam(exam)}
                          className={
                            exam.isPublished
                              ? "border-red-500 text-red-600 hover:bg-red-50"
                              : "border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                          }
                        >
                          {exam.isPublished ? "Ẩn" : "Hiển thị"}
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

      {pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Hiển thị {page * pageSize + 1} đến {Math.min((page + 1) * pageSize, pagination.totalElements)} trong{" "}
            {pagination.totalElements} đề thi
          </p>
          <DataTablePagination table={bankTable} pageCount={pagination.totalPages} />
        </div>
      )}

      <ExamDetailModal examId={viewExamId} onClose={() => setViewExamId(null)} mode="view" />

      <TogglePublishConfirm
        exam={toggleExam}
        isPending={publishExamMutation.isPending}
        onConfirm={handleTogglePublish}
        onClose={() => setToggleExam(null)}
      />
    </div>
  );
}
