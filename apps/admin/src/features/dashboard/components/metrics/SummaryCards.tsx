import { Card } from "@/components/ui/card";
import { Activity, Cpu, HardDrive, Layers3 } from "lucide-react";
import {
	fmt,
	fmtBytesToMb,
	fmtNumber,
	getHealthLabel,
} from "../../pages/SystemMetricsPage";
import { MetricsSummary } from "../../types/system-metrics.types";
import { MetricKpiCard } from "./MetricKpiCard";
import { SummarySkeleton } from "./SummarySkeleton";

export function SummaryCards({
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
