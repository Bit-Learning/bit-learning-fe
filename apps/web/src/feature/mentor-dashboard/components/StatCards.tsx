import { Card } from "@workspace/ui/components/Card";
import { BookOpen, DollarSign, Users } from "lucide-react";
import { formatCurrency } from "@/shared/format";
import type { DashboardStats } from "../types/dashboard.type";

interface StatsCardsProps {
	stats: DashboardStats;
}

const statsConfig = [
	{
		key: "totalCourses" as const,
		label: "Tổng khóa học",
		icon: BookOpen,
		bgColor: "bg-blue-500/10",
		iconBg: "bg-blue-100",
		iconColor: "text-blue-600",
		format: (val: number) => val.toString(),
	},
	{
		key: "totalStudents" as const,
		label: "Tổng học viên",
		icon: Users,
		bgColor: "bg-purple-500/10",
		iconBg: "bg-purple-100",
		iconColor: "text-purple-600",
		format: (val: number) => val.toLocaleString(),
	},
	{
		key: "totalEarnings" as const,
		label: "Tổng doanh thu",
		icon: DollarSign,
		bgColor: "bg-green-500/10",
		iconBg: "bg-green-100",
		iconColor: "text-green-600",
		format: (val: number) => `${formatCurrency(val)}₫`,
	},
];

export const StatsCards = ({ stats }: StatsCardsProps) => {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-3">
			{statsConfig.map((config) => {
				const Icon = config.icon;
				const value = stats[config.key];
				return (
					<Card key={config.key} className="relative overflow-hidden p-6">
						<div
							className={`absolute -right-4 -top-4 h-24 w-24 rounded-full ${config.bgColor}`}
						/>
						<div className="flex items-center gap-4">
							<div
								className={`flex h-12 w-12 items-center justify-center rounded-xl ${config.iconBg}`}
							>
								<Icon className={`h-6 w-6 ${config.iconColor}`} />
							</div>
							<div>
								<p className="text-sm text-gray-600">{config.label}</p>
								<p className={`'text-gray-900 text-2xl font-bold`}>
									{config.format(value)}
								</p>
							</div>
						</div>
					</Card>
				);
			})}
		</div>
	);
};
