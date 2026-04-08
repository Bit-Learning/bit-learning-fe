import React from "react";
import { Loader2, TrendingUp, Users } from "lucide-react";
import { useProblemStatistics } from "../queries/useCoding";
import { cn } from "@workspace/ui/lib/utils";

interface ProblemStatsCardProps {
  problemId: string;
}

export const ProblemStatsCard: React.FC<ProblemStatsCardProps> = ({ problemId }) => {
  const { data: stats, isLoading } = useProblemStatistics(problemId);

  if (isLoading) {
    return (
      <>
        <div className="flex flex-col items-center">
          <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
        </div>
      </>
    );
  }

  if (!stats) {
    return (
      <>
        <span className="text-sm text-slate-400 text-right">—</span>
      </>
    );
  }

  const rate = stats.acceptanceRate || 0;
  const rateColor = rate >= 60 ? "text-green-600" : rate >= 30 ? "text-orange-500" : "text-red-500";

  return (
    <>
      <span className={cn("font-bold text-lg text-right", rateColor)}>{rate.toFixed(1)}%</span>
    </>
  );
};
