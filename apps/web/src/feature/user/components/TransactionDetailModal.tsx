import React from "react";
import { X, CheckCircle2, Wallet, Printer } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";

interface TransactionDetailModalProps {
  open: boolean;
  onClose: () => void;
  transaction: any;
}

export const TransactionDetailModal = ({ open, onClose, transaction }: TransactionDetailModalProps) => {
  if (!open || !transaction) return null;

  const getStatusBadge = (status: string) => {
    if (status === "COMPLETED")
      return { variant: "default" as const, text: "Thành công", class: "bg-emerald-100 text-emerald-700" };
    if (status === "PENDING")
      return { variant: "secondary" as const, text: "Đang xử lý", class: "bg-amber-100 text-amber-700" };
    return { variant: "destructive" as const, text: "Đã hủy", class: "bg-rose-100 text-rose-700" };
  };

  const statusInfo = getStatusBadge(transaction.status);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-140 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Chi tiết đơn hàng #{transaction.orderCode}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-emerald-900">Trạng thái đơn hàng</span>
            </div>
            <Badge className={`text-sm px-4 ${statusInfo.class}`}>{statusInfo.text}</Badge>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Danh sách khóa học</h3>
            <div className="flex gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
              <div className="size-20 rounded-lg overflow-hidden shrink-0">
                <img
                  alt="Course"
                  className="w-full h-full object-cover"
                  src={transaction.courseImage || "/placeholder.jpg"}
                />
              </div>
              <div className="grow">
                <p className="text-[12px] font-bold text-primary mb-1 uppercase">
                  {transaction.courseCategory || "Khóa học"}
                </p>
                <h4 className="font-bold text-slate-900 mb-1 leading-snug">{transaction.courseName}</h4>
                <p className="font-bold text-[#005baa]">{transaction.totalAmount.toLocaleString("vi-VN")}đ</p>
              </div>
            </div>
          </div>

          <div className="mb-8 bg-slate-50 rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Mã giao dịch:</span>
              <span className="font-medium text-slate-900">{transaction.transactionId || "N/A"}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Phương thức thanh toán:</span>
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="font-medium text-slate-900">{transaction.paymentMethod || "Ví bit learning"}</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Thời gian:</span>
              <span className="font-medium text-slate-900">
                {new Date(transaction.createdAt).toLocaleString("vi-VN")}
              </span>
            </div>
          </div>

          <div className="space-y-3 border-t border-dashed border-slate-200 pt-5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Tạm tính:</span>
              <span className="font-medium text-slate-900">{transaction.totalAmount.toLocaleString("vi-VN")}đ</span>
            </div>
            <div className="flex justify-between items-center text-sm text-emerald-600">
              <span>Giảm giá (Voucher):</span>
              <span className="font-medium">- {(transaction.discount || 0).toLocaleString("vi-VN")}đ</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-base font-bold text-slate-900">Tổng thanh toán:</span>
              <span className="text-xl font-bold text-primary">{transaction.totalAmount.toLocaleString("vi-VN")}đ</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex gap-3">
          <Button variant="outline" className="flex-1">
            <Printer className="w-5 h-5 mr-2" />
            In hóa đơn
          </Button>
          <Button className="flex-1" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};
