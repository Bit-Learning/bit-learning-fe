"use client";

import { FieldGroup } from "@workspace/ui/components/Field";
import { cn } from "@workspace/ui/lib/utils";
import { SearchIcon, XIcon } from "lucide-react";
import {
	Button as AriaButton,
	type ButtonProps as AriaButtonProps,
	Group as AriaGroup,
	type GroupProps as AriaGroupProps,
	Input as AriaInput,
	type InputProps as AriaInputProps,
	SearchField as AriaSearchField,
	type SearchFieldProps as AriaSearchFieldProps,
	composeRenderProps,
} from "react-aria-components";

function SearchField({ className, ...props }: AriaSearchFieldProps) {
	return (
		<AriaSearchField
			aria-label="Search"
			className={composeRenderProps(className, (className) =>
				cn("group", className),
			)}
			{...props}
		/>
	);
}

function SearchFieldInput({ className, ...props }: AriaInputProps) {
	return (
		<AriaInput
			aria-label="Search"
			className={composeRenderProps(className, (className) =>
				cn(
					"placeholder:text-muted-foreground min-w-0 flex-1 px-2 py-1.5 outline outline-0 [&::-webkit-search-cancel-button]:hidden",
					className,
				),
			)}
			{...props}
		/>
	);
}

function SearchFieldGroup({ className, ...props }: AriaGroupProps) {
	return (
		<AriaGroup
			className={composeRenderProps(className, (className) =>
				cn(
					"ring-offset-background flex h-10 w-full items-center overflow-hidden rounded-md border px-3 py-2 text-sm",
					/* Focus Within */
					"data-[focus-within]:ring-ring data-[focus-within]:ring-2 data-[focus-within]:ring-offset-2 data-[focus-within]:outline-none",
					/* Disabled */
					"data-[disabled]:opacity-50",
					className,
				),
			)}
			{...props}
		/>
	);
}

function SearchFieldClear({ className, ...props }: AriaButtonProps) {
	return (
		<AriaButton
			className={composeRenderProps(className, (className) =>
				cn(
					"ring-offset-background rounded-sm opacity-70 transition-opacity",
					/* Hover */
					"data-[hovered]:opacity-100",
					/* Disabled */
					"data-[disabled]:pointer-events-none",
					/* Empty */
					"group-data-[empty]:invisible",
					className,
				),
			)}
			{...props}
		/>
	);
}

interface BsSearchFieldProps extends AriaSearchFieldProps {
	placeholder?: string;
	containerClassName?: string;
}

function BsSearchField({
	className,
	placeholder = "Search...",
	containerClassName,
	...props
}: BsSearchFieldProps) {
	return (
		<SearchField
			className={cn("group flex flex-col gap-2", containerClassName)}
			{...props}
		>
			<FieldGroup className={() => cn("px-2", className)}>
				<SearchIcon
					aria-hidden
					className="text-muted-foreground pointer-events-none size-4"
				/>
				<SearchFieldInput placeholder={placeholder} />
				<SearchFieldClear>
					<XIcon aria-hidden className="size-4" />
				</SearchFieldClear>
			</FieldGroup>
		</SearchField>
	);
}

export {
	BsSearchField,
	SearchField,
	SearchFieldClear,
	SearchFieldGroup,
	SearchFieldInput,
};
export type { BsSearchFieldProps };
