import React, { useState } from "react";
import { Eye, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card } from "@workspace/ui/components/Card";
import { Badge } from "@workspace/ui/components/Badge";
import { useMyOrders } from "@/feature/order/queries/useOrder";
import { TransactionDetailModal } from "./TransactionDetailModal";
import { Pagination } from "@/shared/components/Pagination";
import { OrderInfo } from "@/feature/order/types/order.type";
import Loader from "@workspace/ui/components/loader/TerminalLoader";
import { formatCurrency } from "@/shared/lib/currency";

export const HistoryContent: React.FC = () => {
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const [selectedTransaction, setSelectedTransaction] = useState<OrderInfo | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { data: ordersData, isLoading } = useMyOrders({
    page: page,
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
      return {
        variant: "secondary" as const,
        text: "Đang xử lý",
        class: "bg-amber-100 text-amber-700",
        icon: Clock,
      };
    return {
      variant: "destructive" as const,
      text: "Đã hủy",
      class: "bg-rose-100 text-rose-700",
      icon: XCircle,
    };
  };

  const handleViewDetail = (order: OrderInfo) => {
    setSelectedTransaction(order);
    setShowModal(true);
  };

  return (
    <>
      <div className="grow space-y-8">
        <Card className="px-6 py-8 min-h-screen">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Lịch sử mua hàng</h2>
                <p className="text-md text-slate-500">Xem lại tất cả các đơn hàng và trạng thái thanh toán của bạn</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <Loader />
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-slate-500">Chưa có giao dịch nào</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 border border-slate-200 font-semibold uppercase text-slate-800 text-sm w-72">
                        Mã đơn hàng
                      </th>
                      <th className="px-4 py-3 border border-slate-200 font-semibold uppercase text-slate-800 text-sm w-80">
                        Khóa học
                      </th>
                      <th className="px-4 py-3 border border-slate-200 font-semibold uppercase text-slate-800 text-sm w-36">
                        Tổng tiền
                      </th>
                      <th className="px-4 py-3 border border-slate-200 font-semibold uppercase text-slate-800 text-sm w-36">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 border border-slate-200 font-semibold uppercase text-slate-800 text-sm text-center">
                        Xem đơn
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => {
                      const firstDetail = order.details?.[0];
                      const course = firstDetail?.course;
                      const statusInfo = getStatusBadge(order.status);

                      return (
                        <tr
                          key={order.id}
                          onClick={() => handleViewDetail(order)}
                          className="cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-4 py-4 border border-slate-200 font-semibold text-slate-900 text-[13px]">
                            #{order.code}
                          </td>

                          <td className="px-4 py-4 border border-slate-200">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-slate-700 text-sm line-clamp-1">
                                {course?.title || "—"}
                                {order.details.length > 1 && (
                                  <span className="text-slate-400 ml-1">(+{order.details.length - 1})</span>
                                )}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4 border border-slate-200 font-bold text-primary text-[15px]">
                            {formatCurrency(order.totalAmount)}
                          </td>

                          <td className="px-4 py-4 border border-slate-200">
                            <Badge className={`text-[15px] px-2 flex items-center gap-1.5 w-fit ${statusInfo.class}`}>
                              <statusInfo.icon className="w-3.5 h-3.5" />
                              {statusInfo.text}
                            </Badge>
                          </td>

                          <td className="px-4 py-4 border border-slate-200 text-right">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="cursor-pointer text-slate-700 hover:text-blue-600 hover:bg-blue-100 p-2"
                                onClick={() => handleViewDetail(order)}
                                title="Xem chi tiết"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </Card>
      </div>
      <TransactionDetailModal open={showModal} onClose={() => setShowModal(false)} transaction={selectedTransaction} />
    </>
  );
};
