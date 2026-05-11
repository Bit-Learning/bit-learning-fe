import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import {
	formatGB,
	getStatusTone,
	isDiskSpaceHealthDetails,
} from "../../pages/SystemMetricsPage";
import {
	HealthComponent,
	MetricsHealth,
} from "../../types/system-metrics.types";
import { Server } from "lucide-react";

const COMPONENT_DESCRIPTIONS: Record<string, string> = {
	db: "Kết nối cơ sở dữ liệu chính (PostgreSQL)",
	redis: "Cache và message broker (Redis)",
	diskSpace: "Dung lượng ổ đĩa của máy chủ",
	livenessState:
		"Trạng thái sống của ứng dụng — dùng để Kubernetes restart khi cần",
	readinessState:
		"Trạng thái sẵn sàng nhận traffic — dùng để Kubernetes route request",
	ping: "Kiểm tra ứng dụng có phản hồi được không",
	refreshScope: "Trạng thái của Spring Cloud RefreshScope",
	ssl: "Thông tin chứng chỉ SSL/TLS",
};

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
						{COMPONENT_DESCRIPTIONS[component.name] && (
							<p className="mt-0.5 truncate text-xs text-muted-foreground/70">
								{COMPONENT_DESCRIPTIONS[component.name]}
							</p>
						)}
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

export function HealthOverviewCard({
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

	const HIDDEN_COMPONENTS = ["discoveryComposite", "reactiveDiscoveryClients"];

	const components = [...(data.components ?? [])]
		.filter((c) => !HIDDEN_COMPONENTS.includes(c.name))
		.sort((a, b) => {
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
