import React from "react";
import { X, CheckCircle, XCircle, Clock, AlertCircle, Code, Loader2 } from "lucide-react";
import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import { useSubmissionDetail } from "../queries/useContest";
import { Language } from "@/feature/code-practice/types/coding.type";

interface SubmissionDetailModalProps {
  submissionId: string;
  onClose: () => void;
}

export const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({ submissionId, onClose }) => {
  const { data: submissionData, isLoading } = useSubmissionDetail(submissionId);

  const submission = submissionData?.data;
  const getLanguageLabel = (lang: Language): string => {
    const labels: Record<Language, string> = {
      [Language.PYTHON]: "Python",
      [Language.CPP]: "C++",
      [Language.JAVA]: "Java",
      [Language.JAVASCRIPT]: "JavaScript",
    };
    return labels[lang] || lang;
  };

  const getFileExtension = (lang: Language): string => {
    const extensions: Record<Language, string> = {
      [Language.PYTHON]: "py",
      [Language.CPP]: "cpp",
      [Language.JAVA]: "java",
      [Language.JAVASCRIPT]: "js",
    };
    return extensions[lang] || "txt";
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
      AC: "bg-green-100 text-green-700",
      WA: "bg-red-100 text-red-700",
      TLE: "bg-orange-100 text-orange-700",
      CE: "bg-blue-100 text-blue-700",
      RE: "bg-purple-100 text-purple-700",
    };
    return classes[verdict as keyof typeof classes] || classes.WA;
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-lg p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
        </div>
      </div>
    );
  }

  if (!submission) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Chi tiết bài nộp</h3>
              <p className="text-md text-gray-500 mt-1">#{submission.submissionId}</p>
            </div>
          </div>
          <button onClick={onClose} className="cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-500">Bài tập</p>
              <p className="text-md font-semibold text-gray-900">
                {submission.problemLabel}. {submission.problemTitle}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-500">Ngôn ngữ</p>
              <p className="text-md font-semibold text-gray-900">{getLanguageLabel(submission.language as Language)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-500">Trạng thái</p>
              <div className="flex items-center gap-2">
                {getVerdictIcon(submission.verdict ?? "")}
                <Badge className={`${getVerdictBadge(submission.verdict ?? "")} px-2 py-1 text-sm font-semibold`}>
                  {submission.verdict}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-500">Kết quả</p>
              <p className="text-md font-semibold text-green-600">
                {submission.passedTestcases}/{submission.totalTestcases} test cases
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-500 mb-2">Thời gian thực thi</p>
              <p className="text-2xl font-bold text-gray-900">{submission.executionTimeMs}ms</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-500 mb-2">Bộ nhớ sử dụng</p>
              <p className="text-2xl font-bold text-gray-900">{submission.memoryUsageMb} MB</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-gray-400" />
              <h4 className="font-bold text-gray-900">Source Code</h4>
            </div>
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <span className="text-sm font-mono text-gray-400 ml-2">
                  solution.{getFileExtension(submission.language as Language)}
                </span>
              </div>
              <pre className="p-4 text-md text-gray-300 font-mono overflow-x-auto">{submission.sourceCode}</pre>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-gray-900">Test Cases</h4>
            <div className="space-y-3">
              {submission.testcaseResults.map((testcase) => (
                <div key={testcase.orderIndex} className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getVerdictIcon(testcase.verdict)}
                      <span className="font-semibold text-gray-900">
                        Test Case {testcase.orderIndex}
                        {testcase.isSample && (
                          <Badge className="ml-2 bg-blue-100 text-blue-700 text-sm px-2 py-0.5">Sample</Badge>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-md">
                      <span className="text-gray-600">{testcase.executionTimeMs}ms</span>
                      <span className="text-gray-600">{testcase.memoryUsageMb} MB</span>
                    </div>
                  </div>

                  {testcase.isSample && (
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">Input</p>
                        <pre className="bg-white p-2 rounded border border-gray-200 font-mono">{testcase.input}</pre>
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">Expected</p>
                        <pre className="bg-white p-2 rounded border border-gray-200 font-mono">
                          {testcase.expectedOutput}
                        </pre>
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">Output</p>
                        <pre className="bg-white p-2 rounded border border-gray-200 font-mono text-green-600">
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

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} className="p-5 cursor-pointer">
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};
