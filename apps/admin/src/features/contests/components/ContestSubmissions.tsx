import React, { useState } from "react";
// import { useContestSubmissions } from "../queries/useContest";
import { Search, Filter, RefreshCw, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ContestVerdict } from "../types/contest.type";

interface ContestSubmissionsProps {
  contestId: string;
}

const MOCK_SUBMISSIONS = [
  {
    submissionId: "482910",
    problemLabel: "A",
    problemTitle: "Two Sum",
    userId: 1,
    username: "Nguyễn Hoàng",
    language: "CPP",
    verdict: ContestVerdict.AC,
    executionTimeMs: 12,
    memoryUsageMb: 2.4,
    createdAt: "2026-03-12T10:45:22",
  },
  {
    submissionId: "482905",
    problemLabel: "B",
    problemTitle: "Binary Search",
    userId: 2,
    username: "Trần Minh Quân",
    language: "PYTHON",
    verdict: ContestVerdict.WA,
    executionTimeMs: 24,
    memoryUsageMb: 3.1,
    createdAt: "2026-03-12T10:42:01",
  },
  {
    submissionId: "482901",
    problemLabel: "A",
    problemTitle: "Two Sum",
    userId: 3,
    username: "Lê Thu Hà",
    language: "JAVA",
    verdict: ContestVerdict.TLE,
    executionTimeMs: 1002,
    memoryUsageMb: 1.8,
    createdAt: "2026-03-12T10:39:55",
  },
  {
    submissionId: "482898",
    problemLabel: "D",
    problemTitle: "Graph Traversal",
    userId: 4,
    username: "Phạm Văn Đức",
    language: "CPP",
    verdict: ContestVerdict.CE,
    executionTimeMs: 0,
    memoryUsageMb: 0,
    createdAt: "2026-03-12T10:35:12",
  },
  {
    submissionId: "482890",
    problemLabel: "A",
    problemTitle: "Two Sum",
    userId: 5,
    username: "Vũ Tiến Thành",
    language: "CPP",
    verdict: ContestVerdict.AC,
    executionTimeMs: 8,
    memoryUsageMb: 2.2,
    createdAt: "2026-03-12T10:30:44",
  },
];

export const ContestSubmissions: React.FC<ContestSubmissionsProps> = ({ contestId }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [problemFilter, setProblemFilter] = useState("all");
  const [verdictFilter, setVerdictFilter] = useState("all");

  const submissions = MOCK_SUBMISSIONS;
  const isLoading = false;

  const getVerdictBadge = (verdict: ContestVerdict | null) => {
    if (!verdict) return null;

    const config = {
      [ContestVerdict.AC]: {
        className:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800/50",
        label: "ACCEPTED",
      },
      [ContestVerdict.WA]: {
        className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/50",
        label: "WRONG ANSWER",
      },
      [ContestVerdict.TLE]: {
        className:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50",
        label: "TIME LIMIT",
      },
      [ContestVerdict.MLE]: {
        className:
          "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800/50",
        label: "MEMORY LIMIT",
      },
      [ContestVerdict.RE]: {
        className:
          "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800/50",
        label: "RUNTIME ERROR",
      },
      [ContestVerdict.CE]: {
        className:
          "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
        label: "COMPILATION ERROR",
      },
    };

    const { className, label } = config[verdict];

    return <Badge className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${className}`}>{label}</Badge>;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch = s.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProblem = problemFilter === "all" || s.problemLabel === problemFilter;
    const matchesVerdict = verdictFilter === "all" || s.verdict === verdictFilter;
    return matchesSearch && matchesProblem && matchesVerdict;
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-360 mx-auto">
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Select value={problemFilter} onValueChange={setProblemFilter}>
          <SelectTrigger className="w-50">
            <SelectValue placeholder="Tất cả bài tập" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả bài tập</SelectItem>
            <SelectItem value="A">A. Two Sum</SelectItem>
            <SelectItem value="B">B. Binary Search Mastery</SelectItem>
            <SelectItem value="C">C. Longest Common Subsequence</SelectItem>
            <SelectItem value="D">D. Graph Traversal Challenge</SelectItem>
            <SelectItem value="E">E. Prime factorization</SelectItem>
          </SelectContent>
        </Select>

        <Select value={verdictFilter} onValueChange={setVerdictFilter}>
          <SelectTrigger className="w-50">
            <SelectValue placeholder="Trạng thái (Tất cả)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Trạng thái (Tất cả)</SelectItem>
            <SelectItem value={ContestVerdict.AC}>Accepted (AC)</SelectItem>
            <SelectItem value={ContestVerdict.WA}>Wrong Answer (WA)</SelectItem>
            <SelectItem value={ContestVerdict.TLE}>Time Limit Exceeded (TLE)</SelectItem>
            <SelectItem value={ContestVerdict.MLE}>Memory Limit Exceeded (MLE)</SelectItem>
            <SelectItem value={ContestVerdict.RE}>Runtime Error (RE)</SelectItem>
            <SelectItem value={ContestVerdict.CE}>Compilation Error (CE)</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Lọc nâng cao
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    ID
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Thí sinh
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Bài tập
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Kết quả
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Thời gian
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Bộ nhớ
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Ngày nộp
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredSubmissions.map((submission) => (
                  <tr
                    key={submission.submissionId}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-slate-500">#{submission.submissionId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            {submission.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-semibold">{submission.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-200">
                        {submission.problemLabel}. {submission.problemTitle}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getVerdictBadge(submission.verdict)}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
                        {submission.executionTimeMs} ms
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
                        {submission.memoryUsageMb} MB
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-500">{formatDateTime(submission.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                          title="Chấm lại"
                        >
                          <RefreshCw className="w-5 h-5" />
                        </button>
                        <button
                          className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                          title="Xem code"
                        >
                          <Code className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-between px-2">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Hiển thị{" "}
          <span className="font-semibold text-slate-900 dark:text-slate-100">1-{filteredSubmissions.length}</span> trong{" "}
          <span className="font-semibold text-slate-900 dark:text-slate-100">240</span> bài nộp
        </p>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <span className="material-icons-round">chevron_left</span>
          </button>
          <button className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-sm font-bold shadow-sm">1</button>
          <button className="px-3.5 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            2
          </button>
          <button className="px-3.5 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            3
          </button>
          <span className="px-2 text-slate-400">...</span>
          <button className="px-3.5 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            24
          </button>
          <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <span className="material-icons-round">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};
