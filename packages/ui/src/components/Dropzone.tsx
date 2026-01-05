"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
	DropZone as AriaDropZone,
	type DropZoneProps as AriaDropZoneProps,
	composeRenderProps,
} from "react-aria-components";

const DropZone = ({ className, ...props }: AriaDropZoneProps) => (
	<AriaDropZone
		className={composeRenderProps(className, (className) =>
			cn(
				"ring-offset-background flex h-[150px] w-[300px] flex-col items-center justify-center gap-2 rounded-md border border-dashed text-sm",
				/* Drop Target */
				"data-[drop-target]:border-primary data-[drop-target]:bg-accent data-[drop-target]:border-solid",
				/* Focus Visible */
				"data-[focus-visible]:ring-ring data-[focus-visible]:ring-2 data-[focus-visible]:ring-offset-2 data-[focus-visible]:outline-none",
				className,
			),
		)}
		{...props}
	/>
);

export { DropZone };
