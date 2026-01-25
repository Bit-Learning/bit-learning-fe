import { CheckCircle } from "lucide-react";
import { PaymentMethod } from "../types/order.type";

interface PaymentMethodCardProps {
  method: PaymentMethod;
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  bgGradient: string;
  iconBg: string;
  checkColor: string;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  selected,
  onClick,
  icon,
  title,
  description,
  borderColor,
  bgGradient,
  iconBg,
  checkColor,
}) => {
  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer overflow-hidden rounded-2xl border-2 transition-all ${
        selected ? `${borderColor} ${bgGradient} shadow-lg` : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-4 p-6">
        <div
          className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl ${iconBg} shadow-lg transition-transform group-hover:scale-105`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-xl font-bold text-gray-900">{title}</div>
          <div className="text-sm text-gray-600">{description}</div>
        </div>
        {selected && <CheckCircle className={`h-8 w-8 shrink-0 ${checkColor}`} />}
      </div>
    </div>
  );
};
