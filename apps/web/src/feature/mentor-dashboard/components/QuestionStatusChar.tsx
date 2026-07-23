// @ts-nocheck
import { Card } from "@workspace/ui/components/Card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type {
	QuestionStatusData,
	ProblemStatusData,
} from "../types/mentor.type";

const STATUS_ITEMS = [
	{ key: "approved", label: "Đã duyệt", color: "#16A37F" },
	{ key: "pending", label: "Chờ duyệt", color: "#F59E0B" },
	{ key: "rejected", label: "Từ chối", color: "#F04444" },
	{ key: "none", label: "Chưa gửi", color: "#CBD5E1" },
];

interface LegendRowProps {
	color: string;
	label: string;
	value: number;
	pct: number;
}

function LegendRow({ color, label, value, pct }: LegendRowProps) {
	return (
		<div className="flex items-center gap-2.5">
			<span
				className="h-2.5 w-2.5 shrink-0 rounded-sm"
				style={{ background: color }}
			/>
			<span className="flex-1 text-sm text-gray-600">{label}</span>
			<span className="text-sm font-semibold text-gray-900 tabular-nums">
				{value.toLocaleString("vi-VN")}
			</span>
			<span className="w-9 text-right text-xs text-gray-400 tabular-nums">
				{pct}%
			</span>
		</div>
	);
}

interface DonutChartCardProps {
	title: string;
	subtitle?: string;
	chartData: { name: string; value: number; color: string }[];
	total: number;
	unitLabel: string;
}

function DonutChartCard({
	title,
	subtitle,
	chartData,
	total,
	unitLabel,
}: DonutChartCardProps) {
	return (
		<Card className="p-6 flex flex-col gap-4 shadow-sm border border-gray-100 rounded-2xl">
			<div>
				<h2 className="text-base font-semibold text-gray-900">{title}</h2>
				{subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
			</div>

			<div className="flex items-center gap-6">
				<div className="relative h-44 w-44 shrink-0">
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Pie
								data={chartData}
								cx="50%"
								cy="50%"
								innerRadius={52}
								outerRadius={70}
								paddingAngle={2}
								dataKey="value"
								strokeWidth={0}
							>
								{chartData.map((entry, i) => (
									<Cell key={i} fill={entry.color} />
								))}
							</Pie>
							<Tooltip
								formatter={(value: number) => [
									`${value.toLocaleString("vi-VN")} ${unitLabel}`,
									"",
								]}
								contentStyle={{
									borderRadius: "10px",
									border: "1px solid #E5E7EB",
									fontSize: "12px",
									padding: "6px 10px",
								}}
							/>
						</PieChart>
					</ResponsiveContainer>
					<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
						<span className="text-2xl font-bold text-gray-900 leading-none tabular-nums">
							{total.toLocaleString("vi-VN")}
						</span>
						<span className="mt-0.5 text-[11px] text-gray-400">
							{unitLabel}
						</span>
					</div>
				</div>

				<div className="flex-1 space-y-2.5">
					{chartData.map((item) => (
						<LegendRow
							key={item.name}
							color={item.color}
							label={item.name}
							value={item.value}
							pct={total > 0 ? Math.round((item.value / total) * 100) : 0}
						/>
					))}
					<div className="border-t border-gray-100 pt-2.5 flex justify-between text-sm">
						<span className="text-gray-400">Tổng cộng</span>
						<span className="font-bold text-gray-900 tabular-nums">
							{total.toLocaleString("vi-VN")}
						</span>
					</div>
				</div>
			</div>
		</Card>
	);
}

interface QuestionStatusChartProps {
	data: QuestionStatusData;
}

export const QuestionStatusChart = ({ data }: QuestionStatusChartProps) => {
	const chartData = STATUS_ITEMS.map((item) => ({
		name: item.label,
		value: data[item.key as keyof QuestionStatusData],
		color: item.color,
	}));
	const total = chartData.reduce((s, d) => s + d.value, 0);

	return (
		<DonutChartCard
			title="Trạng thái câu hỏi"
			subtitle="Phân bố trạng thái duyệt câu hỏi"
			chartData={chartData}
			total={total}
			unitLabel="câu hỏi"
		/>
	);
};

interface ProblemStatusChartProps {
	data: ProblemStatusData;
}

export const ProblemStatusChart = ({ data }: ProblemStatusChartProps) => {
	const chartData = STATUS_ITEMS.map((item) => ({
		name: item.label,
		value: data[item.key as keyof ProblemStatusData],
		color: item.color,
	}));
	const total = chartData.reduce((s, d) => s + d.value, 0);

	return (
		<DonutChartCard
			title="Trạng thái bài tập"
			subtitle="Phân bố trạng thái duyệt bài tập"
			chartData={chartData}
			total={total}
			unitLabel="bài tập"
		/>
	);
};
