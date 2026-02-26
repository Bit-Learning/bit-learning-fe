import React, { useState } from "react";
import {
  Receipt,
  Eye,
  ChevronLeft,
  ChevronRight,
  Wallet,
  ShoppingCart,
  Star,
  Printer,
  CheckCircle2,
  X,
} from "lucide-react";
import { Card } from "@workspace/ui/components/Card";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { useOrdersByUserId } from "@/feature/order/queries/useOrder";
import { useUserProfile } from "../queries/useUser";
import { TransactionDetailModal } from "./TransactionDetailModal";

export const HistoryContent = () => {
  const { data: userProfile } = useUserProfile();
  const [page, setPage] = useState(1);
  const [size] = useState(10);

  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const { data: ordersData, isLoading } = useOrdersByUserId(userProfile?.id || 0, {
    page: page - 1,
    size,
    sort: "createdAt",
    direction: "DESC",
  });

  const orders = ordersData?.data || [];
  const totalPages = ordersData?.page?.totalPages || 1;

  const getStatusVariant = (status: string) => {
    if (status === "COMPLETED") return "default";
    if (status === "PENDING") return "secondary";
    return "destructive";
  };

  const getStatusText = (status: string) => {
    if (status === "COMPLETED") return "Thành công";
    if (status === "PENDING") return "Đang xử lý";
    return "Đã hủy";
  };

  const handleViewDetail = (order: any) => {
    setSelectedTransaction(order);
    setShowModal(true);
  };

  return (
    <>
      <div className="grow space-y-6">
        <Card className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Lịch sử giao dịch</h2>
                <p className="text-sm text-slate-500">Xem lại tất cả các đơn hàng và trạng thái thanh toán của bạn</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Xuất file PDF
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-slate-500">Đang tải...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-slate-500">Chưa có giao dịch nào</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-4 pt-0 font-semibold text-slate-500 text-sm">Mã đơn hàng</th>
                      <th className="pb-4 pt-0 font-semibold text-slate-500 text-sm">Khóa học</th>
                      <th className="pb-4 pt-0 font-semibold text-slate-500 text-sm">Ngày mua</th>
                      <th className="pb-4 pt-0 font-semibold text-slate-500 text-sm">Tổng tiền</th>
                      <th className="pb-4 pt-0 font-semibold text-slate-500 text-sm">Trạng thái</th>
                      <th className="pb-4 pt-0 font-semibold text-slate-500 text-sm"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {orders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-5 font-bold text-slate-900 text-[14px]">#{order.orderCode}</td>
                        <td className="py-5">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                              <img
                                alt="Course"
                                className="w-full h-full object-cover"
                                src={order.courseImage || "/placeholder.jpg"}
                              />
                            </div>
                            <span className="font-medium text-slate-700 text-[14px] line-clamp-1">
                              {order.courseName}
                            </span>
                          </div>
                        </td>
                        <td className="py-5 text-slate-500 text-sm">
                          {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="py-5 font-bold text-primary text-[14px]">
                          {order.totalAmount.toLocaleString("vi-VN")}đ
                        </td>
                        <td className="py-5">
                          <Badge variant={getStatusVariant(order.status)} className="px-3 py-1">
                            {getStatusText(order.status)}
                          </Badge>
                        </td>
                        <td className="py-5 text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetail(order)}>
                            <Eye className="w-5 h-5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-6">
                <p className="text-sm text-slate-500">
                  Hiển thị {(page - 1) * size + 1}-{Math.min(page * size, ordersData?.page?.totalElements || 0)} trên
                  tổng số {ordersData?.page?.totalElements || 0} giao dịch
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    isDisabled={page === 1}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = page - 2 + i;
                    if (p < 1 || p > totalPages) return null;
                    return (
                      <Button key={p} variant={page === p ? "default" : "outline"} size="sm" onClick={() => setPage(p)}>
                        {p}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    isDisabled={page === totalPages}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-emerald-50 border-emerald-100">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-900">Tổng chi tiêu</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600">
              {ordersData?.data?.reduce((sum: number, o: any) => sum + o.totalAmount, 0).toLocaleString("vi-VN")}đ
            </div>
          </Card>
          <Card className="p-6 bg-blue-50 border-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart className="w-5 h-5 text-[#005baa]" />
              <span className="text-sm font-bold text-blue-900">Khóa học đã mua</span>
            </div>
            <div className="text-2xl font-bold text-[#005baa]">{ordersData?.page?.totalElements || 0} Khóa học</div>
          </Card>
          <Card className="p-6 bg-amber-50 border-amber-100">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-bold text-amber-900">Điểm tích lũy</span>
            </div>
            <div className="text-2xl font-bold text-amber-600">
              {userProfile?.wallet?.balance?.toLocaleString("vi-VN") || "0"} BIT
            </div>
          </Card>
        </div>
      </div>

      <TransactionDetailModal open={showModal} onClose={() => setShowModal(false)} transaction={selectedTransaction} />
    </>
  );
};
