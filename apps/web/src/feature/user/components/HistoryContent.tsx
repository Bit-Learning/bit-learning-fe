import React, { useState } from "react";
import { Receipt, Eye, Wallet, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card } from "@workspace/ui/components/Card";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { useMyOrders } from "@/feature/order/queries/useOrder";
import { TransactionDetailModal } from "./TransactionDetailModal";
import { Pagination } from "@/shared/components/Pagination";
import { OrderInfo } from "@/feature/order/types/order.type";
import Loader from "@workspace/ui/components/loader/TerminalLoader";

export const HistoryContent = () => {
	const [page, setPage] = useState(1);
	const [size] = useState(10);

	const [selectedTransaction, setSelectedTransaction] =
		useState<OrderInfo | null>(null);
	const [showModal, setShowModal] = useState(false);

	const { data: ordersData, isLoading } = useMyOrders({
		page: page - 1,
		size,
		sort: "createdAt",
		direction: "DESC",
	});

	const orders: OrderInfo[] = ordersData?.data || [];
	const totalPages = ordersData?.page?.totalPages || 1;

  const getStatusBadge = (status: string) => {
    if (status === "COMPLETED")
      return {
        variant: "default" as const,
        text: "Thành công",
        class: "bg-emerald-100 text-emerald-700",
        icon: CheckCircle2,
      };
    if (status === "PENDING")
      return { variant: "secondary" as const, text: "Đang xử lý", class: "bg-amber-100 text-amber-700", icon: Clock };
    return { variant: "destructive" as const, text: "Đã hủy", class: "bg-rose-100 text-rose-700", icon: XCircle };
  };

	const handleViewDetail = (order: OrderInfo) => {
		setSelectedTransaction(order);
		setShowModal(true);
	};

	return (
		<>
			<div className="grow space-y-8">
				<Card className="p-8 min-h-screen">
					<div className="flex items-center justify-between mb-8">
						<div className="flex items-center gap-3">
							<div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
								<Receipt className="w-6 h-6 text-primary" />
							</div>
							<div>
								<h2 className="text-xl font-bold text-slate-900">
									Lịch sử giao dịch
								</h2>
								<p className="text-sm text-slate-500">
									Xem lại tất cả các đơn hàng và trạng thái thanh toán của bạn
								</p>
							</div>
						</div>
						<div className="flex items-center gap-3 mb-2">
							<Wallet className="w-5 h-5 text-emerald-600" />
							<span className="text-md font-bold text-emerald-900">
								Tổng chi tiêu:{" "}
							</span>
							<div className="text-xl font-bold text-emerald-700">
								{orders
									.filter((o) => o.status === "COMPLETED")
									.reduce((sum, o) => sum + o.totalAmount, 0)
									.toLocaleString("vi-VN") || 0}
								đ{" "}
							</div>
						</div>
					</div>

					{isLoading ? (
						<Loader />
					) : orders.length === 0 ? (
						<div className="text-center py-12 text-slate-500">
							Chưa có giao dịch nào
						</div>
					) : (
						<>
							<div className="overflow-x-auto">
								<table className="w-full text-left border-collapse">
									<thead>
										<tr className="border-b border-slate-100">
											<th className="pb-4 pt-0 font-semibold text-slate-800 text-sm">
												Mã đơn hàng
											</th>
											<th className="pb-4 pt-0 font-semibold text-slate-800 text-sm">
												Khóa học
											</th>
											<th className="pb-4 pt-0 font-semibold text-slate-800 text-sm">
												Tổng tiền
											</th>
											<th className="pb-4 pt-0 font-semibold text-slate-800 text-sm">
												Trạng thái
											</th>
											<th className="pb-4 pt-0 font-semibold text-slate-800 text-sm"></th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-50">
										{orders.map((order) => {
											const firstDetail = order.details?.[0];
											const course = firstDetail?.course;
											const statusInfo = getStatusBadge(order.status);

                      return (
                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-5 font-bold text-slate-900 text-[14px]">#{order.code}</td>
                          <td className="py-5">
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                <img
                                  alt="Course"
                                  className="w-full h-full object-cover"
                                  src={course?.thumbnailUrl || "/placeholder.jpg"}
                                />
                              </div>
                              <span className="font-medium text-slate-700 text-[14px] line-clamp-1">
                                {course?.title || "—"}
                                {order.details.length > 1 && (
                                  <span className="text-slate-400 ml-1">(+{order.details.length - 1})</span>
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="py-5 font-bold text-primary text-[14px]">
                            {order.totalAmount.toLocaleString("vi-VN")}đ
                          </td>
                          <td className="py-5">
                            <Badge className={`text-sm px-3 flex items-center gap-1.5 w-fit ${statusInfo.class}`}>
                              <statusInfo.icon className="w-3.5 h-3.5" />
                              {statusInfo.text}
                            </Badge>
                          </td>
                          <td className=" text-right">
                            <Button
                              variant="ghost"
                              size="lg"
                              className="text-slate-700 hover:text-slate-900"
                              onClick={() => handleViewDetail(order)}
                            >
                              <Eye size="lg" className="w-8 h-8" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

							{totalPages > 1 && (
								<Pagination
									currentPage={page}
									totalPages={totalPages}
									onPageChange={setPage}
								/>
							)}
						</>
					)}
				</Card>
			</div>

			<TransactionDetailModal
				open={showModal}
				onClose={() => setShowModal(false)}
				transaction={selectedTransaction}
			/>
		</>
	);
};
