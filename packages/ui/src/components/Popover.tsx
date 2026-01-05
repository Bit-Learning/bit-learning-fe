"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
	Dialog as AriaDialog,
	type DialogProps as AriaDialogProps,
	DialogTrigger as AriaDialogTrigger,
	Popover as AriaPopover,
	type PopoverProps as AriaPopoverProps,
	composeRenderProps,
} from "react-aria-components";

const PopoverTrigger = AriaDialogTrigger;

const Popover = ({
	className,
	offset = 4,
	isAnimated = true,
	...props
}: AriaPopoverProps & { isAnimated?: boolean }) => (
	<AriaPopover
		offset={offset}
		className={composeRenderProps(className, (className) =>
			cn(
				// "dark", // dark mode only, disable it if you want to use it in both modes
				"bg-popover/80 text-popover-foreground shadow-popover z-50 rounded-lg border backdrop-blur-xl outline-none",
				/* Entering */
				isAnimated && "data-[entering]:animate-in data-[entering]:fade-in-0",
				/* Exiting */
				isAnimated && "data-[exiting]:animate-out data-[exiting]:fade-out-0",
				/* Placement */
				"data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2",
				className,
			),
		)}
		{...props}
	/>
);

function PopoverDialog({ className, ...props }: AriaDialogProps) {
	return (
		<AriaDialog className={cn("p-3 outline outline-0", className)} {...props} />
	);
}

export { Popover, PopoverDialog, PopoverTrigger };
