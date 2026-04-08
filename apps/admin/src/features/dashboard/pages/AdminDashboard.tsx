import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
	AlertTriangle,
	DollarSign,
	RefreshCw,
	Settings,
	ShoppingCart,
	UserPlus,
	Users,
	X,
} from "lucide-react";
import { useState } from "react";
import {
	getAllDashboardStats,
	getDashboardSettings,
	triggerManualRefresh,
	updateDashboardSettings,
} from "../api/dashboard-api";
import { PaymentRevenueChart } from "../components/payment-revenue-chart";
import { Header } from "@/layout/header";
import { cn } from "@/shared/lib/utils";

function fmt(n: number): string {
	return n.toLocaleString("vi-VN");
}
function fmtCurrency(n: number): string {
	return n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

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
	tone: "users" | "users-secondary" | "orders" | "revenue";
}) {
	let cardBg = "bg-white";
	let border = "border-slate-200";
	let iconBg = "bg-slate-100";
	let iconColor = "text-slate-700";
	let valueColor = "text-slate-900";

	switch (tone) {
		case "users": {
			iconBg = "bg-indigo-50";
			iconColor = "text-indigo-600";
			break;
		}
		case "users-secondary": {
			iconBg = "bg-sky-50";
			iconColor = "text-sky-600";
			break;
		}
		case "orders": {
			iconBg = "bg-blue-50";
			iconColor = "text-blue-600";
			break;
		}
		case "revenue": {
			cardBg = "bg-emerald-50";
			border = "border-emerald-100";
			iconBg = "bg-emerald-100";
			iconColor = "text-emerald-600";
			valueColor = "text-emerald-900";
			break;
		}
	}

	return (
		<Card className={`h-full border ${border} ${cardBg} shadow-sm`}>
			<CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
				<div>
					<p className="text-xs font-medium text-muted-foreground">{label}</p>
				</div>
				<div className={`rounded-lg p-2 ${iconBg}`}>
					<Icon className={`h-4 w-4 ${iconColor}`} />
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				<div className={`text-2xl font-semibold ${valueColor}`}>{value}</div>
				{description && (
					<p className="mt-1 text-xs text-muted-foreground">{description}</p>
				)}
			</CardContent>
		</Card>
	);
}

function BreakdownPie({
	data,
	labels,
	title,
	className,
}: {
	data: Record<string, number>;
	labels: Record<string, string>;
	title: string;
	className?: string;
}) {
	const entries = Object.entries(data ?? {});
	const total = entries.reduce((sum, [, value]) => sum + value, 0);

	const DEFAULT_COLORS = [
		"#6366f1",
		"#22c55e",
		"#f97316",
		"#eab308",
		"#ec4899",
	];

	const roleColorMap: Record<string, string> = {
		STUDENT: "#4f46e5",
		MENTOR: "#6366f1",
		MANAGER: "#0ea5e9",
		ADMIN: "#0f172a",
	};

	const statusColorMap: Record<string, string> = {
		COMPLETED: "#10b981",
		PENDING: "#f97316",
		FAILED: "#ef4444",
	};

	const txColorMap: Record<string, string> = {
		DEPOSIT: "#10b981",
		AI_REQUEST: "#4f46e5",
		PURCHASE: "#0ea5e9",
	};

	const isOrderCard = title.includes("Trạng thái đơn hàng");

	let unitLabel = "người";
	const titleLower = title.toLowerCase();

	if (titleLower.includes("đơn hàng")) {
		unitLabel = "đơn";
	} else if (titleLower.includes("giao dịch")) {
		unitLabel = "giao dịch";
	}

	const chartData = entries.map(([key, value], index) => {
		let color = DEFAULT_COLORS[index % DEFAULT_COLORS.length];

		if (title.includes("vai trò người dùng") && roleColorMap[key]) {
			color = roleColorMap[key];
		} else if (title.includes("Trạng thái đơn hàng") && statusColorMap[key]) {
			color = statusColorMap[key];
		} else if (title.includes("loại giao dịch") && txColorMap[key]) {
			color = txColorMap[key];
		}

		return {
			key,
			name: labels[key] || key,
			value,
			percent: total > 0 ? Math.round((value / total) * 100) : 0,
			color,
		};
	});

	const innerRadius = isOrderCard ? 78 : 55;
	const outerRadius = isOrderCard ? 128 : 85;
	const chartHeight = isOrderCard ? "h-[300px]" : "h-[220px]";
	const chartWidth = isOrderCard ? "max-w-[300px]" : "max-w-[220px]";

	return (
		<Card
			className={cn(
				"flex h-full flex-col border bg-white/60 shadow-sm",
				isOrderCard && "bg-white",
				className,
			)}
		>
			<CardHeader className={cn("pb-2", isOrderCard && "pb-4")}>
				<CardTitle
					className={cn("text-base font-semibold", isOrderCard && "text-lg")}
				>
					{title}
				</CardTitle>
			</CardHeader>

			<CardContent className="p-2 flex flex-1">
				{chartData.length === 0 ? (
					<div className="flex w-full items-center justify-center py-8 text-sm text-muted-foreground">
						Chưa có dữ liệu
					</div>
				) : isOrderCard ? (
					<div className="flex h-full w-full flex-col items-center justify-center gap-6">
						<div className={cn("w-full", chartHeight, chartWidth)}>
							<ResponsiveContainer width="100%" height="100%">
								<PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
									<Pie
										data={chartData}
										dataKey="value"
										nameKey="name"
										cx="50%"
										cy="50%"
										innerRadius={innerRadius}
										outerRadius={outerRadius}
										paddingAngle={4}
										stroke="white"
										strokeWidth={4}
									>
										{chartData.map((entry) => (
											<Cell key={entry.key} fill={entry.color} />
										))}
									</Pie>

									<Tooltip
										formatter={(value: any, name: any, props: any) => {
											const percent = props?.payload?.percent;
											const formatted = Number(value || 0).toLocaleString(
												"vi-VN",
											);
											return [
												`${formatted} ${unitLabel} (${percent ?? 0}%)`,
												name,
											];
										}}
									/>

									<text
										x="50%"
										y="47%"
										textAnchor="middle"
										dominantBaseline="middle"
										className="fill-slate-900 text-[3em] font-semibold"
									>
										{total.toLocaleString("vi-VN")}
									</text>
									<text
										x="50%"
										y="58%"
										textAnchor="middle"
										dominantBaseline="middle"
										className="fill-slate-500 text-[12px] font-medium"
									>
										Tổng đơn
									</text>
								</PieChart>
							</ResponsiveContainer>
						</div>

						<div className="flex w-full max-w-[340px] flex-col gap-3">
							{chartData.map((entry) => (
								<div
									key={entry.key}
									className="flex items-start justify-between px-4 py-3"
								>
									<div className="flex items-center gap-3">
										<span
											className="h-3.5 w-3.5 rounded-full"
											style={{ backgroundColor: entry.color }}
										/>
										<span className="text-sm font-medium text-slate-800">
											{entry.name}
										</span>
									</div>

									<div className="text-right">
										<div className="text-sm font-semibold text-slate-900">
											{entry.value.toLocaleString("vi-VN")} {unitLabel}
										</div>
										<div className="text-xs text-muted-foreground">
											{entry.percent}%
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				) : (
					<div className="grid h-full w-full items-center gap-6 md:grid-cols-[1fr_1fr]">
						<div className="flex items-center justify-center">
							<div className={cn("w-full", chartHeight, chartWidth)}>
								<ResponsiveContainer width="100%" height="100%">
									<PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
										<Pie
											data={chartData}
											dataKey="value"
											nameKey="name"
											cx="50%"
											cy="50%"
											innerRadius={innerRadius}
											outerRadius={outerRadius}
											paddingAngle={4}
											stroke="white"
											strokeWidth={4}
										>
											{chartData.map((entry) => (
												<Cell key={entry.key} fill={entry.color} />
											))}
										</Pie>

										<Tooltip
											formatter={(value: any, name: any, props: any) => {
												const percent = props?.payload?.percent;
												const formatted = Number(value || 0).toLocaleString(
													"vi-VN",
												);
												return [
													`${formatted} ${unitLabel} (${percent ?? 0}%)`,
													name,
												];
											}}
										/>

										<text
											x="50%"
											y="47%"
											textAnchor="middle"
											dominantBaseline="middle"
											className="fill-slate-900 text-[22px] font-semibold"
										>
											{total.toLocaleString("vi-VN")}
										</text>
										<text
											x="50%"
											y="58%"
											textAnchor="middle"
											dominantBaseline="middle"
											className="fill-slate-500 text-[12px] font-medium"
										>
											Tổng {unitLabel}
										</text>
									</PieChart>
								</ResponsiveContainer>
							</div>
						</div>

						<div className="flex flex-col justify-center gap-3">
							{chartData.map((entry) => (
								<div
									key={entry.key}
									className="flex items-start justify-between px-3 py-2.5"
								>
									<div className="flex min-w-0 items-center gap-3">
										<span
											className="h-3 w-3 rounded-full"
											style={{ backgroundColor: entry.color }}
										/>
										<span className="truncate text-sm font-medium text-slate-800">
											{entry.name}
										</span>
									</div>

									<div className="text-right text-xs text-muted-foreground">
										<div className="font-semibold text-slate-900">
											{entry.value.toLocaleString("vi-VN")} {unitLabel}
										</div>
										<div>{entry.percent}%</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
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

// ── Stale Data Banner ──
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
		<div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 px-4 py-3">
			<AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium text-amber-800 dark:text-amber-200">
					Dữ liệu đã cũ ({minutesAgo} phút trước)
				</p>
				<p className="text-xs text-amber-600 dark:text-amber-400">
					Nhấn "Đồng bộ ngay" để lấy dữ liệu mới nhất. Quá trình có thể mất vài
					giây do lượng dữ liệu lớn.
				</p>
			</div>
			<button
				onClick={onRefresh}
				disabled={isRefreshing}
				className="shrink-0 flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
			>
				<RefreshCw
					className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
				/>
				{isRefreshing ? "Đang đồng bộ..." : "Đồng bộ ngay"}
			</button>
		</div>
	);
}

// ── Main Dashboard ──
export function Dashboard() {
	const qc = useQueryClient();
	const [showSettings, setShowSettings] = useState(false);
	const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

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

	let revenueDeltaPct: number | null = null;
	let isRevenueUp = false;
	let isRecordMonth = false;
	let bestMonthRevenue: number | null = null;

	const revenueSeries = data?.payments.monthlyRevenue ?? [];

	if (revenueSeries.length > 0) {
		const maxRevenue = Math.max(...revenueSeries.map((m) => m.revenue));
		const latest = revenueSeries[revenueSeries.length - 1];

		if (latest && maxRevenue > 0) {
			isRecordMonth = latest.revenue === maxRevenue;
			bestMonthRevenue = maxRevenue;
		}
	}

	if (revenueSeries.length >= 2) {
		const lastIndex = revenueSeries.length - 1;
		const latest = revenueSeries[lastIndex];
		const prev = revenueSeries[lastIndex - 1];

		if (latest && prev && prev.revenue > 0) {
			const delta = ((latest.revenue - prev.revenue) / prev.revenue) * 100;
			revenueDeltaPct = delta;
			isRevenueUp = delta >= 0;
		}
	}

	return (
		<>
			<Header fixed></Header>

			<div className="container mx-auto p-8">
				<div className="flex flex-1 flex-col gap-6">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
						<div>
							<h2 className="mt-3 text-2xl font-semibold tracking-tight">
								Bảng thống kê
							</h2>
							<p className="mt-1 text-xs text-muted-foreground">
								{data?.refreshedAt && (
									<span className="ml-1 text-[11px] opacity-60">
										Cập nhật lúc{" "}
										{new Date(data.refreshedAt).toLocaleTimeString("vi-VN")}
									</span>
								)}
							</p>
						</div>
						<div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-end">
							<div className="inline-flex rounded-full border bg-white p-1 text-xs shadow-sm">
								{[
									{ id: "7d", label: "7 ngày" },
									{ id: "30d", label: "30 ngày" },
									{ id: "90d", label: "90 ngày" },
								].map((range) => (
									<button
										key={range.id}
										type="button"
										onClick={() =>
											setTimeRange(range.id as "7d" | "30d" | "90d")
										}
										className={`rounded-full px-3 py-1.5 transition-colors ${
											timeRange === range.id
												? "bg-slate-900 text-white"
												: "text-slate-600 hover:bg-slate-100"
										}`}
									>
										{range.label}
									</button>
								))}
							</div>
							<div className="flex items-center gap-2">
								<button
									onClick={() => refreshMutation.mutate()}
									disabled={refreshMutation.isPending}
									className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:text-foreground disabled:opacity-50"
								>
									<RefreshCw
										className={`h-3.5 w-3.5 ${refreshMutation.isPending ? "animate-spin" : ""}`}
									/>
									{refreshMutation.isPending ? "Đang đồng bộ..." : "Đồng bộ"}
								</button>
								<button
									onClick={() => setShowSettings(true)}
									className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:text-foreground"
								>
									<Settings className="h-3.5 w-3.5" />
									Cài đặt
								</button>
							</div>
						</div>
					</div>

					{data && (
						<StaleBanner
							refreshedAt={data.refreshedAt}
							onRefresh={() => refreshMutation.mutate()}
							isRefreshing={refreshMutation.isPending}
						/>
					)}

					{isLoading && (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							{Array.from({ length: 4 }).map((_, i) => (
								<Card key={i}>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-8 w-8 rounded-lg" />
									</CardHeader>
									<CardContent className="pt-0">
										<Skeleton className="mb-2 h-8 w-32" />
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
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
								<KpiCard
									label="Tổng người dùng"
									value={fmt(data.users.totalUsers)}
									description={`Hoạt động: ${fmt(data.users.activeUsers)}`}
									icon={Users}
									tone="users"
								/>
								<KpiCard
									label="Người dùng mới"
									value={`+${fmt(data.users.newUsersThisMonth)}`}
									description={`Tuần: +${fmt(data.users.newUsersThisWeek)} · Hôm nay: +${fmt(data.users.newUsersToday)}`}
									icon={UserPlus}
									tone="users-secondary"
								/>
								<KpiCard
									label="Tổng đơn hàng"
									value={fmt(data.orders.totalOrders)}
									description={`Doanh thu: ${fmtCurrency(data.orders.totalRevenue)}`}
									icon={ShoppingCart}
									tone="orders"
								/>
								<KpiCard
									label="Doanh thu tháng"
									value={fmtCurrency(data.orders.revenueThisMonth)}
									description={`Tổng: ${fmtCurrency(data.orders.totalRevenue)}`}
									icon={DollarSign}
									tone="revenue"
								/>
							</div>

							{revenueSeries.length > 0 && bestMonthRevenue !== null && (
								<div className="relative overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 px-5 py-4 shadow-sm">
									{/* subtle glow */}
									<div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-200/30 blur-2xl" />

									<div className="relative flex items-start gap-3">
										<div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
											<DollarSign className="h-5 w-5 text-emerald-600" />
										</div>

										<div className="flex-1">
											<p className="text-sm font-semibold text-emerald-900">
												{isRecordMonth
													? "🚀 Tháng này đang đạt đỉnh doanh thu"
													: "📈 Doanh thu cao nhất trong 12 tháng"}
											</p>

											<p className="mt-1 text-sm text-emerald-800">
												{isRecordMonth ? (
													<>
														Doanh thu hiện tại đang là mức cao nhất trong 12
														tháng gần đây.
													</>
												) : (
													<>
														Mức cao nhất đạt{" "}
														<span className="font-semibold text-emerald-900">
															{fmtCurrency(bestMonthRevenue)}
														</span>
													</>
												)}
											</p>
										</div>
									</div>
								</div>
							)}

							<div className="grid gap-4 lg:grid-cols-3 lg:items-stretch">
								<div className="lg:col-span-1 min-h-[640px]">
									<div className="h-full">
										<BreakdownPie
											data={data.orders.statusBreakdown || {}}
											labels={orderStatusLabels}
											title="Trạng thái đơn hàng"
											className="h-full"
										/>
									</div>
								</div>

								<div className="lg:col-span-2 flex min-h-[640px] h-full flex-col gap-4">
									<div className="flex-1">
										<Card className="h-full border-emerald-100 bg-white/60 shadow-sm">
											<CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
												<div>
													<CardTitle className="text-base font-semibold">
														Doanh thu theo tháng
													</CardTitle>
													<p className="text-xs text-muted-foreground">
														Diễn biến doanh thu theo từng tháng
													</p>
												</div>
											</CardHeader>

											<CardContent className="pt-2">
												{data.payments.monthlyRevenue?.length > 0 ? (
													<>
														<PaymentRevenueChart
															data={data.payments.monthlyRevenue}
														/>
														{revenueDeltaPct !== null && (
															<p className="mt-3 text-xs text-emerald-700">
																Doanh thu tháng này{" "}
																{isRevenueUp ? "tăng" : "giảm"}{" "}
																{Math.abs(revenueDeltaPct).toFixed(1)}% so với
																tháng trước.
															</p>
														)}
													</>
												) : (
													<div className="flex h-60 items-center justify-center text-xs text-muted-foreground">
														Chưa có dữ liệu
													</div>
												)}
											</CardContent>
										</Card>
									</div>

									<div className="grid flex-1 gap-4 md:grid-cols-2">
										<div className="h-full">
											<BreakdownPie
												data={data.users.roleBreakdown || {}}
												labels={roleLabels}
												title="Phân bổ vai trò người dùng"
												className="h-full"
											/>
										</div>

										<div className="h-full">
											<BreakdownPie
												data={data.payments.typeBreakdown || {}}
												labels={txTypeLabels}
												title="Phân bổ loại giao dịch"
												className="h-full"
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
		</>
	);
}
