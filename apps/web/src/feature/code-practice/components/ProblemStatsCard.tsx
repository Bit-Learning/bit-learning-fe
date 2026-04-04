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
        <div className="flex flex-col items-center">
          <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
        </div>
      </>
    );
  }

  if (!stats) {
    return (
      <>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
            <Users className="w-3 h-3" /> Người giải
          </span>
          <span className="font-bold text-slate-400 text-sm">—</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Tỷ lệ đúng
          </span>
          <span className="font-bold text-slate-400 text-sm">—</span>
        </div>
      </>
    );
  }

  const rate = stats.acceptanceRate || 0;
  const rateColor = rate >= 60 ? "text-green-600" : rate >= 30 ? "text-orange-500" : "text-red-500";

  return (
    <>
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
          <Users className="w-3 h-3" /> Người giải
        </span>
        <span className="font-bold text-slate-800 text-sm">{stats.solvedUsers.toLocaleString()}</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> Tỷ lệ đúng
        </span>
        <span className={cn("font-bold text-sm", rateColor)}>{rate.toFixed(1)}%</span>
      </div>
    </>
  );
};
