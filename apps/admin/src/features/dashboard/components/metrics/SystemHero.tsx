import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/shared/lib/utils";
import {
	MetricsHealth,
	MetricsSummary,
} from "../../types/system-metrics.types";
import {
	fmt,
	fmtNumber,
	formatTime,
	getStatusTone,
} from "../../pages/SystemMetricsPage";

export function SystemHero({
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
