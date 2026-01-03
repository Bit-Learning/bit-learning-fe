"use client";

import { labelVariants } from "@workspace/ui/components/Field";
import { cn } from "@workspace/ui/lib/utils";
import { Check, Minus } from "lucide-react";
import {
	Checkbox as AriaCheckbox,
	CheckboxGroup as AriaCheckboxGroup,
	type CheckboxGroupProps as AriaCheckboxGroupProps,
	type CheckboxProps as AriaCheckboxProps,
	composeRenderProps,
} from "react-aria-components";

const CheckboxGroup = ({ className, ...props }: AriaCheckboxGroupProps) => {
	return (
		<AriaCheckboxGroup className={cn("grid gap-2", className)} {...props} />
	);
};

const Checkbox = ({ className, children, ...props }: AriaCheckboxProps) => (
	<AriaCheckbox
		className={composeRenderProps(className, (className) =>
			cn(
				"group/checkbox flex cursor-pointer items-center gap-x-2 text-sm",
				/* Disabled */
				"data-[disabled]:cursor-not-allowed data-[disabled]:opacity-70",
				labelVariants,
				className,
			),
		)}
		isInvalid={(props as any)["aria-invalid"]}
		{...props}
	>
		{composeRenderProps(children, (children, renderProps) => (
			<>
				<div
					className={cn(
						"bg-background-secondary ring-offset-background flex size-4 shrink-0 items-center justify-center rounded-[5px] border text-white",
						/* Focus Visible */
						"group-data-[focus-visible]/checkbox:ring-primary/40 group-data-[focus-visible]/checkbox:ring-2 group-data-[focus-visible]/checkbox:ring-offset-2 group-data-[focus-visible]/checkbox:outline-none",
						/* Selected */
						"group-data-[indeterminate]/checkbox:bg-primary group-data-[selected]/checkbox:bg-primary group-data-[indeterminate]/checkbox:border-black/10 group-data-[indeterminate]/checkbox:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] group-data-[selected]/checkbox:border-black/10 group-data-[selected]/checkbox:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]",
						/* Selected Dark */
						"dark:group-data-[indeterminate]/checkbox:border-none dark:group-data-[selected]/checkbox:border-none",
						/* Disabled */
						"group-data-[disabled]/checkbox:cursor-not-allowed group-data-[disabled]/checkbox:opacity-80",
						/* Invalid */
						"group-data-[invalid]/checkbox:border-destructive group-data-[invalid]/checkbox:group-data-[selected]/checkbox:bg-destructive group-data-[invalid]/checkbox:group-data-[selected]/checkbox:text-destructive-foreground-foreground",
						/* Resets */
						"focus:outline-none focus-visible:outline-none",
					)}
				>
					{renderProps.isIndeterminate ? (
						<Minus className="size-4" />
					) : renderProps.isSelected ? (
						<Check className="size-4" />
					) : null}
				</div>
				{children}
			</>
		))}
	</AriaCheckbox>
);

interface BsCheckboxGroupOption {
	id: string;
	name: string;
}

interface BsCheckboxProps extends AriaCheckboxGroupProps {
	options: Array<BsCheckboxGroupOption>;
}

function BsCheckboxGroup({ options, className, ...props }: BsCheckboxProps) {
	return (
		<CheckboxGroup {...props}>
			<div className={cn("grid grid-cols-3 gap-4", className)}>
				{options.map((option) => (
					<Checkbox key={option.id} value={option.id}>
						{option.name}
					</Checkbox>
				))}
			</div>
		</CheckboxGroup>
	);
}

export { BsCheckboxGroup, Checkbox, CheckboxGroup };
export type { BsCheckboxGroupOption, BsCheckboxProps };
