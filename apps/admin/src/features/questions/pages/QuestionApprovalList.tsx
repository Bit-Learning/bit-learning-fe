import { useEffect, useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { getCoreRowModel, type OnChangeFn, type PaginationState, useReactTable } from "@tanstack/react-table";
import { CheckCircle, XCircle, Eye, Calendar } from "lucide-react";
import { DataTablePagination } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  usePendingApproval,
  useApproveQuestions,
  useRejectQuestions,
  usePendingApprovalAll,
} from "../queries/useQuestion";
import { QuestionLevel, QuestionType, type QuestionResponse } from "../types/question.type";
import { QuestionDetailDialog } from "../components/QuestionDetailDialog";
import { RejectDialog } from "../components/RejectDialog";
import { useTableUrlState } from "@/shared/hooks/use-table-url-state";
import { cn } from "@/shared/lib/utils";
import { Header } from "@/layout/header";
import { QuestionBankTab } from "../components/QuestionBankTab";

const route = getRouteApi("/_authenticated/questions/");

export function QuestionApprovalList() {
  const searchParams = route.useSearch();
  const navigate = route.useNavigate();
  const activeTab = searchParams.tab || "pending";
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [viewQuestion, setViewQuestion] = useState<QuestionResponse | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const { pagination: tablePagination, onPaginationChange } = useTableUrlState({
    search: searchParams,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: false },
    columnFilters: [],
  });
  const page = tablePagination.pageIndex;
  const PAGE_SIZE = tablePagination.pageSize;

  const { data: response, isLoading } = usePendingApproval(
    { page, size: PAGE_SIZE },
    { enabled: activeTab === "pending" },
  );

  const { data: questionsAll } = usePendingApprovalAll();

  const approveQuestions = useApproveQuestions();
  const rejectQuestions = useRejectQuestions();

  const questions = response?.data || [];
  const pagination = response?.page;

  useEffect(() => {
    setSelectedQuestions([]);
  }, [page, activeTab]);

  useEffect(() => {
    if (activeTab === "pending" && pagination && pagination.totalPages > 0 && page >= pagination.totalPages) {
      navigate({
        replace: true,
        search: (prev) => ({
          ...prev,
          page: pagination.totalPages <= 1 ? undefined : pagination.totalPages,
        }),
      });
    }
  }, [activeTab, navigate, page, pagination]);

  const handleTabChange = (tab: string) => {
    if (tab !== "pending" && tab !== "bank") return;
    setSelectedQuestions([]);
    navigate({
      search: (prev) => ({
        ...prev,
        tab: tab === "pending" ? undefined : tab,
        page: undefined,
      }),
    });
  };

  const pendingPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === "function" ? updater(tablePagination) : updater;
    onPaginationChange({
      pageIndex: next.pageSize !== tablePagination.pageSize ? 0 : next.pageIndex,
      pageSize: next.pageSize,
    });
  };

  // eslint-disable-next-line react-hooks/incompatible-library
  const pendingTable = useReactTable({
    data: questions,
    columns: [],
    state: {
      pagination: tablePagination,
    },
    onPaginationChange: pendingPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pagination?.totalPages ?? 0,
  });

  const handleSelectQuestion = (id: number) => {
    setSelectedQuestions((prev) => (prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questionsAll?.data?.map((q) => q.id)!);
    }
  };

  const handleApprove = () => {
    if (selectedQuestions.length === 0) return;
    approveQuestions.mutate(
      { questionIds: selectedQuestions },
      {
        onSuccess: () => setSelectedQuestions([]),
      },
    );
  };

  const handleReject = (reason: string) => {
    if (selectedQuestions.length === 0) return;
    rejectQuestions.mutate(
      { questionIds: selectedQuestions, rejectReason: reason },
      {
        onSuccess: () => {
          setSelectedQuestions([]);
          setRejectDialogOpen(false);
        },
      },
    );
  };

  const getDifficultyBadge = (level: QuestionLevel) => {
    const config = {
      [QuestionLevel.EASY]: { variant: "default" as const, label: "Dễ" },
      [QuestionLevel.MEDIUM]: {
        variant: "secondary" as const,
        label: "Trung bình",
      },
      [QuestionLevel.HARD]: { variant: "destructive" as const, label: "Khó" },
    };
    const { variant, label } = config[level];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (isLoading && activeTab === "pending") {
    return (
      <>
        <Header />

        <div className="flex flex-1 flex-col gap-2 sm:gap-6 p-6">
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
            <h1 className="text-2xl font-bold mb-2">Quản lý ngân hàng câu hỏi</h1>
            <p className="text-muted-foreground text-sm">Phê duyệt câu hỏi mới và quản lý ngân hàng câu hỏi hiện có</p>
          </div>
          {activeTab === "pending" && selectedQuestions.length > 0 && (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleApprove} className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Phê duyệt ({selectedQuestions.length})
              </Button>
              <Button variant="destructive" onClick={() => setRejectDialogOpen(true)} className="gap-2">
                <XCircle className="h-4 w-4" />
                Từ chối ({selectedQuestions.length})
              </Button>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2 px-6 py-3 text-base font-medium">
              <CheckCircle className="h-4 w-4" />
              Chờ phê duyệt
              <Badge variant="secondary" className="ml-1">
                {questionsAll?.page?.totalElements}
              </Badge>
            </TabsTrigger>

            <TabsTrigger value="bank" className="gap-2 px-6 py-3 text-base font-medium">
              <Eye className="h-4 w-4" />
              Ngân hàng câu hỏi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg">
                <CheckCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Không có câu hỏi nào cần phê duyệt</h3>
                <p className="text-sm text-muted-foreground">Tất cả câu hỏi đã được xử lý</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedQuestions.length === questions.length && questions.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Nội dung câu hỏi</TableHead>
                      <TableHead>Mức độ</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Ngày gửi</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map((question: QuestionResponse, index: number) => (
                      <TableRow
                        key={question.id}
                        className={cn(selectedQuestions.includes(question.id) && "bg-muted/50")}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedQuestions.includes(question.id)}
                            onCheckedChange={() => handleSelectQuestion(question.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium line-clamp-1">
                              {index + 1}: {question.content}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{getDifficultyBadge(question.questionLevel)}</TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {question.questionType === QuestionType.MCQ ? "Trắc nghiệm" : "Tự luận"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDate(question.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => setViewQuestion(question)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {pagination && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Hiển thị {page * PAGE_SIZE + 1} đến {Math.min((page + 1) * PAGE_SIZE, pagination.totalElements)} trong{" "}
                  {pagination.totalElements} câu hỏi
                </p>
                <DataTablePagination table={pendingTable} pageCount={pagination.totalPages} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="bank">
            <QuestionBankTab
              keyword={searchParams.keyword || ""}
              pagination={tablePagination}
              onPaginationChange={onPaginationChange}
              navigate={navigate}
            />
          </TabsContent>
        </Tabs>

        <QuestionDetailDialog
          question={viewQuestion}
          open={!!viewQuestion}
          onOpenChange={(open: any) => !open && setViewQuestion(null)}
        />

        <RejectDialog
          open={rejectDialogOpen}
          onOpenChange={setRejectDialogOpen}
          onConfirm={handleReject}
          count={selectedQuestions.length}
        />
      </div>
    </>
  );
}
