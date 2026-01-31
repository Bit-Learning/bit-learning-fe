import React, { useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Search, Code2, Flame, Zap, Trophy, Target, Sparkles, Hash, Heart, Clock, HardDrive } from "lucide-react";
import { Input } from "@workspace/ui/components/Input";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/Table";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { Progress } from "@workspace/ui/components/Progress";
import { cn } from "@workspace/ui/lib/utils";
import { Difficulty, ProblemBriefResponse } from "../types/coding.type";
import { useProblems, useUserSubmissionStats, useToggleFavorite } from "../queries/useCoding";
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
      <Skeleton key={i} className="h-14 w-full" />
    ))}
  </div>
);

const StudentProblemListContent: React.FC = () => {
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false }) as { page?: string | number };
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string>("all");

  const page = Number(searchParams.page) || 0;
  const size = 15;

  const { data: problemsData, isLoading } = useProblems({ page, size, sort: "createdAt,desc" });
  const { data: stats } = useUserSubmissionStats();
  const toggleFavorite = useToggleFavorite();

  const problems = problemsData?.data || [];
  const pageInfo = problemsData?.page;
  const totalPages = pageInfo?.totalPages || 0;

  const filteredProblems = problems.filter((p: ProblemBriefResponse) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchDifficulty = difficulty === "all" || p.difficulty === difficulty;
    return matchSearch && matchDifficulty;
  });

  const handleFavorite = (e: React.MouseEvent, problemId: string) => {
    e.stopPropagation();
    toggleFavorite.mutate(problemId);
  };

  const handlePageChange = (newPage: number) => {
    navigate({ search: `?page=${newPage}` } as any);
  };

  const progressPercent = stats ? (stats.solvedProblems / stats.totalProblems) * 100 : 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-linear-to-br from-violet-500 to-cyan-500 shadow-lg shadow-violet-500/25">
            <Code2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Problem Set</h1>
            <p className="text-muted-foreground">Luyện tập và nâng cao kỹ năng coding</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            icon={Target}
            label="Tổng số"
            value={stats?.totalProblems || 0}
            gradient="bg-gradient-to-br from-violet-500 to-purple-600"
          />
          <StatCard
            icon={Trophy}
            label="Đã giải"
            value={stats?.solvedProblems || 0}
            gradient="bg-gradient-to-br from-emerald-500 to-green-600"
          />
          <StatCard
            icon={Zap}
            label="Submissions"
            value={stats?.totalSubmissions || 0}
            gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={Flame}
            label="Accepted"
            value={stats?.acceptedSubmissions || 0}
            gradient="bg-gradient-to-br from-amber-400 to-orange-500"
          />
          <StatCard
            icon={Sparkles}
            label="Tỷ lệ AC"
            value={`${(stats?.acceptanceRate || 0).toFixed(1)}%`}
            gradient="bg-gradient-to-br from-rose-400 to-pink-500"
          />
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Tiến độ hoàn thành</span>
              <span className="text-sm text-muted-foreground">
                {stats?.solvedProblems || 0}/{stats?.totalProblems || 0} bài
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm problem..."
              className="pl-10"
            />
          </div>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full sm:w-40 h-9 px-3 py-1 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Tất cả</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

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
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead className="w-24">Độ khó</TableHead>
                    <TableHead className="w-24">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Time
                      </div>
                    </TableHead>
                    <TableHead className="w-24">
                      <div className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        Memory
                      </div>
                    </TableHead>
                    <TableHead className="w-48">Tags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProblems.map((problem: ProblemBriefResponse, index: number) => (
                    <TableRow
                      key={problem.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate({ to: `/problem/${problem.id}` })}
                    >
                      <TableCell>
                        <button onClick={(e) => handleFavorite(e, problem.id)} className="p-1 rounded hover:bg-muted">
                          <Heart
                            className={cn(
                              "w-4 h-4 transition-colors",
                              problem.isFavorite ? "fill-rose-500 text-rose-500" : "text-muted-foreground",
                            )}
                          />
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-sm">{page * size + index + 1}.</span>
                          <span className="font-medium hover:text-primary transition-colors">{problem.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DifficultyBadge difficulty={problem.difficulty} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{problem.timeLimitMs}ms</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{problem.memoryLimitMb}MB</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {problem.tags?.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              <Hash className="w-2.5 h-2.5 mr-0.5" />
                              {tag}
                            </Badge>
                          ))}
                          {problem.tags?.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{problem.tags.length - 3}
                            </Badge>
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
                <p className="text-muted-foreground">Không tìm thấy problem nào</p>
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
    </div>
  );
};

export default StudentProblemListContent;
