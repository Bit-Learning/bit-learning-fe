import React, { useState } from "react";
import { X, CreditCard, Wallet, QrCode, AlertCircle, CheckCircle2, Clock, XCircle, ExternalLink } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { OrderInfo, OrderStatus, PaymentMethod } from "@/feature/order/types/order.type";
import { useCancelOrder } from "@/feature/order/queries/useOrder";
import { useRegeneratePayOSUrl, useRegenerateVNPayUrl } from "@/feature/order/queries/usePayment";

interface TransactionDetailModalProps {
  open: boolean;
  onClose: () => void;
  transaction: OrderInfo | null;
}

const PAYMENT_METHODS = [
  {
    value: PaymentMethod.VNPAY,
    label: "VNPay",
    description: "Thẻ ATM, Visa, MasterCard",
    icon: CreditCard,
    color: "border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600",
    activeColor: "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
  },
  {
    value: PaymentMethod.PAYOS,
    label: "PayOS",
    description: "Quét mã QR qua app ngân hàng",
    icon: QrCode,
    color: "border-violet-200 dark:border-violet-800 hover:border-violet-400 dark:hover:border-violet-600",
    activeColor: "border-violet-500 bg-violet-50 dark:bg-violet-900/20",
  },
  {
    value: PaymentMethod.WALLET,
    label: "Ví của tôi",
    description: "Thanh toán bằng số dư ví",
    icon: Wallet,
    color: "border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600",
    activeColor: "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
  },
];

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "COMPLETED") return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
  if (status === "PENDING") return <Clock className="w-5 h-5 text-amber-500" />;
  return <XCircle className="w-5 h-5 text-rose-500" />;
};

const statusLabel: Record<string, { text: string; cls: string }> = {
  COMPLETED: {
    text: "Thành công",
    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  PENDING: { text: "Đang xử lý", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  CANCELLED: { text: "Đã hủy", cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" },
};

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ open, onClose, transaction }) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.VNPAY);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const regenerateVNPay = useRegenerateVNPayUrl();
  const regeneratePayOS = useRegeneratePayOSUrl();
  const cancelOrder = useCancelOrder();

  if (!open || !transaction) return null;

  const isPending = transaction.status === "PENDING";
  const isCompleted = transaction.status === "COMPLETED";
  const status = statusLabel[transaction.status] ?? { text: transaction.status, cls: "" };

  const handleContinuePayment = async () => {
    if (selectedMethod === PaymentMethod.VNPAY) {
      await regenerateVNPay.mutateAsync(transaction.code);
    } else if (selectedMethod === PaymentMethod.PAYOS) {
      await regeneratePayOS.mutateAsync(transaction.code);
    } else {
      await regenerateVNPay.mutateAsync(transaction.code);
    }
  };

  const handleCancel = async () => {
    await cancelOrder.mutateAsync(transaction.id);
    setShowCancelConfirm(false);
    onClose();
  };

  const isProcessing = regenerateVNPay.isPending || regeneratePayOS.isPending || cancelOrder.isPending;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <StatusIcon status={transaction.status} />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Chi tiết đơn hàng</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">#{transaction.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`text-xs px-3 ${status.cls}`}>{status.text}</Badge>
            <button
              onClick={onClose}
              className="cursor-pointer w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-3 max-h-48 overflow-y-auto">
          {transaction.details?.map((detail, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                <img
                  src={detail.course?.thumbnailUrl || "/placeholder.jpg"}
                  alt={detail.course?.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                  {detail.course?.title || "—"}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border-y border-slate-100 dark:border-slate-800">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Tổng thanh toán</span>
          <span className="text-lg font-black text-primary">{transaction.totalAmount.toLocaleString("vi-VN")}đ</span>
        </div>

        {isPending && !showCancelConfirm && (
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                Đơn hàng chưa được thanh toán. Chọn phương thức và tiếp tục hoặc hủy đơn.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Chọn phương thức thanh toán
              </p>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isActive = selectedMethod === method.value;
                  return (
                    <button
                      key={method.value}
                      onClick={() => setSelectedMethod(method.value)}
                      className={`cursor-pointer w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                        isActive ? method.activeColor : method.color + " bg-white dark:bg-slate-900"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive ? "bg-white dark:bg-slate-800 shadow-sm" : "bg-slate-100 dark:bg-slate-800"
                        }`}
                      >
                        <Icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{method.label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{method.description}</p>
                      </div>
                      {isActive && (
                        <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center shrink-0 text-blue-500">
                          <div className="w-2 h-2 rounded-full bg-current" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="cursor-pointer flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-900/20"
                onClick={() => setShowCancelConfirm(true)}
                isDisabled={isProcessing}
              >
                Hủy đơn
              </Button>
              <Button
                className="cursor-pointer flex-1 gap-2 bg-primary hover:bg-primary/90"
                size="lg"
                onClick={handleContinuePayment}
                isDisabled={isProcessing}
              >
                <ExternalLink className="w-4 h-4" />
                {isProcessing ? "Đang xử lý..." : "Tiếp tục thanh toán"}
              </Button>
            </div>
          </div>
        )}

        {isPending && showCancelConfirm && (
          <div className="px-6 py-5 space-y-4">
            <div className="text-center py-2">
              <div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <XCircle className="w-7 h-7 text-rose-500" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Xác nhận hủy đơn?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Đơn hàng <span className="font-semibold">#{transaction.code}</span> sẽ bị hủy vĩnh viễn.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="cursor-pointer  flex-1"
                onClick={() => setShowCancelConfirm(false)}
                isDisabled={cancelOrder.isPending}
              >
                Quay lại
              </Button>
              <Button
                className="cursor-pointer flex-1 bg-rose-600 hover:bg-rose-700 text-white"
                onClick={handleCancel}
                isDisabled={cancelOrder.isPending}
              >
                {cancelOrder.isPending ? "Đang hủy..." : "Xác nhận hủy"}
              </Button>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="px-6 py-5">
            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                Đơn hàng đã thanh toán thành công.
              </p>
            </div>
            <Button variant="outline" className="cursor-pointer w-full mt-4" onClick={onClose}>
              Đóng
            </Button>
          </div>
        )}

        {transaction.status === OrderStatus.FAILED && (
          <div className="px-6 py-5">
            <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-800">
              <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <p className="text-sm text-rose-700 dark:text-rose-400 font-medium">Đơn hàng này đã bị hủy.</p>
            </div>
            <Button variant="outline" className="cursor-pointer w-full mt-4" onClick={onClose}>
              Đóng
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
