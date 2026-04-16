import { Check, ChevronsUpDown, LoaderCircle, Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/shared/lib/utils";
import { lookupAdminUsers } from "../api/transaction.api";
import type { AdminUserLookupOption } from "../types/transaction.type";

type UserLookupComboboxProps = {
	value: AdminUserLookupOption | null;
	onChange: (value: AdminUserLookupOption | null) => void;
};

export function UserLookupCombobox({
	value,
	onChange,
}: UserLookupComboboxProps) {
	const [open, setOpen] = useState(false);
	const [keyword, setKeyword] = useState("");

	useEffect(() => {
		if (!open) {
			setKeyword("");
		}
	}, [open]);

	const trimmedKeyword = keyword.trim();
	const { data, isFetching } = useQuery({
		queryKey: ["admin-user-lookup", trimmedKeyword],
		queryFn: () => lookupAdminUsers({ keyword: trimmedKeyword, limit: 10 }),
		enabled: open && trimmedKeyword.length >= 2,
		staleTime: 60 * 1000,
	});

	const selectedLabel =
		value?.fullName?.trim() || value?.email || "Chọn người dùng";

	return (
		<div className="flex min-w-[260px] items-center gap-2">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className="h-9 w-full justify-between"
					>
						<div className="flex min-w-0 items-center gap-2">
							<Search className="text-muted-foreground size-4 shrink-0" />
							<span className="truncate">{selectedLabel}</span>
						</div>
						<ChevronsUpDown className="text-muted-foreground ms-2 size-4 shrink-0" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[320px] p-0" align="start">
					<Command shouldFilter={false}>
						<CommandInput
							placeholder="Tìm theo tên, email hoặc username..."
							value={keyword}
							onValueChange={setKeyword}
						/>
						<CommandList>
							{trimmedKeyword.length < 2 ? (
								<CommandEmpty>Nhập ít nhất 2 ký tự để tìm.</CommandEmpty>
							) : isFetching ? (
								<div className="text-muted-foreground flex items-center gap-2 px-3 py-4 text-sm">
									<LoaderCircle className="size-4 animate-spin" />
									Đang tìm người dùng...
								</div>
							) : (
								<CommandEmpty>Không tìm thấy người dùng.</CommandEmpty>
							)}

							{value ? (
								<CommandGroup heading="Đã chọn">
									<CommandItem
										value={`selected-${value.id}`}
										onSelect={() => {
											onChange(null);
											setOpen(false);
										}}
									>
										<X className="size-4" />
										Xóa người dùng đã chọn
									</CommandItem>
								</CommandGroup>
							) : null}

							{data?.length ? (
								<CommandGroup heading="Kết quả">
									{data.map((user) => {
										const isSelected = value?.id === user.id;
										const initials = getInitials(user);

										return (
											<CommandItem
												key={user.id}
												value={`${user.id}-${user.fullName ?? user.email}`}
												onSelect={() => {
													onChange(user);
													setOpen(false);
												}}
											>
												<Avatar className="size-7">
													<AvatarImage
														src={user.avatar ?? undefined}
														alt={user.fullName ?? user.email}
													/>
													<AvatarFallback>{initials}</AvatarFallback>
												</Avatar>
												<div className="min-w-0 flex-1">
													<p className="truncate text-sm font-medium">
														{user.fullName || "Không có tên"}
													</p>
													<p className="text-muted-foreground truncate text-xs">
														{user.email}
													</p>
												</div>
												<Check
													className={cn(
														"ms-2 size-4 shrink-0",
														isSelected ? "opacity-100" : "opacity-0",
													)}
												/>
											</CommandItem>
										);
									})}
								</CommandGroup>
							) : null}
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			{value ? (
				<Button
					variant="ghost"
					size="icon"
					className="size-9 shrink-0"
					onClick={() => onChange(null)}
				>
					<X className="size-4" />
					<span className="sr-only">Xóa người dùng</span>
				</Button>
			) : null}
		</div>
	);
}

function getInitials(user: AdminUserLookupOption) {
	const source = user.fullName?.trim() || user.email;
	return source
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");
}
