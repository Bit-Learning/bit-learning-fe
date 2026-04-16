import type { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LongText } from "@/components/long-text";
import type { AdminTransaction } from "../types/transaction.type";
import {
	formatCurrency,
	formatDateTime,
	translatePaymentMethod,
	translateTransactionStatus,
	translateTransactionType,
} from "../types/transaction.type";

export const transactionColumns: ColumnDef<AdminTransaction>[] = [
	{
		accessorKey: "code",
		header: "Mã giao dịch",
		cell: ({ row }) => (
			<div className="font-mono text-xs sm:text-sm">{row.original.code}</div>
		),
	},
	{
		id: "user",
		header: "Người dùng",
		cell: ({ row }) => {
			const { user } = row.original;
			const initials = getInitials(user.fullName, user.email);

			return (
				<div className="flex min-w-0 items-center gap-3">
					<Avatar className="size-8">
						<AvatarImage
							src={user.avatar ?? undefined}
							alt={user.fullName ?? user.email}
						/>
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
					<div className="min-w-0">
						<p className="truncate text-sm font-medium">
							{user.fullName || "Không có tên"}
						</p>
						<p className="text-muted-foreground truncate text-xs">
							{user.email}
						</p>
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: "type",
		header: "Loại",
		cell: ({ row }) => (
			<Badge variant="outline" className="font-medium">
				{translateTransactionType(row.original.type)}
			</Badge>
		),
	},
	{
		accessorKey: "status",
		header: "Trạng thái",
		cell: ({ row }) => (
			<Badge
				variant="outline"
				className={getStatusClassName(row.original.status)}
			>
				{translateTransactionStatus(row.original.status)}
			</Badge>
		),
	},
	{
		accessorKey: "paymentMethod",
		header: "Thanh toán",
		cell: ({ row }) => (
			<span className="text-sm">
				{translatePaymentMethod(row.original.paymentMethod)}
			</span>
		),
	},
	{
		accessorKey: "amount",
		header: "Số tiền",
		cell: ({ row }) => (
			<div className="font-medium">{formatCurrency(row.original.amount)}</div>
		),
	},
	{
		id: "order",
		header: "Đơn hàng",
		cell: ({ row }) =>
			row.original.order ? (
				<LongText className="max-w-36 font-mono text-xs sm:text-sm">
					{row.original.order.code}
				</LongText>
			) : (
				<span className="text-muted-foreground text-sm">-</span>
			),
	},
	{
		accessorKey: "createdAt",
		header: "Tạo lúc",
		cell: ({ row }) => (
			<div className="text-sm">{formatDateTime(row.original.createdAt)}</div>
		),
	},
];

function getInitials(fullName: string | null, email: string) {
	const source = fullName?.trim() || email;
	return source
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");
}

function getStatusClassName(status: AdminTransaction["status"]) {
	switch (status) {
		case "COMPLETED":
			return "border-emerald-200 bg-emerald-50 text-emerald-700";
		case "FAILED":
			return "border-rose-200 bg-rose-50 text-rose-700";
		case "PENDING":
			return "border-amber-200 bg-amber-50 text-amber-700";
		default:
			return "";
	}
}
