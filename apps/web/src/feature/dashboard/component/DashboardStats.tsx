import React from "react";
import { Award, BookOpen, CheckCircle, Clock } from "lucide-react";
import { useMyLearningStatistics } from "../../lecture/queries/useLearning";

const formatSeconds = (seconds: number): string => {
  if (!seconds) return "0 phút";
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return mins > 0 ? `${hours}h ${mins}m` : `${hours} giờ`;
  return `${mins} phút`;
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  bg: string;
  labelColor: string;
  valueColor: string;
  loading?: boolean;
}> = ({ icon, label, value, subValue, bg, labelColor, valueColor, loading }) => (
  <div className={`rounded-md p-5 shadow-sm transition-shadow hover:shadow-md ${bg}`}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className={`text-sm font-medium ${labelColor}`}>{label}</p>
        {loading ? (
          <div className="mt-2 h-8 w-16 animate-pulse rounded bg-white/40" />
        ) : (
          <p className={`mt-2 text-2xl font-bold ${valueColor}`}>{value}</p>
        )}
        {subValue && <p className={`mt-1 text-xs ${labelColor} opacity-75`}>{subValue}</p>}
      </div>
      <div className="rounded-lg bg-white/20 p-3">{icon}</div>
    </div>
  </div>
);

const DashboardStats: React.FC = () => {
  const { data: stats, isLoading } = useMyLearningStatistics();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={<BookOpen className="h-6 w-6 text-white" />}
        label="Khóa học đã đăng ký"
        value={stats?.totalEnrolledCourses ?? 0}
        bg="bg-blue-600"
        labelColor="text-blue-100"
        valueColor="text-white"
        loading={isLoading}
      />
      <StatCard
        icon={<CheckCircle className="h-6 w-6 text-white" />}
        label="Bài học hoàn thành"
        value={stats?.totalCompletedLectures ?? 0}
        bg="bg-green-500"
        labelColor="text-green-100"
        valueColor="text-white"
        loading={isLoading}
      />
      <StatCard
        icon={<Clock className="h-6 w-6 text-white" />}
        label="Thời gian học"
        value={formatSeconds(stats?.totalDurations ?? 0)}
        bg="bg-purple-500"
        labelColor="text-purple-100"
        valueColor="text-white"
        loading={isLoading}
      />
      <StatCard
        icon={<Award className="h-6 w-6 text-white" />}
        label="Chứng chỉ"
        value={stats?.totalCertificates ?? 0}
        bg="bg-amber-500"
        labelColor="text-amber-100"
        valueColor="text-white"
        loading={isLoading}
      />
    </div>
  );
};

export default DashboardStats;
