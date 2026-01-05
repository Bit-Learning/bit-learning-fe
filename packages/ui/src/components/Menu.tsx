"use client";

import { Popover } from "@workspace/ui/components/Popover";
import { cn } from "@workspace/ui/lib/utils";
import { Check, ChevronRight, Circle } from "lucide-react";
import type * as React from "react";
import {
	Header as AriaHeader,
	Keyboard as AriaKeyboard,
	Menu as AriaMenu,
	MenuItem as AriaMenuItem,
	type MenuItemProps as AriaMenuItemProps,
	type MenuProps as AriaMenuProps,
	MenuTrigger as AriaMenuTrigger,
	Separator as AriaSeparator,
	type SeparatorProps as AriaSeparatorProps,
	SubmenuTrigger as AriaSubmenuTrigger,
	composeRenderProps,
	type PopoverProps,
} from "react-aria-components";
import { ListBoxCollection, ListBoxSection } from "./ListBox";

const MenuTrigger = AriaMenuTrigger;

const MenuSubTrigger = AriaSubmenuTrigger;

const MenuSection = ListBoxSection;

const MenuCollection = ListBoxCollection;

function MenuPopover({ className, ...props }: PopoverProps) {
	return (
		<Popover
			className={composeRenderProps(className, (className) =>
				cn("w-auto", className),
			)}
			{...props}
		/>
	);
}

const Menu = <T extends object>({ className, ...props }: AriaMenuProps<T>) => (
	<AriaMenu
		className={cn(
			"max-h-[inherit] overflow-auto rounded-md p-1.5 outline outline-0 [clip-path:inset(0_0_0_0_round_calc(var(--radius)-2px))]",
			className,
		)}
		{...props}
	/>
);

const MenuItem = ({ children, className, ...props }: AriaMenuItemProps) => (
	<AriaMenuItem
		textValue={
			props.textValue || (typeof children === "string" ? children : undefined)
		}
		className={composeRenderProps(className, (className) =>
			cn(
				"relative flex cursor-default items-center gap-2.5 rounded-sm px-2 py-1.5 text-sm outline-none select-none",
				/* Disabled */
				"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
				/* Focused */
				"data-[focused]:bg-primary data-[focused]:text-white",
				/* Selection Mode */
				"data-[selection-mode]:pl-8",
				className,
			),
		)}
		{...props}
	>
		{composeRenderProps(children, (children, renderProps) => (
			<>
				<span className="absolute left-2 flex size-4 items-center justify-center">
					{renderProps.isSelected && (
						<>
							{renderProps.selectionMode === "single" && (
								<Circle className="size-2 fill-current" />
							)}
							{renderProps.selectionMode === "multiple" && (
								<Check className="size-4" />
							)}
						</>
					)}
				</span>

				{children}

				{renderProps.hasSubmenu && <ChevronRight className="ml-auto size-4" />}
			</>
		))}
	</AriaMenuItem>
);

interface MenuHeaderProps extends React.ComponentProps<typeof AriaHeader> {
	inset?: boolean;
	separator?: boolean;
}

const MenuHeader = ({
	className,
	inset,
	separator = true,
	...props
}: MenuHeaderProps) => (
	<AriaHeader
		className={cn(
			"px-3 py-1.5 text-sm font-semibold",
			inset && "pl-8",
			separator && "border-b-border -mx-1 mb-1 border-b pb-2.5",
			className,
		)}
		{...props}
	/>
);

const MenuSeparator = ({ className, ...props }: AriaSeparatorProps) => (
	<AriaSeparator
		className={cn("bg-muted -mx-1 my-1 h-px", className)}
		{...props}
	/>
);

const MenuKeyboard = ({
	className,
	...props
}: React.ComponentProps<typeof AriaKeyboard>) => {
	return (
		<AriaKeyboard
			className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
			{...props}
		/>
	);
};

export {
	Menu,
	MenuCollection,
	MenuHeader,
	MenuItem,
	MenuKeyboard,
	MenuPopover,
	MenuSection,
	MenuSeparator,
	MenuSubTrigger,
	MenuTrigger,
};
export type { MenuHeaderProps };
