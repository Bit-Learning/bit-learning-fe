import { useState } from "react";
import { getCoreRowModel, type OnChangeFn, type PaginationState, useReactTable } from "@tanstack/react-table";
import { Search as SearchIcon, ChevronDown, FileText, ArrowDownIcon, ArrowUpIcon } from "lucide-react";
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
import { useSubjects } from "@/features/curriculum/queries/useSubject";

const TYPE_LABELS: Record<ExamType, { label: string; className: string }> = {
  EXAM: { label: "Đề thi", className: "bg-blue-100 text-blue-700" },
  PRACTICE: { label: "Luyện tập", className: "bg-violet-100 text-violet-700" },
};

type ExamBankTabProps = {
  keyword: string;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  onKeywordChange: (keyword: string) => void;
};

export function ExamBankTab({
  keyword,
  pagination: tablePagination,
  onPaginationChange,
  onKeywordChange,
}: ExamBankTabProps) {
  const page = tablePagination.pageIndex;
  const pageSize = tablePagination.pageSize;
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [subjectId, setSubjectId] = useState<number | undefined>();

  const [searchValue, setSearchValue] = useState(keyword);
  const [viewExamId, setViewExamId] = useState<number | null>(null);
  const [toggleExam, setToggleExam] = useState<ExamBriefResponse | null>(null);

  const publishExamMutation = usePublishExam();

  const { data: response, isLoading } = useAllExams({
    page,
    size: pageSize,
    search: keyword || undefined,
    sort: `createdAt,${sortDirection}`,
    subjectId,
    approvalStatus: "APPROVED",
  });

  const { data: subjectResponse } = useSubjects(0, 100);

  const subjects = subjectResponse?.data || [];

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
            value={subjectId ?? ""}
            onChange={(e) => setSubjectId(e.target.value ? Number(e.target.value) : undefined)}
            className="appearance-none pl-3 pr-8 py-2 bg-background border border-input rounded-lg text-sm h-10"
          >
            <option value="">Môn học: Tất cả</option>

            {subjects.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
        <Button onClick={handleSearch}>Tìm kiếm</Button>
      </div>

      {exams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{"Chưa có đề thi nào"}</h3>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Đề thi</TableHead>
                <TableHead>Mã đề</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Môn học</TableHead>
                <TableHead>Tác giả</TableHead>
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
                      <button
                        onClick={() => setViewExamId(exam.id)}
                        className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline text-left"
                      >
                        {exam.name}
                      </button>{" "}
                    </TableCell>

                    <TableCell>
                      <span className="py-1 bg-muted text-blue-600 dark:text-blue-400 rounded-md text-sm font-semibold font-mono">
                        {exam.code}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${typeConf.className} mt-1`}>{typeConf.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{exam.subject?.name || "Tin học"}</span>
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
