import React, { useState } from "react";
import { useContestSubmissions, useRejudgeSubmission, useContestProblems } from "../queries/useContest";
import { Search, RefreshCw, Code, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ContestVerdict, SubmissionBriefDTO } from "../types/contest.type";
import { cn } from "@/shared/lib/utils";
import { SubmissionDetailModal } from "./SubmissionDetailModal";

interface ContestSubmissionsProps {
  contestId: string;
}

export const ContestSubmissions: React.FC<ContestSubmissionsProps> = ({ contestId }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [verdictFilter, setVerdictFilter] = useState<string>("all");
  const [problemFilter, setProblemFilter] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionBriefDTO | null>(null);

  const { data: problems, isLoading: isLoadingProblems } = useContestProblems(contestId);
  const { data: submissions, isLoading } = useContestSubmissions(contestId, {
    verdict: verdictFilter === "all" ? undefined : (verdictFilter as ContestVerdict),
  });
  const rejudge = useRejudgeSubmission();

  const getVerdictBadge = (verdict: ContestVerdict | null) => {
    if (!verdict) return null;

    const config = {
      [ContestVerdict.AC]: {
        className: "bg-green-100 text-green-700 border-green-200",
        label: "ACCEPTED",
      },
      [ContestVerdict.WA]: {
        className: "bg-red-100 text-red-700 border-red-200",
        label: "WRONG ANSWER",
      },
      [ContestVerdict.TLE]: {
        className: "bg-orange-100 text-orange-700 border-orange-200",
        label: "TIME LIMIT",
      },
      [ContestVerdict.MLE]: {
        className: "bg-orange-100 text-orange-700 border-orange-200",
        label: "MEMORY LIMIT",
      },
      [ContestVerdict.RE]: {
        className: "bg-purple-100 text-purple-700 border-purple-200",
        label: "RUNTIME ERROR",
      },
      [ContestVerdict.CE]: {
        className: "bg-gray-100 text-gray-700 border-gray-200",
        label: "COMPILATION ERROR",
      },
    };

    const { className, label } = config[verdict];

    return <Badge className={cn("px-2.5 py-1 rounded-md text-xs font-bold border", className)}>{label}</Badge>;
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

  const filteredSubmissions = submissions?.filter((s) => {
    const matchesSearch = s.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProblem = problemFilter === "all" || s.problemLabel === problemFilter;
    return matchesSearch && matchesProblem;
  });

  if (isLoading || isLoadingProblems) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Đang tải danh sách bài nộp...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Select value={problemFilter} onValueChange={setProblemFilter}>
          <SelectTrigger className="w-50 border-gray-300">
            <SelectValue placeholder="Tất cả bài tập" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả bài tập</SelectItem>
            {problems?.map((problem) => (
              <SelectItem key={problem.contestProblemId} value={problem.label}>
                {problem.label}. {problem.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={verdictFilter} onValueChange={setVerdictFilter}>
          <SelectTrigger className="w-50 border-gray-300">
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card className="bg-white border-gray-200 py-0">
        <CardContent className="p-0">
          {!filteredSubmissions || filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Không có bài nộp nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600">ID</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600">Thí sinh</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600">Bài tập</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600">Kết quả</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600">Thời gian</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600">Bộ nhớ</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600">Ngày nộp</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600 text-right">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSubmissions.map((submission) => (
                    <tr key={submission.submissionId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono text-gray-500">#{submission.submissionId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-md font-semibold text-gray-900 line-clamp-1">
                            {submission.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {submission.problemLabel}. {submission.problemTitle}
                        </span>
                      </td>
                      <td className="px-6 py-4">{getVerdictBadge(submission.verdict)}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-gray-600">{submission.executionTimeMs || 0} ms</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-gray-600">{submission.memoryUsageMb || 0} MB</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500">{formatDateTime(submission.createdAt)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => rejudge.mutate(submission.submissionId)}
                            disabled={rejudge.isPending}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50"
                            title="Chấm lại"
                          >
                            <RefreshCw className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setSelectedSubmission(submission)}
                            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                            title="Xem chi tiết"
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
          )}
        </CardContent>
      </Card>
      <SubmissionDetailModal
        submission={selectedSubmission}
        isOpen={!!selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        onRejudge={(id) => rejudge.mutate(id)}
        isRejudging={rejudge.isPending}
      />

      {filteredSubmissions && filteredSubmissions.length > 0 && (
        <div className="mt-6 flex items-center justify-between px-2">
          <p className="text-sm text-gray-600">
            Hiển thị <span className="font-semibold text-gray-900">1-{filteredSubmissions.length}</span> bài nộp
          </p>
        </div>
      )}
    </div>
  );
};
