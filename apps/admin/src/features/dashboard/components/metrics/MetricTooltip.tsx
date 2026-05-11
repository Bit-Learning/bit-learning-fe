import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export function MetricTooltip({ content }: { content: string }) {
	return (
		<TooltipProvider delayDuration={200}>
			<Tooltip>
				<TooltipTrigger asChild>
					<Info className="h-3.5 w-3.5 cursor-help text-muted-foreground/60 hover:text-muted-foreground transition-colors" />
				</TooltipTrigger>
				<TooltipContent
					side="top"
					className="max-w-[240px] text-xs leading-relaxed"
				>
					{content}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
