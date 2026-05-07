import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getHealthLabel } from "../../pages/SystemMetricsPage";
import { cn } from "@/shared/lib/utils";
import { MetricTooltip } from "./MetricTooltip";

export function MetricKpiCard({
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
