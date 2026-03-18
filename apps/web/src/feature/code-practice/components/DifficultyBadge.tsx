import React from "react";
import { Badge } from "@workspace/ui/components/Badge";
import { Difficulty } from "../types/coding.type";
import { cn } from "@workspace/ui/lib/utils";

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  className?: string;
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ difficulty, className }) => {
  const getConfig = () => {
    switch (difficulty) {
      case Difficulty.EASY:
        return {
          label: "Dễ",
          className: "bg-green-100 text-green-700 border-green-200",
        };
      case Difficulty.MEDIUM:
        return {
          label: "Trung bình",
          className: "bg-orange-100 text-orange-700 border-orange-200",
        };
      case Difficulty.HARD:
        return {
          label: "Khó",
          className: "bg-red-100 text-red-700 border-red-200",
        };
      default:
        return {
          label: difficulty,
          className: "bg-gray-100 text-gray-700 border-gray-200",
        };
    }
  };

  const config = getConfig();

  return (
    <Badge variant="outline" className={cn("font-medium border", config.className, className)}>
      {config.label}
    </Badge>
  );
};
