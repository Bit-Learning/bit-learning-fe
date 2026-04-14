import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { X, Wallet, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { OrderInfo, OrderStatus, PaymentMethod } from "@/feature/order/types/order.type";
import { useCancelOrder } from "@/feature/order/queries/useOrder";
import { useRegeneratePayOSUrl, useRegenerateVNPayUrl, useReorderWithWallet } from "@/feature/order/queries/usePayment";
import { useUserProfile } from "@/feature/user/queries/useUser";
import BitCoinIcon from "@/shared/components/BitCoinIcon";
import { formatCurrency } from "@/shared/lib/currency";

interface TransactionDetailModalProps {
  open: boolean;
  onClose: () => void;
  transaction: OrderInfo | null;
}

const PAYMENT_METHODS_MAP = {
  [PaymentMethod.VNPAY]: {
    label: "VNPay",
    description: "Thẻ ATM, Visa, MasterCard",
    renderIcon: () => (
      <div className="shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-200">
        <img src="/vendors/vnpay_logo.png" alt="VNPAY" className="w-8 h-8 object-contain" />
      </div>
    ),
    activeColor: "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
  },
  [PaymentMethod.PAYOS]: {
    label: "PayOS",
    description: "Quét mã QR qua app ngân hàng",
    renderIcon: () => (
      <div className="shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-200">
        <img src="/vendors/payos_logo.png" alt="PayOS" className="w-8 h-8 object-contain" />
      </div>
    ),
    activeColor: "border-violet-500 bg-violet-50 dark:bg-violet-900/20",
  },
  [PaymentMethod.WALLET]: {
    label: "Ví của tôi",
    description: "Thanh toán bằng số dư ví",
    renderIcon: () => (
      <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-emerald-100 dark:bg-emerald-900/30">
        <Wallet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
      </div>
    ),
    activeColor: "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
  },
};

const statusLabel: Record<string, { text: string; cls: string }> = {
  COMPLETED: {
    text: "Thành công",
    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  PENDING: {
    text: "Đang xử lý",
    cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  FAILED: {
    text: "Đã hủy/Thất bại",
    cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  },
};

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ open, onClose, transaction }) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const navigate = useNavigate();

  const regenerateVNPay = useRegenerateVNPayUrl();
  const regeneratePayOS = useRegeneratePayOSUrl();
  const cancelOrder = useCancelOrder();
  const reorderWithWallet = useReorderWithWallet();
  const { data: userProfile } = useUserProfile();

  if (!open || !transaction) return null;

  const currentMethod = transaction.paymentMethod as PaymentMethod;
  const methodInfo = PAYMENT_METHODS_MAP[currentMethod];
  const walletBalance = userProfile?.wallet?.balance ?? 0;

  const isPending = transaction.status === OrderStatus.PENDING;
  const isCompleted = transaction.status === OrderStatus.COMPLETED;
  const isCancelledOrFailed = transaction.status === OrderStatus.FAILED;
  const status = statusLabel[transaction.status] ?? { text: transaction.status, cls: "" };

  const isWalletPayment = currentMethod === PaymentMethod.WALLET;
  const isWalletInsufficient = isWalletPayment && walletBalance < transaction.totalAmount;
  const walletShortfall = Math.max(0, transaction.totalAmount - walletBalance);

  const handleContinuePayment = async () => {
    if (currentMethod === PaymentMethod.WALLET) {
      await reorderWithWallet.mutateAsync(transaction.code);
      onClose();
    } else if (currentMethod === PaymentMethod.VNPAY) {
      await regenerateVNPay.mutateAsync(transaction.code);
    } else if (currentMethod === PaymentMethod.PAYOS) {
      await regeneratePayOS.mutateAsync(transaction.code);
    }
  };

  const handleCancel = async () => {
    await cancelOrder.mutateAsync(transaction.id);
    setShowCancelConfirm(false);
    onClose();
  };

  const handleNavigateToTopUp = () => {
    onClose();
    navigate({ to: "/profile/top-up" });
  };

  const isProcessing =
    regenerateVNPay.isPending || regeneratePayOS.isPending || cancelOrder.isPending || reorderWithWallet.isPending;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Chi tiết đơn hàng</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">#{transaction.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`text-sm px-3 ${status.cls}`}>{status.text}</Badge>
            <button
              onClick={onClose}
              className="cursor-pointer w-10 h-10 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-3 max-h-48 overflow-y-auto">
          {transaction.details?.map((detail, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-20 h-12 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-slate-700">
                <img
                  src={detail.course?.thumbnailUrl || "/placeholder.jpg"}
                  alt={detail.course?.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-md font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                  {detail.course?.title || "—"}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border-y border-slate-100 dark:border-slate-800">
          <span className="text-md font-medium text-slate-600 dark:text-slate-400">Tổng thanh toán</span>
          <span className="text-lg font-black text-primary">{formatCurrency(transaction.totalAmount)}</span>
        </div>

        <div className="px-6 py-5">
          {isPending && !showCancelConfirm && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Phương thức thanh toán đã chọn
                </p>
                {methodInfo && (
                  <div className={`flex items-center gap-3 p-4 rounded-xl border-2 ${methodInfo.activeColor}`}>
                    {methodInfo.renderIcon()}
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{methodInfo.label}</p>
                      <p className="text-sm text-slate-500">{methodInfo.description}</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  </div>
                )}
              </div>

              {isWalletPayment && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <BitCoinIcon size={18} />
                      <span className="text-sm font-medium">Số dư ví:</span>
                    </div>
                    <span className="font-bold">{walletBalance.toLocaleString("vi-VN")} BIT</span>
                  </div>
                  {isWalletInsufficient && (
                    <div className="flex items-start gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 text-rose-700 text-sm">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <p>
                        Thiếu <b>{walletShortfall.toLocaleString("vi-VN")} BIT</b>.
                        <button
                          onClick={handleNavigateToTopUp}
                          className="ml-1 underline font-bold hover:text-rose-800"
                        >
                          Nạp tiền ngay
                        </button>
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 py-6 border-rose-200 text-md text-rose-600 hover:bg-rose-50 rounded-xl"
                  onClick={() => setShowCancelConfirm(true)}
                  isDisabled={isProcessing}
                >
                  Hủy đơn
                </Button>
                <Button
                  className="flex-1 py-6 bg-primary rounded-xl text-md"
                  onClick={handleContinuePayment}
                  isDisabled={isProcessing || isWalletInsufficient}
                >
                  {isProcessing ? "Đang xử lý..." : "Tiếp tục thanh toán"}
                </Button>
              </div>
            </div>
          )}

          {isPending && showCancelConfirm && (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-rose-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Xác nhận hủy đơn hàng?</h3>
                <p className="text-slate-500">Hành động này không thể hoàn tác.</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 text-md py-6 border-slate-400 rounded-xl"
                  onClick={() => setShowCancelConfirm(false)}
                  isDisabled={cancelOrder.isPending}
                >
                  Quay lại
                </Button>
                <Button
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-md py-6 rounded-xl"
                  onClick={handleCancel}
                  isDisabled={cancelOrder.isPending}
                >
                  {cancelOrder.isPending ? "Đang hủy..." : "Xác nhận hủy"}
                </Button>
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="text-center space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <p className="text-emerald-700 font-medium">Thanh toán hoàn tất. Bạn đã có thể học ngay!</p>
              </div>
              <Button className="w-full py-6 rounded-xl text-md" onClick={onClose}>
                Đóng
              </Button>
            </div>
          )}

          {isCancelledOrFailed && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-3">
                <XCircle className="w-6 h-6 text-slate-500" />
                <p className="text-slate-600 dark:text-slate-400 font-medium">Đơn hàng đã đóng (Hủy hoặc Thất bại).</p>
              </div>
              <Button variant="outline" className="w-full py-6" onClick={onClose}>
                Đóng
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
