import { CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/shared/lib/utils";

type TransactionsMultiSelectProps<TValue extends string> = {
	title: string;
	options: Array<{
		label: string;
		value: TValue;
	}>;
	selectedValues: TValue[];
	onChange: (values: TValue[]) => void;
};

export function TransactionsMultiSelect<TValue extends string>({
	title,
	options,
	selectedValues,
	onChange,
}: TransactionsMultiSelectProps<TValue>) {
	const selectedSet = new Set(selectedValues);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" size="sm" className="h-9 border-dashed">
					<PlusCircledIcon className="size-4" />
					{title}
					{selectedSet.size > 0 && (
						<>
							<Separator orientation="vertical" className="mx-2 h-4" />
							<Badge
								variant="secondary"
								className="rounded-sm px-1 font-normal lg:hidden"
							>
								{selectedSet.size}
							</Badge>
							<div className="hidden space-x-1 lg:flex">
								{selectedSet.size > 2 ? (
									<Badge
										variant="secondary"
										className="rounded-sm px-1 font-normal"
									>
										{selectedSet.size} đã chọn
									</Badge>
								) : (
									options
										.filter((option) => selectedSet.has(option.value))
										.map((option) => (
											<Badge
												variant="secondary"
												key={option.value}
												className="rounded-sm px-1 font-normal"
											>
												{option.label}
											</Badge>
										))
								)}
							</div>
						</>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[220px] p-0" align="start">
				<Command>
					<CommandInput placeholder={title} />
					<CommandList>
						<CommandEmpty>Không có kết quả.</CommandEmpty>
						<CommandGroup>
							{options.map((option) => {
								const isSelected = selectedSet.has(option.value);

								return (
									<CommandItem
										key={option.value}
										value={option.label}
										onSelect={() => {
											if (isSelected) {
												onChange(
													selectedValues.filter(
														(value) => value !== option.value,
													),
												);
												return;
											}

											onChange([...selectedValues, option.value]);
										}}
									>
										<div
											className={cn(
												"border-primary flex size-4 items-center justify-center rounded-sm border",
												isSelected
													? "bg-primary text-primary-foreground"
													: "opacity-50 [&_svg]:invisible",
											)}
										>
											<CheckIcon className="text-background h-4 w-4" />
										</div>
										<span>{option.label}</span>
									</CommandItem>
								);
							})}
						</CommandGroup>
						{selectedSet.size > 0 && (
							<>
								<CommandSeparator />
								<CommandGroup>
									<CommandItem
										onSelect={() => onChange([])}
										className="justify-center text-center"
									>
										Xóa bộ lọc
									</CommandItem>
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
