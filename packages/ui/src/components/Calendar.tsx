"use client";

import { getLocalTimeZone, parseDate, today } from "@internationalized/date";
import { buttonVariants } from "@workspace/ui/components/Button";
import { RangeCalendarCell } from "@workspace/ui/components/Calendar.helper";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";

import { cn } from "@workspace/ui/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import {
	Button as AriaButton,
	Calendar as AriaCalendar,
	CalendarCell as AriaCalendarCell,
	type CalendarCellProps as AriaCalendarCellProps,
	CalendarGrid as AriaCalendarGrid,
	CalendarGridBody as AriaCalendarGridBody,
	type CalendarGridBodyProps as AriaCalendarGridBodyProps,
	CalendarGridHeader as AriaCalendarGridHeader,
	type CalendarGridHeaderProps as AriaCalendarGridHeaderProps,
	type CalendarGridProps as AriaCalendarGridProps,
	CalendarHeaderCell as AriaCalendarHeaderCell,
	type CalendarHeaderCellProps as AriaCalendarHeaderCellProps,
	Heading as AriaHeading,
	RangeCalendar as AriaRangeCalendar,
	composeRenderProps,
	useLocale,
} from "react-aria-components";

const Calendar = AriaCalendar;

const RangeCalendar = AriaRangeCalendar;

const CalendarHeading = (props: React.HTMLAttributes<HTMLElement>) => {
	const { direction } = useLocale();

	return (
		<header className="flex w-full items-center gap-0.5 pb-1" {...props}>
			<AriaHeading className="grow pl-2.5 text-sm font-medium" />

			<AriaButton
				slot="previous"
				className={cn(
					buttonVariants({ variant: "ghost" }),
					"text-primary-foreground size-8 rounded-full bg-transparent p-0",
					/* Hover */
					"data-[hovered]:bg-muted-foreground/10 data-[hovered]:text-primary-foreground data-[hovered]:opacity-100",
				)}
			>
				{direction === "rtl" ? (
					<ChevronRight aria-hidden className="size-4" />
				) : (
					<ChevronLeft aria-hidden className="size-4" />
				)}
			</AriaButton>
			<AriaButton
				slot="next"
				className={cn(
					buttonVariants({ variant: "ghost" }),
					"text-primary-foreground size-8 rounded-full bg-transparent p-0",
					/* Hover */
					"data-[hovered]:bg-muted-foreground/10 data-[hovered]:text-primary-foreground data-[hovered]:opacity-100",
				)}
			>
				{direction === "rtl" ? (
					<ChevronLeft aria-hidden className="size-4" />
				) : (
					<ChevronRight aria-hidden className="size-4" />
				)}
			</AriaButton>
		</header>
	);
};

const CalendarGrid = ({ className, ...props }: AriaCalendarGridProps) => (
	<AriaCalendarGrid
		className={cn(
			"border-separate border-spacing-x-0 border-spacing-y-0.5",
			className,
		)}
		{...props}
	/>
);

const CalendarGridHeader = ({ ...props }: AriaCalendarGridHeaderProps) => (
	<AriaCalendarGridHeader {...props} />
);

const CalendarHeaderCell = ({
	className,
	...props
}: AriaCalendarHeaderCellProps) => (
	<AriaCalendarHeaderCell
		className={cn(
			"text-muted-foreground w-8 rounded-md text-[0.8rem] font-normal",
			className,
		)}
		{...props}
	/>
);

const CalendarGridBody = ({
	className,
	...props
}: AriaCalendarGridBodyProps) => (
	<AriaCalendarGridBody className={cn("[&>tr>td]:p-0", className)} {...props} />
);

const CalendarCell = ({
	className,
	type = "single",
	...props
}: AriaCalendarCellProps & { type?: "single" | "range" }) => {
	if (type === "range") {
		return <RangeCalendarCell date={props.date} />;
	}

	return (
		<AriaCalendarCell
			className={composeRenderProps(className, (className, renderProps) =>
				cn(
					buttonVariants({ variant: "unstyled" }),
					"relative flex size-8 items-center justify-center rounded-full p-0 text-sm font-normal transition-none",
					/* Disabled */
					renderProps.isDisabled && "text-muted-foreground opacity-50",
					/* Selected */
					renderProps.isSelected &&
						"bg-primary data-[focused]:bg-primary text-white",
					/* Current Date */
					renderProps.date.compare(today(getLocalTimeZone())) === 0 &&
						!renderProps.isSelected &&
						"text-accent-foreground bg-neutral-400/10",
					/* Hovered */
					renderProps.isHovered && "bg-neutral-400/20",
					/* Outside Month */
					renderProps.isOutsideMonth && "hidden",
					/* Unavailable Date */
					renderProps.isUnavailable &&
						"text-destructive-foreground cursor-default",
					renderProps.isInvalid &&
						"bg-destructive text-destructive-foreground-foreground data-[focused]:bg-destructive data-[hovered]:bg-destructive data-[focused]:text-destructive-foreground-foreground data-[hovered]:text-destructive-foreground-foreground",
					className,
				),
			)}
			{...props}
		/>
	);
};

/** Accepts values in the format YYYY-MM-DD */
interface BsCalendarProps {
	value?: string;
	onChange?: (date: string) => void;
	defaultValue?: string;
	minValue?: string;
	maxValue?: string;
	variant?: "default" | "unstyled";
	className?: string;
}

function BsCalendar({
	value: controlledValue,
	onChange: controlledOnChange,
	defaultValue,
	minValue,
	maxValue,
	className,
	variant = "default",
}: BsCalendarProps) {
	const [uncontrolledValue, setUncontrolledValue] = React.useState<
		string | undefined
	>(defaultValue);

	const value = controlledValue ?? uncontrolledValue;
	const onChange = controlledOnChange ?? setUncontrolledValue;

	return (
		<Calendar
			value={value ? parseDate(value) : null}
			onChange={(value) => onChange(value?.toString())}
			className={composeRenderProps(className, (className) =>
				cn(
					"w-fit",
					variant === "default"
						? "bg-background-secondary/40 rounded-lg border p-1"
						: "",
					className,
				),
			)}
			minValue={minValue ? parseDate(minValue) : null}
			maxValue={maxValue ? parseDate(maxValue) : null}
		>
			<CalendarHeading />
			<CalendarGrid>
				<CalendarGridHeader>
					{(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}
				</CalendarGridHeader>
				<CalendarGridBody>
					{(date) => <CalendarCell date={date} />}
				</CalendarGridBody>
			</CalendarGrid>
		</Calendar>
	);
}

interface BsRangeCalendarValue {
	start: string;
	end: string;
}

/** Accepts values in the format YYYY-MM-DD */
interface BsRangeCalendarProps {
	value?: BsRangeCalendarValue;
	onChange?: (value: BsRangeCalendarValue) => void;
	defaultValue?: BsRangeCalendarValue;
	className?: string;
	variant?: "default" | "unstyled";
	minValue?: string;
	maxValue?: string;
}

function BsRangeCalendar({
	value: controlledValue,
	onChange: controlledOnChange,
	defaultValue,
	minValue,
	maxValue,
	className,
	variant = "default",
}: BsRangeCalendarProps) {
	const [uncontrolledValue, uncontrolledOnChange] = React.useState<
		BsRangeCalendarValue | undefined
	>(defaultValue);
	const value = controlledValue ?? uncontrolledValue;
	const onChange = controlledOnChange ?? uncontrolledOnChange;

	const isMobile = useIsMobile();
	const months = isMobile ? 1 : 2;

	return (
		<RangeCalendar
			visibleDuration={{ months }}
			value={
				value?.start && value?.end
					? { start: parseDate(value.start), end: parseDate(value.end) }
					: null
			}
			onChange={(value) =>
				onChange?.({
					start: value?.start?.toString(),
					end: value?.end?.toString(),
				})
			}
			minValue={minValue ? parseDate(minValue) : null}
			maxValue={maxValue ? parseDate(maxValue) : null}
			className={composeRenderProps(className, (className) =>
				cn(
					"w-fit",
					variant === "default"
						? "bg-background-secondary/40 rounded-lg border p-1"
						: "",
					className,
				),
			)}
		>
			<CalendarHeading />
			<div className="flex items-start gap-3">
				{Array.from({ length: months }).map((_, index) => (
					<CalendarGrid key={index} offset={{ months: index }}>
						<CalendarGridHeader>
							{(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}
						</CalendarGridHeader>
						<CalendarGridBody>
							{(date) => <CalendarCell date={date} type="range" />}
						</CalendarGridBody>
					</CalendarGrid>
				))}
			</div>
		</RangeCalendar>
	);
}

export {
	BsCalendar,
	BsRangeCalendar,
	Calendar,
	CalendarCell,
	CalendarGrid,
	CalendarGridBody,
	CalendarGridHeader,
	CalendarHeaderCell,
	CalendarHeading,
	RangeCalendar,
};
export type { BsCalendarProps, BsRangeCalendarProps, BsRangeCalendarValue };
