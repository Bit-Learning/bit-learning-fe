import React, { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { RefreshCw, Search, Eye, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { useMySubmissions } from "../queries/useContest";
import { SubmissionDetailModal } from "./SubmissionDetailModal";
import { Language } from "../types/contest.type";

const ContestSubmissionsContent: React.FC = () => {
  const { id } = useParams({ strict: false });
  const [selectedProblem, setSelectedProblem] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  const { data: submissionsData, isLoading } = useMySubmissions({
    contestId: id || "",
    contestProblemId: selectedProblem || undefined,
    page: 0,
    size: 20,
  });

  const submissions = submissionsData?.data || [];

  const getVerdictBadge = (verdict: string) => {
    const classes = {
      AC: "bg-green-100 text-green-700",
      WA: "bg-red-100 text-red-700",
      TLE: "bg-orange-100 text-orange-700",
      CE: "bg-blue-100 text-blue-700",
      RE: "bg-purple-100 text-purple-700",
    };
    return classes[verdict as keyof typeof classes] || classes.WA;
  };

  const getProgressColor = (verdict: string) => {
    switch (verdict) {
      case "AC":
        return "bg-green-500";
      case "WA":
        return "bg-red-500";
      case "TLE":
        return "bg-orange-500";
      case "CE":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
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

  const getLanguageLabel = (lang: Language): string => {
    const labels: Record<Language, string> = {
      [Language.PYTHON]: "Python 3.10",
      [Language.CPP]: "C++ 17",
      [Language.C]: "C 11",
      [Language.JAVA]: "Java 17",
      [Language.JAVASCRIPT]: "JavaScript (Node.js)",
    };
    return labels[lang] || lang;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <main className="flex-1 flex flex-col p-8 max-w-360 mx-auto w-full">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Lịch sử bài nộp</h2>
            <p className="text-gray-500 mt-1 font-medium">Theo dõi quá trình thực hiện bài thi của bạn</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex items-center gap-2 px-5 py-2.5">
              <RefreshCw className="w-4 h-4" />
              Làm mới
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-500 ml-1">Bài tập</label>
            <div className="relative">
              <select
                value={selectedProblem}
                onChange={(e) => setSelectedProblem(e.target.value)}
                className="w-full bg-white border-gray-300 rounded-lg px-4 py-3 text-sm font-medium focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">Tất cả bài tập</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-500 ml-1">Trạng thái</label>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-white border-gray-300 rounded-lg px-4 py-3 text-sm font-medium focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="AC">Accepted (AC)</option>
                <option value="WA">Wrong Answer (WA)</option>
                <option value="TLE">Time Limit Exceeded (TLE)</option>
                <option value="CE">Compile Error (CE)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-semibold text-gray-500 ml-1">Tìm kiếm</label>
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border-gray-300 rounded-lg text-sm font-medium focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
                placeholder="Tìm theo ID, ngôn ngữ..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-5 text-xs font-semibold text-gray-600">ID</th>
                  <th className="px-6 py-5 text-xs font-semibold text-gray-600">Thời gian nộp</th>
                  <th className="px-6 py-5 text-xs font-semibold text-gray-600">Bài tập</th>
                  <th className="px-6 py-5 text-xs font-semibold text-gray-600">Ngôn ngữ</th>
                  <th className="px-6 py-5 text-xs font-semibold text-gray-600 text-center">Trạng thái</th>
                  <th className="px-6 py-5 text-xs font-semibold text-gray-600">Kết quả</th>
                  <th className="px-6 py-5 text-xs font-semibold text-gray-600">T.Gian</th>
                  <th className="px-6 py-5 text-xs font-semibold text-gray-600">Bộ nhớ</th>
                  <th className="px-6 py-5 text-xs font-semibold text-gray-600 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.map((submission) => (
                  <tr key={submission.submissionId} className="hover:bg-blue-50 transition-colors group">
                    <td className="px-6 py-5 text-xs font-mono text-gray-400">#{submission.submissionId}</td>
                    <td className="px-6 py-5 text-sm text-gray-600 font-medium">{formatDate(submission.createdAt)}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center rounded-lg border border-blue-100">
                          {submission.problemLabel}
                        </span>
                        <span className="text-sm font-semibold text-gray-800">{submission.problemTitle}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600 font-semibold">
                      {getLanguageLabel(submission.language as Language)}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <Badge className={`${getVerdictBadge(submission.verdict ?? "")} px-2 py-1 text-xs font-semibold`}>
                        {submission.verdict}
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 w-16 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`${getProgressColor(submission.verdict ?? "")} h-full`}
                            style={{
                              width: `${(submission.passedTestcases / submission.totalTestcases) * 100}%`,
                            }}
                          />
                        </div>
                        <span
                          className={`text-sm font-bold ${
                            submission.verdict === "AC"
                              ? "text-green-600"
                              : submission.verdict === "WA"
                                ? "text-red-600"
                                : submission.verdict === "TLE"
                                  ? "text-orange-600"
                                  : "text-blue-600"
                          }`}
                        >
                          {submission.passedTestcases}/{submission.totalTestcases}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-700 font-semibold">
                      {submission.executionTimeMs ? `${submission.executionTimeMs}ms` : "--"}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-700 font-semibold">
                      {submission.memoryUsageMb ? `${submission.memoryUsageMb} MB` : "--"}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => setSelectedSubmissionId(submission.submissionId)}
                        className="p-2.5 bg-gray-50 group-hover:bg-white rounded-lg text-gray-400 group-hover:text-blue-600 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {selectedSubmissionId && (
        <SubmissionDetailModal submissionId={selectedSubmissionId} onClose={() => setSelectedSubmissionId(null)} />
      )}
    </>
  );
};

export default ContestSubmissionsContent;
