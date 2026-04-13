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
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	AlertTriangle,
	ArrowDownRight,
	ArrowUpRight,
	CreditCard,
	DollarSign,
	Gauge,
	RefreshCw,
	Settings,
	ShoppingCart,
	Sparkles,
	UserCheck,
	UserPlus,
	Users,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/layout/header";
import { Main } from "@/layout/main";
import { cn } from "@/shared/lib/utils";
import {
	getAllDashboardStats,
	getDashboardSettings,
	triggerManualRefresh,
	updateDashboardSettings,
} from "../api/dashboard-api";

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

function getMonthName(month: number): string {
	return (
		["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"][
			month - 1
		] ?? `T${month}`
	);
}

type TimeRange = "3m" | "6m" | "12m";
type KpiTone = "indigo" | "sky" | "blue" | "emerald";

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
				"relative overflow-hidden border border-border/70 bg-gradient-to-br shadow-sm",
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
			<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:28px_28px] dark:bg-[linear-gradient(to_right,rgba(51,65,85,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(51,65,85,0.14)_1px,transparent_1px)]" />
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
}: {
	data: Array<{ month: string; revenue: number; fullLabel: string }>;
	deltaPct: number | null;
	isUp: boolean;
	periodRevenue: number;
	averageRevenue: number;
	bestMonthLabel: string;
	bestMonthRevenue: number;
	rangeLabel: string;
}) {
	const enhancedData = withMovingAverage(data);

	return (
		<PanelShell className="h-full">
			<div className="relative flex flex-col gap-4 border-b border-slate-200/70 px-6 py-5 sm:flex-row sm:items-start sm:justify-between dark:border-slate-800/80">
				<div>
					<p className="text-lg font-semibold text-slate-950 dark:text-slate-50">
						Revenue Pulse
					</p>
					<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
						Theo dõi doanh thu theo tháng cho khung thời gian {rangeLabel}.
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<PanelLegend
						items={[
							{ color: "#10b981", label: "Revenue" },
							{ color: "#6ee7b7", label: "Moving avg", soft: true },
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

			<div className="relative px-4 pb-4 pt-5 md:px-6 md:pb-6">
				{enhancedData.length === 0 ? (
					<div className="flex h-[340px] items-center justify-center text-sm text-muted-foreground">
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
													payload as Array<{
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
									name="Revenue"
									stroke="#10b981"
									strokeWidth={3}
									fill="url(#dashboard-revenue-fill)"
									activeDot={{ r: 5, fill: "#10b981", stroke: "var(--card)" }}
								/>
								<Line
									type="monotone"
									dataKey="avgRevenue"
									name="Moving avg"
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
					Operations Snapshot
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
			? "Tổng GD"
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
					<div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
						Chưa có dữ liệu
					</div>
				) : (
					<div className="grid items-center gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
						<div className="mx-auto h-[220px] w-full max-w-[220px]">
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
					Transaction Mix
				</p>
				<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
					So sánh tỷ trọng theo từng loại giao dịch trên toàn hệ thống.
				</p>
			</div>

			<div className="relative px-4 pb-4 pt-5 md:px-6 md:pb-6">
				{chartData.length === 0 ? (
					<div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
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

function SettingsPanel({ onClose }: { onClose: () => void }) {
	const qc = useQueryClient();
	const { data: settings, isLoading } = useQuery({
		queryKey: ["dashboard-settings"],
		queryFn: getDashboardSettings,
	});
	const [interval, setInterval] = useState("");
	const [autoRefresh, setAutoRefresh] = useState(true);

	useEffect(() => {
		if (!settings) return;
		setInterval(settings.refresh_interval_minutes || "30");
		setAutoRefresh(settings.auto_refresh_enabled !== "false");
	}, [settings]);

	const saveMutation = useMutation({
		mutationFn: (updates: Record<string, string>) =>
			updateDashboardSettings(updates),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["dashboard-settings"] });
		},
	});

	const handleSave = () => {
		saveMutation.mutate({
			refresh_interval_minutes: interval,
			auto_refresh_enabled: String(autoRefresh),
		});
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
			<div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
				<button
					type="button"
					onClick={onClose}
					className="absolute right-4 top-4 rounded-xl p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
				>
					<X className="h-5 w-5" />
				</button>

				<div className="mb-5">
					<h3 className="text-lg font-semibold text-foreground">
						Cài đặt Dashboard
					</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						Tinh chỉnh chu kỳ đồng bộ và chế độ cập nhật tự động.
					</p>
				</div>

				{isLoading ? (
					<div className="space-y-3">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				) : (
					<div className="space-y-5">
						<div>
							<p className="mb-2 block text-sm font-medium text-foreground">
								Chu kỳ tự động cập nhật (phút)
							</p>
							<input
								type="number"
								min={1}
								max={1440}
								value={interval}
								onChange={(e) => setInterval(e.target.value)}
								className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
							/>
							<p className="mt-2 text-xs text-muted-foreground">
								Tối thiểu 1 phút, tối đa 1440 phút (24 giờ).
							</p>
						</div>

						<div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/20 px-4 py-4">
							<div>
								<p className="text-sm font-medium text-foreground">
									Tự động cập nhật
								</p>
								<p className="mt-1 text-xs text-muted-foreground">
									Bật hoặc tắt cron job đồng bộ dashboard.
								</p>
							</div>
							<button
								type="button"
								onClick={() => setAutoRefresh((prev) => !prev)}
								className={cn(
									"relative h-6 w-11 rounded-full transition-colors",
									autoRefresh ? "bg-primary" : "bg-muted",
								)}
							>
								<span
									className={cn(
										"absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform dark:bg-slate-100",
										autoRefresh && "translate-x-5",
									)}
								/>
							</button>
						</div>

						<button
							type="button"
							onClick={handleSave}
							disabled={saveMutation.isPending}
							className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
						>
							{saveMutation.isPending
								? "Đang lưu..."
								: saveMutation.isSuccess
									? "✓ Đã lưu"
									: "Lưu cài đặt"}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

function StaleBanner({
	refreshedAt,
	onRefresh,
	isRefreshing,
}: {
	refreshedAt?: string;
	onRefresh: () => void;
	isRefreshing: boolean;
}) {
	if (!refreshedAt) return null;
	const refreshedTime = new Date(refreshedAt);
	const minutesAgo = Math.floor(
		(Date.now() - refreshedTime.getTime()) / 60_000,
	);
	const isStale = minutesAgo > 30;

	if (!isStale) return null;

	return (
		<div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/30">
			<AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
			<div className="min-w-0 flex-1">
				<p className="text-sm font-medium text-amber-800 dark:text-amber-200">
					Dữ liệu đã cũ ({minutesAgo} phút trước)
				</p>
				<p className="text-xs text-amber-700 dark:text-amber-400">
					Nhấn đồng bộ ngay để lấy dữ liệu mới nhất từ hệ thống.
				</p>
			</div>
			<button
				type="button"
				onClick={onRefresh}
				disabled={isRefreshing}
				className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
			>
				<RefreshCw
					className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
				/>
				{isRefreshing ? "Đang đồng bộ..." : "Đồng bộ ngay"}
			</button>
		</div>
	);
}

export function Dashboard() {
	const qc = useQueryClient();
	const [showSettings, setShowSettings] = useState(false);
	const [timeRange, setTimeRange] = useState<TimeRange>("12m");

	const { data, isLoading, isError } = useQuery({
		queryKey: ["dashboard-stats"],
		queryFn: getAllDashboardStats,
		staleTime: 5 * 60 * 1000,
		refetchInterval: 5 * 60 * 1000,
	});

	const refreshMutation = useMutation({
		mutationFn: triggerManualRefresh,
		onSuccess: () => {
			setTimeout(() => {
				qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
			}, 1500);
		},
	});

	const roleLabels: Record<string, string> = {
		STUDENT: "Học viên",
		MENTOR: "Giảng viên",
		MANAGER: "Quản lý",
		ADMIN: "Admin",
	};
	const orderStatusLabels: Record<string, string> = {
		PENDING: "Đang chờ",
		COMPLETED: "Hoàn thành",
		FAILED: "Thất bại",
	};
	const txTypeLabels: Record<string, string> = {
		DEPOSIT: "Nạp tiền",
		AI_REQUEST: "Yêu cầu AI",
		PURCHASE: "Mua hàng",
	};

	const rangeOptions: Array<{ id: TimeRange; label: string; months: number }> =
		[
			{ id: "3m", label: "3 tháng", months: 3 },
			{ id: "6m", label: "6 tháng", months: 6 },
			{ id: "12m", label: "12 tháng", months: 12 },
		];

	const activeRange =
		rangeOptions.find((option) => option.id === timeRange) ?? rangeOptions[1];
	const revenueSeries = data?.payments.monthlyRevenue ?? [];
	const filteredRevenueSeries = revenueSeries.slice(-activeRange.months);

	const revenueChartData = useMemo(
		() =>
			filteredRevenueSeries.map((item) => ({
				month: getMonthName(item.month),
				fullLabel: `Tháng ${item.month}`,
				revenue: item.revenue,
			})),
		[filteredRevenueSeries],
	);

	const totalPeriodRevenue = filteredRevenueSeries.reduce(
		(sum, item) => sum + item.revenue,
		0,
	);
	const averageRevenue =
		filteredRevenueSeries.length > 0
			? totalPeriodRevenue / filteredRevenueSeries.length
			: 0;

	const bestRevenueMonth =
		filteredRevenueSeries.length > 0
			? filteredRevenueSeries.reduce((best, current) =>
					current.revenue > best.revenue ? current : best,
				)
			: null;

	let revenueDeltaPct: number | null = null;
	let isRevenueUp = false;
	if (filteredRevenueSeries.length >= 2) {
		const latest = filteredRevenueSeries[filteredRevenueSeries.length - 1];
		const previous = filteredRevenueSeries[filteredRevenueSeries.length - 2];

		if (latest && previous && previous.revenue > 0) {
			revenueDeltaPct =
				((latest.revenue - previous.revenue) / previous.revenue) * 100;
			isRevenueUp = revenueDeltaPct >= 0;
		}
	}

	const completedOrders = data?.orders.statusBreakdown?.COMPLETED ?? 0;
	const activeRate = pct(
		data?.users.activeUsers ?? 0,
		data?.users.totalUsers ?? 0,
	);
	const paymentSuccessRate = pct(
		data?.payments.successfulTransactions ?? 0,
		data?.payments.totalTransactions ?? 0,
	);
	const orderCompletionRate = pct(
		completedOrders,
		data?.orders.totalOrders ?? 0,
	);

	const recordMessage =
		bestRevenueMonth && filteredRevenueSeries.length > 0
			? `Mốc doanh thu tốt nhất trong ${activeRange.label.toLowerCase()} đang rơi vào ${getMonthName(bestRevenueMonth.month)} với ${fmtCurrency(bestRevenueMonth.revenue)}.`
			: "Dashboard sẽ hiển thị insight doanh thu khi có đủ dữ liệu tháng.";

	return (
		<>
			<Header fixed />

			<div className="flex flex-1 flex-col gap-2 sm:gap-6 p-6">
				<Card className="relative overflow-hidden border border-border/70 bg-gradient-to-br from-slate-50 via-white to-sky-50/60 shadow-sm dark:from-slate-900 dark:via-slate-950 dark:to-sky-950/20">
					<div className="pointer-events-none absolute inset-0 overflow-hidden">
						<div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl dark:bg-sky-500/15" />
						<div className="absolute -bottom-16 left-20 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/15" />
					</div>

					<CardContent className="relative p-6">
						<div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
							<div className="max-w-2xl">
								<div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
									<Sparkles className="h-3.5 w-3.5 text-sky-500" />
									Executive dashboard
								</div>
								<h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
									Bảng thống kê
								</h2>
								<p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
									Theo dõi tăng trưởng người dùng, hiệu suất giao dịch và doanh
									thu trên một bố cục phân tích rõ ràng hơn cho admin.
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
											onClick={() => setTimeRange(range.id)}
											className={cn(
												"rounded-full px-3 py-1.5 text-xs font-medium transition",
												timeRange === range.id
													? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
													: "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
											)}
										>
											{range.label}
										</button>
									))}
								</div>

								<div className="flex flex-wrap items-center gap-2">
									<button
										type="button"
										onClick={() => refreshMutation.mutate()}
										disabled={refreshMutation.isPending}
										className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:text-foreground disabled:opacity-50"
									>
										<RefreshCw
											className={cn(
												"h-4 w-4",
												refreshMutation.isPending && "animate-spin",
											)}
										/>
										{refreshMutation.isPending ? "Đang đồng bộ..." : "Đồng bộ"}
									</button>
									<button
										type="button"
										onClick={() => setShowSettings(true)}
										className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:text-foreground"
									>
										<Settings className="h-4 w-4" />
										Cài đặt
									</button>
								</div>

								{data?.refreshedAt && (
									<p className="text-xs text-muted-foreground">
										Cập nhật lúc{" "}
										{new Date(data.refreshedAt).toLocaleTimeString("vi-VN")}
									</p>
								)}
							</div>
						</div>
					</CardContent>
				</Card>

				{data && (
					<StaleBanner
						refreshedAt={data.refreshedAt}
						onRefresh={() => refreshMutation.mutate()}
						isRefreshing={refreshMutation.isPending}
					/>
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
						<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
							<KpiCard
								label="Tổng người dùng"
								value={fmt(data.users.totalUsers)}
								description={`Hoạt động: ${fmt(data.users.activeUsers)} người`}
								icon={Users}
								tone="indigo"
							/>
							<KpiCard
								label="Người dùng mới"
								value={`+${fmt(data.users.newUsersThisMonth)}`}
								description={`Tuần: +${fmt(data.users.newUsersThisWeek)} · Hôm nay: +${fmt(data.users.newUsersToday)}`}
								icon={UserPlus}
								tone="sky"
							/>
							<KpiCard
								label="Tổng đơn hàng"
								value={fmt(data.orders.totalOrders)}
								description={`Hoàn tất: ${fmt(completedOrders)} đơn`}
								icon={ShoppingCart}
								tone="blue"
							/>
							<KpiCard
								label="Doanh thu tháng"
								value={fmtCurrency(data.orders.revenueThisMonth)}
								description={`Toàn hệ thống: ${fmtCurrency(data.orders.totalRevenue)}`}
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
									bestMonthLabel={
										bestRevenueMonth
											? getMonthName(bestRevenueMonth.month)
											: "N/A"
									}
									bestMonthRevenue={bestRevenueMonth?.revenue ?? 0}
									rangeLabel={activeRange.label.toLowerCase()}
								/>
							</div>

							<div className="xl:col-span-4">
								<OperationsSnapshotCard
									activeUsers={data.users.activeUsers}
									totalUsers={data.users.totalUsers}
									completedOrders={completedOrders}
									totalOrders={data.orders.totalOrders}
									successfulTransactions={data.payments.successfulTransactions}
									totalTransactions={data.payments.totalTransactions}
									recordMessage={recordMessage}
								/>
							</div>
						</div>

						<div className="grid gap-4 xl:grid-cols-12">
							<div className="xl:col-span-4">
								<BreakdownPie
									data={data.orders.statusBreakdown || {}}
									labels={orderStatusLabels}
									title="Trạng thái đơn hàng"
									description="Phân phối đơn hàng theo trạng thái xử lý hiện tại."
								/>
							</div>
							<div className="xl:col-span-4">
								<BreakdownPie
									data={data.users.roleBreakdown || {}}
									labels={roleLabels}
									title="Vai trò người dùng"
									description="Cơ cấu người dùng theo từng nhóm quyền trong nền tảng."
								/>
							</div>
							<div className="xl:col-span-4">
								<TransactionMixCard
									data={data.payments.typeBreakdown || {}}
									labels={txTypeLabels}
								/>
							</div>
						</div>
					</div>
				)}
			</div>

			{showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
		</>
	);
}
