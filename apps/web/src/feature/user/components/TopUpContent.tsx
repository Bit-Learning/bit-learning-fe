import { useState } from "react";
import { Wallet, CheckCircle2, TrendingUp, Loader2 } from "lucide-react";
import { useAddBalanceToWallet } from "@/feature/order/queries/usePayment";
import { useUserProfile } from "../queries/useUser";
import BitCoinIcon from "@/shared/components/BitCoinIcon";
import CardTransaction from "../../../shared/components/button/CardTransaction";
import { FcMoneyTransfer } from "react-icons/fc";

export enum PaymentMethod {
  VNPAY = "VNPAY",
  PAYOS = "PAYOS",
}

const PRESET_AMOUNTS = [
  { value: 10000, label: "10.000đ" },
  { value: 20000, label: "20.000đ" },
  { value: 50000, label: "50.000đ" },
  { value: 100000, label: "100.000đ" },
  { value: 200000, label: "200.000đ" },
  { value: 500000, label: "500.000đ" },
];

const toBIT = (vnd: number) => vnd;

const formatBIT = (bit: number) => bit.toLocaleString("vi-VN");

export const TopUpContent: React.FC = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.VNPAY);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const { mutate: addBalance, isPending } = useAddBalanceToWallet();
  const { data: userProfile } = useUserProfile();

  const currentBalance = userProfile?.wallet?.balance || 0;
  const currentBIT = toBIT(currentBalance);

  const finalAmount = customAmount ? parseInt(customAmount.replace(/\D/g, "")) : selectedAmount;

  const earnedBIT = finalAmount ? toBIT(finalAmount) : 0;
  const showLoadingOverlay = isPending || isProcessingPayment;

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value) {
      setCustomAmount(parseInt(value).toLocaleString("vi-VN"));
      setSelectedAmount(null);
    } else {
      setCustomAmount("");
    }
  };

  const handleSubmit = () => {
    if (!finalAmount || finalAmount < 10000) {
      alert("Vui lòng chọn số tiền tối thiểu 10.000đ");
      return;
    }
    if (isPending) return;
    setIsProcessingPayment(true);

    addBalance(
      { amount: finalAmount, paymentMethod },
      {
        onSuccess: () => {
          setSelectedAmount(null);
          setCustomAmount("");
          setPaymentMethod(PaymentMethod.VNPAY);
        },
        onError: () => {
          setIsProcessingPayment(false);
        },
        onSettled: () => {
          setIsProcessingPayment(false);
        },
      },
    );
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  return (
    <>
      <div className="max-w-7xl mx-auto p-6" aria-busy={showLoadingOverlay}>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FcMoneyTransfer className="w-6 h-6" />
            <h1 className="text-3xl font-bold text-gray-900">Nạp tiền vào ví</h1>
          </div>
          <p className="text-gray-600">Chọn số tiền bạn muốn nạp vào ví của mình</p>

          <div className="mt-6 bg-[#137fec] rounded-md p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-lg font-medium mb-1">Số dư hiện tại</p>

                <div className="flex items-center gap-1.5 mt-2">
                  <BitCoinIcon size={32} />
                  <span className="text-slate-100 text-3xl font-bold">{formatBIT(currentBIT)}</span>
                  <span className="text-3xl font-semibold text-amber-300">BIT</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <img src="/icons/trending-up.png" alt="trending" className="w-16 h-16 object-contain" />
              </div>
            </div>

            {finalAmount ? (
              <div className="mt-4 pt-4 border-t border-blue-500/30 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-100 flex items-center gap-1">
                    <BitCoinIcon size={18} />
                    BIT sau khi nạp
                  </span>
                  <span className="text-amber-300 font-semibold">{formatBIT(currentBIT + earnedBIT)} BIT</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Chọn số tiền</h2>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {PRESET_AMOUNTS.map((preset) => {
                  const isSelected = selectedAmount === preset.value;
                  return (
                    <button
                      key={preset.value}
                      onClick={() => handleAmountSelect(preset.value)}
                      className={`
                      cursor-pointer py-3 px-4 rounded-lg border-2 font-medium transition-all text-left
                      ${
                        isSelected
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-blue-300 text-gray-700"
                      }
                    `}
                    >
                      <div className="text-sm font-semibold">{preset.label}</div>
                      <div className={`flex items-center gap-1 mt-1 ${isSelected ? "opacity-100" : "opacity-60"}`}>
                        <BitCoinIcon size={14} />
                        <span className="text-xs font-medium text-amber-600">
                          +{toBIT(preset.value).toLocaleString("vi-VN")} BIT
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Hoặc nhập số tiền khác</label>
                <div className="relative">
                  <input
                    type="text"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    placeholder="Nhập số tiền"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">đ</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">Số tiền tối thiểu: 10.000đ</p>
                  {earnedBIT > 0 && customAmount && (
                    <div className="flex items-center gap-1 text-xs font-medium text-amber-600">
                      <BitCoinIcon size={14} />
                      <span>+{earnedBIT.toLocaleString("vi-VN")} BIT</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 bg-amber-50 rounded-lg px-4 py-2.5 border border-amber-100">
                <BitCoinIcon size={22} />
                <p className="text-xs text-amber-700 font-medium">
                  Tỷ lệ quy đổi: <span className="font-bold">1.000đ = 1.000 BIT</span>
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Phương thức thanh toán</h2>

              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod(PaymentMethod.VNPAY)}
                  className={`
                  group cursor-pointer w-full p-4 rounded-lg border-2 flex flex-col items-stretch gap-3 transition-all
                  ${
                    paymentMethod === PaymentMethod.VNPAY
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }
                `}
                >
                  <div className="flex items-center gap-4">
                    <div className="shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                      <img src="/vendors/vnpay_logo.png" alt="VNPAY logo" className="w-8 h-8 object-contain" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-900">VNPAY</div>
                      <div className="text-sm text-gray-600">Thanh toán qua VNPAY</div>
                    </div>
                    {paymentMethod === PaymentMethod.VNPAY && <CheckCircle2 className="w-6 h-6 text-blue-600" />}
                  </div>

                  <div className="grid max-h-0 grid-cols-2 gap-x-3 gap-y-1 overflow-hidden rounded-lg border border-blue-100 bg-white/70 px-3 text-xs text-gray-600 opacity-0 transition-all duration-300 group-hover:max-h-24 group-hover:py-2 group-hover:opacity-100">
                    <div>
                      <span className="font-medium text-gray-800">Cổng:</span> VNPAY
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">Xử lý:</span> Tức thì
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">Bảo mật:</span> TLS mã hóa
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">Hỗ trợ:</span> 24/7
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod(PaymentMethod.PAYOS)}
                  className={`
                  group cursor-pointer w-full p-4 rounded-lg border-2 flex flex-col items-stretch gap-3 transition-all
                  ${
                    paymentMethod === PaymentMethod.PAYOS
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }
                `}
                >
                  <div className="flex items-center gap-4">
                    <div className="shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                      <img src="/vendors/payos_logo.png" alt="PayOS logo" className="w-8 h-8 object-contain" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-900">PayOS</div>
                      <div className="text-sm text-gray-600">Thanh toán qua PayOS</div>
                    </div>
                    {paymentMethod === PaymentMethod.PAYOS && <CheckCircle2 className="w-6 h-6 text-blue-600" />}
                  </div>

                  <div className="grid max-h-0 grid-cols-2 gap-x-3 gap-y-1 overflow-hidden rounded-lg border border-blue-100 bg-white/70 px-3 text-xs text-gray-600 opacity-0 transition-all duration-300 group-hover:max-h-24 group-hover:py-2 group-hover:opacity-100">
                    <div>
                      <span className="font-medium text-gray-800">Cổng:</span> PayOS
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">Xử lý:</span> Tức thì
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">Bảo mật:</span> PCI DSS
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">Đối soát:</span> Minh bạch
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-[#137fec] rounded-xl shadow-lg p-6 text-white sticky top-6">
              <h3 className="text-2xl font-semibold mb-4 border-b-3 pb-3 border-white/30">Đơn hàng</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center pb-3 border-b border-blue-500">
                  <span className="text-blue-100">Số tiền nạp</span>
                  <span className="text-xl font-bold">{finalAmount ? formatCurrency(finalAmount) : "0đ"}</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-blue-500">
                  <span className="text-blue-100 flex items-center gap-1">
                    <BitCoinIcon size={18} />
                    <span className=" font-semibold text-amber-300">BIT</span>
                    nhận được
                  </span>
                  <span className="font-bold text-amber-300">
                    {earnedBIT > 0 ? `+${formatBIT(earnedBIT)}` : "0 BIT"}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b-3 border-white/30">
                  <span className="text-blue-100">Phí giao dịch</span>
                  <span className="font-semibold">0đ</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className=" text-blue-100">Tổng tiền </span>
                  <span className="text-xl font-bold text-yellow-400">
                    {finalAmount ? formatCurrency(finalAmount) : "0đ"}
                  </span>
                </div>
              </div>

              <CardTransaction
                onClick={handleSubmit}
                disabled={!finalAmount || finalAmount < 10000 || isPending}
                loading={isPending}
                label="Thanh toán"
              />

              <p className="text-sx text-blue-100 mt-4 text-center">Bạn sẽ được chuyển đến trang thanh toán an toàn</p>
            </div>
          </div>
        </div>
      </div>

      {showLoadingOverlay && (
        <div className="fixed inset-0 z-100 bg-slate-900/35 backdrop-blur-[1px]">
          <div className="flex h-full w-full items-center justify-center p-4">
            <div className="flex items-center gap-3 rounded-xl bg-white/95 px-5 py-3 text-sm font-medium text-slate-800 shadow-lg">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span>Đang xử lý thanh toán... vui lòng đợi</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
