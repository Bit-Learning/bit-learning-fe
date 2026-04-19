import { Card } from "@workspace/ui/components/Card";
import { HelpCircle, FileText, BookOpen, PresentationIcon, Network, Wallet } from "lucide-react";
import type { MentorDashboardStats } from "../types/mentor.type";

interface StatsCardsProps {
  stats: MentorDashboardStats;
}

interface StatCardItem {
  label: string;
  value: string;
  desc?: string;
  bg: string;
  border: string;
  labelColor: string;
  valueColor: string;
  descColor: string;
}

export const StatsCards = ({ stats }: StatsCardsProps) => {
  const cards: StatCardItem[] = [
    {
      label: "CÂU HỎI",
      value: stats.totalQuestions.toLocaleString("vi-VN"),
      desc: `${stats.pendingQuestions} chờ duyệt`,
      bg: "bg-[#EEEDFE]",
      border: "border-[#AFA9EC]",
      labelColor: "text-[#534AB7]",
      valueColor: "text-[#3C3489]",
      descColor: "text-[#7F77DD]",
    },
    {
      label: "ĐỀ THI",
      value: stats.totalExams.toString(),
      desc: `+${stats.newExamsThisMonth ?? 0} tháng này`,
      bg: "bg-[#FAECE7]",
      border: "border-[#F0997B]",
      labelColor: "text-[#993C1D]",
      valueColor: "text-[#712B13]",
      descColor: "text-[#D85A30]",
    },
    {
      label: "BÀI TẬP",
      value: stats.totalPractices.toString(),
      desc: `+${stats.newPracticesThisMonth ?? 0} tháng này`,
      bg: "bg-[#E1F5EE]",
      border: "border-[#5DCAA5]",
      labelColor: "text-[#0F6E56]",
      valueColor: "text-[#085041]",
      descColor: "text-[#1D9E75]",
    },
    {
      label: "SLIDE",
      value: stats.totalSlides.toString(),
      desc: `+${stats.newSlidesThisMonth ?? 0} tháng này`,
      bg: "bg-[#FBEAF0]",
      border: "border-[#ED93B1]",
      labelColor: "text-[#993556]",
      valueColor: "text-[#72243E]",
      descColor: "text-[#D4537E]",
    },
    {
      label: "MIND MAP",
      value: stats.totalMindMaps.toString(),
      desc: `+${stats.newMindMapsThisMonth ?? 0} tháng này`,
      bg: "bg-[#E6F1FB]",
      border: "border-[#85B7EB]",
      labelColor: "text-[#185FA5]",
      valueColor: "text-[#0C447C]",
      descColor: "text-[#378ADD]",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((c) => (
        <Card key={c.label} className={`border ${c.bg} ${c.border} shadow-none gap-1 px-4 py-3`}>
          <div className={`text-[10px] font-semibold tracking-widest ${c.labelColor}`}>{c.label}</div>
          <div className={`text-2xl font-bold leading-tight ${c.valueColor}`}>{c.value}</div>
          {c.desc && <div className={`mt-1 text-xs ${c.descColor}`}>{c.desc}</div>}
        </Card>
      ))}
    </div>
  );
};
