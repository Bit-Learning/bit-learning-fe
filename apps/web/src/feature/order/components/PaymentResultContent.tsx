import { useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/Card";
import { CheckCircle, XCircle, Package, Calendar, CreditCard, Home, AlertCircle, Loader2 } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

type PaymentStatus = "loading" | "success" | "failed";

interface DisplayInfo {
  orderCode: string;
  transactionId: string;
  errorMessage: string;
}

const PaymentResultContent: React.FC = () => {
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false }) as Record<string, string>;

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("loading");
  const [displayInfo, setDisplayInfo] = useState<DisplayInfo>({
    orderCode: "",
    transactionId: "",
    errorMessage: "",
  });

  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const isVNPay = "vnp_ResponseCode" in searchParams;
    const isPayOS = "status" in searchParams;

    const process = async () => {
      if (isPayOS) {
        const isCancelled = searchParams.cancel === "true" || searchParams.status === "CANCELLED";
        const isPaid = searchParams.status === "PAID" && !isCancelled;

        setDisplayInfo({
          orderCode: searchParams.orderCode ?? "",
          transactionId: searchParams.id ?? "",
          errorMessage: isCancelled
            ? "Bạn đã hủy giao dịch. Vui lòng thử lại nếu muốn tiếp tục thanh toán."
            : "Có lỗi xảy ra trong quá trình thanh toán. Vui lòng kiểm tra lại thông tin thẻ hoặc liên hệ ngân hàng.",
        });
        setPaymentStatus(isPaid ? "success" : "failed");
        return;
      }

      if (isVNPay) {
        const baseInfo: DisplayInfo = {
          orderCode: searchParams.vnp_OrderInfo ?? "",
          transactionId: searchParams.vnp_TransactionNo ?? "",
          errorMessage:
            "Có lỗi xảy ra trong quá trình thanh toán. Vui lòng kiểm tra lại thông tin thẻ hoặc liên hệ ngân hàng.",
        };

        try {
          setDisplayInfo(baseInfo);
          setPaymentStatus(searchParams.vnp_ResponseCode === "00" ? "success" : "failed");
        } catch {
          setDisplayInfo({
            ...baseInfo,
            errorMessage: "Không thể xác minh giao dịch. Vui lòng liên hệ hỗ trợ.",
          });
          setPaymentStatus("failed");
        }
        return;
      }

      setDisplayInfo({
        orderCode: "",
        transactionId: "",
        errorMessage: "Không tìm thấy thông tin giao dịch. Vui lòng liên hệ hỗ trợ.",
      });
      setPaymentStatus("failed");
    };

    process();
  }, [searchParams]);

  const isPaid = paymentStatus === "success";

  if (paymentStatus === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 via-blue-50 to-indigo-50 p-4">
        <div className="text-center">
          <Loader2 className="mx-auto mb-6 h-16 w-16 animate-spin text-blue-600" />
          <p className="text-lg font-medium text-gray-700">Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-200 items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card
          className={`overflow-hidden rounded-md p-0 border-2 ${isPaid ? "border-green-500" : "border-red-500"}`}
          style={{ animation: "slideUp 0.6s ease-out" }}
        >
          {" "}
          <CardHeader className={`px-8 py-10 text-center ${isPaid ? "bg-green-600" : "bg-red-600"}`}>
            <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full ${isPaid ? "bg-green-400/30" : "bg-red-400/30"} animate-ping`}
              />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                {isPaid ? (
                  <CheckCircle className="h-12 w-12 text-white" strokeWidth={2.5} />
                ) : (
                  <XCircle className="h-12 w-12 text-white" strokeWidth={2.5} />
                )}
              </div>
            </div>

            <h1 className="mb-3 text-4xl font-black text-white">
              {isPaid ? "Thanh toán thành công!" : "Thanh toán thất bại"}
            </h1>
            <p className="text-lg text-white/90">
              {isPaid ? "Đơn hàng của bạn đã được xác nhận" : "Giao dịch đã bị hủy hoặc không thành công"}
            </p>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            <div className="space-y-4 rounded-xl bg-gray-50 p-5 border border-gray-400">
              <h2 className="text-lg font-bold text-gray-900">Thông tin đơn hàng</h2>
              <div className="space-y-3">
                <InfoRow
                  icon={<Package className="h-5 w-5" />}
                  label="Mã đơn hàng"
                  value={displayInfo.orderCode || "—"}
                />
                <InfoRow
                  icon={<CreditCard className="h-5 w-5" />}
                  label="Mã giao dịch"
                  value={displayInfo.transactionId ? `#${displayInfo.transactionId}` : "—"}
                />
                <InfoRow
                  icon={<Calendar className="h-5 w-5" />}
                  label="Thời gian"
                  value={new Date().toLocaleString("vi-VN")}
                />
              </div>
            </div>

            {!isPaid && (
              <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 shrink-0 text-red-600" />
                  <div>
                    <h3 className="mb-2 font-bold text-red-900">Giao dịch không thành công</h3>
                    <p className="text-sm text-red-700">{displayInfo.errorMessage}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 pt-4">
              <Button
                onClick={() => navigate({ to: "/" })}
                variant="outline"
                className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-gray-400 bg-white py-6 text-lg font-semibold text-gray-900 transition-all hover:border-gray-400 hover:bg-gray-50"
              >
                <Home className="h-6 w-6" />
                Về trang chủ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
};

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3 text-gray-600">
      {icon}
      <span className="font-medium">{label}</span>
    </div>
    <span className="font-bold text-gray-900">{value}</span>
  </div>
);

export default PaymentResultContent;
