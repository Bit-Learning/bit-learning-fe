import React, { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Clock, HardDrive, CheckCircle, XCircle, AlertCircle, Code, Download } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/Card";
import { Progress } from "@workspace/ui/components/Progress";
import { cn } from "@workspace/ui/lib/utils";
import { useSubmissionResult, useExportSubmission } from "../queries/useCoding";
import { SubmissionStatusBadge } from "./SubmissionStatusBadge";
import { SubmissionStatus } from "../types/coding.type";

const SubmissionResultContent: React.FC = () => {
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();

  const { data: submission, isLoading } = useSubmissionResult(id as string);
  const exportMutation = useExportSubmission();

  const getStatusIcon = (status: SubmissionStatus) => {
    switch (status) {
      case SubmissionStatus.ACCEPTED:
        return <CheckCircle className="w-10 h-10 text-green-600" />;
      case SubmissionStatus.WRONG_ANSWER:
        return <XCircle className="w-10 h-10 text-red-600" />;
      case SubmissionStatus.TIME_LIMIT_EXCEEDED:
        return <Clock className="w-10 h-10 text-orange-500" />;
      case SubmissionStatus.RUNTIME_ERROR:
        return <AlertCircle className="w-10 h-10 text-red-600" />;
      case SubmissionStatus.COMPILE_ERROR:
        return <Code className="w-10 h-10 text-red-600" />;
      default:
        return <Clock className="w-10 h-10 text-gray-500" />;
    }
  };

  const getStatusMessage = (status: SubmissionStatus) => {
    switch (status) {
      case SubmissionStatus.ACCEPTED:
        return "Bài nộp của bạn đã được chấp nhận.";
      case SubmissionStatus.WRONG_ANSWER:
        return "Kết quả trả về không đúng.";
      case SubmissionStatus.TIME_LIMIT_EXCEEDED:
        return "Chương trình vượt quá thời gian cho phép.";
      case SubmissionStatus.RUNTIME_ERROR:
        return "Chương trình gặp lỗi khi chạy.";
      case SubmissionStatus.COMPILE_ERROR:
        return "Không thể biên dịch chương trình.";
      case SubmissionStatus.RUNNING:
        return "Đang chấm bài...";
      default:
        return "Đang chờ xử lý...";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full mx-auto" />
          <p className="text-gray-500">Đang tải kết quả...</p>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Không tìm thấy kết quả bài nộp.</p>
      </div>
    );
  }

  const passRate = (submission.passedTestcases / submission.totalTestcases) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: `/problem/${submission.problemId}` })}
          className="text-gray-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại bài
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportMutation.mutate({ submissionId: id as string, format: "txt" })}
            isDisabled={exportMutation.isPending}
            className="gap-1.5 text-xs"
          >
            {exportMutation.isPending ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            Xuất .txt
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportMutation.mutate({ submissionId: id as string, format: "xlsx" })}
            isDisabled={exportMutation.isPending}
            className="gap-1.5 text-xs"
          >
            {exportMutation.isPending ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            Xuất .xlsx
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="py-2 px-5 space-y-2">
          <div className="text-center space-y-2 mb-6">
            <div className="flex justify-center">{getStatusIcon(submission.status)}</div>
            <SubmissionStatusBadge status={submission.status} className="text-sm px-3 py-0.5" />
            <p className="text-sm text-gray-600">{getStatusMessage(submission.status)}</p>
            <div className="max-w-2xl mx-auto space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Kết quả test case</span>
                <span className="font-medium">
                  {submission.passedTestcases}/{submission.totalTestcases}
                </span>
              </div>
              <Progress
                value={passRate}
                className={cn(
                  "h-1",
                  submission.status === SubmissionStatus.ACCEPTED ? "[&>div]:bg-green-600" : "[&>div]:bg-red-500",
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <Clock className="w-4 h-4 text-gray-800 mx-auto" />
              <p className="text-xs text-gray-800">Thời gian chạy</p>
              <p className="text-sm font-semibold text-gray-900">{submission.totalTimeMs} ms</p>
            </div>
            <div className="space-y-1">
              <HardDrive className="w-4 h-4 text-gray-800 mx-auto" />
              <p className="text-xs text-gray-800">Bộ nhớ</p>
              <p className="text-sm font-semibold text-gray-900">{submission.maxMemoryMb} MB</p>
            </div>
            <div className="space-y-1">
              <Code className="w-4 h-4 text-gray-800 mx-auto" />
              <p className="text-xs text-gray-800">Ngôn ngữ</p>
              <p className="text-sm font-semibold text-gray-900">{submission.language}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {submission.errorMessage && (
        <Card className="border-red-600">
          <CardHeader>
            <CardTitle className="text-red-700 text-base flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Thông báo lỗi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-red-700 whitespace-pre-wrap font-mono">{submission.errorMessage}</pre>
          </CardContent>
        </Card>
      )}

      {submission.testcaseResults?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết test case</CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y">
            {submission.testcaseResults.map((testcase, index) => (
              <div
                key={testcase.testcaseId}
                className={cn(
                  "p-4 border-l-4",
                  testcase.status === SubmissionStatus.ACCEPTED ? "border-green-500" : "border-red-500",
                )}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">Test case #{index + 1}</span>
                    <SubmissionStatusBadge status={testcase.status} showIcon className="text-xs" />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {testcase.executionTimeMs} ms
                    </div>
                    <div className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3" /> {testcase.memoryUsageMb} MB
                    </div>
                  </div>
                </div>
                {testcase.actualOutput && testcase.status !== SubmissionStatus.ACCEPTED && (
                  <div className="mt-3 p-3 bg-gray-50 rounded text-sm font-mono">
                    <p className="text-xs text-gray-500 mb-1">Kết quả thực tế</p>
                    {testcase.actualOutput}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center gap-3">
        <Button variant="outline" size="xl" onClick={() => navigate({ to: `/problem/${submission.problemId}` })}>
          Nộp lại
        </Button>
        <Button size="xl" onClick={() => navigate({ to: "/problem" })} className="bg-blue-600 hover:bg-blue-700">
          Danh sách bài tập
        </Button>
      </div>
    </div>
  );
};

export default SubmissionResultContent;
