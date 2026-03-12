import React, { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { RefreshCw, Plus, Search, Eye, ChevronDown, Info } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { useMySubmissions } from "../queries/useContest";
import { SubmissionDetailModal } from "./SubmissionDetailModal";

const ContestSubmissionsContent: React.FC = () => {
  const { id } = useParams({ strict: false });
  const [selectedProblem, setSelectedProblem] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  // const { data: submissions, isLoading } = useMySubmissions({
  //   contestId: id || "",
  //   contestProblemId: selectedProblem || undefined,
  //   page: 0,
  //   size: 20,
  // });

  const mockSubmissions = [
    {
      submissionId: "6a42b1",
      problemLabel: "A",
      problemTitle: "Hai tổng (Two Sum)",
      language: "PYTHON",
      status: "DONE",
      verdict: "AC",
      passedTestcases: 10,
      totalTestcases: 10,
      executionTimeMs: 12,
      memoryUsageMb: 8.4,
      createdAt: "2025-01-06T10:45:22",
    },
    {
      submissionId: "9c21e4",
      problemLabel: "B",
      problemTitle: "Dãy con dài nhất",
      language: "CPP",
      status: "DONE",
      verdict: "WA",
      passedTestcases: 4,
      totalTestcases: 10,
      executionTimeMs: 45,
      memoryUsageMb: 12.1,
      createdAt: "2025-01-06T10:40:15",
    },
    {
      submissionId: "1d78f2",
      problemLabel: "C",
      problemTitle: "Mạng lưới giao thông",
      language: "JAVA",
      status: "DONE",
      verdict: "TLE",
      passedTestcases: 8,
      totalTestcases: 15,
      executionTimeMs: 1005,
      memoryUsageMb: 64.5,
      createdAt: "2025-01-06T10:35:01",
    },
    {
      submissionId: "4f39a1",
      problemLabel: "B",
      problemTitle: "Dãy con dài nhất",
      language: "CPP",
      status: "DONE",
      verdict: "CE",
      passedTestcases: 0,
      totalTestcases: 10,
      executionTimeMs: null,
      memoryUsageMb: null,
      createdAt: "2025-01-06T10:32:44",
    },
  ];

  const getVerdictBadge = (verdict: string) => {
    const classes = {
      AC: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      WA: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      TLE: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      CE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      RE: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
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
        return "bg-slate-500";
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

  return (
    <>
      <main className="flex-1 flex flex-col p-8 max-w-360 mx-auto w-full">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Lịch sử bài nộp</h2>
            <p className="text-slate-500 mt-1 font-medium">Theo dõi và quản lý quá trình thực hiện bài thi của bạn</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex items-center gap-2 px-5 py-2.5">
              <RefreshCw className="w-4 h-4" />
              Làm mới
            </Button>
            <Button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white">
              <Plus className="w-4 h-4" />
              Nộp bài mới
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Bài tập</label>
            <div className="relative">
              <select
                value={selectedProblem}
                onChange={(e) => setSelectedProblem(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-primary focus:border-primary appearance-none"
              >
                <option value="">Tất cả bài tập</option>
                <option value="A">A. Hai tổng (Two Sum)</option>
                <option value="B">B. Dãy con dài nhất</option>
                <option value="C">C. Mạng lưới giao thông</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Trạng thái
            </label>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-primary focus:border-primary appearance-none"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="AC">Accepted (AC)</option>
                <option value="WA">Wrong Answer (WA)</option>
                <option value="TLE">Time Limit Exceeded (TLE)</option>
                <option value="CE">Compile Error (CE)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Tìm kiếm
            </label>
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-primary focus:border-primary placeholder:text-slate-400"
                placeholder="Tìm theo ID, ngôn ngữ..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">ID</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Thời gian nộp
                  </th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Bài tập</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ngôn ngữ</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">
                    Trạng thái
                  </th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Kết quả</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">T.Gian</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Bộ nhớ</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">
                    Chi tiết
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {mockSubmissions.map((submission) => (
                  <tr
                    key={submission.submissionId}
                    className="hover:bg-blue-50/30 dark:hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="px-6 py-5 text-xs font-mono text-slate-400">#{submission.submissionId}</td>
                    <td className="px-6 py-5 text-[13px] text-slate-600 dark:text-slate-400 font-medium">
                      {formatDate(submission.createdAt)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 bg-blue-50 dark:bg-blue-900/30 text-primary text-[11px] font-bold flex items-center justify-center rounded-lg border border-blue-100 dark:border-blue-800">
                          {submission.problemLabel}
                        </span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {submission.problemTitle}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-[13px] text-slate-600 dark:text-slate-400 font-semibold">
                      {submission.language === "PYTHON" && "Python 3.10"}
                      {submission.language === "CPP" && "C++ 17"}
                      {submission.language === "JAVA" && "Java 17"}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <Badge className={`${getVerdictBadge(submission.verdict)} px-2 py-1 text-xs font-bold`}>
                        {submission.verdict}
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 w-16 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`${getProgressColor(submission.verdict)} h-full`}
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
                    <td className="px-6 py-5 text-[13px] text-slate-700 dark:text-slate-300 font-bold">
                      {submission.executionTimeMs ? `${submission.executionTimeMs}ms` : "--"}
                    </td>
                    <td className="px-6 py-5 text-[13px] text-slate-700 dark:text-slate-300 font-bold">
                      {submission.memoryUsageMb ? `${submission.memoryUsageMb} MB` : "--"}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => setSelectedSubmissionId(submission.submissionId)}
                        className="p-2.5 bg-slate-50 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 rounded-xl text-slate-400 group-hover:text-primary transition-all shadow-sm"
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

        <div className="flex flex-col items-center justify-center p-12 bg-white/50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center mb-12">
          <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center mb-4">
            <Info className="text-slate-300 w-8 h-8" />
          </div>
          <p className="text-slate-500 font-medium max-w-md">
            Hiển thị các bài nộp gần đây nhất. Cuộn xuống hoặc tải thêm để xem toàn bộ lịch sử bài làm của bạn.
          </p>
        </div>
      </main>

      {selectedSubmissionId && (
        <SubmissionDetailModal submissionId={selectedSubmissionId} onClose={() => setSelectedSubmissionId(null)} />
      )}
    </>
  );
};

export default ContestSubmissionsContent;
