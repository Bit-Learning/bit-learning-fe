import { useState } from "react";
import { Wallet, CreditCard, Zap, CheckCircle2, ArrowRight, TrendingUp } from "lucide-react";
import { useAddBalanceToWallet } from "@/feature/order/queries/usePayment";
import { useUserProfile } from "../queries/useUser";
import BitCoinIcon from "@/shared/components/BitCoinIcon";

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

const formatBIT = (bit: number) => bit.toLocaleString("vi-VN") + " BIT";

export const TopUpContent: React.FC = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.VNPAY);

  const { mutate: addBalance, isPending } = useAddBalanceToWallet();
  const { data: userProfile } = useUserProfile();

  const currentBalance = userProfile?.wallet?.balance || 0;
  const currentBIT = toBIT(currentBalance);

  const finalAmount = customAmount ? parseInt(customAmount.replace(/\D/g, "")) : selectedAmount;

  const earnedBIT = finalAmount ? toBIT(finalAmount) : 0;

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
    addBalance(
      { amount: finalAmount, paymentMethod },
      {
        onSuccess: () => {
          setSelectedAmount(null);
          setCustomAmount("");
          setPaymentMethod(PaymentMethod.VNPAY);
        },
      },
    );
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Wallet className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Nạp tiền vào ví</h1>
        </div>
        <p className="text-gray-600">Chọn số tiền bạn muốn nạp vào ví của mình</p>

        <div className="mt-6 bg-blue-600 rounded-md p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Số dư hiện tại</p>

              <div className="flex items-center gap-1.5 mt-2">
                <BitCoinIcon size={32} />
                <span className="text-blue-100 text-lg font-medium">{formatBIT(currentBIT)}</span>
              </div>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>

          {finalAmount ? (
            <div className="mt-4 pt-4 border-t border-blue-500/30 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-100 flex items-center gap-1">
                  <BitCoinIcon size={18} />
                  BIT sau khi nạp
                </span>
                <span className="text-amber-300 font-semibold">{formatBIT(currentBIT + earnedBIT)}</span>
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
                  cursor-pointer w-full p-4 rounded-lg border-2 flex items-center gap-4 transition-all
                  ${
                    paymentMethod === PaymentMethod.VNPAY
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }
                `}
              >
                <div className="shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-900">VNPAY</div>
                  <div className="text-sm text-gray-600">Thanh toán qua VNPAY</div>
                </div>
                {paymentMethod === PaymentMethod.VNPAY && <CheckCircle2 className="w-6 h-6 text-blue-600" />}
              </button>

              <button
                onClick={() => setPaymentMethod(PaymentMethod.PAYOS)}
                className={`
                  cursor-pointer w-full p-4 rounded-lg border-2 flex items-center gap-4 transition-all
                  ${
                    paymentMethod === PaymentMethod.PAYOS
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }
                `}
              >
                <div className="shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-900">PayOS</div>
                  <div className="text-sm text-gray-600">Thanh toán qua PayOS</div>
                </div>
                {paymentMethod === PaymentMethod.PAYOS && <CheckCircle2 className="w-6 h-6 text-blue-600" />}
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-blue-700 rounded-xl shadow-lg p-6 text-white sticky top-6">
            <h3 className="text-lg font-semibold mb-4">Tóm tắt</h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center pb-3 border-b border-blue-500">
                <span className="text-blue-100">Số tiền nạp</span>
                <span className="text-xl font-bold">{finalAmount ? formatCurrency(finalAmount) : "0đ"}</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-blue-500">
                <span className="text-blue-100 flex items-center gap-1">
                  <BitCoinIcon size={16} />
                  BIT nhận được
                </span>
                <span className="font-bold text-amber-300">{earnedBIT > 0 ? `+${formatBIT(earnedBIT)}` : "0 BIT"}</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-blue-500">
                <span className="text-blue-100">Phí giao dịch</span>
                <span className="font-semibold">0đ</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-blue-100">Tổng tiền </span>
                <span className="text-2xl font-bold">
                  {finalAmount ? formatCurrency(currentBalance + finalAmount) : formatCurrency(currentBalance)}
                </span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!finalAmount || finalAmount < 10000 || isPending}
              className="cursor-pointer w-full bg-white text-blue-600 py-3 px-4 rounded-lg font-semibold
                         hover:bg-blue-50 transition-colors disabled:opacity-50
                         disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                "Đang xử lý..."
              ) : (
                <>
                  Thanh toán
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <p className="text-xs text-blue-100 mt-4 text-center">Bạn sẽ được chuyển đến trang thanh toán an toàn</p>
          </div>
        </div>
      </div>
    </div>
  );
};
