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

			console.log("userType", userType);

			return (
				<div className="flex items-center justify-center gap-x-2">
					{userType.icon && (
						<userType.icon size={16} className="text-muted-foreground" />
					)}
					{/* <span className="text-sm">{userType.label}</span> */}
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
		accessorKey: "specialties",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Chuyên môn" />
		),
		cell: ({ row }) => {
			const specialties = row.original.specialties ?? [];
			if (!specialties.length) {
				return <span className="text-xs text-muted-foreground">-</span>;
			}
			return (
				<div className="flex flex-wrap gap-1">
					{specialties.slice(0, 3).map((s) => (
						<Badge
							key={s}
							variant="outline"
							className="text-[10px] font-normal"
						>
							{s}
						</Badge>
					))}
					{specialties.length > 3 && (
						<span className="text-[10px] text-muted-foreground">
							+{specialties.length - 3}
						</span>
					)}
				</div>
			);
		},
	},
	{
		accessorKey: "company",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Đơn vị công tác" />
		),
		cell: ({ row }) => {
			const company = row.original.company;
			return (
				<span className="text-xs text-muted-foreground">
					{company && company.trim().length > 0 ? company : "-"}
				</span>
			);
		},
	},
	{
		accessorKey: "yearsOfExperience",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Kinh nghiệm" />
		),
		cell: ({ row }) => {
			const years = row.original.yearsOfExperience;
			if (!years) {
				return (
					<div className="text-center text-xs text-muted-foreground">-</div>
				);
			}
			return <div className="text-center text-xs font-medium">{years} năm</div>;
		},
	},
	{
		accessorKey: "featured",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Nổi bật" />
		),
		cell: ({ row }) => {
			const featured = row.original.featured;
			if (!featured) {
				return <span className="text-xs text-muted-foreground">-</span>;
			}
			return (
				<Badge variant="outline" className="text-[10px] font-medium">
					Featured
				</Badge>
			);
		},
	},
	{
		accessorKey: "studentsCount",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Học viên" />
		),
		cell: ({ row }) => {
			const students = row.original.studentsCount ?? 0;
			return <div className="text-center text-xs">{students}</div>;
		},
	},
	{
		accessorKey: "coursesCount",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Khoá học" />
		),
		cell: ({ row }) => {
			const courses = row.original.coursesCount ?? 0;
			return <div className="text-center text-xs">{courses}</div>;
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
