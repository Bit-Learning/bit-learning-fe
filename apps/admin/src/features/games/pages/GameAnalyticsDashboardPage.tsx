import { useMemo, useState, type ReactNode } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	AlertTriangle,
	Clock3,
	ListChecks,
	Target,
	TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminGameAnalyticsDashboard } from "../queries/useAdminGameAnalytics";

const DAY_OPTIONS = [7, 30, 90];

const formatDuration = (seconds: number) =>
	`${Math.floor(seconds / 60)}m ${seconds % 60}s`;

export function GameAnalyticsDashboardPage() {
	const [days, setDays] = useState(30);
	const { data, isLoading } = useAdminGameAnalyticsDashboard(days);

	const topGames = useMemo(
		() => (data?.gamePerformance ?? []).slice(0, 8),
		[data?.gamePerformance],
	);
	const topTopics = useMemo(
		() => (data?.topicPerformance ?? []).slice(0, 8),
		[data?.topicPerformance],
	);
	const timeoutLeaders = useMemo(
		() => (data?.timeoutLeaders ?? []).slice(0, 5),
		[data?.timeoutLeaders],
	);

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 rounded-[28px] border border-slate-200/80 bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_24px_90px_rgba(15,23,42,0.22)] lg:flex-row lg:items-end lg:justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200/80">
						Analytics dashboard
					</p>
					<h1 className="mt-2 text-3xl font-semibold">
						Theo dõi hiệu suất game bằng dữ liệu lượt chơi thật
					</h1>
					<p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
						Tổng hợp số lượt chơi theo ngày, completion rate, accuracy trung
						bình theo game/chủ đề, abandonment và những game có timeout cao để
						quản trị nội dung sát hơn với hành vi người học.
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					{DAY_OPTIONS.map((option) => (
						<Button
							key={option}
							type="button"
							variant={days === option ? "default" : "secondary"}
							onClick={() => setDays(option)}
						>
							{option} ngày
						</Button>
					))}
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
				<KpiCard
					icon={<ListChecks className="h-5 w-5" />}
					label="Tổng attempt"
					value={isLoading ? "..." : String(data?.overview.totalAttempts ?? 0)}
					description={`${data?.overview.distinctGames ?? 0} game • ${data?.overview.distinctTopics ?? 0} chủ đề`}
				/>
				<KpiCard
					icon={<Target className="h-5 w-5" />}
					label="Completion rate"
					value={isLoading ? "..." : `${data?.overview.completionRate ?? 0}%`}
					description={`${data?.overview.completedAttempts ?? 0} hoàn thành`}
				/>
				<KpiCard
					icon={<TrendingUp className="h-5 w-5" />}
					label="Accuracy TB"
					value={isLoading ? "..." : `${data?.overview.averageAccuracy ?? 0}%`}
					description="Tính trên toàn bộ attempts có metrics"
				/>
				<KpiCard
					icon={<AlertTriangle className="h-5 w-5" />}
					label="Bỏ dở"
					value={isLoading ? "..." : `${data?.overview.partialRate ?? 0}%`}
					description={`${data?.overview.partialAttempts ?? 0} attempts PARTIAL`}
				/>
				<KpiCard
					icon={<Clock3 className="h-5 w-5" />}
					label="Thời lượng TB"
					value={
						isLoading
							? "..."
							: formatDuration(data?.overview.averageDurationSeconds ?? 0)
					}
					description={`Timeout rate ${data?.overview.timeoutRate ?? 0}%`}
				/>
			</div>

			<div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
				<Card className="rounded-[28px] border-slate-200/80">
					<CardHeader>
						<CardTitle>Lượt chơi theo ngày</CardTitle>
					</CardHeader>
					<CardContent className="h-[320px]">
						{isLoading ? (
							<Skeleton className="h-full w-full rounded-3xl" />
						) : (
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={data?.playsByDay ?? []}>
									<CartesianGrid strokeDasharray="3 3" opacity={0.2} />
									<XAxis dataKey="date" tick={{ fontSize: 12 }} />
									<YAxis tick={{ fontSize: 12 }} />
									<Tooltip />
									<Line
										type="monotone"
										dataKey="plays"
										stroke="#2563eb"
										strokeWidth={3}
										dot={false}
										name="Lượt chơi"
									/>
									<Line
										type="monotone"
										dataKey="completed"
										stroke="#16a34a"
										strokeWidth={2}
										dot={false}
										name="Hoàn thành"
									/>
									<Line
										type="monotone"
										dataKey="partial"
										stroke="#f59e0b"
										strokeWidth={2}
										dot={false}
										name="Bỏ dở"
									/>
								</LineChart>
							</ResponsiveContainer>
						)}
					</CardContent>
				</Card>

				<Card className="rounded-[28px] border-slate-200/80">
					<CardHeader>
						<CardTitle>Top game timeout cao</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{isLoading ? (
							Array.from({ length: 5 }).map((_, index) => (
								<Skeleton key={index} className="h-16 w-full rounded-2xl" />
							))
						) : timeoutLeaders.length > 0 ? (
							timeoutLeaders.map((item) => (
								<div
									key={item.gameId}
									className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
								>
									<div className="flex items-start justify-between gap-3">
										<div>
											<div className="font-semibold text-slate-900">
												{item.gameTitle}
											</div>
											<div className="mt-1 text-xs text-slate-500">
												{item.categoryName ||
													item.gameType ||
													"Không phân loại"}
											</div>
										</div>
										<div className="text-right">
											<div className="text-lg font-bold text-amber-600">
												{item.timeoutRate}%
											</div>
											<div className="text-xs text-slate-500">timeout</div>
										</div>
									</div>
									<div className="mt-3 text-xs text-slate-600">
										{item.attempts} attempts • Accuracy {item.averageAccuracy}%
										• Completion {item.completionRate}%
									</div>
								</div>
							))
						) : (
							<div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
								Chưa có dữ liệu timeout trong khoảng thời gian này.
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 xl:grid-cols-2">
				<Card className="rounded-[28px] border-slate-200/80">
					<CardHeader>
						<CardTitle>Accuracy trung bình theo game</CardTitle>
					</CardHeader>
					<CardContent className="h-[420px]">
						{isLoading ? (
							<Skeleton className="h-full w-full rounded-3xl" />
						) : (
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={topGames}
									layout="vertical"
									margin={{ left: 12, right: 12 }}
								>
									<CartesianGrid strokeDasharray="3 3" opacity={0.2} />
									<XAxis
										type="number"
										domain={[0, 100]}
										tick={{ fontSize: 12 }}
									/>
									<YAxis
										dataKey="gameTitle"
										type="category"
										width={180}
										tick={{ fontSize: 12 }}
									/>
									<Tooltip />
									<Bar
										dataKey="averageAccuracy"
										fill="#2563eb"
										radius={[0, 10, 10, 0]}
									/>
								</BarChart>
							</ResponsiveContainer>
						)}
					</CardContent>
				</Card>

				<Card className="rounded-[28px] border-slate-200/80">
					<CardHeader>
						<CardTitle>Accuracy trung bình theo chủ đề</CardTitle>
					</CardHeader>
					<CardContent className="h-[420px]">
						{isLoading ? (
							<Skeleton className="h-full w-full rounded-3xl" />
						) : (
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={topTopics}
									layout="vertical"
									margin={{ left: 12, right: 12 }}
								>
									<CartesianGrid strokeDasharray="3 3" opacity={0.2} />
									<XAxis
										type="number"
										domain={[0, 100]}
										tick={{ fontSize: 12 }}
									/>
									<YAxis
										dataKey="label"
										type="category"
										width={180}
										tick={{ fontSize: 12 }}
									/>
									<Tooltip />
									<Bar
										dataKey="averageAccuracy"
										fill="#0f766e"
										radius={[0, 10, 10, 0]}
									/>
								</BarChart>
							</ResponsiveContainer>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

function KpiCard({
	icon,
	label,
	value,
	description,
}: {
	icon: ReactNode;
	label: string;
	value: string;
	description: string;
}) {
	return (
		<Card className="rounded-[24px] border-slate-200/80">
			<CardContent className="p-5">
				<div className="flex items-center justify-between gap-3">
					<div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
						{label}
					</div>
					<div className="rounded-2xl bg-slate-100 p-2 text-slate-700">
						{icon}
					</div>
				</div>
				<div className="mt-4 text-3xl font-bold text-slate-950">{value}</div>
				<div className="mt-2 text-sm text-slate-500">{description}</div>
			</CardContent>
		</Card>
	);
}
