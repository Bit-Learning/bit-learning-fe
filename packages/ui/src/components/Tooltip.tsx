"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
	Tooltip as AriaTooltip,
	type TooltipProps as AriaTooltipProps,
	TooltipTrigger as AriaTooltipTrigger,
	composeRenderProps,
} from "react-aria-components";

const TooltipTrigger = AriaTooltipTrigger;

const Tooltip = ({ className, offset = 4, ...props }: AriaTooltipProps) => (
	<AriaTooltip
		offset={offset}
		className={composeRenderProps(className, (className) =>
			cn(
				"max-w-xs",
				"animate-in fade-in-0 z-50 overflow-hidden rounded-sm bg-neutral-800 px-2.5 py-1.5 text-xs text-neutral-200 dark:border",
				/* Exiting */
				"data-[exiting]:animate-out data-[exiting]:fade-out-0",
				className,
			),
		)}
		{...props}
	/>
);

export { Tooltip, TooltipTrigger };
