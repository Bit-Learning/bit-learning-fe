"use client";

import { labelVariants } from "@workspace/ui/components/Field";
import { cn } from "@workspace/ui/lib/utils";
import { Circle } from "lucide-react";
import {
	Radio as AriaRadio,
	RadioGroup as AriaRadioGroup,
	type RadioGroupProps as AriaRadioGroupProps,
	type RadioProps as AriaRadioProps,
	composeRenderProps,
} from "react-aria-components";

const RadioGroup = ({ className, ...props }: AriaRadioGroupProps) => {
	return (
		<AriaRadioGroup
			isInvalid={(props as any)["aria-invalid"]}
			className={composeRenderProps(className, (className, renderProps) =>
				cn(
					"group/radiogroup flex flex-col flex-wrap gap-2",
					renderProps.orientation === "horizontal" &&
						"flex-row items-center gap-4",
					className,
				),
			)}
			{...props}
		/>
	);
};

const Radio = ({ className, children, ...props }: AriaRadioProps) => {
	return (
		<AriaRadio
			className={composeRenderProps(className, (className) =>
				cn(
					"group/radio flex cursor-pointer items-center gap-x-2 text-sm",
					/* Disabled */
					"data-[disabled]:cursor-not-allowed data-[disabled]:opacity-70",
					labelVariants,
					className,
				),
			)}
			{...props}
		>
			{composeRenderProps(children, (children, renderProps) => (
				<>
					<span
						className={cn(
							"bg-background-secondary ring-offset-background flex aspect-square size-4 items-center justify-center rounded-full border text-white",
							/* Focus */
							"group-data-[focused]/radio:outline-none",
							/* Focus Visible */
							"group-data-[focus-visible]/radio:ring-primary/40 group-data-[focus-visible]/radio:ring-2 group-data-[focus-visible]/radio:ring-offset-2",
							/* Selected */
							"group-data-[selected]/radio:bg-primary group-data-[selected]/radio:border-black/10 group-data-[selected]/radio:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]",
							/* Selected Dark */
							"dark:group-data-[selected]/radio:border-none",
							/* Disabled */
							"group-data-[disabled]/radio:cursor-not-allowed group-data-[disabled]/radio:opacity-50",
							/* Invalid */
							"group-data-[invalid]/radio:border-destructive",
						)}
					>
						{renderProps.isSelected && (
							<Circle className="size-1.5 fill-current text-current" />
						)}
					</span>
					{children}
				</>
			))}
		</AriaRadio>
	);
};

interface BsRadioGroupOption {
	id: string;
	name: string;
}

interface BsRadioGroupProps extends AriaRadioGroupProps {
	options: Array<BsRadioGroupOption>;
}

function BsRadioGroup({ options, className, ...props }: BsRadioGroupProps) {
	return (
		<RadioGroup {...props}>
			{options.map((option) => (
				<Radio key={option.id} value={option.id}>
					{option.name}
				</Radio>
			))}
		</RadioGroup>
	);
}

export { BsRadioGroup, Radio, RadioGroup };
export type { BsRadioGroupOption, BsRadioGroupProps };
