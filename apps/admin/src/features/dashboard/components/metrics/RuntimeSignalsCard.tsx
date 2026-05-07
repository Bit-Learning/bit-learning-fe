import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Activity,
	Cpu,
	Database,
	HardDrive,
	Layers,
	AlertTriangle,
} from "lucide-react";
import type React from "react";
import { fmt, fmtBytesToMb, fmtNumber } from "../../pages/SystemMetricsPage";
import type { MetricsSummary } from "../../types/system-metrics.types";
import { SignalBar } from "./SignalBar";

export function RuntimeSignalsCard({ summary }: { summary?: MetricsSummary }) {
	const cpu = summary?.cpu?.usagePercent ?? 0;
	const usedMb = fmtBytesToMb(summary?.memory?.usedBytes ?? 0);
	const maxMb = fmtBytesToMb(summary?.memory?.maxBytes ?? 0);
	const memoryPercent = maxMb > 0 ? (usedMb / maxMb) * 100 : 0;

	const activeConns = summary?.db?.activeConnections ?? 0;
	const idleConns = summary?.db?.idleConnections ?? 0;
	const totalConns = summary?.db?.totalConnections ?? 0;
	const maxConns = summary?.db?.maxConnections ?? 0;
	const waiting = summary?.db?.threadsAwaitingConnection ?? 0;
	// pool pressure = total connections opened vs max capacity
	const dbPercent = maxConns > 0 ? (totalConns / maxConns) * 100 : 0;

	const liveThreads = summary?.jvm?.liveThreads ?? 0;
	const totalRequests = summary?.requests?.totalRequests ?? 0;

	return (
		<Card className="h-full border border-border/70 bg-card/95 shadow-sm">
			<CardHeader className="border-b border-border/60 pb-5">
				<CardTitle className="text-lg font-semibold">Runtime Signals</CardTitle>
				<p className="mt-1 text-sm text-muted-foreground">
					Các chỉ báo nhanh về áp lực CPU, heap và kết nối cơ sở dữ liệu.
				</p>
			</CardHeader>
			<CardContent className="space-y-5 pt-6">
				{/* Signal bars */}
				<div className="space-y-4">
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
						tooltip={`Tỉ lệ connections đã mở so với pool tối đa (total/max). Active: ${activeConns} đang execute SQL · Idle: ${idleConns} sẵn sàng · Chờ: ${waiting}. Pool đầy (100%) → request mới phải xếp hàng.`}
					/>
				</div>

				{/* Stats grid */}
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
					<StatCell
						icon={Cpu}
						label="CPU"
						value={`${fmtNumber(cpu)}%`}
						iconColor="text-emerald-500"
					/>
					<StatCell
						icon={HardDrive}
						label="Heap dùng"
						value={`${fmtNumber(usedMb)} MB`}
						sub={maxMb > 0 ? `/ ${fmtNumber(maxMb, 0)} MB` : undefined}
						iconColor="text-indigo-500"
					/>
					<StatCell
						icon={Database}
						label="DB pool"
						value={maxConns > 0 ? `${totalConns} / ${maxConns}` : "N/A"}
						sub={`active ${activeConns} · idle ${idleConns}`}
						iconColor="text-amber-500"
					/>
					<StatCell
						icon={Layers}
						label="JVM threads"
						value={fmt(liveThreads)}
						sub="live threads"
						iconColor="text-sky-500"
					/>
					<StatCell
						icon={Activity}
						label="Tổng requests"
						value={fmt(totalRequests)}
						sub="kể từ khởi động"
						iconColor="text-violet-500"
					/>
					<StatCell
						icon={AlertTriangle}
						label="Chờ DB pool"
						value={String(waiting)}
						sub={waiting > 0 ? "⚠ pool đang tắc nghẽn" : "bình thường"}
						iconColor={waiting > 0 ? "text-rose-500" : "text-slate-400"}
					/>
				</div>
			</CardContent>
		</Card>
	);
}

function StatCell({
	icon: Icon,
	label,
	value,
	sub,
	iconColor,
	className,
}: {
	icon: React.ElementType;
	label: string;
	value: string;
	sub?: string;
	iconColor: string;
	className?: string;
}) {
	return (
		<div
			className={`rounded-2xl border border-border/60 bg-muted/20 p-4 ${className ?? ""}`}
		>
			<div className="flex items-center gap-2">
				<Icon className={`h-3.5 w-3.5 ${iconColor}`} />
				<p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
					{label}
				</p>
			</div>
			<p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
			{sub && (
				<p className="mt-0.5 text-[11px] text-muted-foreground/70">{sub}</p>
			)}
		</div>
	);
}
