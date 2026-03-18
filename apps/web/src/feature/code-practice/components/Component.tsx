import { Card, CardContent } from "@workspace/ui/components/Card";
import { Difficulty, Language, SubmissionBriefResponse, SubmissionStatus } from "../types/coding.type";
import { cn } from "@workspace/ui/lib/utils";
import { AlertCircle, CheckCircle2, Loader2, Timer, X } from "lucide-react";
import { Badge } from "@workspace/ui/components/Badge";

export const statusConfig: Record<SubmissionStatus, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: "Pending", color: "text-slate-500", icon: <Loader2 className="w-4 h-4 animate-spin" /> },
  RUNNING: { label: "Judging", color: "text-blue-500", icon: <Loader2 className="w-4 h-4 animate-spin" /> },
  ACCEPTED: { label: "Accepted", color: "text-emerald-600", icon: <CheckCircle2 className="w-4 h-4" /> },
  WRONG_ANSWER: { label: "Wrong Answer", color: "text-rose-600", icon: <X className="w-4 h-4" /> },
  TIME_LIMIT_EXCEEDED: { label: "Time Limit", color: "text-amber-600", icon: <Timer className="w-4 h-4" /> },
  RUNTIME_ERROR: { label: "Runtime Error", color: "text-rose-600", icon: <AlertCircle className="w-4 h-4" /> },
  COMPILE_ERROR: { label: "Compile Error", color: "text-rose-600", icon: <AlertCircle className="w-4 h-4" /> },
};

export const difficultyConfig = {
  [Difficulty.EASY]: {
    label: "Dễ",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  [Difficulty.MEDIUM]: {
    label: "Trung bình",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  [Difficulty.HARD]: {
    label: "Khó",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
  },
};
export const languageOptions = [
  { value: Language.CPP, label: "C++ 17" },
  { value: Language.JAVA, label: "Java 17" },
  { value: Language.PYTHON, label: "Python 3" },
  { value: Language.JAVASCRIPT, label: "Node.js 18" },
];

export const DifficultyBadge: React.FC<{ difficulty: Difficulty }> = ({ difficulty }) => {
  const config = difficultyConfig[difficulty];
  return (
    <Badge variant="outline" className={cn("font-medium", config.color, config.bg, config.border)}>
      {config.label}
    </Badge>
  );
};

export const SubmissionItem: React.FC<{ submission: SubmissionBriefResponse }> = ({ submission }) => {
  const config = statusConfig[submission.status];
  const date = new Date(submission.createdAt);
  const timeStr = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

  return (
    <Card className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
      <CardContent className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <span className={config.color}>{config.icon}</span>
          <div>
            <p className={cn("font-medium text-sm", config.color)}>{config.label}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{timeStr}</p>
          </div>
        </div>
        <div className="text-right text-sm">
          <p className="font-medium">{submission.totalTimeMs}ms</p>
          <p className="text-slate-500 dark:text-slate-400">
            {submission.passedTestcases}/{submission.totalTestcases}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
