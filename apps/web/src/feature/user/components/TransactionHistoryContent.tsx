import React, { useState } from "react";
import {
	ArrowDownCircle,
	ArrowUpCircle,
	RefreshCw,
	Trophy,
	Bot,
	CheckCircle2,
	Clock,
	XCircle,
	Layers,
} from "lucide-react";
import { Card } from "@workspace/ui/components/Card";
import { Badge } from "@workspace/ui/components/Badge";
import { useMyTransactionHistory } from "@/feature/order/queries/useOrder";
import {
	TransactionInfo,
	TransactionStatus,
	TransactionType,
} from "@/feature/order/types/payment.type";
import { Pagination } from "@/shared/components/Pagination";
import Loader from "@workspace/ui/components/loader/TerminalLoader";
import { formatDateTime } from "@/shared/lib/date-time-utils";
import BitCoinIcon from "@/shared/components/BitCoinIcon";
import { cn } from "@workspace/ui/lib/utils";

const PAGE_SIZE = 10;

const STATUS_CONFIG: Record<
	TransactionStatus,
	{ text: string; cls: string; icon: React.ElementType }
> = {
	[TransactionStatus.COMPLETED]: {
		text: "Thành công",
		cls: "bg-emerald-100 text-emerald-700",
		icon: CheckCircle2,
	},
	[TransactionStatus.PENDING]: {
		text: "Đang xử lý",
		cls: "bg-amber-100 text-amber-700",
		icon: Clock,
	},
	[TransactionStatus.FAILED]: {
		text: "Thất bại",
		cls: "bg-rose-100 text-rose-700",
		icon: XCircle,
	},
};

const TYPE_CONFIG: Record<
	TransactionType,
	{ text: string; cls: string; icon: React.ElementType; amountCls: string }
> = {
	[TransactionType.DEPOSIT]: {
		text: "Nạp tiền",
		cls: "bg-blue-100 text-blue-700",
		icon: ArrowDownCircle,
		amountCls: "text-emerald-600",
	},
	[TransactionType.PURCHASE]: {
		text: "Mua khóa học",
		cls: "bg-violet-100 text-violet-700",
		icon: ArrowUpCircle,
		amountCls: "text-rose-600",
	},
	[TransactionType.AI_REQUEST]: {
		text: "Dùng AI",
		cls: "bg-orange-100 text-orange-700",
		icon: Bot,
		amountCls: "text-rose-600",
	},
	[TransactionType.AI_REFUND]: {
		text: "Hoàn AI",
		cls: "bg-teal-100 text-teal-700",
		icon: RefreshCw,
		amountCls: "text-emerald-600",
	},
	[TransactionType.CONTEST_PRIZE]: {
		text: "Giải thưởng",
		cls: "bg-amber-100 text-amber-700",
		icon: Trophy,
		amountCls: "text-emerald-600",
	},
};

const AMOUNT_PREFIX: Record<TransactionType, string> = {
	[TransactionType.DEPOSIT]: "+",
	[TransactionType.PURCHASE]: "-",
	[TransactionType.AI_REQUEST]: "-",
	[TransactionType.AI_REFUND]: "+",
	[TransactionType.CONTEST_PRIZE]: "+",
};

const isDebit = (type: TransactionType) =>
	type === TransactionType.PURCHASE || type === TransactionType.AI_REQUEST;

export const TransactionHistoryContent: React.FC = () => {
	const [page, setPage] = useState(0);

	const { data, isLoading } = useMyTransactionHistory({
		page,
		size: PAGE_SIZE,
		sort: "createdAt",
		direction: "DESC",
	});

	const transactions: TransactionInfo[] = data?.data ?? [];
	const totalPages = data?.page?.totalPages ?? 1;

	return (
		<div className="grow space-y-8">
			<Card className="px-6 py-8 min-h-screen">
				<div className="flex items-center justify-between mb-8">
					<div className="flex items-center gap-3">
						<div>
							<h2 className="text-2xl font-bold text-slate-900">
								Lịch sử giao dịch
							</h2>
							<p className="text-md text-slate-500">
								Tất cả các giao dịch trong tài khoản của bạn
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
						<Layers className="w-4 h-4 text-slate-500" />
						<span className="text-sm font-semibold text-slate-600">
							Tổng giao dịch:
						</span>
						<span className="text-lg font-bold text-slate-800">
							{data?.page?.totalElements ?? 0}
						</span>
					</div>
				</div>

				{isLoading ? (
					<Loader />
				) : transactions.length === 0 ? (
					<div className="text-center py-12 text-slate-500">
						Chưa có giao dịch nào
					</div>
				) : (
					<>
						<div className="overflow-x-auto">
							<table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
								<thead>
									<tr className="bg-slate-50">
										<th className="px-4 py-3 border border-slate-200 font-semibold uppercase text-slate-800 text-sm">
											Mã giao dịch
										</th>
										<th className="px-4 py-3 border border-slate-200 font-semibold uppercase text-slate-800 text-sm text-center">
											Loại
										</th>
										<th className="px-4 py-3 border border-slate-200 font-semibold uppercase text-slate-800 text-sm text-center">
											Số tiền
										</th>
										<th className="px-4 py-3 border border-slate-200 font-semibold uppercase text-slate-800 text-sm">
											Ngày giao dịch
										</th>
										<th className="px-4 py-3 border border-slate-200 font-semibold uppercase text-slate-800 text-sm">
											Trạng thái
										</th>
									</tr>
								</thead>

								<tbody>
									{transactions.map((tx) => {
										const status = STATUS_CONFIG[tx.status];
										const typeConfig =
											TYPE_CONFIG[tx.type] ??
											TYPE_CONFIG[TransactionType.DEPOSIT];
										const StatusIcon = status.icon;
										const TypeIcon = typeConfig.icon;
										const debit = isDebit(tx.type);
										const isFailed = tx.status === TransactionStatus.FAILED;

										const formattedAmount = isFailed
											? `${tx.amount.toLocaleString("vi-VN")}`
											: debit
												? `- ${tx.amount.toLocaleString("vi-VN")}`
												: `+${tx.amount.toLocaleString("vi-VN")}`;

										return (
											<tr
												key={tx.id}
												className="hover:bg-slate-50 transition-colors"
											>
												<td className="px-4 py-4 border border-slate-200 font-bold text-slate-900 text-[14px]">
													#{tx.code}
												</td>

												<td className="px-4 py-4 border border-slate-200 text-center">
													<div className="flex justify-center">
														<Badge
															className={`text-sm px-3 flex items-center gap-1.5 w-fit ${typeConfig.cls}`}
														>
															<TypeIcon className="w-3.5 h-3.5" />
															{typeConfig.text}
														</Badge>
													</div>
												</td>

												<td className="px-4 py-4 border border-slate-200">
													<span
														className={cn(
															"font-bold text-[16px] flex items-center justify-center gap-1",
															isFailed
																? "text-slate-900"
																: typeConfig.amountCls,
														)}
													>
														{formattedAmount}
														<BitCoinIcon size={20} />
													</span>
												</td>

												<td className="px-4 py-4 border border-slate-200 text-slate-500 text-[13px]">
													{tx.createdAt ? formatDateTime(tx.createdAt) : "—"}
												</td>

												<td className="px-4 py-4 border border-slate-200">
													<Badge
														className={`text-sm px-3 flex items-center gap-1.5 w-fit ${status.cls}`}
													>
														<StatusIcon className="w-3.5 h-3.5" />
														{status.text}
													</Badge>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>

						{totalPages > 1 && (
							<div className="flex justify-center mt-6">
								<Pagination
									currentPage={page}
									totalPages={totalPages}
									onPageChange={setPage}
								/>
							</div>
						)}
					</>
				)}
			</Card>
		</div>
	);
};

export default TransactionHistoryContent;
