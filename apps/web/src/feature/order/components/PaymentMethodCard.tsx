import { CheckCircle } from "lucide-react";

interface PaymentMethodCardProps {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "blue" | "orange";
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  selected,
  onClick,
  icon,
  title,
  description,
  color,
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

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer overflow-hidden rounded-2xl border-2 transition-all ${
        selected ? `${styles.border} ${styles.bg} shadow-lg` : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-4 p-6">
        <div
          className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl ${styles.iconBg} shadow-lg transition-transform group-hover:scale-105`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-xl font-bold text-gray-900">{title}</div>
          <div className="text-sm text-gray-600">{description}</div>
        </div>
        {selected && <CheckCircle className={`h-8 w-8 shrink-0 ${styles.checkColor}`} />}
      </div>
    </div>
  );
};
