import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Header } from "@/layout/header";
import { cn } from "@/shared/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Activity, Cpu, HardDrive, Info, Layers3, Server } from "lucide-react";
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
import type {
	DiskSpaceHealthDetails,
	HealthComponent,
	MetricPoint,
	MetricsHealth,
	MetricsSummary,
	MetricsTrends,
} from "../types/system-metrics.types";
type RechartsPayloadEntry = {
	color?: string;
	name?: string;
	value?: number;
	payload?: Record<string, unknown>;
};

function fmt(n: number): string {
	return n.toLocaleString("vi-VN");
}

function fmtNumber(value: number, digits = 1): string {
	return Number.isFinite(value) ? value.toFixed(digits) : "0.0";
}

function fmtBytesToMb(value: number): number {
	return value / (1024 * 1024);
}

const formatGB = (bytes?: number) => {
	if (!bytes) return "-";
	return (bytes / 1024 / 1024 / 1024).toFixed(1) + " GB";
};

function formatTime(timestamp?: string): string {
	if (!timestamp) return "--:--";
	return new Date(timestamp).toLocaleTimeString("vi-VN", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
}

function isDiskSpaceHealthDetails(
	details: HealthComponent["details"],
): details is DiskSpaceHealthDetails {
	if (!details || typeof details !== "object") return false;

	const candidate = details as Record<string, unknown>;
	return (
		typeof candidate.total === "number" && typeof candidate.free === "number"
	);
}

function getHealthLabel(
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

function getStatusTone(status: string) {
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

function mapPoints(points?: MetricPoint[]) {
	return (points ?? []).map((point) => ({
		time: new Date(point.timestamp).toLocaleTimeString("vi-VN", {
			minute: "2-digit",
			second: "2-digit",
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
					minute: "2-digit",
					second: "2-digit",
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

function MetricTooltip({ content }: { content: string }) {
	return (
		<TooltipProvider delayDuration={200}>
			<Tooltip>
				<TooltipTrigger asChild>
					<Info className="h-3.5 w-3.5 cursor-help text-muted-foreground/60 hover:text-muted-foreground transition-colors" />
				</TooltipTrigger>
				<TooltipContent
					side="top"
					className="max-w-[240px] text-xs leading-relaxed"
				>
					{content}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

function SummarySkeleton() {
	return (
		<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
			{["requests", "cpu", "memory", "threads"].map((key) => (
				<Card key={key}>
					<CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
						<div>
							<Skeleton className="h-4 w-24" />
							<Skeleton className="mt-2 h-3 w-32" />
						</div>
						<Skeleton className="h-10 w-10 rounded-2xl" />
					</CardHeader>
					<CardContent className="pt-0">
						<Skeleton className="mb-3 h-8 w-28" />
						<Skeleton className="h-3 w-36" />
					</CardContent>
				</Card>
			))}
		</div>
	);
}

function MetricKpiCard({
	title,
	value,
	description,
	meta,
	icon: Icon,
	tone,
	healthLabel,
	tooltip,
}: {
	title: string;
	value: string;
	description: string;
	meta: string;
	icon: React.ElementType;
	tone: "sky" | "emerald" | "indigo" | "violet" | "amber";
	healthLabel?: ReturnType<typeof getHealthLabel>;
	tooltip?: string;
}) {
	const toneMap = {
		sky: {
			card: "from-sky-50 via-white to-white dark:from-sky-950/25 dark:via-slate-950 dark:to-slate-950",
			iconWrap: "bg-sky-500/10 dark:bg-sky-400/10",
			icon: "text-sky-600 dark:text-sky-300",
			glow: "bg-sky-500/15 dark:bg-sky-400/15",
		},
		emerald: {
			card: "from-emerald-50 via-white to-white dark:from-emerald-950/25 dark:via-slate-950 dark:to-slate-950",
			iconWrap: "bg-emerald-500/10 dark:bg-emerald-400/10",
			icon: "text-emerald-600 dark:text-emerald-300",
			glow: "bg-emerald-500/15 dark:bg-emerald-400/15",
		},
		indigo: {
			card: "from-indigo-50 via-white to-white dark:from-indigo-950/25 dark:via-slate-950 dark:to-slate-950",
			iconWrap: "bg-indigo-500/10 dark:bg-indigo-400/10",
			icon: "text-indigo-600 dark:text-indigo-300",
			glow: "bg-indigo-500/15 dark:bg-indigo-400/15",
		},
		violet: {
			card: "from-violet-50 via-white to-white dark:from-violet-950/25 dark:via-slate-950 dark:to-slate-950",
			iconWrap: "bg-violet-500/10 dark:bg-violet-400/10",
			icon: "text-violet-600 dark:text-violet-300",
			glow: "bg-violet-500/15 dark:bg-violet-400/15",
		},
		amber: {
			card: "from-amber-50 via-white to-white dark:from-amber-950/25 dark:via-slate-950 dark:to-slate-950",
			iconWrap: "bg-amber-500/10 dark:bg-amber-400/10",
			icon: "text-amber-600 dark:text-amber-300",
			glow: "bg-amber-500/15 dark:bg-amber-400/15",
		},
	}[tone];

	return (
		<Card
			className={cn(
				"relative overflow-hidden border border-border/70 bg-gradient-to-br shadow-sm",
				toneMap.card,
			)}
		>
			<div
				className={cn(
					"pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full blur-3xl",
					toneMap.glow,
				)}
			/>
			<CardHeader className="relative flex flex-row items-start justify-between space-y-0 pb-3">
				<div>
					<div className="flex items-center gap-1.5">
						<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
							{title}
						</p>
						{tooltip && <MetricTooltip content={tooltip} />}
					</div>
					<p className="mt-2 text-xs text-muted-foreground">{description}</p>
				</div>
				<div className={cn("rounded-2xl p-2.5", toneMap.iconWrap)}>
					<Icon className={cn("h-4.5 w-4.5", toneMap.icon)} />
				</div>
			</CardHeader>
			<CardContent className="relative pt-0">
				<div className="text-2xl font-semibold tracking-tight text-foreground">
					{value}
				</div>
				{healthLabel && (
					<div
						className={cn(
							"mt-1.5 flex items-center gap-1.5 text-xs font-medium",
							healthLabel.textClass,
						)}
					>
						<span
							className={cn("h-1.5 w-1.5 rounded-full", healthLabel.dotClass)}
						/>
						{healthLabel.label}
					</div>
				)}
				<p className="mt-1.5 text-xs text-muted-foreground">{meta}</p>
			</CardContent>
		</Card>
	);
}

function SignalBar({
	label,
	value,
	max,
	colorClass,
	thresholds,
	tooltip,
}: {
	label: string;
	value: number;
	max: number;
	colorClass: string;
	thresholds?: { warn: number; critical: number };
	tooltip?: string;
}) {
	const progress = max > 0 ? Math.min((value / max) * 100, 100) : 0;
	const percent = max > 0 ? (value / max) * 100 : value;
	const health = getHealthLabel(percent, thresholds);
	const activeBarClass = health.barClass ?? colorClass;

	return (
		<div className="space-y-2 rounded-2xl border border-border/60 bg-muted/20 p-4">
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-1.5">
					<p className="text-sm font-medium text-foreground">{label}</p>
					{tooltip && <MetricTooltip content={tooltip} />}
				</div>
				<div className="flex items-center gap-2">
					<span
						className={cn(
							"flex items-center gap-1 text-xs font-medium",
							health.textClass,
						)}
					>
						<span className={cn("h-1.5 w-1.5 rounded-full", health.dotClass)} />
						{health.label}
					</span>
					<p className="text-sm font-semibold text-foreground">
						{fmtNumber(value)}%
					</p>
				</div>
			</div>
			<div className="h-2 rounded-full bg-muted">
				<div
					className={cn("h-full rounded-full transition-all", activeBarClass)}
					style={{ width: `${progress}%` }}
				/>
			</div>
		</div>
	);
}

function SystemHero({
	summary,
	health,
}: {
	summary?: MetricsSummary;
	health?: MetricsHealth;
}) {
	const status = health?.status ?? "UNKNOWN";
	const tone = getStatusTone(status);
	const components = health?.components ?? [];
	const upCount = components.filter(
		(component) => component.status === "UP",
	).length;
	const downCount = components.filter(
		(component) => component.status === "DOWN",
	).length;

	const cpu = summary?.cpu?.usagePercent ?? 0;
	const usedBytes = summary?.memory?.usedBytes ?? 0;
	const maxBytes = summary?.memory?.maxBytes ?? 0;
	const memoryPercent = maxBytes > 0 ? (usedBytes / maxBytes) * 100 : 0;

	return (
		<Card className="relative overflow-hidden border border-border/70 bg-gradient-to-br from-slate-50 via-white to-cyan-50/60 shadow-sm dark:from-slate-900 dark:via-slate-950 dark:to-cyan-950/20">
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl dark:bg-sky-500/15" />
				<div className="absolute -bottom-12 left-16 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/15" />
			</div>

			<CardContent className="relative p-6">
				<div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
					<div className="max-w-2xl">
						<h2 className="text-3xl font-semibold tracking-tight text-foreground">
							Tình trạng hệ thống
						</h2>
						<p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
							Theo dõi sức khỏe dịch vụ, hiệu suất runtime và biến động hệ thống
							theo thời gian thực.
						</p>

						<div className="mt-5 grid gap-3 md:grid-cols-3">
							<div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70">
								<p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
									Health status
								</p>
								<div className="mt-2 flex items-center gap-2">
									<span className={cn("h-2.5 w-2.5 rounded-full", tone.dot)} />
									<span className="text-sm font-semibold text-foreground">
										{status}
									</span>
								</div>
							</div>
							<div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70">
								<p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
									CPU hiện tại
								</p>
								<p className="mt-2 text-sm font-semibold text-foreground">
									{fmtNumber(cpu)}%
								</p>
							</div>
							<div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70">
								<p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
									Heap usage
								</p>
								<p className="mt-2 text-sm font-semibold text-foreground">
									{fmtNumber(memoryPercent)}%
								</p>
							</div>
						</div>
					</div>

					<div className="grid gap-3 sm:grid-cols-3 xl:w-[460px]">
						<div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-4 shadow-sm backdrop-blur-sm">
							<p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
								Dịch vụ UP
							</p>
							<p className="mt-2 text-xl font-semibold text-foreground">
								{fmt(upCount)}
							</p>
						</div>
						<div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-4 shadow-sm backdrop-blur-sm">
							<p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
								Dịch vụ lỗi
							</p>
							<p className="mt-2 text-xl font-semibold text-foreground">
								{fmt(downCount)}
							</p>
						</div>
						<div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-4 shadow-sm backdrop-blur-sm">
							<p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
								Cập nhật
							</p>
							<p className="mt-2 text-sm font-semibold text-foreground">
								{formatTime(summary?.timestamp)}
							</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function SummaryCards({
	data,
	isLoading,
	isError,
}: {
	data?: MetricsSummary;
	isLoading: boolean;
	isError: boolean;
}) {
	if (isLoading) return <SummarySkeleton />;

	if (isError) {
		return (
			<Card className="p-5">
				<p className="text-sm text-muted-foreground">
					Không thể tải số liệu kỹ thuật. Vui lòng thử lại sau.
				</p>
			</Card>
		);
	}

	if (!data) return null;

	const totalRequests = data.requests?.totalRequests ?? 0;
	const cpuPercent = data.cpu?.usagePercent ?? 0;
	const usedMb = fmtBytesToMb(data.memory?.usedBytes ?? 0);
	const maxMb = fmtBytesToMb(data.memory?.maxBytes ?? 0);
	const memPercent = maxMb > 0 ? (usedMb / maxMb) * 100 : 0;
	const liveThreads = data.jvm?.liveThreads ?? 0;
	const activeConns = data.db?.activeConnections ?? 0;
	const maxConns = data.db?.maxConnections ?? 0;

	const cards = [
		{
			title: "Tổng request",
			value: fmt(totalRequests),
			description: "Tổng lưu lượng HTTP kể từ khi service khởi động",
			meta: "Throughput tích lũy",
			icon: Activity,
			tone: "sky" as const,
			healthLabel: undefined,
			tooltip:
				"Tổng số HTTP request mà server đã xử lý kể từ lần khởi động gần nhất. Con số này chỉ tăng, không reset theo thời gian thực.",
		},
		{
			title: "CPU hiện tại",
			value: `${fmtNumber(cpuPercent)}%`,
			description: "Mức sử dụng CPU tại thời điểm lấy mẫu gần nhất",
			meta: "Tải runtime hiện tại",
			icon: Cpu,
			tone: "emerald" as const,
			healthLabel: getHealthLabel(cpuPercent, { warn: 70, critical: 90 }),
			tooltip:
				"Phần trăm CPU mà ứng dụng đang dùng. Trên 70% là cần chú ý, trên 90% có thể gây chậm hoặc timeout. Nếu cao liên tục, cần kiểm tra tác vụ nặng hoặc tăng tài nguyên.",
		},
		{
			title: "Heap memory",
			value: `${fmtNumber(usedMb)} / ${fmtNumber(maxMb)} MB`,
			description: "Dung lượng heap đã dùng so với trần JVM",
			meta: `Đang sử dụng ${fmtNumber(memPercent)}%`,
			icon: HardDrive,
			tone: "indigo" as const,
			healthLabel: getHealthLabel(memPercent, { warn: 75, critical: 90 }),
			tooltip:
				"Bộ nhớ heap là vùng RAM mà JVM dùng để lưu dữ liệu ứng dụng. Nếu vượt 90% liên tục, JVM sẽ chạy Garbage Collection liên tục và có thể gây OutOfMemoryError.",
		},
		{
			title: "JVM threads",
			value: fmt(liveThreads),
			description: "Số luồng JVM đang hoạt động trong hệ thống",
			meta:
				maxConns > 0
					? `DB pool ${fmt(activeConns)}/${fmt(maxConns)} kết nối`
					: "Theo dõi thread runtime",
			icon: Layers3,
			tone: "violet" as const,
			healthLabel:
				maxConns > 0
					? getHealthLabel((activeConns / maxConns) * 100, {
							warn: 80,
							critical: 95,
						})
					: undefined,
			tooltip:
				"Số luồng xử lý đang chạy trong JVM. Tăng đột biến có thể là dấu hiệu bottleneck hoặc thread leak. DB pool cho biết số kết nối database đang dùng — nếu đầy, request mới sẽ phải chờ.",
		},
	];

	return (
		<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
			{cards.map((card) => (
				<MetricKpiCard key={card.title} {...card} />
			))}
		</div>
	);
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

function RuntimeSignalsCard({ summary }: { summary?: MetricsSummary }) {
	const cpu = summary?.cpu?.usagePercent ?? 0;
	const usedMb = fmtBytesToMb(summary?.memory?.usedBytes ?? 0);
	const maxMb = fmtBytesToMb(summary?.memory?.maxBytes ?? 0);
	const memoryPercent = maxMb > 0 ? (usedMb / maxMb) * 100 : 0;
	const activeConns = summary?.db?.activeConnections ?? 0;
	const maxConns = summary?.db?.maxConnections ?? 0;
	const dbPercent = maxConns > 0 ? (activeConns / maxConns) * 100 : 0;

	return (
		<Card className="h-full border border-border/70 bg-card/95 shadow-sm">
			<CardHeader className="border-b border-border/60 pb-5">
				<CardTitle className="text-lg font-semibold">Runtime Signals</CardTitle>
				<p className="mt-1 text-sm text-muted-foreground">
					Các chỉ báo nhanh về áp lực CPU, heap và kết nối cơ sở dữ liệu.
				</p>
			</CardHeader>
			<CardContent className="space-y-4 pt-6">
				<SignalBar
					label="CPU saturation"
					value={cpu}
					max={100}
					colorClass="bg-emerald-500"
					thresholds={{ warn: 70, critical: 90 }}
					tooltip="Mức CPU ứng dụng đang tiêu thụ. Trên 70% cần theo dõi, trên 90% có nguy cơ gây chậm hệ thống."
				/>
				<SignalBar
					label="Heap pressure"
					value={memoryPercent}
					max={100}
					colorClass="bg-indigo-500"
					thresholds={{ warn: 75, critical: 90 }}
					tooltip="Tỉ lệ bộ nhớ heap JVM đã dùng. Nếu liên tục trên 90%, JVM sẽ chạy Garbage Collection liên tục và có thể gây lỗi OutOfMemory."
				/>
				<SignalBar
					label="DB pool usage"
					value={dbPercent}
					max={100}
					colorClass="bg-amber-500"
					thresholds={{ warn: 80, critical: 95 }}
					tooltip="Tỉ lệ kết nối database đang được sử dụng trong pool. Nếu đầy (100%), các request mới sẽ phải xếp hàng chờ kết nối."
				/>

				<div className="grid gap-3 sm:grid-cols-3">
					<div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
						<p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
							CPU
						</p>
						<p className="mt-2 text-lg font-semibold text-foreground">
							{fmtNumber(cpu)}%
						</p>
					</div>
					<div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
						<p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
							Heap dùng
						</p>
						<p className="mt-2 text-lg font-semibold text-foreground">
							{fmtNumber(usedMb)} MB
						</p>
					</div>
					<div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
						<p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
							DB active
						</p>
						<p className="mt-2 text-lg font-semibold text-foreground">
							{maxConns > 0 ? `${fmt(activeConns)} / ${fmt(maxConns)}` : "N/A"}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function SystemPulsePanel({
	data,
	memoryMaxMb,
}: {
	data?: MetricsTrends;
	memoryMaxMb: number;
}) {
	const chartData = mergeTrendSeries(data, memoryMaxMb);

	return (
		<PanelShell className="xl:col-span-8">
			<div className="relative border-b border-slate-200/70 px-6 py-5 dark:border-slate-800/80">
				<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
					<div>
						<p className="text-lg font-semibold text-slate-950 dark:text-slate-50">
							System Pulse
						</p>
						<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
							Quan sát đồng thời CPU, áp lực bộ nhớ và lưu lượng request.
						</p>
					</div>
					<PanelLegend
						items={[
							{ color: "#22c55e", label: "CPU" },
							{ color: "#8b5cf6", label: "Heap pressure" },
							{ color: "#0ea5e9", label: "Requests" },
						]}
					/>
				</div>
			</div>

			<div className="relative px-4 pb-4 pt-5 md:px-6 md:pb-6">
				{chartData.length === 0 ? (
					<div className="flex h-[360px] items-center justify-center text-sm text-muted-foreground">
						Chưa có dữ liệu
					</div>
				) : (
					<ResponsiveContainer width="100%" height={360}>
						<LineChart
							data={chartData}
							margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
						>
							<CartesianGrid
								stroke="rgba(148,163,184,0.12)"
								strokeDasharray="4 4"
								vertical={true}
							/>
							<XAxis
								dataKey="time"
								axisLine={false}
								tickLine={false}
								fontSize={11}
								tick={{ fill: "var(--muted-foreground)" }}
							/>
							<YAxis
								yAxisId="percent"
								axisLine={false}
								tickLine={false}
								fontSize={11}
								width={40}
								tick={{ fill: "var(--muted-foreground)" }}
								tickFormatter={(value) => `${Number(value).toFixed(0)}%`}
							/>
							<YAxis
								yAxisId="requests"
								orientation="right"
								axisLine={false}
								tickLine={false}
								fontSize={11}
								width={56}
								tick={{ fill: "var(--muted-foreground)" }}
								tickFormatter={(value) => fmt(Number(value))}
							/>
							<RechartsTooltip
								content={({ active, payload }) => (
									<MultiSeriesTooltip
										active={active}
										payload={payload as unknown as RechartsPayloadEntry[]}
										unit=""
									/>
								)}
							/>
							<Line
								yAxisId="percent"
								type="monotone"
								dataKey="cpu"
								name="CPU"
								stroke="#22c55e"
								strokeWidth={3}
								dot={false}
								activeDot={{ r: 5, fill: "#22c55e", stroke: "#fff" }}
								isAnimationActive={false}
							/>
							<Line
								yAxisId="percent"
								type="monotone"
								dataKey="memoryPercent"
								name="Heap pressure"
								stroke="#8b5cf6"
								strokeWidth={3}
								dot={false}
								activeDot={{ r: 5, fill: "#8b5cf6", stroke: "#fff" }}
								isAnimationActive={false}
							/>
							<Line
								yAxisId="requests"
								type="monotone"
								dataKey="requests"
								name="Requests"
								stroke="#0ea5e9"
								strokeWidth={3}
								dot={false}
								activeDot={{ r: 5, fill: "#0ea5e9", stroke: "#fff" }}
								isAnimationActive={false}
							/>
						</LineChart>
					</ResponsiveContainer>
				)}
			</div>
		</PanelShell>
	);
}

function HealthOverviewCard({
	data,
	isLoading,
	isError,
}: {
	data?: MetricsHealth;
	isLoading: boolean;
	isError: boolean;
}) {
	if (isLoading) {
		return (
			<Card className="h-full">
				<CardHeader>
					<CardTitle>Tình trạng dịch vụ</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{["db", "redis", "disk", "api"].map((key) => (
						<div
							key={key}
							className="flex items-center justify-between rounded-2xl border border-border/60 p-4"
						>
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-6 w-16 rounded-full" />
						</div>
					))}
				</CardContent>
			</Card>
		);
	}

	if (isError) {
		return (
			<Card className="h-full">
				<CardHeader>
					<CardTitle>Tình trạng dịch vụ</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Không thể tải thông tin health từ backend.
					</p>
				</CardContent>
			</Card>
		);
	}

	if (!data) return null;

	const components = [...(data.components ?? [])].sort((a, b) => {
		const weight = (name: string) => {
			if (name === "db") return 0;
			if (name === "redis") return 1;
			if (name === "diskSpace") return 2;
			return 10;
		};

		return weight(a.name) - weight(b.name);
	});

	return (
		<Card className="h-full border border-border/70 bg-card/95 shadow-sm">
			<CardHeader className="border-b border-border/60 pb-5">
				<div className="flex items-center justify-between gap-3">
					<div>
						<CardTitle className="text-lg font-semibold">
							Tình trạng dịch vụ
						</CardTitle>
						<p className="mt-1 text-sm text-muted-foreground">
							Kiểm tra sức khỏe của các thành phần backend quan trọng dựa trên
							Actuator.
						</p>
					</div>
					<span
						className={cn(
							"inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
							getStatusTone(data.status).badge,
						)}
					>
						{data.status}
					</span>
				</div>
			</CardHeader>

			<CardContent className="space-y-3 pt-6">
				{components.length === 0 && (
					<div className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
						Không có component health chi tiết từ Actuator.
					</div>
				)}

				{components.map((component) => (
					<HealthComponentRow key={component.name} component={component} />
				))}
			</CardContent>
		</Card>
	);
}

function HealthComponentRow({ component }: { component: HealthComponent }) {
	const tone = getStatusTone(component.status);
	const diskSpaceDetails =
		component.name === "diskSpace" &&
		isDiskSpaceHealthDetails(component.details)
			? component.details
			: null;
	const detailEntries = diskSpaceDetails
		? []
		: Object.entries(component.details ?? {}).slice(0, 2);

	return (
		<div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
			<div className="flex items-start justify-between gap-3">
				<div className="flex min-w-0 items-center gap-3">
					<div className="rounded-xl bg-background p-2 shadow-sm dark:bg-slate-900">
						<Server className="h-4 w-4 text-muted-foreground" />
					</div>
					<div className="min-w-0">
						<p className="truncate text-sm font-semibold text-foreground">
							{component.name}
						</p>
						{detailEntries.length > 0 && (
							<p className="mt-1 truncate text-xs text-muted-foreground">
								{detailEntries
									.map(([key, value]) => `${key}: ${String(value)}`)
									.join(" · ")}
							</p>
						)}
						{diskSpaceDetails && (
							<p className="mt-1 text-xs text-muted-foreground">
								total: {formatGB(diskSpaceDetails.total)} · free:{" "}
								{formatGB(diskSpaceDetails.free)}
							</p>
						)}
					</div>
				</div>
				<span
					className={cn(
						"inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
						tone.badge,
					)}
				>
					<span className={cn("h-2 w-2 rounded-full", tone.dot)} />
					{component.status}
				</span>
			</div>
		</div>
	);
}

function TrendCard({
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
	const {
		data: sysSummary,
		isLoading: isSysSummaryLoading,
		isError: isSysSummaryError,
	} = useQuery({
		queryKey: ["admin-metrics-summary"],
		queryFn: getSystemMetricsSummary,
		refetchInterval: 15_000,
		staleTime: 10_000,
	});

	const {
		data: sysHealth,
		isLoading: isSysHealthLoading,
		isError: isSysHealthError,
	} = useQuery({
		queryKey: ["admin-metrics-health"],
		queryFn: getSystemMetricsHealth,
		refetchInterval: 30_000,
		staleTime: 20_000,
	});

	const { data: sysTrends, isLoading: isSysTrendsLoading } = useQuery({
		queryKey: ["admin-metrics-trends"],
		queryFn: getSystemMetricsTrends,
		refetchInterval: 15_000,
		staleTime: 10_000,
	});

	const memoryMaxMb = fmtBytesToMb(sysSummary?.memory?.maxBytes ?? 0);

	return (
		<>
			<Header fixed />

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
