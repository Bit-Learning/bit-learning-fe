import React, { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { Search, Eye, ChevronDown } from "lucide-react";
import { Badge } from "@workspace/ui/components/Badge";
import { useMySubmissions, useContestProblems } from "../queries/useContest";
import { SubmissionDetailModal } from "./SubmissionDetailModal";
import { Language, ContestVerdict } from "../types/contest.type";

const ContestSubmissionsContent: React.FC = () => {
  const { id } = useParams({ strict: false });
  const [selectedProblem, setSelectedProblem] = useState<string>("");
  const [selectedVerdict, setSelectedVerdict] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  const { data: problemsData } = useContestProblems(id || "");
  const problems = problemsData?.data || [];

  const { data: submissionsData, isLoading } = useMySubmissions({
    contestId: id || "",
    contestProblemId: selectedProblem || undefined,
    page: 0,
    size: 20,
  });

  const allSubmissions = submissionsData?.data || [];

  const submissions = selectedVerdict ? allSubmissions.filter((s) => s.verdict === selectedVerdict) : allSubmissions;

  const filteredSubmissions = searchQuery
    ? submissions.filter(
        (s) =>
          s.submissionId.includes(searchQuery) ||
          s.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.problemTitle.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : submissions;

  const getVerdictBadge = (verdict: string) => {
    const classes: Record<string, string> = {
      AC: "bg-green-100 text-green-700",
      WA: "bg-red-100 text-red-700",
      TLE: "bg-orange-100 text-orange-700",
      MLE: "bg-yellow-100 text-yellow-700",
      CE: "bg-blue-100 text-blue-700",
      RE: "bg-purple-100 text-purple-700",
    };
    return classes[verdict] ?? "bg-gray-100 text-gray-600";
  };

  const getProgressColor = (verdict: string) => {
    const colors: Record<string, string> = {
      AC: "bg-green-500",
      WA: "bg-red-500",
      TLE: "bg-orange-500",
      CE: "bg-blue-500",
      RE: "bg-purple-500",
      MLE: "bg-yellow-500",
    };
    return colors[verdict] ?? "bg-gray-500";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-md text-slate-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="flex-1 flex flex-col p-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Lịch sử bài nộp</h2>
            <p className="text-gray-500 mt-1 font-medium">Theo dõi quá trình thực hiện bài thi của bạn</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="space-y-2">
            <label className="block text-md font-semibold text-gray-500 ml-1">Bài tập</label>
            <div className="relative">
              <select
                value={selectedProblem}
                onChange={(e) => setSelectedProblem(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-md font-medium focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">Tất cả bài tập</option>
                {problems.map((p) => (
                  <option key={p.contestProblemId} value={p.contestProblemId}>
                    {p.label}. {p.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-md font-semibold text-gray-500 ml-1">Trạng thái</label>
            <div className="relative">
              <select
                value={selectedVerdict}
                onChange={(e) => setSelectedVerdict(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-md font-medium focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">Tất cả trạng thái</option>
                <option value={ContestVerdict.AC}>Accepted (AC)</option>
                <option value={ContestVerdict.WA}>Wrong Answer (WA)</option>
                <option value={ContestVerdict.TLE}>Time Limit Exceeded (TLE)</option>
                <option value={ContestVerdict.MLE}>Memory Limit Exceeded (MLE)</option>
                <option value={ContestVerdict.CE}>Compile Error (CE)</option>
                <option value={ContestVerdict.RE}>Runtime Error (RE)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="block text-md font-semibold text-gray-500 ml-1">Tìm kiếm</label>
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-md font-medium focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
                placeholder="Tìm theo ID, tên bài, ngôn ngữ..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-5 text-md uppercase font-semibold text-gray-600 ">ID</th>
                  <th className="px-6 py-5 text-md uppercase font-semibold text-gray-600 w-60">Bài tập</th>
                  <th className="px-6 py-5 text-md uppercase font-semibold text-gray-600">Thời gian nộp</th>
                  <th className="px-6 py-5 text-md uppercase font-semibold text-gray-600 text-center w-36">
                    Trạng thái
                  </th>
                  <th className="px-6 py-5 text-md uppercase font-semibold text-gray-600">Kết quả</th>
                  <th className="px-6 py-5 text-md uppercase font-semibold text-gray-600 w-20">T.Gian</th>
                  <th className="px-6 py-5 text-md uppercase font-semibold text-gray-600 w-30">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center text-md text-gray-400">
                      Không có bài nộp nào
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((submission) => (
                    <tr
                      key={submission.submissionId}
                      onClick={() => setSelectedSubmissionId(submission.submissionId)}
                      className="cursor-pointer hover:bg-blue-50 transition-colors group"
                    >
                      <td className="px-6 py-5 text-md font-mono text-gray-700">#{submission.submissionId}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <span className="text-md font-semibold text-gray-800">{submission.problemTitle}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-md text-gray-600 font-medium">
                        {formatDate(submission.createdAt)}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <Badge
                          className={`${getVerdictBadge(submission.verdict ?? "")} px-2 py-1 text-sm font-semibold`}
                        >
                          {submission.verdict ?? "--"}
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
                            className={`text-md font-bold ${
                              submission.verdict === ContestVerdict.AC
                                ? "text-green-600"
                                : submission.verdict === ContestVerdict.WA
                                  ? "text-red-600"
                                  : submission.verdict === ContestVerdict.TLE
                                    ? "text-orange-600"
                                    : "text-blue-600"
                            }`}
                          >
                            {submission.passedTestcases}/{submission.totalTestcases}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-md text-gray-700 font-semibold">
                        {submission.executionTimeMs ? `${submission.executionTimeMs}ms` : "--"}
                      </td>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => setSelectedSubmissionId(submission.submissionId)}
                          className="cursor-pointer p-2.5 group-hover:bg-white rounded-lg text-gray-800 group-hover:text-blue-600 transition-all"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
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
