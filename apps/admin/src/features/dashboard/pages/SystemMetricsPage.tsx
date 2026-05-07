import { Skeleton } from "@/components/ui/skeleton";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

import { Header } from "@/layout/header";
import { TopNav } from "@/layout/top-nav";
import { cn } from "@/shared/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Activity, Cpu, HardDrive } from "lucide-react";
import type React from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	Line,
	LineChart,
	Tooltip as RechartsTooltip,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";
import {
	getSystemMetricsHealth,
	getSystemMetricsSummary,
	getSystemMetricsTrends,
} from "../api/system-metrics-api";
import { HealthOverviewCard } from "../components/metrics/HealthOverviewCard";
import { RuntimeSignalsCard } from "../components/metrics/RuntimeSignalsCard";
import { SummaryCards } from "../components/metrics/SummaryCards";
import { SystemHero } from "../components/metrics/SystemHero";
import type {
	DiskSpaceHealthDetails,
	HealthComponent,
	MetricPoint,
	MetricsTrends,
} from "../types/system-metrics.types";
export const REFRESH_INTERVALS = [
	{ label: "5 giây", value: 5_000 },
	{ label: "10 giây", value: 10_000 },
	{ label: "15 giây", value: 15_000 },
	{ label: "30 giây", value: 30_000 },
	{ label: "1 phút", value: 60_000 },
	{ label: "Tắt", value: 0 },
] as const;

function RefreshIntervalPicker({
	value,
	onChange,
}: {
	value: number;
	onChange: (ms: number) => void;
}) {
	return (
		<Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
			<SelectTrigger className="h-7 w-[100px] text-xs">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{REFRESH_INTERVALS.map((opt) => (
					<SelectItem key={opt.value} value={String(opt.value)}>
						{opt.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

type RechartsPayloadEntry = {
	color?: string;
	name?: string;
	value?: number;
	payload?: Record<string, unknown>;
};

export function fmt(n: number): string {
	return n.toLocaleString("vi-VN");
}

export function fmtNumber(value: number, digits = 1): string {
	return Number.isFinite(value) ? value.toFixed(digits) : "0.0";
}

export function fmtBytesToMb(value: number): number {
	return value / (1024 * 1024);
}

export const formatGB = (bytes?: number) => {
	if (!bytes) return "-";
	return (bytes / 1024 / 1024 / 1024).toFixed(1) + " GB";
};

export function formatTime(timestamp?: string): string {
	if (!timestamp) return "--:--";
	return new Date(timestamp).toLocaleTimeString("vi-VN", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
}

export function isDiskSpaceHealthDetails(
	details: HealthComponent["details"],
): details is DiskSpaceHealthDetails {
	if (!details || typeof details !== "object") return false;

	const candidate = details as Record<string, unknown>;
	return (
		typeof candidate.total === "number" && typeof candidate.free === "number"
	);
}

export function getHealthLabel(
	value: number,
	thresholds = { warn: 70, critical: 90 },
) {
	if (value >= thresholds.critical) {
		return {
			label: "Nguy hiểm",
			textClass: "text-rose-600 dark:text-rose-400",
			dotClass: "bg-rose-500",
			barClass: "bg-rose-500",
		};
	}
	if (value >= thresholds.warn) {
		return {
			label: "Cần chú ý",
			textClass: "text-amber-600 dark:text-amber-400",
			dotClass: "bg-amber-500",
			barClass: "bg-amber-500",
		};
	}
	return {
		label: "Bình thường",
		textClass: "text-emerald-600 dark:text-emerald-400",
		dotClass: "bg-emerald-500",
		barClass: null, // use caller's default color
	};
}

export function getStatusTone(status: string) {
	if (status === "UP") {
		return {
			badge:
				"border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
			dot: "bg-emerald-500",
		};
	}

	if (status === "DOWN") {
		return {
			badge:
				"border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
			dot: "bg-rose-500",
		};
	}

	return {
		badge:
			"border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
		dot: "bg-amber-500",
	};
}

export function mapPoints(points?: MetricPoint[]) {
	return (points ?? []).map((point) => ({
		time: new Date(point.timestamp).toLocaleTimeString("vi-VN", {
			hour: "2-digit",
			minute: "2-digit",
		}),
		value: point.value,
		timestamp: point.timestamp,
	}));
}

function withMovingAverage<T extends { value: number }>(
	points: T[],
	windowSize = 3,
) {
	return points.map((point, index) => {
		const start = Math.max(0, index - windowSize + 1);
		const slice = points.slice(start, index + 1);
		const average =
			slice.reduce((sum, item) => sum + item.value, 0) /
			Math.max(slice.length, 1);

		return {
			...point,
			avgValue: average,
		};
	});
}

function mergeTrendSeries(data?: MetricsTrends, maxMemoryMb = 0) {
	const byTimestamp = new Map<
		string,
		{
			timestamp: string;
			time: string;
			cpu?: number;
			memoryPercent?: number;
			requests?: number;
		}
	>();

	const upsert = (
		points: MetricPoint[] | undefined,
		key: "cpu" | "memoryPercent" | "requests",
		transform?: (value: number) => number,
	) => {
		for (const point of points ?? []) {
			const entry = byTimestamp.get(point.timestamp) ?? {
				timestamp: point.timestamp,
				time: new Date(point.timestamp).toLocaleTimeString("vi-VN", {
					hour: "2-digit",
					minute: "2-digit",
				}),
			};

			entry[key] = transform ? transform(point.value) : point.value;
			byTimestamp.set(point.timestamp, entry);
		}
	};

	upsert(data?.cpu, "cpu");
	upsert(data?.memory, "memoryPercent", (value) =>
		maxMemoryMb > 0 ? (value / maxMemoryMb) * 100 : value,
	);
	upsert(data?.requestCount, "requests");

	return [...byTimestamp.values()]
		.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
		.map((item) => ({
			...item,
			cpu: item.cpu ?? 0,
			memoryPercent: item.memoryPercent ?? 0,
			requests: item.requests ?? 0,
		}));
}

function getSeriesStats(points: { time: string; value: number }[]) {
	if (points.length === 0) {
		return { current: 0, average: 0, peak: 0 };
	}

	const values = points.map((point) => point.value);
	const current = values[values.length - 1] ?? 0;
	const average = values.reduce((sum, value) => sum + value, 0) / values.length;
	const peak = Math.max(...values);

	return { current, average, peak };
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

export function TrendCard({
	title,
	description,
	icon: Icon,
	data,
	color,
	unit,
	secondaryColor,
	primaryLabel,
	secondaryLabel,
	chartType = "area",
}: {
	title: string;
	description: string;
	icon: React.ElementType;
	data: { time: string; value: number }[];
	color: string;
	unit: string;
	secondaryColor: string;
	primaryLabel: string;
	secondaryLabel: string;
	chartType?: "area" | "line";
}) {
	const enhancedData = withMovingAverage(data);
	const stats = getSeriesStats(enhancedData);
	const gradientId = `${title.replace(/\s+/g, "-").toLowerCase()}-gradient`;

	return (
		<PanelShell className="h-full">
			<div className="relative flex flex-row items-start justify-between border-b border-slate-200/70 px-6 py-5 dark:border-slate-800/80">
				<div>
					<p className="text-lg font-semibold text-slate-950 dark:text-slate-50">
						{title}
					</p>
					<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
						{description}
					</p>
				</div>
				<div className="flex items-center gap-3">
					<PanelLegend
						items={[
							{ color, label: primaryLabel },
							{ color: secondaryColor, label: secondaryLabel, soft: true },
						]}
					/>
					<div className="rounded-2xl border border-slate-200/70 bg-white/80 p-2.5 dark:border-slate-800 dark:bg-slate-900/70">
						<Icon className="h-4.5 w-4.5 text-slate-700 dark:text-slate-200" />
					</div>
				</div>
			</div>

			<div className="relative px-4 pb-4 pt-5 md:px-6 md:pb-6">
				{enhancedData.length === 0 ? (
					<div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
						Chưa có dữ liệu
					</div>
				) : (
					<>
						<ResponsiveContainer width="100%" height={280}>
							{chartType === "area" ? (
								<AreaChart
									data={enhancedData}
									margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
								>
									<defs>
										<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
											<stop offset="0%" stopColor={color} stopOpacity={0.35} />
											<stop
												offset="100%"
												stopColor={color}
												stopOpacity={0.04}
											/>
										</linearGradient>
									</defs>
									<CartesianGrid
										stroke="var(--border)"
										strokeDasharray="4 4"
										vertical={false}
									/>
									<XAxis
										dataKey="time"
										axisLine={false}
										tickLine={false}
										fontSize={11}
										tick={{ fill: "var(--muted-foreground)" }}
									/>
									<YAxis
										axisLine={false}
										tickLine={false}
										fontSize={11}
										width={48}
										tick={{ fill: "var(--muted-foreground)" }}
										tickFormatter={(value) =>
											`${Number(value).toFixed(0)}${unit}`
										}
									/>
									<RechartsTooltip
										content={({ active, payload }) => (
											<MultiSeriesTooltip
												active={active}
												payload={payload as unknown as RechartsPayloadEntry[]}
												unit={unit}
											/>
										)}
									/>
									<Area
										type="monotone"
										dataKey="value"
										stroke={color}
										strokeWidth={3}
										fill={`url(#${gradientId})`}
										activeDot={{ r: 5, fill: color, stroke: "var(--card)" }}
									/>
									<Line
										type="monotone"
										dataKey="avgValue"
										name={secondaryLabel}
										stroke={secondaryColor}
										strokeWidth={2}
										strokeDasharray="6 6"
										dot={false}
										isAnimationActive={false}
									/>
								</AreaChart>
							) : (
								<LineChart
									data={enhancedData}
									margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
								>
									<CartesianGrid
										stroke="var(--border)"
										strokeDasharray="4 4"
										vertical={false}
									/>
									<XAxis
										dataKey="time"
										axisLine={false}
										tickLine={false}
										fontSize={11}
										tick={{ fill: "var(--muted-foreground)" }}
									/>
									<YAxis
										axisLine={false}
										tickLine={false}
										fontSize={11}
										width={48}
										tick={{ fill: "var(--muted-foreground)" }}
										tickFormatter={(value) =>
											`${Number(value).toFixed(0)}${unit}`
										}
									/>
									<RechartsTooltip
										content={({ active, payload }) => (
											<MultiSeriesTooltip
												active={active}
												payload={payload as unknown as RechartsPayloadEntry[]}
												unit={unit}
											/>
										)}
									/>
									<Line
										type="monotone"
										dataKey="value"
										stroke={color}
										strokeWidth={3}
										dot={false}
										activeDot={{ r: 5, fill: color, stroke: "var(--card)" }}
										isAnimationActive={false}
									/>
									<Line
										type="monotone"
										dataKey="avgValue"
										name={secondaryLabel}
										stroke={secondaryColor}
										strokeWidth={2}
										strokeDasharray="6 6"
										dot={false}
										isAnimationActive={false}
									/>
								</LineChart>
							)}
						</ResponsiveContainer>

						<div className="mt-6 grid gap-3 sm:grid-cols-3">
							<TrendStat label="Hiện tại" value={stats.current} unit={unit} />
							<TrendStat label="Trung bình" value={stats.average} unit={unit} />
							<TrendStat label="Đỉnh" value={stats.peak} unit={unit} />
						</div>
					</>
				)}
			</div>
		</PanelShell>
	);
}

function MultiSeriesTooltip({
	active,
	payload,
	unit = "",
}: {
	active?: boolean;
	payload?: RechartsPayloadEntry[];
	unit?: string;
}) {
	if (!active || !payload?.length) return null;

	const item = payload[0]?.payload as { time?: string } | undefined;

	return (
		<div className="rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
			<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
				{item?.time}
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
							{fmtNumber(Number(entry.value ?? 0))}
							{unit}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

function TrendStat({
	label,
	value,
	unit,
}: {
	label: string;
	value: number;
	unit: string;
}) {
	return (
		<div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
			<p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
				{label}
			</p>
			<p className="mt-2 text-lg font-semibold text-foreground">
				{fmtNumber(value)}
				{unit}
			</p>
		</div>
	);
}

function SystemTrendsSection({
	data,
	isLoading,
	memoryMaxMb,
}: {
	data?: MetricsTrends;
	isLoading: boolean;
	memoryMaxMb: number;
}) {
	if (isLoading) {
		return (
			<div className="grid gap-4 xl:grid-cols-12">
				<div className="xl:col-span-8">
					<PanelShell>
						<div className="px-6 py-5">
							<Skeleton className="h-5 w-40" />
							<Skeleton className="mt-2 h-4 w-56" />
						</div>
						<div className="px-6 pb-6">
							<Skeleton className="h-[360px] w-full" />
						</div>
					</PanelShell>
				</div>
				{["cpu", "memory", "requests"].slice(0, 2).map((key) => (
					<div key={key} className="xl:col-span-4">
						<PanelShell>
							<div className="px-6 py-5">
								<Skeleton className="h-5 w-32" />
								<Skeleton className="mt-2 h-4 w-48" />
							</div>
							<div className="px-6 pb-6">
								<Skeleton className="h-[280px] w-full" />
							</div>
						</PanelShell>
					</div>
				))}
			</div>
		);
	}

	if (!data) return null;

	const cpuData = mapPoints(data.cpu);
	const memoryData = mapPoints(data.memory);
	const requestData = mapPoints(data.requestCount);

	return (
		<div className="grid gap-4 xl:grid-cols-12">
			{/* <SystemPulsePanel data={data} memoryMaxMb={memoryMaxMb} /> */}
			<div className="xl:col-span-4">
				<TrendCard
					title="CPU load"
					description="Biến động CPU theo chu kỳ lấy mẫu gần nhất."
					icon={Cpu}
					data={cpuData}
					color="#22c55e"
					secondaryColor="#86efac"
					primaryLabel="Live CPU"
					secondaryLabel="Moving avg"
					unit="%"
				/>
			</div>
			<div className="xl:col-span-4">
				<TrendCard
					title="Heap memory"
					description="Theo dõi áp lực bộ nhớ heap trên JVM."
					icon={HardDrive}
					data={memoryData}
					color="#8b5cf6"
					secondaryColor="#c4b5fd"
					primaryLabel="Heap usage"
					secondaryLabel="Moving avg"
					unit="MB"
				/>
			</div>
			<div className="xl:col-span-4">
				<TrendCard
					title="Request volume"
					description="Xu hướng request count để quan sát tải hệ thống."
					icon={Activity}
					data={requestData}
					color="#0ea5e9"
					secondaryColor="#7dd3fc"
					primaryLabel="Requests"
					secondaryLabel="Moving avg"
					unit=""
					chartType="line"
				/>
			</div>
		</div>
	);
}

export function Dashboard() {
	const [summaryInterval, setSummaryInterval] = useState(15_000);
	const [healthInterval, setHealthInterval] = useState(30_000);
	const [trendsInterval, setTrendsInterval] = useState(15_000);

	const {
		data: sysSummary,
		isLoading: isSysSummaryLoading,
		isError: isSysSummaryError,
	} = useQuery({
		queryKey: ["admin-metrics-summary"],
		queryFn: getSystemMetricsSummary,
		refetchInterval: summaryInterval || false,
		staleTime: summaryInterval ? summaryInterval * 0.66 : 10_000,
	});

	const {
		data: sysHealth,
		isLoading: isSysHealthLoading,
		isError: isSysHealthError,
	} = useQuery({
		queryKey: ["admin-metrics-health"],
		queryFn: getSystemMetricsHealth,
		refetchInterval: healthInterval || false,
		staleTime: healthInterval ? healthInterval * 0.66 : 20_000,
	});

	const { data: sysTrends, isLoading: isSysTrendsLoading } = useQuery({
		queryKey: ["admin-metrics-trends"],
		queryFn: getSystemMetricsTrends,
		refetchInterval: trendsInterval || false,
		staleTime: trendsInterval ? trendsInterval * 0.66 : 10_000,
	});

	const memoryMaxMb = fmtBytesToMb(sysSummary?.memory?.maxBytes ?? 0);

	return (
		<>
			<Header fixed />
			<div className="border-b px-6 py-2">
				<TopNav
					links={[
						{
							title: "Trang chủ",
							href: "/metrics",
							isActive: true,
						},
						{
							title: "Công cụ giám sát nâng cao",
							href: "/tools-metrics",
							isActive: false,
						},
						{
							title: "Quản lý mẫu email",
							href: "/mail-templates",
							isActive: false,
						},
					]}
				/>
			</div>

			<div className="flex flex-wrap items-center justify-end gap-6 border-b px-6 py-2 text-sm text-muted-foreground">
				<span className="font-medium">Tần suất làm mới:</span>
				<div className="flex items-center gap-2">
					<Tooltip>
						<TooltipTrigger asChild>
							<span className="cursor-default underline decoration-dashed underline-offset-4">
								Tổng quan
							</span>
						</TooltipTrigger>
						<TooltipContent side="bottom">
							Tần suất tải lại dữ liệu CPU, bộ nhớ, uptime và các chỉ số tổng
							hợp
						</TooltipContent>
					</Tooltip>
					<RefreshIntervalPicker
						value={summaryInterval}
						onChange={setSummaryInterval}
					/>
				</div>
				<div className="flex items-center gap-2">
					<Tooltip>
						<TooltipTrigger asChild>
							<span className="cursor-default underline decoration-dashed underline-offset-4">
								Sức khoẻ
							</span>
						</TooltipTrigger>
						<TooltipContent side="bottom">
							Tần suất kiểm tra trạng thái các thành phần hệ thống (DB, cache,
							disk...)
						</TooltipContent>
					</Tooltip>
					<RefreshIntervalPicker
						value={healthInterval}
						onChange={setHealthInterval}
					/>
				</div>
				<div className="flex items-center gap-2">
					<Tooltip>
						<TooltipTrigger asChild>
							<span className="cursor-default underline decoration-dashed underline-offset-4">
								Xu hướng
							</span>
						</TooltipTrigger>
						<TooltipContent side="bottom">
							Tần suất cập nhật biểu đồ CPU, heap memory và request volume theo
							thời gian
						</TooltipContent>
					</Tooltip>
					<RefreshIntervalPicker
						value={trendsInterval}
						onChange={setTrendsInterval}
					/>
				</div>
			</div>

			<div className="flex flex-1 flex-col gap-2 sm:gap-6 p-6">
				<SystemHero summary={sysSummary} health={sysHealth} />

				<SummaryCards
					data={sysSummary}
					isLoading={isSysSummaryLoading}
					isError={isSysSummaryError}
				/>

				<div className="grid gap-4 xl:grid-cols-12">
					<div className="xl:col-span-7">
						<HealthOverviewCard
							data={sysHealth}
							isLoading={isSysHealthLoading}
							isError={isSysHealthError}
						/>
					</div>
					<div className="xl:col-span-5">
						<RuntimeSignalsCard summary={sysSummary} />
					</div>
				</div>

				<SystemTrendsSection
					data={sysTrends}
					isLoading={isSysTrendsLoading}
					memoryMaxMb={memoryMaxMb}
				/>
			</div>
		</>
	);
}
