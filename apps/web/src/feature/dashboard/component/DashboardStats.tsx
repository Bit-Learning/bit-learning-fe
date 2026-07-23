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
	borderColor: string;
	iconColor: string;
	labelColor: string;
	valueColor: string;
	loading?: boolean;
}> = ({
	icon,
	label,
	value,
	subValue,
	bg,
	borderColor,
	labelColor,
	valueColor,
	loading,
}) => (
	<div
		className={`rounded-lg border ${borderColor} ${bg} p-5 shadow-sm transition-shadow hover:shadow-md`}
	>
		<div className="flex items-start justify-between">
			<div className="flex-1">
				<p className={`text-sm font-semibold ${labelColor}`}>{label}</p>
				{loading ? (
					<div className="mt-2 h-8 w-16 animate-pulse rounded bg-gray-200" />
				) : (
					<p className={`mt-2 text-2xl font-bold ${valueColor}`}>{value}</p>
				)}
				{subValue && (
					<p className={`mt-1 text-xs font-medium ${labelColor} opacity-75`}>
						{subValue}
					</p>
				)}
			</div>
			<div className={`rounded-lg p-3`}>{icon}</div>
		</div>
	</div>
);

const DashboardStats: React.FC = () => {
	const { data: stats, isLoading } = useMyLearningStatistics();

	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
			<StatCard
				icon={<BookOpen className="h-6 w-6" />}
				label="Khóa học đã đăng ký"
				value={stats?.totalEnrolledCourses ?? 0}
				bg="bg-blue-50"
				borderColor="border-blue-500"
				iconColor="text-white"
				labelColor="text-blue-700"
				valueColor="text-blue-900"
				loading={isLoading}
			/>
			<StatCard
				icon={<CheckCircle className="h-6 w-6" />}
				label="Bài học hoàn thành"
				value={stats?.totalCompletedLectures ?? 0}
				bg="bg-green-50"
				borderColor="border-green-500"
				iconColor="text-white"
				labelColor="text-green-700"
				valueColor="text-green-900"
				loading={isLoading}
			/>
			<StatCard
				icon={<Clock className="h-6 w-6" />}
				label="Thời gian học"
				value={formatSeconds(stats?.totalDurations ?? 0)}
				bg="bg-purple-50"
				borderColor="border-purple-500"
				iconColor="text-white"
				labelColor="text-purple-700"
				valueColor="text-purple-900"
				loading={isLoading}
			/>
			<StatCard
				icon={<Award className="h-6 w-6" />}
				label="Chứng chỉ"
				value={stats?.totalCertificates ?? 0}
				bg="bg-amber-50"
				borderColor="border-amber-500"
				iconColor="text-white"
				labelColor="text-amber-700"
				valueColor="text-amber-900"
				loading={isLoading}
			/>
		</div>
	);
};

export default DashboardStats;
