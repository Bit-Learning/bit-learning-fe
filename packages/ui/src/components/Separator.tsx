"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
	Separator as AriaSeparator,
	type SeparatorProps as AriaSeparatorProps,
} from "react-aria-components";

const Separator = ({
	className,
	orientation = "horizontal",
	...props
}: AriaSeparatorProps) => (
	<AriaSeparator
		orientation={orientation}
		className={cn(
			"bg-border",
			/* Orientation */
			orientation === "horizontal" ? "h-px w-full" : "w-px",
			className,
		)}
		{...props}
	/>
);

export { Separator };
