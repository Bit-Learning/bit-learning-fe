import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table";
import { LongText } from "@/components/long-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/shared/lib/utils";
import { activatedStatuses, mentorApprovalStatuses, roles } from "../data/data";
import type { User } from "../data/schema";
import { DataTableRowActions } from "./data-table-row-actions";

export const usersColumns: ColumnDef<User>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
				className="translate-y-[2px]"
			/>
		),
		meta: {
			className: cn("max-md:sticky start-0 z-10 rounded-tl-[inherit]"),
		},
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
				className="translate-y-[2px]"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "id",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="ID" />
		),
		cell: ({ row }) => <div className="w-16 ps-3">{row.getValue("id")}</div>,
		meta: {
			className: cn(
				"drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]",
				"ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none",
			),
		},
		enableHiding: false,
	},
	{
		id: "user",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Người dùng" />
		),
		cell: ({ row }) => {
			const { firstName, lastName, avatar } = row.original;
			const fullName = `${firstName} ${lastName}`;
			const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
			return (
				<div className="flex items-center gap-2">
					<Avatar className="h-8 w-8">
						<AvatarImage src={avatar} alt={fullName} />
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
					<LongText className="max-w-36">{fullName}</LongText>
				</div>
			);
		},
		meta: { className: "w-48" },
	},
	{
		accessorKey: "email",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Email" />
		),
		cell: ({ row }) => (
			<div className="w-fit ps-2 text-nowrap">{row.getValue("email")}</div>
		),
	},
	{
		accessorKey: "activated",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Trạng thái" />
		),
		cell: ({ row }) => {
			const activated = row.getValue("activated") as boolean;
			const badgeColor = activatedStatuses.get(activated);
			return (
				<div className="flex space-x-2">
					<Badge variant="outline" className={cn("capitalize", badgeColor)}>
						{activated ? "Hoạt động" : "Không hoạt động"}
					</Badge>
				</div>
			);
		},
		filterFn: (row, id, value) => {
			// Convert boolean to string for comparison with filter values
			const activated = row.getValue(id) as boolean;
			return value.includes(String(activated));
		},
		enableHiding: false,
		enableSorting: false,
	},
	{
		accessorKey: "role",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Vai trò" />
		),
		cell: ({ row }) => {
			const { role } = row.original;
			const userType = roles.find(({ value }) => value === role);

			if (!userType) {
				return null;
			}

			return (
				<div className="flex items-center gap-x-2">
					{userType.icon && (
						<userType.icon size={16} className="text-muted-foreground" />
					)}
					<span className="text-sm">{userType.label}</span>
				</div>
			);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
		enableSorting: false,
		enableHiding: false,
	},
	{
		id: "mentorStatus",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Mentor" />
		),
		cell: ({ row }) => {
			const { role, mentorApprovalStatus, isExternalMentor } = row.original;

			if (role !== "MENTOR") {
				return <div className="text-muted-foreground text-xs">-</div>;
			}

			const key = ((): keyof typeof mentorApprovalStatuses => {
				if (!isExternalMentor) return "INTERNAL";
				if (!mentorApprovalStatus) return "PENDING";
				if (mentorApprovalStatus in mentorApprovalStatuses) {
					return mentorApprovalStatus as keyof typeof mentorApprovalStatuses;
				}
				return "PENDING";
			})();

			const config = mentorApprovalStatuses[key];

			return (
				<Badge
					variant="outline"
					className={cn("text-xs font-medium", config.className)}
				>
					{config.label}
				</Badge>
			);
		},
	},
	{
		accessorKey: "wallet",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Số dư" />
		),
		cell: ({ row }) => {
			const wallet = row.getValue("wallet") as { id: number; balance: number };
			return (
				<div className="text-right font-medium">
					{wallet.balance.toFixed(0)}đ
				</div>
			);
		},
		enableSorting: false,
	},
	{
		accessorKey: "lastLoginAttempt",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Đăng nhập lần cuối" />
		),
		cell: ({ row }) => {
			const lastLogin = row.getValue("lastLoginAttempt") as string | null;
			if (!lastLogin)
				return <div className="text-muted-foreground">Chưa từng</div>;
			const date = new Date(lastLogin);
			return (
				<div className="text-nowrap">
					{date.toLocaleDateString()} {date.toLocaleTimeString()}
				</div>
			);
		},
		enableSorting: false,
	},
	{
		id: "actions",
		cell: DataTableRowActions,
	},
];
