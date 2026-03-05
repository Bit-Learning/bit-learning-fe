import React, { useState, useMemo } from "react";
import { Search, Plus, Check, X, Filter, Code, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Difficulty, ProblemBriefResponse, ProblemDetailResponse } from "../types/problem.type";
import { ContestProblemListDTO } from "../types/contest.type";
// import { useProblems, useProblemDetail } from "../queries/useProblem";
// import { useAddProblem, useRemoveProblem, useContestProblems } from "../hooks/useContest";

const MOCK_PROBLEMS: ProblemBriefResponse[] = [
  {
    id: "p1",
    title: "Cấu trúc điều kiện",
    slug: "cau-truc-dieu-kien",
    description:
      "Sử dụng câu lệnh if-else để kiểm tra số chẵn lẻ. Đây là bài tập cơ bản giúp làm quen với cấu trúc điều kiện trong lập trình.",
    difficulty: Difficulty.EASY,
    timeLimitMs: 1000,
    memoryLimitMb: 128,
    isPublic: true,
    tags: ["if-else", "cơ bản"],
    isFavorite: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "p2",
    title: "Mảng 1 chiều nâng cao",
    slug: "mang-1-chieu-nang-cao",
    description: "Kỹ thuật hai con trỏ và sliding window cơ bản. Tìm subarray có tổng lớn nhất trong mảng số nguyên.",
    difficulty: Difficulty.MEDIUM,
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    isPublic: true,
    tags: ["array", "two-pointers", "sliding-window"],
    isFavorite: false,
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "p3",
    title: "Vòng lặp For lồng nhau",
    slug: "vong-lap-for-long-nhau",
    description: "In các hình sao (tam giác, hình vuông) bằng vòng lặp. Bài tập giúp hiểu rõ về nested loops.",
    difficulty: Difficulty.EASY,
    timeLimitMs: 1000,
    memoryLimitMb: 128,
    isPublic: true,
    tags: ["loops", "pattern"],
    isFavorite: false,
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
  },
  {
    id: "p4",
    title: "Quy hoạch động: Cái túi",
    slug: "quy-hoach-dong-cai-tui",
    description:
      "Bài toán Knapsack kinh điển với trọng số. Áp dụng kỹ thuật dynamic programming để giải quyết bài toán tối ưu.",
    difficulty: Difficulty.HARD,
    timeLimitMs: 3000,
    memoryLimitMb: 512,
    isPublic: true,
    tags: ["dynamic-programming", "knapsack"],
    isFavorite: true,
    createdAt: "2024-01-04T00:00:00Z",
    updatedAt: "2024-01-04T00:00:00Z",
  },
  {
    id: "p5",
    title: "Tìm kiếm nhị phân",
    slug: "tim-kiem-nhi-phan",
    description: "Tìm vị trí phần tử trong mảng đã sắp xếp. Thuật toán tìm kiếm hiệu quả với độ phức tạp O(log n).",
    difficulty: Difficulty.EASY,
    timeLimitMs: 1000,
    memoryLimitMb: 128,
    isPublic: true,
    tags: ["binary-search", "search"],
    isFavorite: false,
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-05T00:00:00Z",
  },
  {
    id: "p6",
    title: "Đồ thị: BFS/DFS",
    slug: "do-thi-bfs-dfs",
    description: "Duyệt đồ thị theo chiều rộng và chiều sâu. Hai thuật toán cơ bản trong xử lý đồ thị.",
    difficulty: Difficulty.MEDIUM,
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    isPublic: true,
    tags: ["graph", "bfs", "dfs"],
    isFavorite: false,
    createdAt: "2024-01-06T00:00:00Z",
    updatedAt: "2024-01-06T00:00:00Z",
  },
];

const MOCK_PROBLEM_DETAILS: Record<string, ProblemDetailResponse> = {
  p1: {
    id: "p1",
    title: "Cấu trúc điều kiện",
    slug: "cau-truc-dieu-kien",
    description: `# Mô tả bài toán

Viết chương trình nhập vào một số nguyên n. Hãy kiểm tra xem n là số chẵn hay số lẻ.

Nếu n là số chẵn, in ra màn hình: CHAN. Nếu n là số lẻ, in ra màn hình: LE.

## Định dạng đầu vào

Dòng duy nhất chứa số nguyên n (-10⁹ ≤ n ≤ 10⁹).

## Định dạng đầu ra

In ra CHAN hoặc LE.

## Giới hạn

- Thời gian: 1.0 giây
- Bộ nhớ: 128 MB`,
    difficulty: Difficulty.EASY,
    timeLimitMs: 1000,
    memoryLimitMb: 128,
    isPublic: true,
    tags: ["if-else", "cơ bản"],
    sampleTestcases: [
      {
        id: "tc1",
        input: "5",
        expectedOutput: "LE",
        isSample: true,
        orderIndex: 1,
      },
      {
        id: "tc2",
        input: "10",
        expectedOutput: "CHAN",
        isSample: true,
        orderIndex: 2,
      },
    ],
    codeTemplate: "# Nhập số nguyên n\nn = int(input())\n\n# Code của bạn ở đây\n",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  p2: {
    id: "p2",
    title: "Mảng 1 chiều nâng cao",
    slug: "mang-1-chieu-nang-cao",
    description: `# Mô tả bài toán

Cho mảng số nguyên A gồm n phần tử. Tìm subarray liên tiếp có tổng lớn nhất.

## Định dạng đầu vào

- Dòng đầu chứa số nguyên n (1 ≤ n ≤ 10⁵)
- Dòng thứ hai chứa n số nguyên A[i] (-10⁹ ≤ A[i] ≤ 10⁹)

## Định dạng đầu ra

In ra tổng lớn nhất có thể đạt được.

## Giới hạn

- Thời gian: 2.0 giây
- Bộ nhớ: 256 MB`,
    difficulty: Difficulty.MEDIUM,
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    isPublic: true,
    tags: ["array", "two-pointers", "sliding-window"],
    sampleTestcases: [
      {
        id: "tc1",
        input: "5\n-2 1 -3 4 -1",
        expectedOutput: "4",
        isSample: true,
        orderIndex: 1,
      },
      {
        id: "tc2",
        input: "6\n5 -3 5 -2 8 -4",
        expectedOutput: "13",
        isSample: true,
        orderIndex: 2,
      },
    ],
    codeTemplate: "n = int(input())\narr = list(map(int, input().split()))\n\n# Code của bạn ở đây\n",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
};

const MOCK_CURRENT_PROBLEMS: ContestProblemListDTO[] = [
  {
    contestProblemId: "cp1",
    label: "A",
    orderIndex: 1,
    problemId: "p1",
    title: "Cấu trúc điều kiện",
    difficulty: "Dễ",
    timeLimitMs: 1000,
    memoryLimitMb: 128,
    myStatus: undefined,
    myAttempts: 0,
    totalAccepted: 0,
    totalSubmissions: 0,
  },
];

interface AddContestProblemsProps {
  contestId?: string;
}

const AddContestProblems: React.FC<AddContestProblemsProps> = ({ contestId: propContestId }) => {
  // Sử dụng từ props hoặc từ route params
  const contestId = propContestId || "1";
  // const id = "1";

  // const { data: availableProblems, isLoading: isLoadingProblems } = useProblems();
  // const { data: contestProblems, isLoading: isLoadingContestProblems } = useContestProblems(id);
  // const addProblemMutation = useAddProblem();
  // const removeProblemMutation = useRemoveProblem();

  const availableProblems = MOCK_PROBLEMS;
  const isLoadingProblems = false;

  const contestProblems = MOCK_CURRENT_PROBLEMS;
  const isLoadingContestProblems = false;

  const [activeProblem, setActiveProblem] = useState<ProblemBriefResponse>(availableProblems[0]!);
  const [activeTab, setActiveTab] = useState<"content" | "testcases" | "details">("content");
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("Tất cả");

  // const { data: problemDetail, isLoading: isLoadingDetail } = useProblemDetail(activeProblem.id);

  const problemDetail = MOCK_PROBLEM_DETAILS[activeProblem.id] || MOCK_PROBLEM_DETAILS.p1;
  const isLoadingDetail = false;

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      [Difficulty.EASY]: "bg-green-100 text-green-700 dark:bg-green-900/40 border-green-200 dark:border-green-800",
      [Difficulty.MEDIUM]: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800",
      [Difficulty.HARD]: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 border-rose-200 dark:border-rose-800",
    };
    return colors[difficulty] || colors[Difficulty.MEDIUM];
  };

  const getDifficultyLabel = (difficulty: Difficulty | string) => {
    const labels: Record<string, string> = {
      [Difficulty.EASY]: "Dễ",
      [Difficulty.MEDIUM]: "Trung bình",
      [Difficulty.HARD]: "Khó",
      Dễ: "Dễ",
      "Trung bình": "Trung bình",
      Khó: "Khó",
    };
    return labels[difficulty] || "Trung bình";
  };

  const isProblemInContest = (problemId: string) => {
    return contestProblems.some((p) => p.problemId === problemId);
  };

  const getContestProblem = (problemId: string) => {
    return contestProblems.find((p) => p.problemId === problemId);
  };

  const handleAddProblem = async (problem: ProblemBriefResponse) => {
    // await addProblemMutation.mutateAsync({
    //   id,
    //   request: {
    //     problemId: problem.id,
    //     orderIndex: contestProblems.length + 1,
    //   }
    // });

    console.log("Added problem:", problem.title, "to contest:", contestId);
  };

  const handleRemoveProblem = async (problem: ProblemBriefResponse) => {
    const contestProblem = getContestProblem(problem.id);
    if (!contestProblem) return;

    // await removeProblemMutation.mutateAsync({
    //   id,
    //   contestProblemId: contestProblem.contestProblemId,
    // });

    console.log("Removed problem:", problem.title, "from contest:", contestId);
  };

  const toggleProblem = (problem: ProblemBriefResponse) => {
    if (isProblemInContest(problem.id)) {
      handleRemoveProblem(problem);
    } else {
      handleAddProblem(problem);
    }
  };

  const handleClearAll = () => {
    console.log("Clear all problems from contest:", contestId);
  };

  const filteredProblems = useMemo(() => {
    return availableProblems.filter((problem) => {
      const matchesSearch =
        problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        problem.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        problem.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesDifficulty = true;
      if (difficultyFilter !== "Tất cả") {
        const difficultyMap: Record<string, Difficulty> = {
          Dễ: Difficulty.EASY,
          "Trung bình": Difficulty.MEDIUM,
          Khó: Difficulty.HARD,
        };
        matchesDifficulty = problem.difficulty === difficultyMap[difficultyFilter];
      }

      return matchesSearch && matchesDifficulty;
    });
  }, [availableProblems, searchQuery, difficultyFilter]);

  const currentProblemData = getContestProblem(activeProblem.id);

  if (isLoadingProblems || isLoadingContestProblems) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Đang tải danh sách bài tập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900/30">
      <div className="w-105 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm bài tập..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {["Tất cả", "Dễ", "Trung bình", "Khó"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setDifficultyFilter(filter)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    difficultyFilter === filter
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {filter === "Trung bình" ? "T.Bình" : filter}
                </button>
              ))}
            </div>
            <button className="p-1.5 text-slate-400 hover:text-slate-600">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/50 dark:bg-slate-950/20">
          {filteredProblems.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">Không tìm thấy bài tập nào</p>
            </div>
          ) : (
            filteredProblems.map((problem) => {
              const isSelected = isProblemInContest(problem.id);
              const isActive = activeProblem.id === problem.id;

              return (
                <div
                  key={problem.id}
                  onClick={() => setActiveProblem(problem)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer group relative ${
                    isActive
                      ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 ring-1 ring-blue-500/20"
                      : "border-transparent bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-800 shadow-sm"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors pr-8">
                      {problem.title}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleProblem(problem);
                      }}
                      className={`absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center shadow-md transition-all ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                      }`}
                    >
                      {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getDifficultyColor(problem.difficulty)}`}
                    >
                      {getDifficultyLabel(problem.difficulty)}
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {problem.timeLimitMs / 1000}s | {problem.memoryLimitMb}MB
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{problem.description}</p>

                  {problem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {problem.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-8 py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{activeProblem.title}</h2>
            <Badge
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold border uppercase ${getDifficultyColor(activeProblem.difficulty)}`}
            >
              {getDifficultyLabel(activeProblem.difficulty)}
            </Badge>
          </div>

          {currentProblemData ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleProblem(activeProblem)}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-all border border-transparent hover:border-red-100"
              >
                <X className="w-4 h-4" />
                Gỡ khỏi kỳ thi
              </button>
            </div>
          ) : (
            <Button onClick={() => handleAddProblem(activeProblem)} className="gap-2">
              <Plus className="w-4 h-4" />
              Thêm vào kỳ thi
            </Button>
          )}
        </div>

        <div className="px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="flex gap-8">
            {[
              { id: "content", label: "Nội dung đề bài" },
              { id: "testcases", label: "Test Case mẫu" },
              { id: "details", label: "Thông tin chi tiết" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 text-sm font-bold transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "text-blue-600 border-blue-600"
                    : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {isLoadingDetail ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-slate-600 dark:text-slate-400">Đang tải chi tiết bài tập...</p>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {activeTab === "content" && problemDetail && (
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                    {problemDetail.description}
                  </div>
                </div>
              )}

              {activeTab === "testcases" && problemDetail && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    Test Case mẫu ({problemDetail.sampleTestcases.length})
                  </h3>
                  {problemDetail.sampleTestcases.map((testcase, index) => (
                    <div
                      key={testcase.id}
                      className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700"
                    >
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Code className="w-4 h-4 text-blue-500" />
                        Test Case #{index + 1}
                      </h4>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Input</p>
                          <pre className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-mono whitespace-pre">
                            {testcase.input}
                          </pre>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Expected Output</p>
                          <pre className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-mono whitespace-pre">
                            {testcase.expectedOutput}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "details" && problemDetail && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-2">Thời gian giới hạn</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {problemDetail.timeLimitMs / 1000}s
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-2">Bộ nhớ giới hạn</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {problemDetail.memoryLimitMb} MB
                      </p>
                    </div>
                  </div>

                  {problemDetail.tags.length > 0 && (
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-3">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {problemDetail.tags.map((tag) => (
                          <Badge
                            key={tag}
                            className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Code Template</p>
                    <pre className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap">
                      {problemDetail.codeTemplate}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Đã chọn <span className="text-blue-600 dark:text-blue-400 font-bold">{contestProblems.length}</span> bài
              tập:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-150">
              {contestProblems.map((cp) => (
                <span
                  key={cp.contestProblemId}
                  className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold border border-blue-100 dark:border-blue-800 whitespace-nowrap"
                >
                  <span className="opacity-60 text-[10px]">{cp.label}</span> {cp.title}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleClearAll}
            className="text-sm font-semibold text-slate-500 hover:text-red-600 transition-colors"
          >
            Xóa tất cả
          </button>
          <Button className="gap-2 shadow-lg">
            <Check className="w-4 h-4" />
            Hoàn tất
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddContestProblems;
