import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { Cpu, HardDrive } from "lucide-react";
import { Activity } from "react";
import { mapPoints, TrendCard } from "../../pages/SystemMetricsPage";
import { MetricsTrends } from "../../types/system-metrics.types";

export function PanelShell({
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

export function PanelLegend({
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

export function SystemTrendsSection({
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
