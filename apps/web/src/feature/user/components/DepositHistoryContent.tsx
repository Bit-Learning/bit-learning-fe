import React, { useState } from "react";
import { CreditCard, QrCode, ExternalLink, AlertCircle, X, Wallet, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card } from "@workspace/ui/components/Card";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { cn } from "@workspace/ui/lib/utils";
import { useMyDepositHistory } from "@/feature/order/queries/useOrder";
import { useRegeneratePayOSUrl, useRegenerateVNPayUrl } from "@/feature/order/queries/usePayment";
import { TransactionInfo, TransactionStatus } from "@/feature/order/types/payment.type";
import { PaymentMethod } from "@/feature/order/types/order.type";
import { Pagination } from "@/shared/components/Pagination";
import Loader from "@workspace/ui/components/loader/TerminalLoader";

const PAGE_SIZE = 10;

const STATUS_CONFIG = {
  [TransactionStatus.COMPLETED]: { text: "Thành công", cls: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  [TransactionStatus.PENDING]: { text: "Đang xử lý", cls: "bg-amber-100 text-amber-700", icon: Clock },
  [TransactionStatus.FAILED]: { text: "Thất bại", cls: "bg-rose-100 text-rose-700", icon: XCircle },
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

export const DepositHistoryContent: React.FC = () => {
  const [page, setPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState<TransactionInfo | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.VNPAY);

  const { data, isLoading } = useMyDepositHistory({
    page: page - 1,
    size: PAGE_SIZE,
    sort: "createdAt",
    direction: "DESC",
  });

  const regenerateVNPay = useRegenerateVNPayUrl();
  const regeneratePayOS = useRegeneratePayOSUrl();

  const transactions: TransactionInfo[] = data?.data ?? [];
  const totalPages = data?.page?.totalPages ?? 1;
  const isProcessing = regenerateVNPay.isPending || regeneratePayOS.isPending;

  const totalDeposited = transactions
    .filter((tx) => tx.status === TransactionStatus.COMPLETED)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const handleContinue = async () => {
    if (!selectedTx) return;
    if (selectedMethod === PaymentMethod.VNPAY) {
      await regenerateVNPay.mutateAsync(selectedTx.code);
    } else {
      await regeneratePayOS.mutateAsync(selectedTx.code);
    }
  };

  return (
    <>
      <div className="grow space-y-8">
        <Card className="p-8 min-h-screen">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Lịch sử nạp tiền</h2>
                <p className="text-sm text-slate-500">Xem lại tất cả các giao dịch nạp tiền của bạn</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span className="text-md font-bold text-emerald-900">Tổng đã nạp:</span>
              <span className="text-xl font-bold text-emerald-700">{formatCurrency(totalDeposited)}</span>
            </div>
          </div>

          {isLoading ? (
            <Loader />
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-slate-500">Chưa có giao dịch nào</div>
          ) : (
            <>
              <div className="overflow-x-auto px-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-4 pt-0 font-semibold uppercase text-slate-800 text-sm">Mã Đơn Hàng</th>
                      <th className="pb-4 pt-0 font-semibold uppercase text-slate-800 text-sm">Số tiền</th>
                      <th className="pb-4 pt-0 font-semibold uppercase text-slate-800 text-sm">Trạng thái</th>
                      <th className="pb-4 pt-0" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {transactions.map((tx) => {
                      const status = STATUS_CONFIG[tx.status];
                      const StatusIcon = status.icon;
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-5 font-bold text-slate-900 text-[14px]">#{tx.code}</td>
                          <td className="py-5 font-bold text-primary text-[14px]">{formatCurrency(tx.amount)}</td>
                          <td className="py-5">
                            <Badge className={`text-sm px-3 flex items-center gap-1.5 w-fit ${status.cls}`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {status.text}
                            </Badge>
                          </td>
                          <td className="text-center">
                            {tx.status === TransactionStatus.PENDING && (
                              <Button
                                size="lg"
                                className="cursor-pointer gap-1.5 bg-primary hover:bg-primary/90 text-xs"
                                onClick={() => {
                                  setSelectedTx(tx);
                                  setSelectedMethod(PaymentMethod.VNPAY);
                                }}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Thanh toán tiếp
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
            </>
          )}
        </Card>
      </div>

      {selectedTx && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedTx(null);
          }}
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Tiếp tục thanh toán</h2>
                <p className="text-xs text-slate-500 mt-0.5">#{selectedTx.code}</p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="cursor-pointer w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-sm text-slate-500">Số tiền nạp</span>
              <span className="text-xl font-black text-primary">{formatCurrency(selectedTx.amount)}</span>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Giao dịch chưa hoàn tất. Chọn phương thức và tiếp tục thanh toán.
                </p>
              </div>

              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Chọn phương thức thanh toán
              </p>

              <div className="space-y-2">
                {[
                  {
                    value: PaymentMethod.VNPAY,
                    label: "VNPay",
                    desc: "Thẻ ATM, Visa, MasterCard",
                    Icon: CreditCard,
                    active: "border-blue-500 bg-blue-50",
                    idle: "border-blue-200 hover:border-blue-400",
                  },
                  {
                    value: PaymentMethod.PAYOS,
                    label: "PayOS",
                    desc: "Quét mã QR qua app ngân hàng",
                    Icon: QrCode,
                    active: "border-violet-500 bg-violet-50",
                    idle: "border-violet-200 hover:border-violet-400",
                  },
                ].map(({ value, label, desc, Icon, active, idle }) => {
                  const isActive = selectedMethod === value;
                  return (
                    <button
                      key={value}
                      onClick={() => setSelectedMethod(value)}
                      className={cn(
                        "cursor-pointer w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all bg-white",
                        isActive ? active : idle,
                      )}
                    >
                      <div
                        className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                          isActive ? "bg-white shadow-sm" : "bg-slate-100",
                        )}
                      >
                        <Icon className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{label}</p>
                        <p className="text-xs text-slate-500">{desc}</p>
                      </div>
                      {isActive && (
                        <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center shrink-0">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <Button
                className="cursor-pointer w-full gap-2 bg-primary hover:bg-primary/90"
                size="lg"
                onClick={handleContinue}
                isDisabled={isProcessing}
              >
                <ExternalLink className="w-4 h-4" />
                {isProcessing ? "Đang xử lý..." : "Tiếp tục thanh toán"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DepositHistoryContent;
