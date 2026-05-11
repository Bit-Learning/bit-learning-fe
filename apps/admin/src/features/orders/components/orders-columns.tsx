import type { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import BitCoinIcon from "@workspace/ui/components/BitCoinIcon";
import type { AdminOrder } from "../types/order.type";
import {
	formatCurrency,
	formatDateTime,
	translateOrderStatus,
	translatePaymentMethod,
} from "../types/order.type";

export const orderColumns: ColumnDef<AdminOrder>[] = [
	{
		id: "index",
		header: "STT",
		cell: ({ row, table }) => {
			const pageIndex = table.getState().pagination.pageIndex;
			const pageSize = table.getState().pagination.pageSize;
			return (
				<div className="text-center text-sm font-medium">
					{pageIndex * pageSize + row.index + 1}
				</div>
			);
		},
	},
	{
		accessorKey: "code",
		header: "Mã đơn hàng",
		cell: ({ row }) => (
			<div className="font-mono text-xs sm:text-sm">{row.original.code}</div>
		),
	},
	{
		id: "user",
		header: "Người dùng",
		cell: ({ row }) => {
			const { userFullName, userEmail, userAvatar } = row.original;
			const initials = getInitials(userFullName, userEmail);

			return (
				<div className="flex min-w-0 items-center gap-3">
					<Avatar className="size-8">
						<AvatarImage
							src={userAvatar ?? undefined}
							alt={userFullName ?? userEmail}
						/>
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
					<div className="min-w-0">
						<p className="truncate text-sm font-medium">
							{userFullName || "Không có tên"}
						</p>
						<p className="text-muted-foreground truncate text-xs">
							{userEmail}
						</p>
					</div>
				</div>
			);
		},
	},
	{
		id: "courses",
		header: "Khóa học",
		cell: ({ row }) => {
			const { details } = row.original;
			if (!details?.length) {
				return <span className="text-muted-foreground text-sm">-</span>;
			}
			return (
				<div className="flex flex-col gap-1">
					{details.map((d) => (
						<span key={d.id} className="text-sm leading-snug">
							{d.course.title}
						</span>
					))}
				</div>
			);
		},
	},
	{
		accessorKey: "status",
		header: "Trạng thái",
		cell: ({ row }) => (
			<Badge
				variant="outline"
				className={getStatusClassName(row.original.status)}
			>
				{translateOrderStatus(row.original.status)}
			</Badge>
		),
	},
	{
		accessorKey: "paymentMethod",
		header: "Thanh toán",
		cell: ({ row }) => (
			<Badge
				variant="outline"
				className={getPaymentMethodClassName(row.original.paymentMethod)}
			>
				{translatePaymentMethod(row.original.paymentMethod)}
			</Badge>
		),
	},
	{
		accessorKey: "totalAmount",
		header: () => <div className="text-center">Tổng tiền</div>,
		cell: ({ row }) => {
			const { status, totalAmount } = row.original;
			const color =
				status === "COMPLETED"
					? "text-emerald-600"
					: status === "FAILED"
						? "text-muted-foreground line-through"
						: "text-amber-600";
			return (
				<div
					className={`flex items-center justify-end gap-1 font-medium ${color}`}
				>
					{status === "COMPLETED" && <span>+</span>}
					<span>{formatCurrency(totalAmount)}</span>
					<BitCoinIcon size={14} />
				</div>
			);
		},
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

function getStatusClassName(status: AdminOrder["status"]) {
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

function getPaymentMethodClassName(paymentMethod: AdminOrder["paymentMethod"]) {
	switch (paymentMethod) {
		case "VNPAY":
			return "border-blue-500/30 bg-blue-500/10 text-blue-700 font-medium";
		case "PAYOS":
			return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 font-medium";
		case "WALLET":
			return "border-amber-500/30 bg-amber-500/10 text-amber-700 font-medium";
		default:
			return "text-muted-foreground font-medium";
	}
}
