import React, { useState } from "react";
import { Search, Code2, Hash, Heart, Clock, HardDrive, Trophy, RefreshCw } from "lucide-react";
import { Input } from "@workspace/ui/components/Input";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Progress } from "@workspace/ui/components/Progress";
import { cn } from "@workspace/ui/lib/utils";
import { Difficulty, ProblemBriefResponse, UserSubmissionStatsResponse } from "../types/coding.type";
import { DifficultyBadge } from "./Component";
import { useNavigate } from "@tanstack/react-router";
import { Pagination } from "@/shared/components/Pagination";

// Mock data
const mockProblems: ProblemBriefResponse[] = [
  {
    id: "1",
    title: "Tính tổng dãy số Fibonacci",
    slug: "fibonacci-sum",
    description: "Tính tổng các số Fibonacci",
    difficulty: Difficulty.EASY,
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    tags: ["Đệ quy", "Cơ bản"],
    isFavorite: false,
    isPublic: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "2",
    title: "Bài toán cái túi (Knapsack)",
    slug: "knapsack-problem",
    description: "Giải bài toán cái túi",
    difficulty: Difficulty.MEDIUM,
    timeLimitMs: 2000,
    memoryLimitMb: 512,
    tags: ["QH Động", "Tối ưu"],
    isFavorite: false,
    isPublic: true,
    createdAt: "2024-01-02",
    updatedAt: "2024-01-02",
  },
  {
    id: "3",
    title: "Tìm đường đi ngắn nhất (Dijkstra)",
    slug: "dijkstra-shortest-path",
    description: "Thuật toán Dijkstra",
    difficulty: Difficulty.HARD,
    timeLimitMs: 3000,
    memoryLimitMb: 512,
    tags: ["Đồ thị", "Giải thuật"],
    isFavorite: true,
    isPublic: true,
    createdAt: "2024-01-03",
    updatedAt: "2024-01-03",
  },
  {
    id: "4",
    title: "Số nguyên tố và ước số",
    slug: "prime-numbers",
    description: "Kiểm tra số nguyên tố",
    difficulty: Difficulty.EASY,
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    tags: ["Số học"],
    isFavorite: false,
    isPublic: true,
    createdAt: "2024-01-04",
    updatedAt: "2024-01-04",
  },
  {
    id: "5",
    title: "Dãy con tăng dài nhất",
    slug: "longest-increasing-subsequence",
    description: "Tìm dãy con tăng dài nhất",
    difficulty: Difficulty.MEDIUM,
    timeLimitMs: 2000,
    memoryLimitMb: 512,
    tags: ["QH Động", "Mảng"],
    isFavorite: false,
    isPublic: true,
    createdAt: "2024-01-05",
    updatedAt: "2024-01-05",
  },
  {
    id: "6",
    title: "Tìm kiếm nhị phân",
    slug: "binary-search",
    description: "Thuật toán tìm kiếm nhị phân",
    difficulty: Difficulty.EASY,
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    tags: ["Tìm kiếm", "Mảng"],
    isFavorite: true,
    isPublic: true,
    createdAt: "2024-01-06",
    updatedAt: "2024-01-06",
  },
  {
    id: "7",
    title: "Cây nhị phân tìm kiếm",
    slug: "binary-search-tree",
    description: "Thao tác trên BST",
    difficulty: Difficulty.MEDIUM,
    timeLimitMs: 2000,
    memoryLimitMb: 512,
    tags: ["Cây", "Đệ quy"],
    isFavorite: false,
    isPublic: true,
    createdAt: "2024-01-07",
    updatedAt: "2024-01-07",
  },
  {
    id: "8",
    title: "Thuật toán sắp xếp nhanh",
    slug: "quick-sort",
    description: "Quick Sort algorithm",
    difficulty: Difficulty.MEDIUM,
    timeLimitMs: 2000,
    memoryLimitMb: 512,
    tags: ["Sắp xếp", "Divide & Conquer"],
    isFavorite: false,
    isPublic: true,
    createdAt: "2024-01-08",
    updatedAt: "2024-01-08",
  },
];

const mockStats: UserSubmissionStatsResponse = {
  userId: 1,
  totalSubmissions: 156,
  acceptedSubmissions: 87,
  acceptanceRate: 55.8,
  solvedProblems: 42,
  totalProblems: 128,
};

const StudentProblemListContent: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [page, setPage] = useState<number>(0);
  const [favorites, setFavorites] = useState<Record<string, boolean>>(
    mockProblems.reduce((acc, p) => ({ ...acc, [p.id]: p.isFavorite }), {}),
  );

  const navigate = useNavigate();
  // const searchParams = useSearch({ strict: false }) as { page?: string | number };
  // const { data: problemsData, isLoading } = useProblems({ page, size: 15, sort: "createdAt,desc" });
  // const { data: stats } = useUserSubmissionStats();
  // const toggleFavorite = useToggleFavorite();

  const isLoading: boolean = false;
  const size: number = 10;

  const filteredProblems: ProblemBriefResponse[] = mockProblems.filter((p) => {
    const matchSearch: boolean = p.title.toLowerCase().includes(search.toLowerCase());
    const matchDifficulty: boolean = difficulty === "all" || p.difficulty === difficulty;
    return matchSearch && matchDifficulty;
  });

  const totalPages: number = Math.ceil(filteredProblems.length / size);
  const paginatedProblems: ProblemBriefResponse[] = filteredProblems.slice(page * size, (page + 1) * size);

  const handleFavorite = (e: React.MouseEvent, problemId: string): void => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [problemId]: !prev[problemId] }));
    //  toggleFavorite.mutate(problemId);
  };

  const handleProblemClick = (problemId: string): void => {
    navigate({ to: `/problem/${problemId}` });
  };

  const progressPercent: number = mockStats ? (mockStats.solvedProblems / mockStats.totalProblems) * 100 : 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-2xl bg-linear-to-br from-violet-500 to-cyan-500 shadow-lg shadow-violet-500/25">
              <Code2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Danh sách bài tập lập trình</h1>
              <nav className="flex text-sm text-muted-foreground mt-1">
                <a className="hover:text-primary" href="#">
                  Trang chủ
                </a>
                <span className="mx-2">/</span>
                <span className="text-foreground font-medium">Luyện tập</span>
              </nav>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              placeholder="Tìm kiếm bài tập theo tên..."
              className="pl-10"
            />
          </div>
          <div className="md:col-span-2">
            <select
              value={difficulty}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDifficulty(e.target.value)}
              className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Độ khó</option>
              <option value={Difficulty.EASY}>Dễ</option>
              <option value={Difficulty.MEDIUM}>Trung bình</option>
              <option value={Difficulty.HARD}>Khó</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <select className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Trạng thái</option>
              <option value="solved">Đã giải</option>
              <option value="unsolved">Chưa giải</option>
              <option value="trying">Đang thử</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <select className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Gắn thẻ (Tags)</option>
              <option value="dp">Quy hoạch động</option>
              <option value="graph">Đồ thị</option>
              <option value="string">Xử lý chuỗi</option>
              <option value="math">Toán học</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <Button variant="outline" className="w-full h-10">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Tên bài tập
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Độ khó
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Time
                      </div>
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        Memory
                      </div>
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Chủ đề
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedProblems.map((problem: ProblemBriefResponse, index: number) => (
                    <tr
                      key={problem.id}
                      className="hover:bg-muted/50 transition-colors cursor-pointer group"
                      onClick={() => handleProblemClick(problem.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e: React.MouseEvent) => handleFavorite(e, problem.id)}
                            className="p-1 rounded hover:bg-muted transition-colors"
                          >
                            <Heart
                              className={cn(
                                "w-4 h-4 transition-colors",
                                favorites[problem.id] ? "fill-rose-500 text-rose-500" : "text-muted-foreground",
                              )}
                            />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-sm">{page * size + index + 1}.</span>
                          <span className="font-medium hover:text-primary transition-colors">{problem.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <DifficultyBadge difficulty={problem.difficulty} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">{problem.timeLimitMs}ms</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">{problem.memoryLimitMb}MB</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {problem.tags?.slice(0, 3).map((tag: string) => (
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Hiển thị <span className="font-medium text-foreground">{page * size + 1}</span> đến{" "}
                <span className="font-medium text-foreground">
                  {Math.min((page + 1) * size, filteredProblems.length)}
                </span>{" "}
                của <span className="font-medium text-foreground">{mockStats.totalProblems}</span> bài tập
              </p>
              <div className="flex items-center gap-2">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-linear-to-br from-blue-500 to-indigo-600 border-0">
            <CardContent className="p-6 text-white">
              <div className="flex items-center space-x-3 mb-4">
                <Trophy className="w-6 h-6" />
                <h3 className="text-lg font-bold">Thử thách mới</h3>
              </div>
              <p className="text-blue-100 text-sm leading-relaxed mb-4">
                Tham gia cuộc thi lập trình hàng tuần để nhận được những phần quà hấp dẫn từ Bitlearning.
              </p>
              <Button className="bg-white text-blue-600 hover:bg-blue-50">Xem chi tiết</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Tiến độ cá nhân</h3>
              <div className="flex items-end justify-between mb-2">
                <span className="text-2xl font-bold text-primary">
                  {mockStats.solvedProblems}/{mockStats.totalProblems}
                </span>
                <span className="text-xs text-muted-foreground">{progressPercent.toFixed(0)}% hoàn thành</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Xếp hạng của bạn</h3>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vị trí hiện tại</p>
                  <p className="text-xl font-bold">
                    #1,204 <span className="text-xs font-normal text-green-500 ml-1">↑ 12</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default StudentProblemListContent;
