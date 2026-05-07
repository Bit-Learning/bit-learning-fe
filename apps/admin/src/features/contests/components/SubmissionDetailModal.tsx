import React from "react";
import { X, Clock, Cpu, Code2, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ContestVerdict, SubmissionBriefDTO } from "../types/contest.type";
import { cn } from "@/shared/lib/utils";

interface SubmissionDetailModalProps {
  submission: SubmissionBriefDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onRejudge?: (submissionId: string) => void;
  isRejudging?: boolean;
}

const VERDICT_CONFIG: Record<
  ContestVerdict,
  { className: string; label: string; icon: React.ReactNode; bgClass: string }
> = {
  [ContestVerdict.AC]: {
    className: "bg-green-100 text-green-700 border-green-200",
    bgClass: "bg-green-50 border-green-100",
    label: "Accepted",
    icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
  },
  [ContestVerdict.WA]: {
    className: "bg-red-100 text-red-700 border-red-200",
    bgClass: "bg-red-50 border-red-100",
    label: "Wrong Answer",
    icon: <XCircle className="w-5 h-5 text-red-600" />,
  },
  [ContestVerdict.TLE]: {
    className: "bg-orange-100 text-orange-700 border-orange-200",
    bgClass: "bg-orange-50 border-orange-100",
    label: "Time Limit Exceeded",
    icon: <Clock className="w-5 h-5 text-orange-600" />,
  },
  [ContestVerdict.MLE]: {
    className: "bg-orange-100 text-orange-700 border-orange-200",
    bgClass: "bg-orange-50 border-orange-100",
    label: "Memory Limit Exceeded",
    icon: <Cpu className="w-5 h-5 text-orange-600" />,
  },
  [ContestVerdict.RE]: {
    className: "bg-purple-100 text-purple-700 border-purple-200",
    bgClass: "bg-purple-50 border-purple-100",
    label: "Runtime Error",
    icon: <AlertTriangle className="w-5 h-5 text-purple-600" />,
  },
  [ContestVerdict.CE]: {
    className: "bg-gray-100 text-gray-700 border-gray-200",
    bgClass: "bg-gray-50 border-gray-100",
    label: "Compilation Error",
    icon: <Code2 className="w-5 h-5 text-gray-600" />,
  },
};

const formatDateTime = (dateString: string) =>
  new Date(dateString).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const LANGUAGE_LABEL: Record<string, string> = {
  CPP: "C++",
  C: "C",
  JAVA: "Java",
  PYTHON: "Python",
  JAVASCRIPT: "JavaScript",
  GO: "Go",
  RUST: "Rust",
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel?: string;
}> = ({ icon, label, value, sublabel }) => (
  <div className="flex flex-col gap-1 rounded-xl bg-gray-50 border border-gray-100 px-5 py-4">
    <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider">
      {icon}
      {label}
    </div>
    <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
    {sublabel && <p className="text-xs text-gray-400">{sublabel}</p>}
  </div>
);

const TestcaseBar: React.FC<{ passed: number; total: number }> = ({ passed, total }) => {
  const pct = total > 0 ? Math.round((passed / total) * 100) : 0;
  const allPassed = passed === total;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 font-medium">Test cases</span>
        <span className={cn("font-bold", allPassed ? "text-green-600" : "text-red-500")}>
          {passed}/{total} ({pct}%)
        </span>
      </div>
      <div className="relative h-2.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={cn(
            "absolute left-0 top-0 h-full rounded-full transition-all duration-500",
            allPassed ? "bg-green-500" : "bg-red-400",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  submission,
  isOpen,
  onClose,
  onRejudge,
  isRejudging = false,
}) => {
  if (!isOpen || !submission) return null;

  const verdictCfg = submission.verdict ? VERDICT_CONFIG[submission.verdict] : null;
  const langLabel = LANGUAGE_LABEL[submission.language] ?? submission.language;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex flex-col gap-0.5">
            <p className="text-xs font-mono text-gray-400">#{submission.submissionId}</p>
            <h2 className="text-lg font-bold text-gray-900 leading-snug">
              {submission.problemLabel}. {submission.problemTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {verdictCfg && (
          <div className={cn("flex items-center justify-between px-6 py-4 border-b", verdictCfg.bgClass)}>
            <div className="flex items-center gap-3">
              <div>
                <p className="text-lg font-semibold text-gray-900">{submission.username}</p>
                <p className="text-xs text-gray-500">{formatDateTime(submission.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {verdictCfg.icon}
              <Badge className={cn("px-3 py-1 rounded-lg text-sm font-bold border", verdictCfg.className)}>
                {verdictCfg.label}
              </Badge>
            </div>
          </div>
        )}

        <div className="overflow-y-auto flex-1 px-6 py-5">
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                icon={<Clock className="w-3.5 h-3.5" />}
                label="Thời gian"
                value={`${submission.executionTimeMs ?? 0} ms`}
              />
              <StatCard
                icon={<Cpu className="w-3.5 h-3.5" />}
                label="Bộ nhớ"
                value={`${submission.memoryUsageMb ?? 0} MB`}
              />
              <StatCard icon={<Code2 className="w-3.5 h-3.5" />} label="Ngôn ngữ" value={langLabel} />
              <StatCard icon={<CheckCircle2 className="w-3.5 h-3.5" />} label="Trạng thái" value={submission.status} />
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 px-5 py-4">
              <TestcaseBar passed={submission.passedTestcases} total={submission.totalTestcases} />
            </div>

            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-50">
                  {[
                    { label: "Submission ID", value: `#${submission.submissionId}` },
                    { label: "Thí sinh", value: submission.username },
                    { label: "Bài tập", value: `${submission.problemLabel}. ${submission.problemTitle}` },
                    { label: "Ngôn ngữ", value: langLabel },
                    { label: "Nộp lúc", value: formatDateTime(submission.createdAt) },
                  ].map(({ label, value }) => (
                    <tr key={label} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-gray-500 font-medium w-36">{label}</td>
                      <td className="px-5 py-3 text-gray-900 font-mono text-xs">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
          >
            Đóng
          </button>

          <button
            onClick={() => onRejudge?.(submission.submissionId)}
            disabled={isRejudging}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-all"
          >
            {isRejudging ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Chấm lại
          </button>
        </div>
      </div>
    </div>
  );
};
