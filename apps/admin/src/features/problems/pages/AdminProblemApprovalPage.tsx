import React, { useEffect, useState } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  Eye,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Code2,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Difficulty, type ProblemBriefResponse } from "../types/problem.type";
import { useApproveProblem, useGetPendingProblems, useRejectProblem } from "../queries/useProblem";
import { toast } from "@/components/Sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { Pagination } from "@/components/Pagination";
import { DetailModal } from "../components/ProblemDetailModal";
import { ProblemBankTab } from "../components/ProblemBankTab";
import { Header } from "@/layout/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const difficultyConfig: Record<Difficulty, { label: string; className: string }> = {
  [Difficulty.EASY]: { label: "Dễ", className: "bg-emerald-100 text-emerald-700" },
  [Difficulty.MEDIUM]: { label: "Trung bình", className: "bg-amber-100 text-amber-700" },
  [Difficulty.HARD]: { label: "Khó", className: "bg-rose-100 text-rose-700" },
};

const PENDING_PAGE_SIZE = 20;

const AdminProblemApprovalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"pending" | "bank">("pending");

  // --- Pending tab state ---
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [detailProblemId, setDetailProblemId] = useState<string | null>(null);
  const [showBatchRejectForm, setShowBatchRejectForm] = useState(false);
  const [batchRejectReason, setBatchRejectReason] = useState("");

  // --- Bank tab state ---
  const [bankKeyword, setBankKeyword] = useState("");
  const [bankDifficulty, setBankDifficulty] = useState("");
  const [bankPagination, setBankPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const { data: response, isLoading } = useGetPendingProblems({
    page,
    size: PENDING_PAGE_SIZE,
    sort: "createdAt,desc",
  });
  const approveMutation = useApproveProblem();
  const rejectMutation = useRejectProblem();

  const problems: ProblemBriefResponse[] = response?.data || [];
  const totalPages: number = response?.page?.totalPages || 0;
  const totalElements: number = response?.page?.totalElements || 0;

  const filteredProblems = problems.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase());
    const matchDifficulty = difficultyFilter === "all" || p.difficulty === difficultyFilter;
    return matchSearch && matchDifficulty;
  });

  useEffect(() => {
    setSelectedIds([]);
  }, [page, activeTab]);

  const handleSelectAll = () => {
    if (selectedIds.length === filteredProblems.length && filteredProblems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProblems.map((p) => Number(p.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const numId = Number(id);
    setSelectedIds((prev) => (prev.includes(numId) ? prev.filter((x) => x !== numId) : [...prev, numId]));
  };

  const handleBatchApprove = () => {
    approveMutation.mutate(selectedIds.map(String), {
      onSuccess: () => setSelectedIds([]),
    });
  };

  const handleBatchReject = () => {
    if (!batchRejectReason.trim()) {
      toast.error({ title: "Lỗi", description: "Vui lòng nhập lý do từ chối" });
      return;
    }
    rejectMutation.mutate(
      { problemIds: selectedIds.map(String), rejectReason: batchRejectReason.trim() },
      {
        onSuccess: () => {
          setSelectedIds([]);
          setShowBatchRejectForm(false);
          setBatchRejectReason("");
        },
      },
    );
  };

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
            <h1 className="text-2xl font-bold mb-2">Quản lý bài tập lập trình</h1>
            <p className="text-muted-foreground text-sm">Phê duyệt bài tập mới và quản lý kho bài tập hiện có</p>
          </div>

          {activeTab === "pending" && selectedIds.length > 0 && !showBatchRejectForm && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleBatchApprove}
                className="gap-2"
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Phê duyệt ({selectedIds.length})
              </Button>
              <Button variant="destructive" onClick={() => setShowBatchRejectForm(true)} className="gap-2">
                <XCircle className="h-4 w-4" />
                Từ chối ({selectedIds.length})
              </Button>
            </div>
          )}
        </div>

        {showBatchRejectForm && selectedIds.length > 0 && (
          <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/20 p-4 space-y-3">
            <p className="text-sm font-medium text-rose-700 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Từ chối {selectedIds.length} bài tập — nhập lý do:
            </p>
            <textarea
              value={batchRejectReason}
              onChange={(e) => setBatchRejectReason(e.target.value)}
              placeholder="Mô tả lý do từ chối..."
              rows={2}
              className="w-full text-sm rounded-lg border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-800 px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none placeholder:text-slate-400"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowBatchRejectForm(false);
                  setBatchRejectReason("");
                }}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBatchReject}
                disabled={rejectMutation.isPending}
                className="gap-2"
              >
                {rejectMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        )}

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
              <Code2 className="h-4 w-4" />
              Kho bài tập
            </TabsTrigger>
          </TabsList>

          {/* ── PENDING TAB ── */}
          <TabsContent value="pending" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring outline-none text-sm transition-all"
                  placeholder="Tìm kiếm theo tên, slug..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="relative">
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2.5 bg-background border border-input rounded-lg text-sm text-foreground outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                >
                  <option value="all">Độ khó: Tất cả</option>
                  <option value={Difficulty.EASY}>Dễ</option>
                  <option value={Difficulty.MEDIUM}>Trung bình</option>
                  <option value={Difficulty.HARD}>Khó</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {filteredProblems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg">
                <CheckCircle2 className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {search || difficultyFilter !== "all"
                    ? "Không tìm thấy bài tập phù hợp"
                    : "Không có bài tập nào chờ phê duyệt"}
                </h3>
                <p className="text-sm text-muted-foreground">Tất cả bài tập đã được xử lý</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={filteredProblems.length > 0 && selectedIds.length === filteredProblems.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>Độ khó</TableHead>
                      <TableHead>Tác giả</TableHead>
                      <TableHead>Ngày gửi</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProblems.map((problem) => {
                      const isSelected = selectedIds.includes(Number(problem.id));
                      return (
                        <TableRow key={problem.id} className={cn(isSelected && "bg-muted/50")}>
                          <TableCell>
                            <Checkbox checked={isSelected} onCheckedChange={() => handleSelectOne(problem.id)} />
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() => setDetailProblemId(problem.id)}
                              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline text-left"
                            >
                              {problem.title}
                            </button>
                            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                              {problem.tags?.map((t: any) => t.name).join(", ") || problem.slug}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge className={difficultyConfig[problem.difficulty].className}>
                              {difficultyConfig[problem.difficulty].label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {problem.createdBy?.firstName + " " + problem.createdBy?.lastName}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {format(new Date(problem.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => setDetailProblemId(problem.id)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => approveMutation.mutate([problem.id])}
                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedIds([Number(problem.id)]);
                                  setShowBatchRejectForm(true);
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4" />
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
                <p className="text-sm text-muted-foreground">{totalElements} bài tập chờ duyệt</p>
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="bank">
            <ProblemBankTab
              keyword={bankKeyword}
              difficulty={bankDifficulty}
              pagination={bankPagination}
              onPaginationChange={setBankPagination}
              onKeywordChange={setBankKeyword}
              onDifficultyChange={setBankDifficulty}
            />
          </TabsContent>
        </Tabs>
      </div>

      <DetailModal
        problemId={detailProblemId}
        onClose={() => setDetailProblemId(null)}
        onApprove={(ids) => approveMutation.mutate(ids, { onSuccess: () => setDetailProblemId(null) })}
        onReject={(ids, reason) =>
          rejectMutation.mutate(
            { problemIds: ids, rejectReason: reason },
            { onSuccess: () => setDetailProblemId(null) },
          )
        }
        isApproving={approveMutation.isPending}
        isRejecting={rejectMutation.isPending}
      />
    </>
  );
};

export default AdminProblemApprovalPage;
