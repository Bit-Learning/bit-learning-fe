// @ts-nocheck
import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { Card } from "@workspace/ui/components/Card";
import { ArrowUpRight } from "lucide-react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { CoursePerformance } from "../types/dashboard.type";

interface CoursePerformanceChartProps {
	data: CoursePerformance[];
}

export const CoursePerformanceChart = ({
	data,
}: CoursePerformanceChartProps) => {
	return (
		<Card className="p-6">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-lg font-semibold text-gray-900">
					Hiệu suất khóa học
				</h2>
				<Link to="/mentor/course/list">
					<Button variant="ghost" size="sm" className="gap-1 text-blue-600">
						Xem tất cả <ArrowUpRight className="h-4 w-4" />
					</Button>
				</Link>
			</div>
			<div className="h-64">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={data} layout="vertical">
						<CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
						<XAxis type="number" stroke="#9CA3AF" fontSize={12} />
						<YAxis
							dataKey="name"
							type="category"
							stroke="#9CA3AF"
							fontSize={11}
							width={100}
							tick={{ fontSize: 11 }}
						/>
						<Tooltip
							formatter={(value: number, name: string) => [
								value,
								name === "students"
									? "Học viên"
									: name === "completion"
										? "Hoàn thành %"
										: name,
							]}
							contentStyle={{
								borderRadius: "8px",
								border: "1px solid #E5E7EB",
							}}
						/>
						<Bar dataKey="students" fill="#3B82F6" radius={[0, 4, 4, 0]} />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</Card>
	);
};
