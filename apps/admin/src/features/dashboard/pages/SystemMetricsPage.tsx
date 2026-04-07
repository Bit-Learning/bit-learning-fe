import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Main } from "@/layout/main";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, GripVertical, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import {
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	getDashboardSettings,
	updateDashboardSettings,
} from "../api/dashboard-api";
import {
	getSystemMetricsHealth,
	getSystemMetricsSummary,
	getSystemMetricsTrends,
} from "../api/system-metrics-api";
import {
	MetricPoint,
	MetricsHealth,
	MetricsSummary,
	MetricsTrends,
} from "../types/system-metrics.types";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/layout/header";

function fmt(n: number): string {
	return n.toLocaleString("vi-VN");
}

interface StatCard {
	id: string;
	title: string;
	value: string;
	description: string;
	icon: React.ElementType;
	iconColor: string;
	bgColor: string;
}

// ── Draggable Grid ──
function DraggableStatsGrid({ stats }: { stats: StatCard[] }) {
	const [order, setOrder] = useState(() => stats.map((s) => s.id));
	const dragItem = useRef<string | null>(null);
	const dragOver = useRef<string | null>(null);

	const onDragEnd = useCallback(() => {
		if (
			dragItem.current &&
			dragOver.current &&
			dragItem.current !== dragOver.current
		) {
			setOrder((prev) => {
				const c = [...prev];
				const f = c.indexOf(dragItem.current!);
				const t = c.indexOf(dragOver.current!);
				c.splice(f, 1);
				c.splice(t, 0, dragItem.current!);
				return c;
			});
		}
		dragItem.current = null;
		dragOver.current = null;
	}, []);

	const ordered = order
		.map((id) => stats.find((s) => s.id === id)!)
		.filter(Boolean);

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{ordered.map((s) => {
				const Icon = s.icon;
				return (
					<Card
						key={s.id}
						draggable
						onDragStart={() => {
							dragItem.current = s.id;
						}}
						onDragEnter={() => {
							dragOver.current = s.id;
						}}
						onDragEnd={onDragEnd}
						onDragOver={(e) => e.preventDefault()}
						className="cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow select-none"
					>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">{s.title}</CardTitle>
							<div className="flex items-center gap-1">
								<GripVertical className="h-3.5 w-3.5 text-muted-foreground/40" />
								<div className={`rounded-lg p-2 ${s.bgColor}`}>
									<Icon className={`h-4 w-4 ${s.iconColor}`} />
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{s.value}</div>
							<p className="text-muted-foreground text-xs mt-1">
								{s.description}
							</p>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}

// ── System Metrics Summary Cards ──
function SystemSummaryCards({
	data,
	isLoading,
	isError,
}: {
	data?: MetricsSummary;
	isLoading: boolean;
	isError: boolean;
}) {
	if (isLoading) {
		return (
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
				{Array.from({ length: 5 }).map((_, i) => (
					<Card key={i}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-8 w-8 rounded-lg" />
						</CardHeader>
						<CardContent>
							<Skeleton className="mb-2 h-8 w-32" />
							<Skeleton className="h-3 w-40" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<Card className="p-4">
				<p className="text-muted-foreground text-sm">
					Không thể tải số liệu kỹ thuật. Vui lòng thử lại sau.
				</p>
			</Card>
		);
	}

	if (!data) return null;

	const totalRequests = data.requests?.totalRequests ?? 0;
	const cpuPercent = data.cpu?.usagePercent ?? 0;
	const usedBytes = data.memory?.usedBytes ?? 0;
	const maxBytes = data.memory?.maxBytes ?? 0;
	const usedMb = usedBytes / (1024 * 1024);
	const maxMb = maxBytes / (1024 * 1024);
	const memPercent = maxMb > 0 ? (usedMb / maxMb) * 100 : 0;
	const liveThreads = data.jvm?.liveThreads ?? 0;
	const activeConns = data.db?.activeConnections ?? 0;
	const maxConns = data.db?.maxConnections ?? 0;

	const cards: StatCard[] = [
		{
			id: "total-requests",
			title: "Tổng request",
			value: fmt(totalRequests),
			description: "Tổng số request HTTP kể từ khi khởi động",
			icon: Activity,
			iconColor: "text-sky-600",
			bgColor: "bg-sky-100 dark:bg-sky-950",
		},
		{
			id: "cpu-usage",
			title: "CPU hiện tại",
			value: `${cpuPercent.toFixed(1)}%`,
			description: "Mức sử dụng CPU của hệ thống",
			icon: Activity,
			iconColor: "text-emerald-600",
			bgColor: "bg-emerald-100 dark:bg-emerald-950",
		},
		{
			id: "memory-usage",
			title: "Bộ nhớ heap",
			value: `${usedMb.toFixed(1)} / ${maxMb.toFixed(1)} MB`,
			description: `Đang dùng ~${memPercent.toFixed(1)}% dung lượng`,
			icon: Activity,
			iconColor: "text-indigo-600",
			bgColor: "bg-indigo-100 dark:bg-indigo-950",
		},
		{
			id: "jvm-threads",
			title: "JVM threads",
			value: fmt(liveThreads),
			description: "Số luồng JVM đang hoạt động",
			icon: Activity,
			iconColor: "text-purple-600",
			bgColor: "bg-purple-100 dark:bg-purple-950",
		},
		{
			id: "db-pool",
			title: "Kết nối DB",
			value: maxConns > 0 ? `${activeConns}/${maxConns}` : "Chưa có dữ liệu",
			description: data.db?.poolName
				? `Pool: ${data.db.poolName}`
				: "HikariCP pool (nếu được cấu hình)",
			icon: Activity,
			iconColor: "text-rose-600",
			bgColor: "bg-rose-100 dark:bg-rose-950",
		},
	];

	return <DraggableStatsGrid stats={cards} />;
}

// ── System Health Panel ──
function SystemHealthPanel({
	data,
	isLoading,
	isError,
}: {
	data?: MetricsHealth;
	isLoading: boolean;
	isError: boolean;
}) {
	const statusColor = (status: string) => {
		if (status === "UP") return "text-emerald-600";
		if (status === "DOWN") return "text-red-600";
		return "text-amber-600";
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Tình trạng dịch vụ</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<Skeleton className="h-4 w-40" />
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="flex items-center justify-between">
							<Skeleton className="h-3 w-24" />
							<Skeleton className="h-3 w-16" />
						</div>
					))}
				</CardContent>
			</Card>
		);
	}

	if (isError) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Tình trạng dịch vụ</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">
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
			return 10;
		};
		return weight(a.name) - weight(b.name);
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<span>Tình trạng dịch vụ</span>
					<span
						className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
							data.status === "UP"
								? "border-emerald-500 text-emerald-600"
								: "border-amber-500 text-amber-600"
						}`}
					>
						{data.status}
					</span>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3 text-sm">
				{components.map((c) => (
					<div
						key={c.name}
						className="flex items-center justify-between gap-4 border-b last:border-b-0 pb-2 last:pb-0"
					>
						<div className="flex items-center gap-2 min-w-0">
							<span
								className={`h-2 w-2 rounded-full ${
									c.status === "UP"
										? "bg-emerald-500"
										: c.status === "DOWN"
											? "bg-red-500"
											: "bg-amber-500"
								}`}
							/>
							<span className="font-medium truncate">{c.name}</span>
						</div>
						<span className={`font-semibold ${statusColor(c.status)}`}>
							{c.status}
						</span>
					</div>
				))}
				{components.length === 0 && (
					<p className="text-muted-foreground text-xs">
						Không có component health chi tiết từ Actuator.
					</p>
				)}
			</CardContent>
		</Card>
	);
}

// ── System Trends Charts ──
function SystemTrendsCharts({
	data,
	isLoading,
}: {
	data?: MetricsTrends;
	isLoading: boolean;
}) {
	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Xu hướng kỹ thuật</CardTitle>
				</CardHeader>
				<CardContent>
					<Skeleton className="h-48 w-full" />
				</CardContent>
			</Card>
		);
	}

	if (!data) return null;

	const toChartData = (points?: MetricPoint[]) => {
		return (points ?? []).map((p) => ({
			time: new Date(p.timestamp).toLocaleTimeString("vi-VN", {
				minute: "2-digit",
				second: "2-digit",
			}),
			value: p.value,
		}));
	};

	const requestData = toChartData(data.requestCount);
	const cpuData = toChartData(data.cpu);
	const memoryData = toChartData(data.memory);

	const renderLineChart = (
		title: string,
		unit: string,
		chartData: { time: string; value: number }[],
	) => (
		<Card>
			<CardHeader>
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
			</CardHeader>
			<CardContent className="h-56">
				{chartData.length === 0 ? (
					<div className="flex h-full items-center justify-center text-muted-foreground text-sm">
						Chưa có dữ liệu
					</div>
				) : (
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={chartData}>
							<XAxis
								dataKey="time"
								stroke="#888888"
								fontSize={12}
								tickLine={false}
								axisLine={false}
							/>
							<YAxis
								stroke="#888888"
								fontSize={12}
								tickLine={false}
								axisLine={false}
								tickFormatter={(v) => `${v.toFixed(0)}${unit}`}
							/>
							<Tooltip
								content={({ active, payload }) => {
									if (active && payload && payload.length) {
										return (
											<div className="bg-background border rounded-md px-2 py-1 text-xs shadow-sm">
												<div className="font-medium">
													{payload[0].payload.time}
												</div>
												<div className="text-muted-foreground">
													{payload[0].value?.toFixed(1)}
													{unit}
												</div>
											</div>
										);
									}
									return null;
								}}
							/>
							<Line
								type="monotone"
								dataKey="value"
								stroke="currentColor"
								className="text-primary"
								strokeWidth={2}
								dot={false}
								isAnimationActive={false}
							/>
						</LineChart>
					</ResponsiveContainer>
				)}
			</CardContent>
		</Card>
	);

	return (
		<div className="grid gap-4 lg:grid-cols-1">
			{renderLineChart("Request (tổng số)", "", requestData)}
			{renderLineChart("CPU (%)", "%", cpuData)}
			{renderLineChart("Heap đã dùng (MB)", "MB", memoryData)}
		</div>
	);
}

// ── Settings Panel ──
function SettingsPanel({ onClose }: { onClose: () => void }) {
	const qc = useQueryClient();
	const { data: settings, isLoading } = useQuery({
		queryKey: ["dashboard-settings"],
		queryFn: getDashboardSettings,
	});
	const [interval, setInterval] = useState("");
	const [autoRefresh, setAutoRefresh] = useState(true);
	const [initialized, setInitialized] = useState(false);

	if (settings && !initialized) {
		setInterval(settings.refresh_interval_minutes || "30");
		setAutoRefresh(settings.auto_refresh_enabled !== "false");
		setInitialized(true);
	}

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
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="bg-background rounded-xl shadow-2xl max-w-sm w-full p-6 relative border">
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
				>
					<X className="w-5 h-5" />
				</button>
				<h3 className="text-lg font-bold mb-4">Cài đặt Dashboard</h3>

				{isLoading ? (
					<div className="space-y-3">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				) : (
					<div className="space-y-4">
						<div>
							<label className="text-sm font-medium mb-1.5 block">
								Chu kỳ tự động cập nhật (phút)
							</label>
							<input
								type="number"
								min={1}
								max={1440}
								value={interval}
								onChange={(e) => setInterval(e.target.value)}
								className="w-full rounded-lg border px-3 py-2 text-sm bg-background"
							/>
							<p className="text-xs text-muted-foreground mt-1">
								Tối thiểu 1 phút, tối đa 1440 phút (24 giờ)
							</p>
						</div>

						<div className="flex items-center justify-between">
							<div>
								<label className="text-sm font-medium">Tự động cập nhật</label>
								<p className="text-xs text-muted-foreground">
									Bật/tắt cron job tự động
								</p>
							</div>
							<button
								onClick={() => setAutoRefresh(!autoRefresh)}
								className={`relative w-11 h-6 rounded-full transition-colors ${autoRefresh ? "bg-primary" : "bg-muted"}`}
							>
								<span
									className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${autoRefresh ? "translate-x-5" : ""}`}
								/>
							</button>
						</div>

						<button
							onClick={handleSave}
							disabled={saveMutation.isPending}
							className="w-full bg-primary text-primary-foreground font-medium py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
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

// ── Main Dashboard ──
export function Dashboard() {
	const [showSettings, setShowSettings] = useState(false);

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

	return (
		<>
			<Header fixed>
				<Search />
				<div className="ms-auto flex items-center space-x-4">
					<ThemeSwitch />
					<ConfigDrawer />
					<ProfileDropdown />
				</div>
			</Header>

			<Main className="flex flex-1 flex-col gap-6 p-8">
				<div className="space-y-4">
					<div className="flex items-end justify-between">
						<div>
							<h3 className="text-lg font-semibold">Tình trạng hệ thống</h3>
							<p className="text-muted-foreground text-sm">
								Tổng quan về hiệu suất và sức khỏe hệ thống Bit Learning
							</p>
						</div>
					</div>

					<SystemSummaryCards
						data={sysSummary}
						isLoading={isSysSummaryLoading}
						isError={isSysSummaryError}
					/>

					<div className="grid gap-4 lg:grid-cols-2">
						<SystemHealthPanel
							data={sysHealth}
							isLoading={isSysHealthLoading}
							isError={isSysHealthError}
						/>
						<SystemTrendsCharts
							data={sysTrends}
							isLoading={isSysTrendsLoading}
						/>
					</div>
				</div>
			</Main>

			{showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
		</>
	);
}
