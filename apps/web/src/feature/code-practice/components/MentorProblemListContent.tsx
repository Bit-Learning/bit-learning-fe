import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Code2,
  Clock,
  BarChart3,
  Hash,
  FileCode,
  Settings,
} from "lucide-react";
import { Input } from "@workspace/ui/components/Input";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/Table";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { cn } from "@workspace/ui/lib/utils";
import { Difficulty, ProblemBriefResponse } from "../types/coding.type";
import { useProblems, useDeleteProblem } from "../queries/useCoding";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { StatCard } from "./StatCard";

const difficultyConfig = {
  EASY: { label: "Easy", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  MEDIUM: { label: "Medium", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  HARD: { label: "Hard", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/30" },
};

const DifficultyBadge: React.FC<{ difficulty: Difficulty }> = ({ difficulty }) => {
  const config = difficultyConfig[difficulty];
  return (
    <Badge variant="outline" className={cn("font-medium", config.color, config.bg, config.border)}>
      {config.label}
    </Badge>
  );
};

const TableSkeleton: React.FC = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <Skeleton key={i} className="h-16 w-full" />
    ))}
  </div>
);

interface MentorProblemListProps {
  initialPage?: number;
}

const MentorProblemListContent: React.FC<MentorProblemListProps> = ({ initialPage = 0 }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [visibility, setVisibility] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);

  const size = 15;

  const { data: problemsResponse, isLoading } = useProblems({
    page,
    size,
    sort: "createdAt,desc",
  });

  const deleteMutation = useDeleteProblem();

  const problems = problemsResponse?.data || [];
  const totalPages = problemsResponse?.page?.totalPages || 0;
  const totalElements = problemsResponse?.page?.totalElements || 0;

  const filteredProblems = problems.filter((p: ProblemBriefResponse) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase());
    const matchDifficulty = difficulty === "all" || p.difficulty === difficulty;
    const matchVisibility =
      visibility === "all" || (visibility === "public" && p.isPublic) || (visibility === "private" && !p.isPublic);
    return matchSearch && matchDifficulty && matchVisibility;
  });

  const stats = {
    total: totalElements,
    public: problems.filter((p: ProblemBriefResponse) => p.isPublic).length,
    private: problems.filter((p: ProblemBriefResponse) => !p.isPublic).length,
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <FileCode className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Quản lý Problem</h1>
              <p className="text-sm text-muted-foreground">Tạo và quản lý các bài tập coding</p>
            </div>
          </div>
          <Button onClick={() => navigate({ to: "/mentor/problem/create" })} className="gap-2">
            <Plus className="w-4 h-4" />
            Tạo Problem mới
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatCard icon={Code2} label="Tổng Problem" value={stats.total} />
          <StatCard icon={Eye} label="Công khai" value={stats.public} />
          <StatCard icon={EyeOff} label="Riêng tư" value={stats.private} />
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm theo tiêu đề, slug..."
                  className="pl-10"
                />
              </div>

              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full sm:w-36 h-9 px-3 py-1 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">Tất cả độ khó</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>

              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full sm:w-36 h-9 px-3 py-1 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">Tất cả</option>
                <option value="public">Công khai</option>
                <option value="private">Riêng tư</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4">
                <TableSkeleton />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead className="w-24">Độ khó</TableHead>
                    <TableHead className="w-24">Giới hạn</TableHead>
                    <TableHead className="w-24 text-center">Trạng thái</TableHead>
                    <TableHead className="w-36">Ngày tạo</TableHead>
                    <TableHead className="w-16 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProblems.map((problem: ProblemBriefResponse) => (
                    <TableRow key={problem.id} className="group">
                      <TableCell>
                        <div>
                          <p
                            className="font-medium group-hover:text-primary transition-colors cursor-pointer"
                            onClick={() => navigate({ to: `/mentor/problems/${problem.id}` })}
                          >
                            {problem.title}
                          </p>
                          <p className="text-sm text-muted-foreground">{problem.slug}</p>
                          {problem.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {problem.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  <Hash className="w-2.5 h-2.5 mr-0.5" />
                                  {tag}
                                </Badge>
                              ))}
                              {problem.tags.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{problem.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DifficultyBadge difficulty={problem.difficulty} />
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {problem.timeLimitMs}ms
                          </div>
                          <div className="flex items-center gap-1">
                            <BarChart3 className="w-3 h-3" />
                            {problem.memoryLimitMb}MB
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={problem.isPublic ? "default" : "secondary"}>
                          {problem.isPublic ? "Công khai" : "Riêng tư"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(problem.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                      </TableCell>
                      <TableCell>
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setOpenDropdownId(openDropdownId === problem.id ? null : problem.id)}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>

                          {openDropdownId === problem.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)} />
                              <div className="absolute right-0 top-full mt-1 w-48 bg-popover border rounded-md shadow-lg z-50 py-1">
                                <button
                                  onClick={() => {
                                    navigate({ to: `/mentor/problems/${problem.id}` });
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                                >
                                  <Eye className="w-4 h-4" />
                                  Xem chi tiết
                                </button>
                                <button
                                  onClick={() => {
                                    navigate({ to: `/mentor/problems/${problem.id}/edit` });
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                                >
                                  <Edit className="w-4 h-4" />
                                  Chỉnh sửa
                                </button>
                                <button
                                  onClick={() => {
                                    navigate({ to: `/mentor/problems/${problem.id}/testcases` });
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                                >
                                  <Settings className="w-4 h-4" />
                                  Test cases
                                </button>
                                <div className="h-px bg-border my-1" />
                                <button
                                  onClick={() => {
                                    setDeleteId(problem.id);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Xóa
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {!isLoading && filteredProblems.length === 0 && (
              <div className="p-12 text-center">
                <Code2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">Chưa có problem nào</p>
                <Button onClick={() => navigate({ to: "/mentor/problem/create" })}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo Problem đầu tiên
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" isDisabled={page <= 0} onClick={() => handlePageChange(page - 1)}>
              Trước
            </Button>
            <span className="flex items-center px-4 text-sm text-muted-foreground">
              Trang {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              isDisabled={page >= totalPages - 1}
              onClick={() => handlePageChange(page + 1)}
            >
              Sau
            </Button>
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative bg-background rounded-lg shadow-lg max-w-md w-full mx-4 p-6 z-50">
            <h2 className="text-lg font-semibold mb-2">Xác nhận xóa</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Bạn có chắc chắn muốn xóa problem này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteId(null)}>
                Hủy
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                isDisabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorProblemListContent;
