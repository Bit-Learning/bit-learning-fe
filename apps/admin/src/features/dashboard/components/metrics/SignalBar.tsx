import { cn } from "@/shared/lib/utils";
import { fmtNumber, getHealthLabel } from "../../pages/SystemMetricsPage";
import { MetricTooltip } from "./MetricTooltip";
export function SignalBar({
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
