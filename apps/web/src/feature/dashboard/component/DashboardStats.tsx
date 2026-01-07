import React from "react";
import { BookOpen, CheckCircle, Clock, Award } from "lucide-react";
import type { DashboardStats as DashboardStatsType } from "../types/dashboard.type";

interface DashboardStatsProps {
  stats: DashboardStatsType;
}

const formatMinutes = (minutes: number): string => {
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours} giờ`;
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  color: string;
}> = ({ icon, label, value, subValue, color }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
        {subValue && <p className="mt-1 text-xs text-gray-400">{subValue}</p>}
      </div>
      <div className={`rounded-lg p-2.5 ${color}`}>{icon}</div>
    </div>
  </div>
);

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={<BookOpen className="h-5 w-5 text-blue-600" />}
        label="Khóa học đã đăng ký"
        value={stats.totalCoursesEnrolled}
        subValue={`${stats.totalCoursesCompleted} đã hoàn thành`}
        color="bg-blue-100"
      />
      <StatCard
        icon={<CheckCircle className="h-5 w-5 text-green-600" />}
        label="Bài học hoàn thành"
        value={stats.totalLecturesCompleted}
        color="bg-green-100"
      />
      <StatCard
        icon={<Clock className="h-5 w-5 text-purple-600" />}
        label="Thời gian học"
        value={formatMinutes(stats.totalMinutesLearned)}
        color="bg-purple-100"
      />
      <StatCard
        icon={<Award className="h-5 w-5 text-amber-600" />}
        label="Chứng chỉ"
        value={stats.certificatesEarned}
        color="bg-amber-100"
      />
    </div>
  );
};

export default DashboardStats;
