import type { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import BitCoinIcon from "@workspace/ui/components/BitCoinIcon";
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
			<Badge
				variant="outline"
				className={getTypeClassName(
					row.original.type,
					row.original.paymentMethod,
				)}
			>
				{translateTransactionType(
					row.original.type,
					row.original.paymentMethod,
				)}
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
			<Badge
				variant="outline"
				className={getPaymentMethodClassName(row.original.paymentMethod)}
			>
				{translatePaymentMethod(row.original.paymentMethod)}
			</Badge>
		),
	},
	{
		accessorKey: "amount",
		header: () => <div className="text-center">Số tiền</div>,
		cell: ({ row }) => {
			const { type, status, amount, paymentMethod } = row.original;
			const { color, sign } = getAmountStyle(type, status, paymentMethod);
			const formattedAmount = formatCurrency(amount);

			return (
				<div
					className={`flex items-center justify-end gap-1 font-medium ${color}`}
				>
					{amount === 0 ? (
						<span className="text-muted-foreground italic">Lượt miễn phí</span>
					) : sign === "negative" ? (
						<>
							<span>- {formattedAmount}</span>
							<BitCoinIcon size={14} />
						</>
					) : sign === "positive" ? (
						<>
							<span>+ {formattedAmount}</span>
							<BitCoinIcon size={14} />
						</>
					) : (
						<>
							<span>{formattedAmount}</span>
							<BitCoinIcon size={14} />
						</>
					)}
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

function getTypeClassName(
	type: AdminTransaction["type"],
	paymentMethod: AdminTransaction["paymentMethod"],
) {
	if (type === "PURCHASE") {
		// Mua trực tiếp qua VNPay/PayOS → xanh dương (doanh thu thực)
		if (paymentMethod === "VNPAY" || paymentMethod === "PAYOS") {
			return "border-blue-500/30 bg-blue-500/10 text-blue-600 font-medium";
		}
		// Thanh toán qua ví nội bộ → tím nhạt
		return "border-violet-500/30 bg-violet-500/10 text-violet-600 font-medium";
	}
	if (type === "DEPOSIT") {
		return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 font-medium";
	}
	if (type === "AI_REQUEST") {
		return "border-orange-500/30 bg-orange-500/10 text-orange-600 font-medium";
	}
	if (type === "CONTEST_PRIZE") {
		return "border-yellow-500/30 bg-yellow-500/10 text-yellow-600 font-medium";
	}
	return "font-medium";
}

function getPaymentMethodClassName(
	paymentMethod: AdminTransaction["paymentMethod"],
) {
	switch (paymentMethod) {
		case "VNPAY":
			// Xanh dương — cổng thanh toán VNPay
			return "border-blue-500/30 bg-blue-500/10 text-blue-700 font-medium";
		case "PAYOS":
			// Xanh lá — cổng thanh toán PayOS
			return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 font-medium";
		case "WALLET":
			// Vàng/Cam — ví nội bộ
			return "border-amber-500/30 bg-amber-500/10 text-amber-700 font-medium";
		default:
			return "text-muted-foreground font-medium";
	}
}

function getAmountStyle(
	type: AdminTransaction["type"],
	status: AdminTransaction["status"],
	paymentMethod: AdminTransaction["paymentMethod"],
): { color: string; sign: "positive" | "negative" | "neutral" } {
	// Chờ xử lý -> màu cam, không dấu
	if (status === "PENDING") {
		return { color: "text-amber-600", sign: "neutral" };
	}

	// Hoàn tất
	if (status === "COMPLETED") {
		if (type === "DEPOSIT" || type === "CONTEST_PRIZE") {
			// Nạp tiền / Thưởng cuộc thi -> Xanh, dấu +
			return { color: "text-emerald-600", sign: "positive" };
		}
		if (type === "PURCHASE") {
			if (paymentMethod === "VNPAY" || paymentMethod === "PAYOS") {
				// Mua trực tiếp qua cổng thanh toán → xanh dương, dấu +
				// (tiền thật chảy vào hệ thống, admin nhìn đây là doanh thu)
				return { color: "text-blue-600", sign: "positive" };
			}
			// Thanh toán qua ví nội bộ → đỏ, dấu - (tiền chuyển trong hệ thống)
			return { color: "text-rose-600", sign: "negative" };
		}
		if (type === "AI_REQUEST") {
			// AI Request -> Đỏ, dấu -
			return { color: "text-rose-600", sign: "negative" };
		}
	}

	// Thất bại / mặc định -> không dấu, không màu đặc biệt
	return { color: "text-muted-foreground", sign: "neutral" };
}
