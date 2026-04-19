import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Line,
	Pie,
	PieChart,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ArrowDownRight,
	ArrowUpRight,
	CalendarRange,
	CreditCard,
	Download,
	DollarSign,
	Gauge,
	RefreshCw,
	ShoppingCart,
	Sparkles,
	UserCheck,
	UserPlus,
	Users,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DatePicker } from "@/components/date-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/layout/header";
import { cn } from "@/shared/lib/utils";
import {
	getAllRevenueDetailRows,
	exportBusinessRevenueXlsx,
	getBusinessDashboardOverview,
} from "../api/business-dashboard-api";
import type {
	BusinessDashboardFilterParams,
	BusinessDashboardRevenueDetailRow,
	DashboardGranularity,
	DashboardPreset,
} from "../types/business-dashboard.types";
import {
	translatePaymentMethod,
	type PaymentMethod,
} from "../../transactions/types/transaction.type";

function fmt(n: number): string {
	return n.toLocaleString("vi-VN");
}

function fmtCurrency(n: number): string {
	return n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

function fmtCompact(n: number): string {
	if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
	return n.toString();
}

function pct(value: number, total: number): number {
	if (!total) return 0;
	return Number(((value / total) * 100).toFixed(1));
}

type KpiTone = "indigo" | "sky" | "blue" | "emerald";

function toIsoDate(date?: Date): string | undefined {
	if (!date) return undefined;
	const offset = date.getTimezoneOffset();
	const normalized = new Date(date.getTime() - offset * 60_000);
	return normalized.toISOString().slice(0, 10);
}

function formatDateLabel(value?: string): string {
	if (!value) return "Không có";
	return new Date(`${value}T00:00:00`).toLocaleDateString("vi-VN");
}

const KPI_STYLES: Record<
	KpiTone,
	{ card: string; iconWrap: string; icon: string; glow: string }
> = {
	indigo: {
		card: "from-indigo-50 via-white to-white dark:from-indigo-950/25 dark:via-slate-950 dark:to-slate-950",
		iconWrap: "bg-indigo-500/10 dark:bg-indigo-400/10",
		icon: "text-indigo-600 dark:text-indigo-300",
		glow: "bg-indigo-500/15 dark:bg-indigo-400/15",
	},
	sky: {
		card: "from-sky-50 via-white to-white dark:from-sky-950/25 dark:via-slate-950 dark:to-slate-950",
		iconWrap: "bg-sky-500/10 dark:bg-sky-400/10",
		icon: "text-sky-600 dark:text-sky-300",
		glow: "bg-sky-500/15 dark:bg-sky-400/15",
	},
	blue: {
		card: "from-blue-50 via-white to-white dark:from-blue-950/25 dark:via-slate-950 dark:to-slate-950",
		iconWrap: "bg-blue-500/10 dark:bg-blue-400/10",
		icon: "text-blue-600 dark:text-blue-300",
		glow: "bg-blue-500/15 dark:bg-blue-400/15",
	},
	emerald: {
		card: "from-emerald-50 via-white to-white dark:from-emerald-950/25 dark:via-slate-950 dark:to-slate-950",
		iconWrap: "bg-emerald-500/10 dark:bg-emerald-400/10",
		icon: "text-emerald-600 dark:text-emerald-300",
		glow: "bg-emerald-500/15 dark:bg-emerald-400/15",
	},
};

function KpiCard({
	label,
	value,
	description,
	icon: Icon,
	tone,
}: {
	label: string;
	value: string;
	description?: string;
	icon: React.ElementType;
	tone: KpiTone;
}) {
	const styles = KPI_STYLES[tone];

	return (
		<Card
			className={cn(
				"relative overflow-hidden border border-border/70 bg-linear-to-br shadow-sm",
				styles.card,
			)}
		>
			<div
				className={cn(
					"pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full blur-3xl",
					styles.glow,
				)}
			/>

			<CardHeader className="relative flex flex-row items-start justify-between space-y-0 pb-3">
				<div>
					<p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
						{label}
					</p>
				</div>
				<div className={cn("rounded-2xl p-2.5", styles.iconWrap)}>
					<Icon className={cn("h-4.5 w-4.5", styles.icon)} />
				</div>
			</CardHeader>

			<CardContent className="relative pt-0">
				<div className="text-2xl font-semibold tracking-tight text-foreground">
					{value}
				</div>
				{description && (
					<p className="mt-1.5 text-xs leading-5 text-muted-foreground">
						{description}
					</p>
				)}
			</CardContent>
		</Card>
	);
}

function HeroMetric({
	label,
	value,
	icon: Icon,
}: {
	label: string;
	value: string;
	icon: React.ElementType;
}) {
	return (
		<div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70">
			<div className="flex items-center gap-3">
				<div className="rounded-xl bg-slate-900/5 p-2 dark:bg-white/5">
					<Icon className="h-4 w-4 text-slate-700 dark:text-slate-200" />
				</div>
				<div className="min-w-0">
					<p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
						{label}
					</p>
					<p className="truncate text-sm font-semibold text-foreground">
						{value}
					</p>
				</div>
			</div>
		</div>
	);
}

function withMovingAverage<T extends { revenue: number }>(
	points: T[],
	windowSize = 3,
) {
	return points.map((point, index) => {
		const start = Math.max(0, index - windowSize + 1);
		const slice = points.slice(start, index + 1);
		const average =
			slice.reduce((sum, item) => sum + item.revenue, 0) /
			Math.max(slice.length, 1);

		return {
			...point,
			avgRevenue: average,
		};
	});
}

function withCumulativeRevenue<T extends { revenue: number }>(points: T[]) {
	let cumulativeRevenue = 0;

	return points.map((point) => {
		cumulativeRevenue += point.revenue;

		return {
			...point,
			cumulativeRevenue,
		};
	});
}

function withRevenueDelta<T extends { revenue: number }>(points: T[]) {
	return points.map((point, index) => {
		const previousPoint = index > 0 ? points[index - 1] : null;
		const previousRevenue = previousPoint?.revenue ?? 0;
		const deltaRevenue = previousPoint ? point.revenue - previousRevenue : 0;
		const deltaPct =
			previousPoint && previousRevenue > 0
				? Number(((deltaRevenue / previousRevenue) * 100).toFixed(1))
				: null;

		return {
			...point,
			previousRevenue,
			deltaRevenue,
			deltaPct,
		};
	});
}

function fmtSignedCurrency(n: number): string {
	if (n === 0) return fmtCurrency(0);
	return `${n > 0 ? "+" : "-"}${fmtCurrency(Math.abs(n))}`;
}

const TRANSACTION_VALUE_BUCKETS: Array<{
	key: string;
	shortLabel: string;
	label: string;
	min: number;
	max?: number;
}> = [
	{
		key: "lt-50k",
		shortLabel: "<50K",
		label: "Dưới 50.000 đ",
		min: 0,
		max: 50_000,
	},
	{
		key: "50k-100k",
		shortLabel: "50K-100K",
		label: "50.000 đ - dưới 100.000 đ",
		min: 50_000,
		max: 100_000,
	},
	{
		key: "100k-250k",
		shortLabel: "100K-250K",
		label: "100.000 đ - dưới 250.000 đ",
		min: 100_000,
		max: 250_000,
	},
	{
		key: "250k-500k",
		shortLabel: "250K-500K",
		label: "250.000 đ - dưới 500.000 đ",
		min: 250_000,
		max: 500_000,
	},
	{
		key: "500k-1m",
		shortLabel: "500K-1M",
		label: "500.000 đ - dưới 1.000.000 đ",
		min: 500_000,
		max: 1_000_000,
	},
	{
		key: "1m-2m",
		shortLabel: "1M-2M",
		label: "1.000.000 đ - dưới 2.000.000 đ",
		min: 1_000_000,
		max: 2_000_000,
	},
	{
		key: "gte-2m",
		shortLabel: ">=2M",
		label: "Từ 2.000.000 đ trở lên",
		min: 2_000_000,
	},
];

function findTransactionValueBucket(amount: number) {
	return (
		TRANSACTION_VALUE_BUCKETS.find(
			(bucket) =>
				amount >= bucket.min &&
				(typeof bucket.max !== "number" || amount < bucket.max),
		) ?? TRANSACTION_VALUE_BUCKETS[TRANSACTION_VALUE_BUCKETS.length - 1]
	);
}

function getMedianAmount(rows: BusinessDashboardRevenueDetailRow[]): number {
	if (!rows.length) return 0;

	const amounts = rows
		.map((row) => row.amount)
		.filter((amount) => amount > 0)
		.sort((a, b) => a - b);

	if (!amounts.length) return 0;

	const midpoint = Math.floor(amounts.length / 2);
	return amounts.length % 2 === 0
		? (amounts[midpoint - 1] + amounts[midpoint]) / 2
		: amounts[midpoint]!;
}

function PanelShell({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/92 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/92 dark:shadow-[0_24px_80px_rgba(2,6,23,0.55)]",
				className,
			)}
		>
			<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-size-[28px_28px] dark:bg-[linear-gradient(to_right,rgba(51,65,85,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(51,65,85,0.14)_1px,transparent_1px)]" />
			{children}
		</div>
	);
}

function PanelLegend({
	items,
}: {
	items: Array<{ color: string; label: string; soft?: boolean }>;
}) {
	return (
		<div className="flex flex-wrap items-center gap-3">
			{items.map((item) => (
				<div
					key={item.label}
					className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300"
				>
					<span
						className={cn(
							"h-2.5 w-2.5 rounded-full",
							item.soft && "opacity-60",
						)}
						style={{ backgroundColor: item.color }}
					/>
					{item.label}
				</div>
			))}
		</div>
	);
}

function MultiSeriesTooltip({
	active,
	payload,
	valueFormatter,
}: {
	active?: boolean;
	payload?: Array<{
		color?: string;
		name?: string;
		value?: number;
		payload?: { month?: string; fullLabel?: string };
	}>;
	valueFormatter: (value: number) => string;
}) {
	if (!active || !payload?.length) return null;

	const item = payload[0]?.payload;

	return (
		<div className="rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
			<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
				{item?.fullLabel ?? item?.month}
			</p>
			<div className="mt-2 space-y-1.5">
				{payload.map((entry) => (
					<div
						key={`${entry.name}-${entry.color}`}
						className="flex items-center justify-between gap-4 text-sm"
					>
						<div className="flex items-center gap-2">
							<span
								className="h-2.5 w-2.5 rounded-full"
								style={{ backgroundColor: entry.color }}
							/>
							<span className="text-slate-600 dark:text-slate-300">
								{entry.name}
							</span>
						</div>
						<span className="font-semibold text-slate-950 dark:text-slate-50">
							{valueFormatter(Number(entry.value ?? 0))}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

function RevenueTrendCard({
	data,
	deltaPct,
	isUp,
	periodRevenue,
	averageRevenue,
	bestMonthLabel,
	bestMonthRevenue,
	rangeLabel,
	filterControls,
	granularityControls,
}: {
	data: Array<{ month: string; revenue: number; fullLabel: string }>;
	deltaPct: number | null;
	isUp: boolean;
	periodRevenue: number;
	averageRevenue: number;
	bestMonthLabel: string;
	bestMonthRevenue: number;
	rangeLabel: string;
	filterControls?: React.ReactNode;
	granularityControls?: React.ReactNode;
}) {
	const enhancedData = withMovingAverage(data);

	return (
		<PanelShell className="h-full">
			<div className="relative border-b border-slate-200/70 px-6 py-5 dark:border-slate-800/80">
				{(filterControls || granularityControls) && (
					<div className="mb-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_240px]">
						{filterControls}
						{granularityControls}
					</div>
				)}

				<div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
					<div className="min-w-0 flex-1">
						<p className="text-lg font-semibold text-slate-950 dark:text-slate-50">
							Nhịp doanh thu
						</p>
						<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
							Theo dõi doanh thu theo tháng cho khung thời gian {rangeLabel}.
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-3 xl:justify-end">
						<PanelLegend
							items={[
								{ color: "#10b981", label: "Doanh thu" },
								{ color: "#6ee7b7", label: "Trung bình động", soft: true },
							]}
						/>
						<span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
							{fmtCurrency(periodRevenue)}
						</span>
						{deltaPct !== null && (
							<span
								className={cn(
									"inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
									isUp
										? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
										: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
								)}
							>
								{isUp ? (
									<ArrowUpRight className="h-3.5 w-3.5" />
								) : (
									<ArrowDownRight className="h-3.5 w-3.5" />
								)}
								{Math.abs(deltaPct).toFixed(1)}% so với tháng trước
							</span>
						)}
					</div>
				</div>
			</div>

			<div className="relative px-4 pb-4 pt-5 md:px-6 md:pb-6">
				{enhancedData.length === 0 ? (
					<div className="flex h-85 items-center justify-center text-sm text-muted-foreground">
						Chưa có dữ liệu doanh thu
					</div>
				) : (
					<>
						<ResponsiveContainer width="100%" height={340}>
							<AreaChart
								data={enhancedData}
								margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
							>
								<defs>
									<linearGradient
										id="dashboard-revenue-fill"
										x1="0"
										y1="0"
										x2="0"
										y2="1"
									>
										<stop offset="0%" stopColor="#10b981" stopOpacity={0.32} />
										<stop
											offset="100%"
											stopColor="#10b981"
											stopOpacity={0.03}
										/>
									</linearGradient>
								</defs>

								<CartesianGrid
									stroke="rgba(148,163,184,0.12)"
									strokeDasharray="4 4"
									vertical={true}
								/>
								<XAxis
									dataKey="month"
									axisLine={false}
									tickLine={false}
									fontSize={11}
									tick={{ fill: "var(--muted-foreground)" }}
								/>
								<YAxis
									axisLine={false}
									tickLine={false}
									fontSize={11}
									width={56}
									tick={{ fill: "var(--muted-foreground)" }}
									tickFormatter={(value) => fmtCompact(Number(value))}
								/>
								<Tooltip
									cursor={{
										stroke: "rgba(148,163,184,0.24)",
										strokeDasharray: "4 4",
									}}
									content={({ active, payload }) => {
										return (
											<MultiSeriesTooltip
												active={active}
												payload={
													payload as unknown as Array<{
														color?: string;
														name?: string;
														value?: number;
														payload?: { month?: string; fullLabel?: string };
													}>
												}
												valueFormatter={fmtCurrency}
											/>
										);
									}}
								/>
								<Area
									type="monotone"
									dataKey="revenue"
									name="Doanh thu"
									stroke="#10b981"
									strokeWidth={3}
									fill="url(#dashboard-revenue-fill)"
									activeDot={{ r: 5, fill: "#10b981", stroke: "var(--card)" }}
								/>
								<Line
									type="monotone"
									dataKey="avgRevenue"
									name="Trung bình động"
									stroke="#6ee7b7"
									strokeWidth={2}
									strokeDasharray="6 6"
									dot={false}
									isAnimationActive={false}
								/>
							</AreaChart>
						</ResponsiveContainer>

						<div className="mt-6 grid gap-3 md:grid-cols-3">
							<HeroMetric
								label="Trung bình / tháng"
								value={fmtCurrency(averageRevenue)}
								icon={Gauge}
							/>
							<HeroMetric
								label="Tháng tốt nhất"
								value={`${bestMonthLabel} · ${fmtCurrency(bestMonthRevenue)}`}
								icon={Sparkles}
							/>
							<HeroMetric
								label="Biên độ quan sát"
								value={rangeLabel}
								icon={CreditCard}
							/>
						</div>
					</>
				)}
			</div>
		</PanelShell>
	);
}

function OperationsSnapshotCard({
	activeUsers,
	totalUsers,
	completedOrders,
	totalOrders,
	successfulTransactions,
	totalTransactions,
	recordMessage,
}: {
	activeUsers: number;
	totalUsers: number;
	completedOrders: number;
	totalOrders: number;
	successfulTransactions: number;
	totalTransactions: number;
	recordMessage: string;
}) {
	const metrics = [
		{
			label: "Người dùng hoạt động",
			value: activeUsers,
			total: totalUsers,
			color: "bg-indigo-500",
		},
		{
			label: "Đơn hàng hoàn thành",
			value: completedOrders,
			total: totalOrders,
			color: "bg-sky-500",
		},
		{
			label: "Giao dịch thành công",
			value: successfulTransactions,
			total: totalTransactions,
			color: "bg-emerald-500",
		},
	];

	return (
		<PanelShell className="h-full">
			<div className="relative border-b border-slate-200/70 px-6 py-5 dark:border-slate-800/80">
				<p className="text-lg font-semibold text-slate-950 dark:text-slate-50">
					Tổng quan vận hành
				</p>
				<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
					Tổng hợp các chỉ số vận hành quan trọng theo thời gian thực.
				</p>
			</div>

			<div className="relative space-y-5 px-4 pb-4 pt-5 md:px-6 md:pb-6">
				{metrics.map((metric) => {
					const progress = pct(metric.value, metric.total);

					return (
						<div
							key={metric.label}
							className="rounded-2xl border border-border/60 bg-muted/20 p-4"
						>
							<div className="flex items-center justify-between gap-3">
								<div>
									<p className="text-sm font-medium text-foreground">
										{metric.label}
									</p>
									<p className="mt-1 text-xs text-muted-foreground">
										{fmt(metric.value)} / {fmt(metric.total)}
									</p>
								</div>
								<div className="text-right">
									<p className="text-lg font-semibold text-foreground">
										{progress}%
									</p>
								</div>
							</div>

							<div className="mt-4 h-2 rounded-full bg-muted">
								<div
									className={cn("h-full rounded-full", metric.color)}
									style={{ width: `${Math.min(progress, 100)}%` }}
								/>
							</div>
						</div>
					);
				})}

				<div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
					<div className="flex items-start gap-3">
						<div className="rounded-xl bg-emerald-500/15 p-2">
							<Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
						</div>
						<div>
							<p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
								Điểm nhấn vận hành
							</p>
							<p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
								{recordMessage}
							</p>
						</div>
					</div>
				</div>
			</div>
		</PanelShell>
	);
}

function CumulativeRevenueCard({
	data,
	rangeLabel,
}: {
	data: Array<{ month: string; revenue: number; fullLabel: string }>;
	rangeLabel: string;
}) {
	const enhancedData = withCumulativeRevenue(data);
	const latestPoint =
		enhancedData.length > 0 ? enhancedData[enhancedData.length - 1] : null;
	const totalCumulativeRevenue = latestPoint?.cumulativeRevenue ?? 0;
	const latestIncrementRevenue = latestPoint?.revenue ?? 0;
	const halfwayTarget = totalCumulativeRevenue / 2;
	const halfwayPoint =
		halfwayTarget > 0
			? (enhancedData.find((item) => item.cumulativeRevenue >= halfwayTarget) ??
				null)
			: null;

	return (
		<PanelShell className="h-full">
			<div className="relative flex flex-col gap-4 border-b border-slate-200/70 px-6 py-5 sm:flex-row sm:items-start sm:justify-between dark:border-slate-800/80">
				<div>
					<p className="text-lg font-semibold text-slate-950 dark:text-slate-50">
						Doanh thu lũy kế
					</p>
					<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
						Theo dõi tổng doanh thu tích lũy từ đầu kỳ đến từng mốc trong khung
						thời gian {rangeLabel}.
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<PanelLegend items={[{ color: "#0ea5e9", label: "Lũy kế" }]} />
					<span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300">
						{fmtCurrency(totalCumulativeRevenue)}
					</span>
				</div>
			</div>

			<div className="relative px-4 pb-4 pt-5 md:px-6 md:pb-6">
				{enhancedData.length === 0 ? (
					<div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
						Chưa có dữ liệu doanh thu lũy kế
					</div>
				) : (
					<>
						<ResponsiveContainer width="100%" height={300}>
							<AreaChart
								data={enhancedData}
								margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
							>
								<defs>
									<linearGradient
										id="dashboard-cumulative-fill"
										x1="0"
										y1="0"
										x2="0"
										y2="1"
									>
										<stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.28} />
										<stop
											offset="100%"
											stopColor="#0ea5e9"
											stopOpacity={0.03}
										/>
									</linearGradient>
								</defs>

								<CartesianGrid
									stroke="rgba(148,163,184,0.12)"
									strokeDasharray="4 4"
									vertical={true}
								/>
								<XAxis
									dataKey="month"
									axisLine={false}
									tickLine={false}
									fontSize={11}
									tick={{ fill: "var(--muted-foreground)" }}
								/>
								<YAxis
									axisLine={false}
									tickLine={false}
									fontSize={11}
									width={56}
									tick={{ fill: "var(--muted-foreground)" }}
									tickFormatter={(value) => fmtCompact(Number(value))}
								/>
								<Tooltip
									cursor={{
										stroke: "rgba(148,163,184,0.24)",
										strokeDasharray: "4 4",
									}}
									content={({ active, payload }) => (
										<MultiSeriesTooltip
											active={active}
											payload={
												payload as unknown as Array<{
													color?: string;
													name?: string;
													value?: number;
													payload?: { month?: string; fullLabel?: string };
												}>
											}
											valueFormatter={fmtCurrency}
										/>
									)}
								/>
								<Area
									type="monotone"
									dataKey="cumulativeRevenue"
									name="Lũy kế"
									stroke="#0ea5e9"
									strokeWidth={3}
									fill="url(#dashboard-cumulative-fill)"
									activeDot={{ r: 5, fill: "#0ea5e9", stroke: "var(--card)" }}
								/>
							</AreaChart>
						</ResponsiveContainer>

						<div className="mt-6 grid gap-3 md:grid-cols-3">
							<HeroMetric
								label="Lũy kế cuối kỳ"
								value={fmtCurrency(totalCumulativeRevenue)}
								icon={DollarSign}
							/>
							<HeroMetric
								label="Cột mốc 50%"
								value={
									halfwayPoint
										? `${halfwayPoint.month} · ${fmtCurrency(halfwayPoint.cumulativeRevenue)}`
										: "Không có"
								}
								icon={Sparkles}
							/>
							<HeroMetric
								label="Kỳ gần nhất cộng thêm"
								value={fmtCurrency(latestIncrementRevenue)}
								icon={Gauge}
							/>
						</div>
					</>
				)}
			</div>
		</PanelShell>
	);
}

function RevenueDeltaTooltip({
	active,
	payload,
}: {
	active?: boolean;
	payload?: Array<{
		payload?: {
			month?: string;
			fullLabel?: string;
			revenue?: number;
			previousRevenue?: number;
			deltaRevenue?: number;
			deltaPct?: number | null;
		};
	}>;
}) {
	if (!active || !payload?.length) return null;

	const item = payload[0]?.payload;
	const deltaRevenue = Number(item?.deltaRevenue ?? 0);
	const deltaPct = item?.deltaPct;
	const isUp = deltaRevenue >= 0;

	return (
		<div className="rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
			<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
				{item?.fullLabel ?? item?.month}
			</p>
			<div className="mt-2 space-y-1.5 text-sm">
				<div className="flex items-center justify-between gap-4">
					<span className="text-slate-600 dark:text-slate-300">
						Kỳ hiện tại
					</span>
					<span className="font-semibold text-slate-950 dark:text-slate-50">
						{fmtCurrency(Number(item?.revenue ?? 0))}
					</span>
				</div>
				<div className="flex items-center justify-between gap-4">
					<span className="text-slate-600 dark:text-slate-300">Kỳ trước</span>
					<span className="font-semibold text-slate-950 dark:text-slate-50">
						{fmtCurrency(Number(item?.previousRevenue ?? 0))}
					</span>
				</div>
				<div className="flex items-center justify-between gap-4">
					<span className="text-slate-600 dark:text-slate-300">Chênh lệch</span>
					<span
						className={cn(
							"font-semibold",
							isUp
								? "text-emerald-600 dark:text-emerald-300"
								: "text-rose-600 dark:text-rose-300",
						)}
					>
						{fmtSignedCurrency(deltaRevenue)}
						{deltaPct !== null && ` (${isUp ? "+" : ""}${deltaPct}%)`}
					</span>
				</div>
			</div>
		</div>
	);
}

function RevenueDeltaCard({
	data,
	rangeLabel,
}: {
	data: Array<{ month: string; revenue: number; fullLabel: string }>;
	rangeLabel: string;
}) {
	const enhancedData = withRevenueDelta(data);
	const comparableData = enhancedData.slice(1);
	const latestDelta = comparableData.length
		? comparableData[comparableData.length - 1]
		: null;
	const biggestIncrease = comparableData
		.filter((item) => item.deltaRevenue > 0)
		.reduce(
			(best, current) =>
				!best || current.deltaRevenue > best.deltaRevenue ? current : best,
			null as (typeof comparableData)[number] | null,
		);
	const biggestDrop = comparableData
		.filter((item) => item.deltaRevenue < 0)
		.reduce(
			(worst, current) =>
				!worst || current.deltaRevenue < worst.deltaRevenue ? current : worst,
			null as (typeof comparableData)[number] | null,
		);

	return (
		<PanelShell className="h-full">
			<div className="relative flex flex-col gap-4 border-b border-slate-200/70 px-6 py-5 sm:flex-row sm:items-start sm:justify-between dark:border-slate-800/80">
				<div>
					<p className="text-lg font-semibold text-slate-950 dark:text-slate-50">
						Biến động doanh thu theo kỳ
					</p>
					<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
						So sánh mức tăng giảm doanh thu giữa các kỳ liên tiếp trong khung
						thời gian {rangeLabel}.
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<PanelLegend
						items={[
							{ color: "#10b981", label: "Tăng" },
							{ color: "#f43f5e", label: "Giảm" },
						]}
					/>
					{latestDelta && (
						<span
							className={cn(
								"rounded-full px-3 py-1 text-xs font-semibold",
								latestDelta.deltaRevenue >= 0
									? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
									: "border border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
							)}
						>
							Kỳ gần nhất: {fmtSignedCurrency(latestDelta.deltaRevenue)}
						</span>
					)}
				</div>
			</div>

			<div className="relative px-4 pb-4 pt-5 md:px-6 md:pb-6">
				{comparableData.length === 0 ? (
					<div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
						Cần ít nhất 2 kỳ để tính biến động doanh thu
					</div>
				) : (
					<>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart
								data={comparableData}
								margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
								barCategoryGap={18}
							>
								<CartesianGrid
									stroke="rgba(148,163,184,0.12)"
									strokeDasharray="4 4"
									vertical={true}
								/>
								<XAxis
									dataKey="month"
									axisLine={false}
									tickLine={false}
									fontSize={11}
									tick={{ fill: "var(--muted-foreground)" }}
								/>
								<YAxis
									axisLine={false}
									tickLine={false}
									fontSize={11}
									width={64}
									tick={{ fill: "var(--muted-foreground)" }}
									tickFormatter={(value) => fmtCompact(Number(value))}
								/>
								<ReferenceLine
									y={0}
									stroke="rgba(148,163,184,0.32)"
									strokeDasharray="4 4"
								/>
								<Tooltip
									cursor={{ fill: "rgba(148,163,184,0.08)" }}
									content={({ active, payload }) => (
										<RevenueDeltaTooltip
											active={active}
											payload={
												payload as unknown as Array<{
													payload?: {
														month?: string;
														fullLabel?: string;
														revenue?: number;
														previousRevenue?: number;
														deltaRevenue?: number;
														deltaPct?: number | null;
													};
												}>
											}
										/>
									)}
								/>
								<Bar
									dataKey="deltaRevenue"
									radius={[8, 8, 0, 0]}
									maxBarSize={40}
								>
									{comparableData.map((item) => (
										<Cell
											key={`${item.month}-delta`}
											fill={item.deltaRevenue >= 0 ? "#10b981" : "#f43f5e"}
										/>
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>

						<div className="mt-6 grid gap-3 md:grid-cols-3">
							<HeroMetric
								label="Biến động gần nhất"
								value={
									latestDelta
										? `${latestDelta.month} · ${fmtSignedCurrency(latestDelta.deltaRevenue)}`
										: "Không có"
								}
								icon={Gauge}
							/>
							<HeroMetric
								label="Tăng mạnh nhất"
								value={
									biggestIncrease
										? `${biggestIncrease.month} · ${fmtSignedCurrency(biggestIncrease.deltaRevenue)}`
										: "Không có"
								}
								icon={ArrowUpRight}
							/>
							<HeroMetric
								label="Giảm mạnh nhất"
								value={
									biggestDrop
										? `${biggestDrop.month} · ${fmtSignedCurrency(biggestDrop.deltaRevenue)}`
										: "Không có"
								}
								icon={ArrowDownRight}
							/>
						</div>
					</>
				)}
			</div>
		</PanelShell>
	);
}

function PaymentMethodRevenueTooltip({
	active,
	payload,
}: {
	active?: boolean;
	payload?: Array<{
		payload?: {
			name?: string;
			revenue?: number;
			count?: number;
			share?: number;
		};
	}>;
}) {
	if (!active || !payload?.length) return null;

	const item = payload[0]?.payload;

	return (
		<div className="rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
			<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
				{item?.name}
			</p>
			<div className="mt-2 space-y-1.5 text-sm">
				<div className="flex items-center justify-between gap-4">
					<span className="text-slate-600 dark:text-slate-300">Doanh thu</span>
					<span className="font-semibold text-slate-950 dark:text-slate-50">
						{fmtCurrency(Number(item?.revenue ?? 0))}
					</span>
				</div>
				<div className="flex items-center justify-between gap-4">
					<span className="text-slate-600 dark:text-slate-300">
						Giao dịch hoàn tất
					</span>
					<span className="font-semibold text-slate-950 dark:text-slate-50">
						{fmt(Number(item?.count ?? 0))}
					</span>
				</div>
				<div className="flex items-center justify-between gap-4">
					<span className="text-slate-600 dark:text-slate-300">Tỷ trọng</span>
					<span className="font-semibold text-slate-950 dark:text-slate-50">
						{Number(item?.share ?? 0)}%
					</span>
				</div>
			</div>
		</div>
	);
}

function PaymentMethodRevenueCard({
	data,
	isLoading,
	isError,
	rangeLabel,
}: {
	data: Array<{
		key: string;
		name: string;
		revenue: number;
		count: number;
		share: number;
		color: string;
	}>;
	isLoading: boolean;
	isError: boolean;
	rangeLabel: string;
}) {
	const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
	const totalTransactions = data.reduce((sum, item) => sum + item.count, 0);
	const topMethod = data[0] ?? null;

	return (
		<PanelShell className="h-full">
			<div className="relative flex flex-col gap-4 border-b border-slate-200/70 px-6 py-5 sm:flex-row sm:items-start sm:justify-between dark:border-slate-800/80">
				<div>
					<p className="text-lg font-semibold text-slate-950 dark:text-slate-50">
						Doanh thu theo phương thức thanh toán
					</p>
					<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
						So sánh đóng góp doanh thu của từng phương thức thanh toán từ các
						giao dịch mua hàng và nạp tiền đã hoàn tất trong khoảng thời gian{" "}
						{rangeLabel}.
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					{topMethod && (
						<span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
							Dẫn đầu: {topMethod.name}
						</span>
					)}
					<span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300">
						{fmtCurrency(totalRevenue)}
					</span>
				</div>
			</div>

			<div className="relative px-4 pb-4 pt-5 md:px-6 md:pb-6">
				{isLoading ? (
					<div className="space-y-3">
						<Skeleton className="h-72 w-full rounded-3xl" />
						<div className="grid gap-3 md:grid-cols-3">
							<Skeleton className="h-20 w-full rounded-2xl" />
							<Skeleton className="h-20 w-full rounded-2xl" />
							<Skeleton className="h-20 w-full rounded-2xl" />
						</div>
					</div>
				) : isError ? (
					<div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
						Không thể tải dữ liệu phương thức thanh toán
					</div>
				) : data.length === 0 ? (
					<div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
						Chưa có dữ liệu phương thức thanh toán trong khoảng thời gian đã
						chọn
					</div>
				) : (
					<>
						<ResponsiveContainer
							width="100%"
							height={Math.max(280, data.length * 72)}
						>
							<BarChart
								data={data}
								layout="vertical"
								margin={{ top: 0, right: 12, left: 12, bottom: 0 }}
								barCategoryGap={18}
							>
								<CartesianGrid
									stroke="var(--border)"
									strokeDasharray="4 4"
									horizontal={false}
								/>
								<XAxis
									type="number"
									axisLine={false}
									tickLine={false}
									fontSize={11}
									tick={{ fill: "var(--muted-foreground)" }}
									tickFormatter={(value) => fmtCompact(Number(value))}
								/>
								<YAxis
									type="category"
									dataKey="name"
									axisLine={false}
									tickLine={false}
									fontSize={12}
									width={120}
									tick={{ fill: "var(--muted-foreground)" }}
								/>
								<Tooltip
									cursor={{ fill: "var(--muted)", opacity: 0.3 }}
									content={({ active, payload }) => (
										<PaymentMethodRevenueTooltip
											active={active}
											payload={
												payload as unknown as Array<{
													payload?: {
														name?: string;
														revenue?: number;
														count?: number;
														share?: number;
													};
												}>
											}
										/>
									)}
								/>
								<Bar dataKey="revenue" radius={[0, 8, 8, 0]} maxBarSize={30}>
									{data.map((item) => (
										<Cell key={item.key} fill={item.color} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>

						<div className="mt-6 grid gap-3 md:grid-cols-3">
							<HeroMetric
								label="Doanh thu hoàn tất"
								value={fmtCurrency(totalRevenue)}
								icon={DollarSign}
							/>
							<HeroMetric
								label="Giao dịch hoàn tất"
								value={fmt(totalTransactions)}
								icon={CreditCard}
							/>
							<HeroMetric
								label="Phương thức dẫn đầu"
								value={
									topMethod
										? `${topMethod.name} · ${topMethod.share}%`
										: "Không có"
								}
								icon={Sparkles}
							/>
						</div>
					</>
				)}
			</div>
		</PanelShell>
	);
}

function TopSpendingCustomersTooltip({
	active,
	payload,
}: {
	active?: boolean;
	payload?: Array<{
		payload?: {
			email?: string;
			totalSpent?: number;
			transactionCount?: number;
			share?: number;
			averageSpent?: number;
		};
	}>;
}) {
	if (!active || !payload?.length) return null;

	const item = payload[0]?.payload;

	return (
		<div className="rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
			<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
				{item?.email}
			</p>
			<div className="mt-2 space-y-1.5 text-sm">
				<div className="flex items-center justify-between gap-4">
					<span className="text-slate-600 dark:text-slate-300">Tổng chi</span>
					<span className="font-semibold text-slate-950 dark:text-slate-50">
						{fmtCurrency(Number(item?.totalSpent ?? 0))}
					</span>
				</div>
				<div className="flex items-center justify-between gap-4">
					<span className="text-slate-600 dark:text-slate-300">
						Số giao dịch
					</span>
					<span className="font-semibold text-slate-950 dark:text-slate-50">
						{fmt(Number(item?.transactionCount ?? 0))}
					</span>
				</div>
				<div className="flex items-center justify-between gap-4">
					<span className="text-slate-600 dark:text-slate-300">
						Trung bình / giao dịch
					</span>
					<span className="font-semibold text-slate-950 dark:text-slate-50">
						{fmtCurrency(Number(item?.averageSpent ?? 0))}
					</span>
				</div>
				<div className="flex items-center justify-between gap-4">
					<span className="text-slate-600 dark:text-slate-300">Tỷ trọng</span>
					<span className="font-semibold text-slate-950 dark:text-slate-50">
						{Number(item?.share ?? 0)}%
					</span>
				</div>
			</div>
		</div>
	);
}

function TopSpendingCustomersCard({
	data,
	isLoading,
	isError,
	rangeLabel,
}: {
	data: Array<{
		key: string;
		email: string;
		label: string;
		totalSpent: number;
		transactionCount: number;
		averageSpent: number;
		share: number;
		color: string;
	}>;
	isLoading: boolean;
	isError: boolean;
	rangeLabel: string;
}) {
	const totalTrackedSpend = data.reduce(
		(sum, item) => sum + item.totalSpent,
		0,
	);
	const totalCustomers = data.length;
	const topCustomer = data[0] ?? null;

	return (
		<PanelShell className="h-full">
			<div className="relative flex flex-col gap-4 border-b border-slate-200/70 px-6 py-5 sm:flex-row sm:items-start sm:justify-between dark:border-slate-800/80">
				<div>
					<p className="text-lg font-semibold text-slate-950 dark:text-slate-50">
						Top khách hàng chi tiêu
					</p>
					<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
						Xếp hạng người dùng chi tiêu nhiều nhất từ các giao dịch mua hàng và
						AI đã hoàn tất trong khoảng thời gian {rangeLabel}.
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					{topCustomer && (
						<span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
							Top 1: {topCustomer.label}
						</span>
					)}
					<span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
						{fmtCurrency(totalTrackedSpend)}
					</span>
				</div>
			</div>

			<div className="relative px-4 pb-4 pt-5 md:px-6 md:pb-6">
				{isLoading ? (
					<div className="space-y-3">
						<Skeleton className="h-72 w-full rounded-3xl" />
						<div className="grid gap-3 md:grid-cols-3">
							<Skeleton className="h-20 w-full rounded-2xl" />
							<Skeleton className="h-20 w-full rounded-2xl" />
							<Skeleton className="h-20 w-full rounded-2xl" />
						</div>
					</div>
				) : isError ? (
					<div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
						Không thể tải dữ liệu khách hàng chi tiêu
					</div>
				) : data.length === 0 ? (
					<div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
						Chưa có dữ liệu chi tiêu của khách hàng trong khoảng thời gian đã
						chọn
					</div>
				) : (
					<>
						<ResponsiveContainer
							width="100%"
							height={Math.max(300, data.length * 74)}
						>
							<BarChart
								data={data}
								layout="vertical"
								margin={{ top: 0, right: 12, left: 12, bottom: 0 }}
								barCategoryGap={16}
							>
								<CartesianGrid
									stroke="var(--border)"
									strokeDasharray="4 4"
									horizontal={false}
								/>
								<XAxis
									type="number"
									axisLine={false}
									tickLine={false}
									fontSize={11}
									tick={{ fill: "var(--muted-foreground)" }}
									tickFormatter={(value) => fmtCompact(Number(value))}
								/>
								<YAxis
									type="category"
									dataKey="label"
									axisLine={false}
									tickLine={false}
									fontSize={12}
									width={160}
									tick={{ fill: "var(--muted-foreground)" }}
								/>
								<Tooltip
									cursor={{ fill: "var(--muted)", opacity: 0.3 }}
									content={({ active, payload }) => (
										<TopSpendingCustomersTooltip
											active={active}
											payload={
												payload as unknown as Array<{
													payload?: {
														email?: string;
														totalSpent?: number;
														transactionCount?: number;
														share?: number;
														averageSpent?: number;
													};
												}>
											}
										/>
									)}
								/>
								<Bar dataKey="totalSpent" radius={[0, 8, 8, 0]} maxBarSize={30}>
									{data.map((item) => (
										<Cell key={item.key} fill={item.color} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>

						<div className="mt-6 grid gap-3 md:grid-cols-3">
							<HeroMetric
								label="Khách hàng được theo dõi"
								value={fmt(totalCustomers)}
								icon={Users}
							/>
							<HeroMetric
								label="Top 1 chi tiêu"
								value={
									topCustomer
										? `${topCustomer.label} · ${fmtCurrency(topCustomer.totalSpent)}`
										: "Không có"
								}
								icon={Sparkles}
							/>
							<HeroMetric
								label="Trung bình top khách hàng"
								value={
									totalCustomers > 0
										? fmtCurrency(totalTrackedSpend / totalCustomers)
										: "Không có"
								}
								icon={Gauge}
							/>
						</div>
					</>
				)}
			</div>
		</PanelShell>
	);
}

function BreakdownPie({
	data,
	labels,
	title,
	description,
}: {
	data: Record<string, number>;
	labels: Record<string, string>;
	title: string;
	description: string;
}) {
	const entries = Object.entries(data ?? {}).sort((a, b) => b[1] - a[1]);
	const total = entries.reduce((sum, [, value]) => sum + value, 0);
	const chartData = entries.map(([key, value], index) => ({
		key,
		name: labels[key] || key,
		value,
		percent: total > 0 ? Math.round((value / total) * 100) : 0,
		color:
			["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#ec4899"][
				index % 6
			] ?? "#6366f1",
	}));

	const titleLower = title.toLowerCase();
	const centerLabel = titleLower.includes("đơn")
		? "Tổng đơn"
		: titleLower.includes("giao dịch")
			? "Tổng giao dịch"
			: "Tổng";

	return (
		<PanelShell className="h-full">
			<div className="relative border-b border-slate-200/70 px-6 py-5 dark:border-slate-800/80">
				<p className="text-lg font-semibold text-slate-950 dark:text-slate-50">
					{title}
				</p>
				<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
					{description}
				</p>
			</div>

			<div className="relative px-4 pb-4 pt-5 md:px-6 md:pb-6">
				{chartData.length === 0 ? (
					<div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
						Chưa có dữ liệu
					</div>
				) : (
					<div className="grid items-center gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
						<div className="mx-auto h-55 w-full max-w-55">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={chartData}
										dataKey="value"
										nameKey="name"
										cx="50%"
										cy="50%"
										innerRadius={60}
										outerRadius={92}
										paddingAngle={4}
										stroke="var(--card)"
										strokeWidth={5}
									>
										{chartData.map((entry) => (
											<Cell key={entry.key} fill={entry.color} />
										))}
									</Pie>
									<Tooltip
										content={({ active, payload }) => {
											if (!active || !payload?.length) return null;
											const item = payload[0]?.payload;
											return (
												<div className="rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
													<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
														{item?.name}
													</p>
													<p className="mt-1 text-base font-semibold text-slate-950 dark:text-slate-50">
														{fmt(item?.value ?? 0)} ({item?.percent ?? 0}%)
													</p>
												</div>
											);
										}}
									/>
									<text
										x="50%"
										y="46%"
										textAnchor="middle"
										dominantBaseline="middle"
										fill="var(--foreground)"
										style={{ fontSize: "22px", fontWeight: 700 }}
									>
										{fmt(total)}
									</text>
									<text
										x="50%"
										y="58%"
										textAnchor="middle"
										dominantBaseline="middle"
										fill="var(--muted-foreground)"
										style={{ fontSize: "11px", fontWeight: 500 }}
									>
										{centerLabel}
									</text>
								</PieChart>
							</ResponsiveContainer>
						</div>

						<div className="space-y-3">
							{chartData.map((entry) => (
								<div
									key={entry.key}
									className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3"
								>
									<div className="flex items-start justify-between gap-3">
										<div className="flex min-w-0 items-center gap-3">
											<span
												className="h-3 w-3 shrink-0 rounded-full"
												style={{ backgroundColor: entry.color }}
											/>
											<span className="truncate text-sm font-medium text-foreground">
												{entry.name}
											</span>
										</div>
										<div className="text-right">
											<p className="text-sm font-semibold text-foreground">
												{fmt(entry.value)}
											</p>
											<p className="text-xs text-muted-foreground">
												{entry.percent}%
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</PanelShell>
	);
}

function TransactionMixCard({
	data,
	labels,
}: {
	data: Record<string, number>;
	labels: Record<string, string>;
}) {
	const entries = Object.entries(data ?? {}).sort((a, b) => b[1] - a[1]);
	const total = entries.reduce((sum, [, value]) => sum + value, 0);
	const chartData = entries.map(([key, value], index) => ({
		key,
		name: labels[key] || key,
		value,
		share: total > 0 ? Math.round((value / total) * 100) : 0,
		color: ["#10b981", "#6366f1", "#0ea5e9", "#f59e0b"][index % 4] ?? "#10b981",
	}));

	return (
		<PanelShell className="h-full">
			<div className="relative border-b border-slate-200/70 px-6 py-5 dark:border-slate-800/80">
				<p className="text-lg font-semibold text-slate-950 dark:text-slate-50">
					Cơ cấu giao dịch
				</p>
				<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
					So sánh tỷ trọng theo từng loại giao dịch trên toàn hệ thống.
				</p>
			</div>

			<div className="relative px-4 pb-4 pt-5 md:px-6 md:pb-6">
				{chartData.length === 0 ? (
					<div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
						Chưa có dữ liệu
					</div>
				) : (
					<>
						<ResponsiveContainer
							width="100%"
							height={Math.max(280, chartData.length * 68)}
						>
							<BarChart
								data={chartData}
								layout="vertical"
								margin={{ top: 0, right: 12, left: 12, bottom: 0 }}
								barCategoryGap={18}
							>
								<CartesianGrid
									stroke="var(--border)"
									strokeDasharray="4 4"
									horizontal={false}
								/>
								<XAxis
									type="number"
									axisLine={false}
									tickLine={false}
									fontSize={11}
									tick={{ fill: "var(--muted-foreground)" }}
									tickFormatter={(value) => fmtCompact(Number(value))}
								/>
								<YAxis
									type="category"
									dataKey="name"
									axisLine={false}
									tickLine={false}
									fontSize={12}
									width={84}
									tick={{ fill: "var(--muted-foreground)" }}
								/>
								<Tooltip
									cursor={{ fill: "var(--muted)", opacity: 0.3 }}
									content={({ active, payload }) => {
										if (!active || !payload?.length) return null;
										const item = payload[0]?.payload;

										return (
											<div className="rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
												<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
													{item?.name}
												</p>
												<p className="mt-1 text-base font-semibold text-slate-950 dark:text-slate-50">
													{fmt(item?.value ?? 0)} giao dịch
												</p>
												<p className="text-xs text-slate-500 dark:text-slate-400">
													Chiếm {item?.share ?? 0}% tổng lưu lượng
												</p>
											</div>
										);
									}}
								/>
								<Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={28}>
									{chartData.map((item) => (
										<Cell key={item.key} fill={item.color} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>

						<div className="mt-6 grid gap-3 sm:grid-cols-3">
							{chartData.slice(0, 3).map((item) => (
								<div
									key={item.key}
									className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3"
								>
									<p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
										{item.name}
									</p>
									<p className="mt-2 text-lg font-semibold text-foreground">
										{fmt(item.value)}
									</p>
									<p className="text-xs text-muted-foreground">
										{item.share}% tổng giao dịch
									</p>
								</div>
							))}
						</div>
					</>
				)}
			</div>
		</PanelShell>
	);
}

function TransactionHeatmapCard({
	rows,
	isLoading,
	isError,
	rangeLabel,
	totalTransactions,
	busiestDayLabel,
	peakSlotLabel,
}: {
	rows: Array<{
		label: string;
		totalCount: number;
		slots: Array<{
			hour: number;
			count: number;
			revenue: number;
			intensity: number;
		}>;
	}>;
	isLoading: boolean;
	isError: boolean;
	rangeLabel: string;
	totalTransactions: number;
	busiestDayLabel: string;
	peakSlotLabel: string;
}) {
	const hours = Array.from({ length: 24 }, (_, hour) => hour);

	return (
		<PanelShell className="h-full">
			<div className="relative flex flex-col gap-4 border-b border-slate-200/70 px-6 py-5 sm:flex-row sm:items-start sm:justify-between dark:border-slate-800/80">
				<div>
					<p className="text-lg font-semibold text-slate-950 dark:text-slate-50">
						Heatmap giao dịch theo giờ/ngày
					</p>
					<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
						Mật độ giao dịch hoàn tất theo ngày trong tuần và khung giờ trong
						ngày, dựa trên dữ liệu của khoảng thời gian {rangeLabel}.
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<PanelLegend
						items={[
							{ color: "#bae6fd", label: "Thấp", soft: true },
							{ color: "#0ea5e9", label: "Cao" },
						]}
					/>
					<span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300">
						{fmt(totalTransactions)} giao dịch
					</span>
				</div>
			</div>

			<div className="relative px-4 pb-4 pt-5 md:px-6 md:pb-6">
				{isLoading ? (
					<div className="space-y-3">
						<Skeleton className="h-80 w-full rounded-3xl" />
						<div className="grid gap-3 md:grid-cols-3">
							<Skeleton className="h-20 w-full rounded-2xl" />
							<Skeleton className="h-20 w-full rounded-2xl" />
							<Skeleton className="h-20 w-full rounded-2xl" />
						</div>
					</div>
				) : isError ? (
					<div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
						Không thể tải dữ liệu heatmap giao dịch
					</div>
				) : rows.every((row) => row.totalCount === 0) ? (
					<div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
						Chưa có dữ liệu giao dịch hoàn tất để dựng heatmap
					</div>
				) : (
					<>
						<div className="overflow-x-auto pb-2">
							<div className="min-w-[980px]">
								<div
									className="grid items-center gap-2"
									style={{
										gridTemplateColumns: "88px repeat(24, minmax(28px, 1fr))",
									}}
								>
									<div />
									{hours.map((hour) => (
										<div
											key={`hour-${hour}`}
											className="text-center text-[11px] font-medium text-slate-500 dark:text-slate-400"
										>
											{hour.toString().padStart(2, "0")}
										</div>
									))}

									{rows.map((row) => (
										<div key={row.label} className="contents">
											<div className="pr-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
												{row.label}
											</div>
											{row.slots.map((slot) => {
												const backgroundColor =
													slot.count === 0
														? "rgba(148,163,184,0.10)"
														: `rgba(14,165,233,${0.14 + slot.intensity * 0.72})`;
												const textColor =
													slot.intensity >= 0.55 ? "#ffffff" : "#0f172a";

												return (
													<div
														key={`${row.label}-${slot.hour}`}
														className="flex aspect-square items-center justify-center rounded-lg border border-white/60 text-[11px] font-semibold shadow-sm transition-transform hover:scale-105 dark:border-slate-900/70"
														style={{ backgroundColor, color: textColor }}
														title={`${row.label} · ${slot.hour
															.toString()
															.padStart(
																2,
																"0",
															)}:00 — ${fmt(slot.count)} giao dịch · ${fmtCurrency(slot.revenue)}`}
													>
														{slot.count > 0 ? fmt(slot.count) : ""}
													</div>
												);
											})}
										</div>
									))}
								</div>
							</div>
						</div>

						<div className="mt-6 grid gap-3 md:grid-cols-3">
							<HeroMetric
								label="Tổng giao dịch theo dõi"
								value={fmt(totalTransactions)}
								icon={CalendarRange}
							/>
							<HeroMetric
								label="Ngày sôi động nhất"
								value={busiestDayLabel}
								icon={Sparkles}
							/>
							<HeroMetric
								label="Khung giờ cao điểm"
								value={peakSlotLabel}
								icon={Gauge}
							/>
						</div>
					</>
				)}
			</div>
		</PanelShell>
	);
}

function TransactionValueDistributionTooltip({
	active,
	payload,
}: {
	active?: boolean;
	payload?: Array<{
		payload?: {
			label?: string;
			count?: number;
			revenue?: number;
			averageAmount?: number;
			share?: number;
		};
	}>;
}) {
	if (!active || !payload?.length) return null;

	const item = payload[0]?.payload;

	return (
		<div className="rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
			<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
				{item?.label}
			</p>
			<div className="mt-2 space-y-1.5 text-sm">
				<div className="flex items-center justify-between gap-4">
					<span className="text-slate-600 dark:text-slate-300">
						Số giao dịch
					</span>
					<span className="font-semibold text-slate-950 dark:text-slate-50">
						{fmt(Number(item?.count ?? 0))}
					</span>
				</div>
				<div className="flex items-center justify-between gap-4">
					<span className="text-slate-600 dark:text-slate-300">
						Tổng giá trị
					</span>
					<span className="font-semibold text-slate-950 dark:text-slate-50">
						{fmtCurrency(Number(item?.revenue ?? 0))}
					</span>
				</div>
				<div className="flex items-center justify-between gap-4">
					<span className="text-slate-600 dark:text-slate-300">
						Trung bình / giao dịch
					</span>
					<span className="font-semibold text-slate-950 dark:text-slate-50">
						{fmtCurrency(Number(item?.averageAmount ?? 0))}
					</span>
				</div>
				<div className="flex items-center justify-between gap-4">
					<span className="text-slate-600 dark:text-slate-300">Tỷ trọng</span>
					<span className="font-semibold text-slate-950 dark:text-slate-50">
						{Number(item?.share ?? 0)}%
					</span>
				</div>
			</div>
		</div>
	);
}

function TransactionValueDistributionCard({
	data,
	isLoading,
	isError,
	rangeLabel,
	totalTransactions,
	totalValue,
	medianAmount,
	dominantBucketLabel,
}: {
	data: Array<{
		key: string;
		shortLabel: string;
		label: string;
		count: number;
		revenue: number;
		averageAmount: number;
		share: number;
		color: string;
	}>;
	isLoading: boolean;
	isError: boolean;
	rangeLabel: string;
	totalTransactions: number;
	totalValue: number;
	medianAmount: number;
	dominantBucketLabel: string;
}) {
	return (
		<PanelShell className="h-full">
			<div className="relative flex flex-col gap-4 border-b border-slate-200/70 px-6 py-5 sm:flex-row sm:items-start sm:justify-between dark:border-slate-800/80">
				<div>
					<p className="text-lg font-semibold text-slate-950 dark:text-slate-50">
						Phân bố giá trị giao dịch
					</p>
					<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
						Nhóm các giao dịch hoàn tất theo từng ngưỡng giá trị để nhìn rõ mệnh
						giá giao dịch phổ biến trong khoảng thời gian {rangeLabel}.
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<PanelLegend items={[{ color: "#6366f1", label: "Số giao dịch" }]} />
					<span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
						{fmtCurrency(totalValue)}
					</span>
				</div>
			</div>

			<div className="relative px-4 pb-4 pt-5 md:px-6 md:pb-6">
				{isLoading ? (
					<div className="space-y-3">
						<Skeleton className="h-80 w-full rounded-3xl" />
						<div className="grid gap-3 md:grid-cols-3">
							<Skeleton className="h-20 w-full rounded-2xl" />
							<Skeleton className="h-20 w-full rounded-2xl" />
							<Skeleton className="h-20 w-full rounded-2xl" />
						</div>
					</div>
				) : isError ? (
					<div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
						Không thể tải dữ liệu phân bố giá trị giao dịch
					</div>
				) : data.every((bucket) => bucket.count === 0) ? (
					<div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
						Chưa có dữ liệu giao dịch hoàn tất để dựng phân bố giá trị
					</div>
				) : (
					<>
						<ResponsiveContainer width="100%" height={340}>
							<BarChart
								data={data}
								margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
								barCategoryGap={20}
							>
								<CartesianGrid
									stroke="var(--border)"
									strokeDasharray="4 4"
									vertical={false}
								/>
								<XAxis
									dataKey="shortLabel"
									axisLine={false}
									tickLine={false}
									fontSize={11}
									tick={{ fill: "var(--muted-foreground)" }}
								/>
								<YAxis
									axisLine={false}
									tickLine={false}
									fontSize={11}
									allowDecimals={false}
									tick={{ fill: "var(--muted-foreground)" }}
								/>
								<Tooltip
									cursor={{ fill: "var(--muted)", opacity: 0.18 }}
									content={({ active, payload }) => (
										<TransactionValueDistributionTooltip
											active={active}
											payload={
												payload as unknown as Array<{
													payload?: {
														label?: string;
														count?: number;
														revenue?: number;
														averageAmount?: number;
														share?: number;
													};
												}>
											}
										/>
									)}
								/>
								<Bar dataKey="count" radius={[10, 10, 0, 0]} maxBarSize={56}>
									{data.map((item) => (
										<Cell key={item.key} fill={item.color} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>

						<div className="mt-6 grid gap-3 md:grid-cols-3">
							<HeroMetric
								label="Giao dịch được theo dõi"
								value={fmt(totalTransactions)}
								icon={CreditCard}
							/>
							<HeroMetric
								label="Khoảng phổ biến nhất"
								value={dominantBucketLabel}
								icon={Sparkles}
							/>
							<HeroMetric
								label="Trung vị giao dịch"
								value={
									medianAmount > 0 ? fmtCurrency(medianAmount) : "Không có"
								}
								icon={Gauge}
							/>
						</div>
					</>
				)}
			</div>
		</PanelShell>
	);
}

export function Dashboard() {
	const qc = useQueryClient();
	const [preset, setPreset] = useState<DashboardPreset>("12m");
	const [customFromDate, setCustomFromDate] = useState<Date | undefined>();
	const [customToDate, setCustomToDate] = useState<Date | undefined>();
	const [granularity, setGranularity] = useState<DashboardGranularity | "auto">(
		"auto",
	);
	const timezone =
		Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Ho_Chi_Minh";
	const hasCustomRange = Boolean(customFromDate && customToDate);
	const hasInvalidCustomRange =
		Boolean(customFromDate && customToDate) &&
		customFromDate!.getTime() > customToDate!.getTime();

	const filterParams = useMemo<BusinessDashboardFilterParams>(
		() => ({
			preset: hasCustomRange ? undefined : preset,
			fromDate: hasCustomRange ? toIsoDate(customFromDate) : undefined,
			toDate: hasCustomRange ? toIsoDate(customToDate) : undefined,
			granularity: granularity === "auto" ? undefined : granularity,
			timezone,
		}),
		[
			customFromDate,
			customToDate,
			granularity,
			hasCustomRange,
			preset,
			timezone,
		],
	);

	const {
		data,
		isLoading,
		isError,
		refetch: refetchOverview,
	} = useQuery({
		queryKey: ["business-dashboard-overview", filterParams],
		queryFn: () => getBusinessDashboardOverview(filterParams),
		staleTime: 5 * 60 * 1000,
		refetchInterval: 2 * 60 * 1000,
		enabled: !hasInvalidCustomRange,
	});

	const completedRevenueDetailsQuery = useQuery({
		queryKey: ["business-dashboard-completed-revenue-details", filterParams],
		queryFn: () =>
			getAllRevenueDetailRows({
				...filterParams,
				statuses: ["COMPLETED"],
			}),
		staleTime: 5 * 60 * 1000,
		enabled: !hasInvalidCustomRange,
	});

	const refreshMutation = useMutation({
		mutationFn: async () => {
			await Promise.all([
				refetchOverview(),
				completedRevenueDetailsQuery.refetch(),
			]);
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["business-dashboard-overview"] });
			qc.invalidateQueries({
				queryKey: ["business-dashboard-completed-revenue-details"],
			});
			toast.success("Đã làm mới dữ liệu dashboard");
		},
		onError: () => {
			toast.error("Không thể làm mới dữ liệu dashboard");
		},
	});

	const exportMutation = useMutation({
		mutationFn: () => exportBusinessRevenueXlsx(filterParams),
		onSuccess: (blob) => {
			const filename = hasCustomRange
				? `revenue-detail-${filterParams.fromDate}_to_${filterParams.toDate}.xlsx`
				: `revenue-detail-${filterParams.preset ?? "12m"}.xlsx`;
			const blobUrl = window.URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = blobUrl;
			anchor.download = filename;
			anchor.click();
			window.URL.revokeObjectURL(blobUrl);
			toast.success("Đã tải file Excel doanh thu");
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message || "Không thể xuất báo cáo doanh thu",
			);
		},
	});

	const roleLabels: Record<string, string> = {
		STUDENT: "Học viên",
		MENTOR: "Giảng viên",
		MANAGER: "Quản lý",
		ADMIN: "Quản trị viên",
	};
	const orderStatusLabels: Record<string, string> = {
		PENDING: "Đang chờ",
		COMPLETED: "Hoàn thành",
		FAILED: "Thất bại",
	};
	const txStatusLabels: Record<string, string> = {
		PENDING: "Đang xử lý",
		COMPLETED: "Thành công",
		FAILED: "Thất bại",
	};
	const txTypeLabels: Record<string, string> = {
		DEPOSIT: "Nạp tiền",
		AI_REQUEST: "Yêu cầu AI",
		PURCHASE: "Mua hàng",
	};

	const rangeOptions: Array<{ id: DashboardPreset; label: string }> = [
		{ id: "3m", label: "3 tháng" },
		{ id: "6m", label: "6 tháng" },
		{ id: "12m", label: "12 tháng" },
	];

	const revenueChartData = useMemo(
		() =>
			(data?.revenueTrend ?? []).map((item) => ({
				month: item.bucketLabel,
				fullLabel: `${formatDateLabel(item.bucketStart)} - ${formatDateLabel(item.bucketEnd)}`,
				revenue: item.revenue,
			})),
		[data?.revenueTrend],
	);

	const totalPeriodRevenue = data?.summary.revenueInRange ?? 0;
	const averageRevenue =
		revenueChartData.length > 0
			? totalPeriodRevenue / revenueChartData.length
			: 0;
	const bestRevenueMonth =
		revenueChartData.length > 0
			? revenueChartData.reduce((best, current) =>
					current.revenue > best.revenue ? current : best,
				)
			: null;

	let revenueDeltaPct: number | null = null;
	let isRevenueUp = false;
	if (revenueChartData.length >= 2) {
		const latest = revenueChartData[revenueChartData.length - 1];
		const previous = revenueChartData[revenueChartData.length - 2];

		if (latest && previous && previous.revenue > 0) {
			revenueDeltaPct =
				((latest.revenue - previous.revenue) / previous.revenue) * 100;
			isRevenueUp = revenueDeltaPct >= 0;
		}
	}

	const completedOrders = data?.summary.completedOrdersInRange ?? 0;
	const activeRate = pct(
		data?.summary.activeUsers ?? 0,
		data?.summary.totalUsers ?? 0,
	);
	const paymentSuccessRate = pct(
		data?.summary.successfulTransactionsInRange ?? 0,
		data?.summary.totalTransactionsInRange ?? 0,
	);
	const orderCompletionRate = pct(
		completedOrders,
		data?.summary.ordersInRange ?? 0,
	);

	const recordMessage =
		bestRevenueMonth && revenueChartData.length > 0
			? `Mốc doanh thu tốt nhất trong kỳ đang rơi vào ${bestRevenueMonth.month} với ${fmtCurrency(bestRevenueMonth.revenue)}.`
			: "Bảng điều khiển sẽ hiển thị nhận định doanh thu khi có dữ liệu trong khoảng thời gian đã chọn.";

	const activeRangeLabel = data
		? `${formatDateLabel(data.filter.fromDate)} - ${formatDateLabel(data.filter.toDate)}`
		: hasCustomRange
			? `${formatDateLabel(filterParams.fromDate)} - ${formatDateLabel(filterParams.toDate)}`
			: (rangeOptions.find((option) => option.id === preset)?.label ??
				"12 tháng");

	const paymentMethodChartData = useMemo(() => {
		const detailRows = (completedRevenueDetailsQuery.data ?? []).filter(
			(row) =>
				Boolean(row.paymentMethod) &&
				(row.type === "PURCHASE" || row.type === "DEPOSIT"),
		);
		const grouped = new Map<
			string,
			{ key: string; name: string; revenue: number; count: number }
		>();

		for (const row of detailRows) {
			const paymentMethodKey = row.paymentMethod as PaymentMethod;
			const translatedLabel =
				translatePaymentMethod(paymentMethodKey) || paymentMethodKey;
			const current = grouped.get(paymentMethodKey) ?? {
				key: paymentMethodKey,
				name: translatedLabel,
				revenue: 0,
				count: 0,
			};

			current.revenue += row.amount;
			current.count += 1;
			grouped.set(paymentMethodKey, current);
		}

		const totalRevenue = Array.from(grouped.values()).reduce(
			(sum, item) => sum + item.revenue,
			0,
		);
		const colors = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899"];

		return Array.from(grouped.values())
			.sort((a, b) => b.revenue - a.revenue)
			.map((item, index) => ({
				...item,
				share:
					totalRevenue > 0
						? Math.round((item.revenue / totalRevenue) * 100)
						: 0,
				color: colors[index % colors.length] ?? "#6366f1",
			}));
	}, [completedRevenueDetailsQuery.data]);

	const topSpendingCustomersData = useMemo(() => {
		const detailRows = (completedRevenueDetailsQuery.data ?? []).filter(
			(row) => row.type === "PURCHASE" || row.type === "AI_REQUEST",
		);
		const grouped = new Map<
			string,
			{
				key: string;
				email: string;
				label: string;
				totalSpent: number;
				transactionCount: number;
			}
		>();

		for (const row of detailRows) {
			const email = row.userEmail?.trim() || `user-${row.userId}`;
			const key = `${row.userId}-${email}`;
			const label = email.length > 28 ? `${email.slice(0, 25)}...` : email;
			const current = grouped.get(key) ?? {
				key,
				email,
				label,
				totalSpent: 0,
				transactionCount: 0,
			};

			current.totalSpent += row.amount;
			current.transactionCount += 1;
			grouped.set(key, current);
		}

		const totalSpentAllCustomers = Array.from(grouped.values()).reduce(
			(sum, item) => sum + item.totalSpent,
			0,
		);
		const colors = [
			"#f59e0b",
			"#6366f1",
			"#0ea5e9",
			"#10b981",
			"#ec4899",
			"#8b5cf6",
		];

		return Array.from(grouped.values())
			.sort((a, b) => b.totalSpent - a.totalSpent)
			.slice(0, 6)
			.map((item, index) => ({
				...item,
				averageSpent:
					item.transactionCount > 0
						? item.totalSpent / item.transactionCount
						: 0,
				share:
					totalSpentAllCustomers > 0
						? Math.round((item.totalSpent / totalSpentAllCustomers) * 100)
						: 0,
				color: colors[index % colors.length] ?? "#f59e0b",
			}));
	}, [completedRevenueDetailsQuery.data]);

	const transactionHeatmapData = useMemo(() => {
		const detailRows = completedRevenueDetailsQuery.data ?? [];
		const dayDefinitions = [
			{ jsDay: 1, label: "Thứ 2" },
			{ jsDay: 2, label: "Thứ 3" },
			{ jsDay: 3, label: "Thứ 4" },
			{ jsDay: 4, label: "Thứ 5" },
			{ jsDay: 5, label: "Thứ 6" },
			{ jsDay: 6, label: "Thứ 7" },
			{ jsDay: 0, label: "Chủ nhật" },
		];
		const dayIndexMap = new Map(
			dayDefinitions.map((definition, index) => [definition.jsDay, index]),
		);
		const rows = dayDefinitions.map((definition) => ({
			label: definition.label,
			totalCount: 0,
			totalRevenue: 0,
			slots: Array.from({ length: 24 }, (_, hour) => ({
				hour,
				count: 0,
				revenue: 0,
				intensity: 0,
			})),
		}));

		for (const row of detailRows) {
			const createdAt = new Date(row.createdAt);
			if (Number.isNaN(createdAt.getTime())) continue;

			const dayIndex = dayIndexMap.get(createdAt.getDay());
			const hour = createdAt.getHours();
			if (dayIndex === undefined || hour < 0 || hour > 23) continue;

			const targetRow = rows[dayIndex];
			const targetSlot = targetRow?.slots[hour];
			if (!targetRow || !targetSlot) continue;

			targetRow.totalCount += 1;
			targetRow.totalRevenue += row.amount;
			targetSlot.count += 1;
			targetSlot.revenue += row.amount;
		}

		const maxCount = rows.reduce(
			(max, row) => Math.max(max, ...row.slots.map((slot) => slot.count)),
			0,
		);

		const normalizedRows = rows.map((row) => ({
			label: row.label,
			totalCount: row.totalCount,
			slots: row.slots.map((slot) => ({
				...slot,
				intensity: maxCount > 0 ? slot.count / maxCount : 0,
			})),
		}));

		const busiestDay = rows.reduce(
			(best, current) =>
				!best || current.totalCount > best.totalCount ? current : best,
			null as (typeof rows)[number] | null,
		);

		let peakSlot: {
			label: string;
			hour: number;
			count: number;
		} | null = null;
		for (const row of rows) {
			for (const slot of row.slots) {
				if (!peakSlot || slot.count > peakSlot.count) {
					peakSlot = {
						label: row.label,
						hour: slot.hour,
						count: slot.count,
					};
				}
			}
		}

		return {
			rows: normalizedRows,
			totalTransactions: detailRows.length,
			busiestDayLabel:
				busiestDay && busiestDay.totalCount > 0
					? `${busiestDay.label} · ${fmt(busiestDay.totalCount)} giao dịch`
					: "Không có",
			peakSlotLabel:
				peakSlot && peakSlot.count > 0
					? `${peakSlot.label} · ${peakSlot.hour
							.toString()
							.padStart(2, "0")}:00 (${fmt(peakSlot.count)})`
					: "Không có",
		};
	}, [completedRevenueDetailsQuery.data]);

	const transactionValueDistributionData = useMemo(() => {
		const detailRows = (completedRevenueDetailsQuery.data ?? []).filter(
			(row) => row.amount > 0,
		);
		const palette = [
			"#38bdf8",
			"#0ea5e9",
			"#6366f1",
			"#8b5cf6",
			"#ec4899",
			"#f59e0b",
			"#10b981",
		];
		const buckets = TRANSACTION_VALUE_BUCKETS.map((bucket, index) => ({
			...bucket,
			count: 0,
			revenue: 0,
			color: palette[index % palette.length] ?? "#6366f1",
		}));

		for (const row of detailRows) {
			const bucket = findTransactionValueBucket(row.amount);
			const target = buckets.find((item) => item.key === bucket.key);
			if (!target) continue;

			target.count += 1;
			target.revenue += row.amount;
		}

		const totalTransactions = detailRows.length;
		const totalValue = detailRows.reduce((sum, row) => sum + row.amount, 0);
		const medianAmount = getMedianAmount(detailRows);
		const data = buckets.map((bucket) => ({
			key: bucket.key,
			shortLabel: bucket.shortLabel,
			label: bucket.label,
			count: bucket.count,
			revenue: bucket.revenue,
			averageAmount: bucket.count > 0 ? bucket.revenue / bucket.count : 0,
			share:
				totalTransactions > 0
					? Math.round((bucket.count / totalTransactions) * 100)
					: 0,
			color: bucket.color,
		}));
		const dominantBucket = data.reduce(
			(best, current) => (!best || current.count > best.count ? current : best),
			null as (typeof data)[number] | null,
		);

		return {
			data,
			totalTransactions,
			totalValue,
			medianAmount,
			dominantBucketLabel:
				dominantBucket && dominantBucket.count > 0
					? `${dominantBucket.shortLabel} · ${fmt(dominantBucket.count)} giao dịch`
					: "Không có",
		};
	}, [completedRevenueDetailsQuery.data]);

	return (
		<>
			<Header fixed />

			<div className="flex flex-1 flex-col gap-2 p-6 sm:gap-6">
				<Card className="relative overflow-hidden border border-border/70 bg-linear-to-br from-slate-50 via-white to-sky-50/60 shadow-sm dark:from-slate-900 dark:via-slate-950 dark:to-sky-950/20">
					<div className="pointer-events-none absolute inset-0 overflow-hidden">
						<div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl dark:bg-sky-500/15" />
						<div className="absolute -bottom-16 left-20 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/15" />
					</div>

					<CardContent className="relative p-6">
						<div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
							<div className="max-w-2xl">
								<div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
									<Sparkles className="h-3.5 w-3.5 text-sky-500" />
									Bảng điều khiển kinh doanh
								</div>
								<h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
									Bảng thống kê
								</h2>
								<p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
									Theo dõi người dùng, đơn hàng và doanh thu với bộ lọc ngày
									thực tế từ server thay vì chỉ cắt dữ liệu 12 tháng ở frontend.
								</p>

								<div className="mt-5 grid gap-3 md:grid-cols-3">
									<HeroMetric
										label="Tỷ lệ hoạt động"
										value={`${activeRate}% người dùng hoạt động`}
										icon={UserCheck}
									/>
									<HeroMetric
										label="Thanh toán thành công"
										value={`${paymentSuccessRate}% giao dịch`}
										icon={CreditCard}
									/>
									<HeroMetric
										label="Đơn hàng hoàn tất"
										value={`${orderCompletionRate}% đơn hàng`}
										icon={ShoppingCart}
									/>
								</div>
							</div>

							<div className="flex flex-col items-start gap-3 xl:items-end">
								<div className="inline-flex rounded-full border border-border bg-background/85 p-1 shadow-sm backdrop-blur-sm">
									{rangeOptions.map((range) => (
										<button
											key={range.id}
											type="button"
											onClick={() => {
												setPreset(range.id);
												setCustomFromDate(undefined);
												setCustomToDate(undefined);
											}}
											className={cn(
												"rounded-full px-3 py-1.5 text-xs font-medium transition",
												!hasCustomRange && preset === range.id
													? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
													: "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
											)}
										>
											{range.label}
										</button>
									))}
								</div>

								<div className="flex w-full flex-wrap items-center gap-2 xl:justify-end">
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											setPreset("12m");
											setCustomFromDate(undefined);
											setCustomToDate(undefined);
											setGranularity("auto");
										}}
									>
										<CalendarRange className="h-4 w-4" />
										Mặc định
									</Button>

									<Button
										type="button"
										variant="outline"
										onClick={() => exportMutation.mutate()}
										disabled={exportMutation.isPending || hasInvalidCustomRange}
									>
										<Download className="h-4 w-4" />
										{exportMutation.isPending ? "Đang xuất..." : "Xuất Excel"}
									</Button>
								</div>

								<div className="flex flex-wrap items-center gap-2">
									<Button
										type="button"
										onClick={() => refreshMutation.mutate()}
										disabled={
											refreshMutation.isPending || hasInvalidCustomRange
										}
										variant="outline"
									>
										<RefreshCw
											className={cn(
												"h-4 w-4",
												refreshMutation.isPending && "animate-spin",
											)}
										/>
										{refreshMutation.isPending
											? "Đang làm mới..."
											: "Làm mới dữ liệu"}
									</Button>
								</div>

								<div className="text-right text-xs text-muted-foreground">
									<p>Phạm vi: {activeRangeLabel}</p>
									{data?.generatedAt && (
										<p>
											Dữ liệu tạo lúc{" "}
											{new Date(data.generatedAt).toLocaleTimeString("vi-VN")}
										</p>
									)}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{hasInvalidCustomRange && (
					<Card className="border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
						`Từ ngày` phải nhỏ hơn hoặc bằng `đến ngày`.
					</Card>
				)}

				{isLoading && (
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
						{["users", "new-users", "orders", "revenue"].map((key) => (
							<Card key={key}>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-10 w-10 rounded-2xl" />
								</CardHeader>
								<CardContent className="pt-0">
									<Skeleton className="mb-3 h-8 w-32" />
									<Skeleton className="h-3 w-40" />
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{isError && (
					<Card className="p-8 text-center">
						<p className="text-muted-foreground">
							Không thể tải dữ liệu. Vui lòng thử lại sau.
						</p>
					</Card>
				)}

				{data && !isLoading && !isError && (
					<div className="space-y-6">
						{data.summary.totalTransactionsInRange === 0 && (
							<Card className="border border-border/70 bg-muted/15 p-5">
								<p className="text-sm font-medium text-foreground">
									Không có giao dịch trong khoảng thời gian đã chọn.
								</p>
								<p className="mt-1 text-sm text-muted-foreground">
									Thử mở rộng phạm vi ngày hoặc chuyển về preset 12 tháng để xem
									xu hướng tổng quan hơn.
								</p>
							</Card>
						)}

						<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
							<KpiCard
								label="Tổng người dùng"
								value={fmt(data.summary.totalUsers)}
								description={`Hoạt động: ${fmt(data.summary.activeUsers)} người`}
								icon={Users}
								tone="indigo"
							/>
							<KpiCard
								label="Người dùng mới trong kỳ"
								value={`+${fmt(data.summary.newUsersInRange)}`}
								description={`Phạm vi hiện tại: ${activeRangeLabel}`}
								icon={UserPlus}
								tone="sky"
							/>
							<KpiCard
								label="Đơn hàng trong kỳ"
								value={fmt(data.summary.ordersInRange)}
								description={`Hoàn tất: ${fmt(completedOrders)} đơn · Tổng hệ thống: ${fmt(data.summary.totalOrders)}`}
								icon={ShoppingCart}
								tone="blue"
							/>
							<KpiCard
								label="Doanh thu trong kỳ"
								value={fmtCurrency(data.summary.revenueInRange)}
								description={`Toàn hệ thống: ${fmtCurrency(data.summary.totalRevenueAllTime)}`}
								icon={DollarSign}
								tone="emerald"
							/>
						</div>

						<div className="grid gap-4 xl:grid-cols-12">
							<div className="xl:col-span-8">
								<RevenueTrendCard
									data={revenueChartData}
									deltaPct={revenueDeltaPct}
									isUp={isRevenueUp}
									periodRevenue={totalPeriodRevenue}
									averageRevenue={averageRevenue}
									bestMonthLabel={bestRevenueMonth?.month ?? "Không có"}
									bestMonthRevenue={bestRevenueMonth?.revenue ?? 0}
									rangeLabel={activeRangeLabel}
									filterControls={
										<div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/40">
											<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
												Lọc theo thời gian
											</p>
											<div className="mt-2 grid gap-2 sm:grid-cols-2">
												<DatePicker
													selected={customFromDate}
													onSelect={setCustomFromDate}
													placeholder="Từ ngày"
												/>
												<DatePicker
													selected={customToDate}
													onSelect={setCustomToDate}
													placeholder="Đến ngày"
												/>
											</div>
										</div>
									}
									granularityControls={
										<div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/40">
											<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
												Hiển thị biểu đồ theo
											</p>
											<div className="mt-2">
												<Select
													value={granularity}
													onValueChange={(value) =>
														setGranularity(
															value as DashboardGranularity | "auto",
														)
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Chọn cách hiển thị biểu đồ" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="auto">Tự động</SelectItem>
														<SelectItem value="day">Gộp theo ngày</SelectItem>
														<SelectItem value="week">Gộp theo tuần</SelectItem>
														<SelectItem value="month">
															Gộp theo tháng
														</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
									}
								/>
							</div>

							<div className="xl:col-span-4">
								<OperationsSnapshotCard
									activeUsers={data.summary.activeUsers}
									totalUsers={data.summary.totalUsers}
									completedOrders={completedOrders}
									totalOrders={data.summary.ordersInRange}
									successfulTransactions={
										data.summary.successfulTransactionsInRange
									}
									totalTransactions={data.summary.totalTransactionsInRange}
									recordMessage={recordMessage}
								/>
							</div>
						</div>

						<div className="grid gap-4 xl:grid-cols-12">
							<div className="xl:col-span-12">
								<CumulativeRevenueCard
									data={revenueChartData}
									rangeLabel={activeRangeLabel}
								/>
							</div>
						</div>

						<div className="grid gap-4 xl:grid-cols-12">
							<div className="xl:col-span-12">
								<RevenueDeltaCard
									data={revenueChartData}
									rangeLabel={activeRangeLabel}
								/>
							</div>
						</div>

						<div className="grid gap-4 xl:grid-cols-12">
							<div className="xl:col-span-4">
								<BreakdownPie
									data={data.orderStatusBreakdown || {}}
									labels={orderStatusLabels}
									title="Trạng thái đơn hàng"
									description="Phân phối đơn hàng phát sinh trong khoảng thời gian đang lọc."
								/>
							</div>
							<div className="xl:col-span-4">
								<BreakdownPie
									data={data.transactionStatusBreakdown || {}}
									labels={txStatusLabels}
									title="Trạng thái giao dịch"
									description="Phân bổ giao dịch thành công, thất bại và đang xử lý trong khoảng thời gian đang lọc."
								/>
							</div>
							<div className="xl:col-span-4">
								<BreakdownPie
									data={data.userRoleBreakdown || {}}
									labels={roleLabels}
									title="Vai trò người dùng"
									description="Cơ cấu người dùng theo từng nhóm quyền trong nền tảng."
								/>
							</div>
						</div>

						<div className="grid gap-4 xl:grid-cols-12">
							<div className="xl:col-span-12">
								<TransactionMixCard
									data={data.transactionTypeBreakdown || {}}
									labels={txTypeLabels}
								/>
							</div>
						</div>

						<div className="grid gap-4 xl:grid-cols-12">
							<div className="xl:col-span-12">
								<PaymentMethodRevenueCard
									data={paymentMethodChartData}
									isLoading={completedRevenueDetailsQuery.isLoading}
									isError={completedRevenueDetailsQuery.isError}
									rangeLabel={activeRangeLabel}
								/>
							</div>
						</div>

						<div className="grid gap-4 xl:grid-cols-12">
							<div className="xl:col-span-12">
								<TopSpendingCustomersCard
									data={topSpendingCustomersData}
									isLoading={completedRevenueDetailsQuery.isLoading}
									isError={completedRevenueDetailsQuery.isError}
									rangeLabel={activeRangeLabel}
								/>
							</div>
						</div>

						<div className="grid gap-4 xl:grid-cols-12">
							<div className="xl:col-span-12">
								<TransactionHeatmapCard
									rows={transactionHeatmapData.rows}
									isLoading={completedRevenueDetailsQuery.isLoading}
									isError={completedRevenueDetailsQuery.isError}
									rangeLabel={activeRangeLabel}
									totalTransactions={transactionHeatmapData.totalTransactions}
									busiestDayLabel={transactionHeatmapData.busiestDayLabel}
									peakSlotLabel={transactionHeatmapData.peakSlotLabel}
								/>
							</div>
						</div>

						<div className="grid gap-4 xl:grid-cols-12">
							<div className="xl:col-span-12">
								<TransactionValueDistributionCard
									data={transactionValueDistributionData.data}
									isLoading={completedRevenueDetailsQuery.isLoading}
									isError={completedRevenueDetailsQuery.isError}
									rangeLabel={activeRangeLabel}
									totalTransactions={
										transactionValueDistributionData.totalTransactions
									}
									totalValue={transactionValueDistributionData.totalValue}
									medianAmount={transactionValueDistributionData.medianAmount}
									dominantBucketLabel={
										transactionValueDistributionData.dominantBucketLabel
									}
								/>
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
