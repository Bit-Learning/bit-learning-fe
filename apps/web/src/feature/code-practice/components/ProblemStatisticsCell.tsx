import React from "react";
import { Loader2 } from "lucide-react";
import { useProblemStatistics } from "../queries/useCoding";
import { cn } from "@workspace/ui/lib/utils";

interface ProblemStatisticsCellProps {
  problemId: string;
}

export const ProblemStatisticsCell: React.FC<ProblemStatisticsCellProps> = ({ problemId }) => {
  const { data: stats, isLoading } = useProblemStatistics(problemId);

  if (isLoading) {
    return (
      <>
        <td className="px-6 py-4">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        </td>
        <td className="px-6 py-4">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        </td>
      </>
    );
  }

  if (!stats) {
    return (
      <>
        <td className="px-6 py-4">
          <span className="text-sm text-gray-400">-</span>
        </td>
        <td className="px-6 py-4">
          <span className="text-sm text-gray-400">-</span>
        </td>
      </>
    );
  }

  const acceptanceRate = stats.acceptanceRate || 0;
  const getAcceptanceColor = (rate: number) => {
    if (rate >= 60) return "text-green-600";
    if (rate >= 30) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <>
      <td className="px-6 py-4">
        <span className="text-sm text-gray-800 font-medium">{stats.solvedUsers} người giải thành công</span>
      </td>
      <td className="px-6 py-4">
        <span className={cn("text-sm font-medium", getAcceptanceColor(acceptanceRate))}>
          {acceptanceRate.toFixed(1)}%
        </span>
      </td>
    </>
  );
};
