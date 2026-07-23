// @ts-nocheck
import { Card } from "@workspace/ui/components/Card";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { ContentMonthlyData } from "../types/mentor.type";

interface SlideChartProps {
	data: ContentMonthlyData[];
}

interface MindMapChartProps {
	data: ContentMonthlyData[];
}

export const SlideMonthlyChart = ({ data }: SlideChartProps) => (
	<Card className="p-6">
		<h2 className="mb-4 text-lg font-semibold text-gray-900">
			Slide theo tháng
		</h2>
		<div className="h-52">
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={data} barCategoryGap="30%">
					<CartesianGrid
						strokeDasharray="3 3"
						stroke="#F3F4F6"
						vertical={false}
					/>
					<XAxis
						dataKey="month"
						fontSize={11}
						tickLine={false}
						axisLine={false}
						tick={{ fill: "#9CA3AF" }}
					/>
					<YAxis
						fontSize={11}
						tickLine={false}
						axisLine={false}
						tick={{ fill: "#9CA3AF" }}
						allowDecimals={false}
					/>
					<Tooltip
						contentStyle={{ borderRadius: "8px", border: "1px solid #E5E7EB" }}
						formatter={(v: number) => [v, "Slide"]}
						cursor={{ fill: "rgba(237,147,177,.1)" }}
					/>
					<Bar
						dataKey="slides"
						fill="#ED93B1"
						radius={[4, 4, 0, 0]}
						maxBarSize={36}
					/>
				</BarChart>
			</ResponsiveContainer>
		</div>
	</Card>
);

export const MindMapMonthlyChart = ({ data }: MindMapChartProps) => (
	<Card className="p-6">
		<h2 className="mb-4 text-lg font-semibold text-gray-900">
			Mind Map theo tháng
		</h2>
		<div className="h-52">
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={data} barCategoryGap="30%">
					<CartesianGrid
						strokeDasharray="3 3"
						stroke="#F3F4F6"
						vertical={false}
					/>
					<XAxis
						dataKey="month"
						fontSize={11}
						tickLine={false}
						axisLine={false}
						tick={{ fill: "#9CA3AF" }}
					/>
					<YAxis
						fontSize={11}
						tickLine={false}
						axisLine={false}
						tick={{ fill: "#9CA3AF" }}
						allowDecimals={false}
					/>
					<Tooltip
						contentStyle={{ borderRadius: "8px", border: "1px solid #E5E7EB" }}
						formatter={(v: number) => [v, "Mind Map"]}
						cursor={{ fill: "rgba(133,183,235,.1)" }}
					/>
					<Bar
						dataKey="mindmaps"
						fill="#85B7EB"
						radius={[4, 4, 0, 0]}
						maxBarSize={36}
					/>
				</BarChart>
			</ResponsiveContainer>
		</div>
	</Card>
);
