"use client";

import { Button } from "@workspace/ui/components/Button";
import { cn } from "@workspace/ui/lib/utils";
import { X } from "lucide-react";
import type React from "react";
import {
	Dialog as AriaDialog,
	type DialogProps as AriaDialogProps,
	DialogTrigger as AriaDialogTrigger,
	Heading as AriaHeading,
	type HeadingProps as AriaHeadingProps,
	Modal as AriaModal,
	ModalOverlay as AriaModalOverlay,
	type ModalOverlayProps as AriaModalOverlayProps,
	composeRenderProps,
} from "react-aria-components";

const Dialog = AriaDialog;

const DialogTrigger = AriaDialogTrigger;

const DialogOverlay = ({
	className,
	isDismissable = true,
	...props
}: AriaModalOverlayProps) => (
	<AriaModalOverlay
		isDismissable={isDismissable}
		className={composeRenderProps(className, (className) =>
			cn(
				"fixed inset-0 z-50 bg-black/70",
				/* Exiting */
				"data-[exiting]:animate-out data-[exiting]:fade-out-0 max-md:data-[exiting]:duration-300",
				/* Entering */
				"data-[entering]:animate-in data-[entering]:fade-in-0 max-md:data-[entering]:duration-300",
				className,
			),
		)}
		{...props}
	/>
);

interface DialogContentProps
	extends Omit<React.ComponentProps<typeof AriaModal>, "children"> {
	children?: AriaDialogProps["children"];
	role?: AriaDialogProps["role"];
	closeButton?: boolean;
	isFullscreenOnMobile?: boolean;
}

const DialogContent = ({
	className,
	children,
	role,
	closeButton = true,
	...props
}: DialogContentProps) => (
	<AriaModal
		className={composeRenderProps(className, (className) =>
			cn(
				"bg-background fixed top-1/2 left-[50vw] z-50 w-full max-w-[calc(100vw-40px)] -translate-x-1/2 -translate-y-1/2 rounded-xl p-5 shadow-2xl md:max-w-lg dark:border",
				"data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0",
				"md:data-[entering]:zoom-in-97 md:data-[exiting]:zoom-out-97",
				"max-md:data-[entering]:slide-in-from-bottom-5 max-md:data-[exiting]:slide-out-to-bottom-5 max-md:data-[exiting]:duration-300",
				className,
			),
		)}
		{...props}
	>
		<AriaDialog
			role={role}
			className={cn("grid h-full gap-4", "h-full outline-none")}
		>
			{composeRenderProps(children, (children, renderProps) => (
				<>
					{children}
					{closeButton && (
						<Button
							onClick={renderProps.close}
							size="icon"
							variant="ghost"
							className="absolute top-2.5 right-2.5"
						>
							<X className="text-muted-foreground size-4!" />
							<span className="sr-only">Close</span>
						</Button>
					)}
				</>
			))}
		</AriaDialog>
	</AriaModal>
);

const DialogHeader = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"flex flex-col space-y-1.5 text-center sm:text-left",
			className,
		)}
		{...props}
	/>
);

const DialogFooter = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
			className,
		)}
		{...props}
	/>
);

const DialogTitle = ({ className, ...props }: AriaHeadingProps) => (
	<AriaHeading
		slot="title"
		className={cn(
			"text-lg leading-none font-semibold tracking-tight",
			className,
		)}
		{...props}
	/>
);

const DialogDescription = ({
	className,
	...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
	<p
		className={cn(
			"text-muted-foreground flex flex-col space-y-1.5 text-center text-sm sm:text-left",
			className,
		)}
		{...props}
	/>
);

export {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogTitle,
	DialogTrigger,
};
export type { DialogContentProps };
