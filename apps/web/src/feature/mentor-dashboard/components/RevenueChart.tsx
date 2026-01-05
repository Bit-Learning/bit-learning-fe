// @ts-nocheck
import { Card } from "@workspace/ui/components/Card";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { formatCurrency } from "@/shared/format";
import type { RevenueData } from "../types/dashboard.type";

interface RevenueChartProps {
	data: RevenueData[];
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
	return (
		<Card className="col-span-2 p-6">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-lg font-semibold text-gray-900">Doanh thu</h2>
				<select className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm">
					<option>12 tháng qua</option>
					<option>6 tháng qua</option>
					<option>3 tháng qua</option>
				</select>
			</div>
			<div className="h-72">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart data={data}>
						<defs>
							<linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
								<stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
						<XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
						<YAxis
							stroke="#9CA3AF"
							fontSize={12}
							tickFormatter={formatCurrency}
						/>
						<Tooltip
							formatter={(value: number, name: string) => [
								name === "revenue" ? `${value.toLocaleString()}₫` : value,
								name === "revenue" ? "Doanh thu" : "Học viên",
							]}
							contentStyle={{
								borderRadius: "8px",
								border: "1px solid #E5E7EB",
							}}
						/>
						<Area
							type="monotone"
							dataKey="revenue"
							stroke="#3B82F6"
							strokeWidth={2}
							fill="url(#colorRevenue)"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</Card>
	);
};
