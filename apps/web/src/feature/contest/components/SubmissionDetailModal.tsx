import React from "react";
import { X, CheckCircle, XCircle, Clock, AlertCircle, Code } from "lucide-react";
import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import { useSubmissionDetail } from "../queries/useContest";

interface SubmissionDetailModalProps {
  submissionId: string;
  onClose: () => void;
}

export const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({ submissionId, onClose }) => {
  // const { data: submission, isLoading } = useSubmissionDetail(submissionId);

  const mockSubmission = {
    submissionId: submissionId,
    contestId: "contest-1",
    contestProblemId: "problem-1",
    problemLabel: "A",
    problemTitle: "Hai tổng (Two Sum)",
    language: "PYTHON",
    sourceCode: `def two_sum(nums, target):
    hash_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in hash_map:
            return [hash_map[complement], i]
        hash_map[num] = i
    return []

# Đọc input
line1 = input().split()
n, target = int(line1[0]), int(line1[1])
nums = list(map(int, input().split()))
result = two_sum(nums, target)
print(f"{result[0]} {result[1]}")`,
    status: "DONE",
    verdict: "AC",
    passedTestcases: 10,
    totalTestcases: 10,
    executionTimeMs: 12,
    memoryUsageMb: 8.4,
    errorMessage: null,
    testcaseResults: [
      {
        orderIndex: 1,
        verdict: "AC",
        executionTimeMs: 10,
        memoryUsageMb: 8.2,
        isSample: true,
        input: "4 9\n2 7 11 15",
        expectedOutput: "0 1",
        actualOutput: "0 1",
        errorMessage: null,
      },
      {
        orderIndex: 2,
        verdict: "AC",
        executionTimeMs: 12,
        memoryUsageMb: 8.4,
        isSample: true,
        input: "3 6\n3 2 4",
        expectedOutput: "1 2",
        actualOutput: "1 2",
        errorMessage: null,
      },
      {
        orderIndex: 3,
        verdict: "AC",
        executionTimeMs: 11,
        memoryUsageMb: 8.3,
        isSample: false,
        input: null,
        expectedOutput: null,
        actualOutput: null,
        errorMessage: null,
      },
    ],
    createdAt: "2025-01-06T10:45:22",
    updatedAt: "2025-01-06T10:45:25",
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case "AC":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "WA":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "TLE":
        return <Clock className="w-5 h-5 text-orange-500" />;
      case "CE":
      case "RE":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Chi tiết bài nộp</h3>
              <p className="text-sm text-slate-500 mt-1">Submission #{mockSubmission.submissionId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bài tập</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {mockSubmission.problemLabel}. {mockSubmission.problemTitle}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ngôn ngữ</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Python 3.10</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng thái</p>
              <div className="flex items-center gap-2">
                {getVerdictIcon(mockSubmission.verdict)}
                <Badge className={`${getVerdictBadge(mockSubmission.verdict)} px-2 py-1 text-xs font-bold`}>
                  {mockSubmission.verdict}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kết quả</p>
              <p className="text-sm font-bold text-green-600">
                {mockSubmission.passedTestcases}/{mockSubmission.totalTestcases} test cases
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Thời gian thực thi</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{mockSubmission.executionTimeMs}ms</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bộ nhớ sử dụng</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{mockSubmission.memoryUsageMb} MB</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-slate-400" />
              <h4 className="font-bold text-slate-900 dark:text-white">Source Code</h4>
            </div>
            <div className="bg-slate-900 rounded-xl overflow-hidden">
              <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest ml-2">solution.py</span>
              </div>
              <pre className="p-4 text-sm text-slate-300 font-mono overflow-x-auto">{mockSubmission.sourceCode}</pre>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white">Test Cases</h4>
            <div className="space-y-3">
              {mockSubmission.testcaseResults.map((testcase) => (
                <div key={testcase.orderIndex} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getVerdictIcon(testcase.verdict)}
                      <span className="font-bold text-slate-900 dark:text-white">
                        Test Case {testcase.orderIndex}
                        {testcase.isSample && (
                          <Badge className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] px-2 py-0.5">
                            Sample
                          </Badge>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-600 dark:text-slate-400">{testcase.executionTimeMs}ms</span>
                      <span className="text-slate-600 dark:text-slate-400">{testcase.memoryUsageMb} MB</span>
                    </div>
                  </div>

                  {testcase.isSample && (
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="text-slate-400 font-bold uppercase mb-1">Input</p>
                        <pre className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700 font-mono">
                          {testcase.input}
                        </pre>
                      </div>
                      <div>
                        <p className="text-slate-400 font-bold uppercase mb-1">Expected</p>
                        <pre className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700 font-mono">
                          {testcase.expectedOutput}
                        </pre>
                      </div>
                      <div>
                        <p className="text-slate-400 font-bold uppercase mb-1">Output</p>
                        <pre className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700 font-mono text-green-600">
                          {testcase.actualOutput}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};
