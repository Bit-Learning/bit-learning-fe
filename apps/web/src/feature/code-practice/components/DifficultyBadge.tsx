import { Badge } from "@workspace/ui/components/Badge";
import { cn } from "@workspace/ui/lib/utils";

export const DIFFICULTY_MAP: Record<string, { label: string; badge: string; bar: string; border: string }> = {
  HARD: { label: "KHÓ", badge: "text-red-600 bg-red-50", bar: "bg-red-500", border: "border-l-red-500" },
  MEDIUM: {
    label: "TRUNG BÌNH",
    badge: "text-orange-500 bg-orange-50",
    bar: "bg-orange-500",
    border: "border-l-orange-500",
  },
  EASY: { label: "DỄ", badge: "text-green-600 bg-green-50", bar: "bg-green-500", border: "border-l-green-500" },
};

export const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
  const cfg = DIFFICULTY_MAP[difficulty] ?? {
    label: difficulty,
    badge: "text-gray-600 bg-gray-50",
    bar: "bg-gray-400",
    border: "",
  };
  return (
    <Badge className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-sm", cfg.badge)}>
      <span className={cn("w-1 h-3 rounded-sm", cfg.bar)} />
      {cfg.label}
    </Badge>
  );
};
