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
		id: "index",
		header: "STT",
		cell: ({ row, table }) => {
			const pageIndex = table.getState().pagination.pageIndex;
			const pageSize = table.getState().pagination.pageSize;
			const rowIndex = row.index;
			return (
				<div className="text-center text-sm font-medium">
					{pageIndex * pageSize + rowIndex + 1}
				</div>
			);
		},
	},
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
		cell: ({ row }) => {
			const { type, status, amount } = row.original;
			const { color, isNegative } = getAmountStyle(type, status);
			const formattedAmount = formatCurrency(amount);

			return (
				<div className={`font-medium ${color}`}>
					{isNegative ? `(${formattedAmount})` : formattedAmount}
				</div>
			);
		},
	},
	// {
	// 	id: "order",
	// 	header: "Đơn hàng",
	// 	cell: ({ row }) =>
	// 		row.original.order ? (
	// 			<LongText className="max-w-36 font-mono text-xs sm:text-sm">
	// 				{row.original.order.code}
	// 			</LongText>
	// 		) : (
	// 			<span className="text-muted-foreground text-sm">-</span>
	// 		),
	// },
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
			return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600";
		case "FAILED":
			return "border-rose-500/30 bg-rose-500/10 text-rose-600";
		case "PENDING":
			return "border-amber-500/30 bg-amber-500/10 text-amber-600";
		default:
			return "";
	}
}

function getAmountStyle(
	type: AdminTransaction["type"],
	status: AdminTransaction["status"],
) {
	// Chờ xử lý -> màu cam
	if (status === "PENDING") {
		return { color: "text-amber-600", isNegative: false };
	}

	// Hoàn tất
	if (status === "COMPLETED") {
		// Nạp tiền + Hoàn tất -> Xanh lá
		if (type === "DEPOSIT" || type === "CONTEST_PRIZE") {
			return { color: "text-emerald-600", isNegative: false };
		}
		// AI Request / Mua hàng + Hoàn tất -> Đỏ, hiển thị dạng (số tiền)
		if (type === "AI_REQUEST" || type === "PURCHASE") {
			return { color: "text-rose-600", isNegative: true };
		}
	}

	// Mặc định
	return { color: "", isNegative: false };
}
