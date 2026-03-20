import BitCoinIcon from "@/shared/components/BitCoinIcon";
import { CheckCircle } from "lucide-react";

interface PaymentMethodCardProps {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "blue" | "orange";
  walletBalance?: number;
  totalAmount?: number;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  selected,
  onClick,
  icon,
  title,
  description,
  color,
  walletBalance,
  totalAmount,
}) => {
  const colorStyles = {
    blue: {
      border: "border-blue-600",
      bg: "bg-blue-50",
      iconBg: "bg-blue-600",
      checkColor: "text-blue-600",
    },
    orange: {
      border: "border-orange-600",
      bg: "bg-orange-50",
      iconBg: "bg-orange-500",
      checkColor: "text-orange-600",
    },
  };

  const styles = colorStyles[color];

  const isWallet = walletBalance !== undefined;
  const insufficient = isWallet && totalAmount !== undefined && walletBalance < totalAmount;

  return (
    <div
      onClick={insufficient ? undefined : onClick}
      className={`group overflow-hidden rounded-2xl border-2 transition-all ${
        insufficient
          ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
          : selected
            ? `${styles.border} ${styles.bg} cursor-pointer`
            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 cursor-pointer"
      }`}
    >
      <div className="flex items-center gap-4 p-6">
        <div
          className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl ${styles.iconBg} transition-transform ${
            !insufficient ? "group-hover:scale-105" : ""
          }`}
        >
          {icon}
        </div>

        <div className="flex-1">
          <div className="text-xl font-bold text-gray-900">{title}</div>
          <div className="text-sm text-gray-600">{description}</div>

          {isWallet && (
            <div className="mt-2 flex items-center gap-1.5">
              <BitCoinIcon size={18} />
              <span className={`text-sm font-semibold ${insufficient ? "text-red-500" : "text-amber-600"}`}>
                Số dư: {walletBalance.toLocaleString("vi-VN")} BIT
              </span>
            </div>
          )}

          {insufficient && (
            <p className="mt-1 text-xs font-medium text-red-500">
              ⚠ Không đủ số dư. Cần thêm {(totalAmount! - walletBalance).toLocaleString("vi-VN")} BIT
            </p>
          )}
        </div>

        {selected && !insufficient && <CheckCircle className={`h-8 w-8 shrink-0 ${styles.checkColor}`} />}
      </div>
    </div>
  );
};
