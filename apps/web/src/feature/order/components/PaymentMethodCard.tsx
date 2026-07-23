import BitCoinIcon from "@/shared/components/BitCoinIcon";
import { CheckCircle2 } from "lucide-react";

interface PaymentMethodCardProps {
	selected: boolean;
	onClick: () => void;
	logoSrc?: string;
	logoAlt?: string;
	logoFallback?: React.ReactNode;
	title: string;
	description: string;
	detailRows?: { label: string; value: string }[];
	walletBalance?: number;
	totalAmount?: number;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
	selected,
	onClick,
	logoSrc,
	logoAlt,
	logoFallback,
	title,
	description,
	detailRows,
	walletBalance,
	totalAmount,
}) => {
	const isWallet = walletBalance !== undefined;
	const insufficient =
		isWallet && totalAmount !== undefined && walletBalance < totalAmount;

	return (
		<button
			type="button"
			onClick={insufficient ? undefined : onClick}
			disabled={insufficient}
			className={`group w-full rounded-xl border-2 flex flex-col items-stretch overflow-hidden transition-all text-left
        ${
					insufficient
						? "border-gray-200 bg-[#f2f3fd] opacity-60 cursor-not-allowed"
						: selected
							? "border-blue-600 bg-blue-100 cursor-pointer"
							: "border-gray-200 hover:border-blue-300 cursor-pointer"
				}`}
		>
			<div className="flex items-center gap-4 p-4">
				<div className="shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-200 overflow-hidden">
					{logoSrc ? (
						<img
							src={logoSrc}
							alt={logoAlt ?? title}
							className="w-8 h-8 object-contain"
						/>
					) : (
						logoFallback
					)}
				</div>

				<div className="flex-1 min-w-0">
					<div className="font-semibold text-gray-900">{title}</div>
					<div className="text-sm text-gray-600">{description}</div>

					{isWallet && (
						<div className="mt-1.5 flex items-center gap-1">
							<span
								className={`text-sm font-semibold ${insufficient ? "text-red-500" : "text-amber-600"}`}
							>
								Số dư: {walletBalance.toLocaleString("vi-VN")}
							</span>
							<BitCoinIcon size={18} />
						</div>
					)}

					{insufficient && (
						<p className="mt-1 text-sm font-medium text-red-500 flex items-center">
							Cần thêm {(totalAmount! - walletBalance).toLocaleString("vi-VN")}{" "}
							<BitCoinIcon size={18} />
						</p>
					)}
				</div>

				{selected && !insufficient && (
					<CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0" />
				)}
			</div>

			{detailRows && detailRows.length > 0 && (
				<div
					className={`grid grid-cols-2 gap-x-3 gap-y-1 px-4 text-xs text-gray-600 overflow-hidden rounded-b-lg border-t border-blue-100 bg-white/70
            max-h-0 opacity-0 py-0 transition-all duration-300
            ${selected || !insufficient ? "group-hover:max-h-24 group-hover:py-2 group-hover:opacity-100" : ""}
            ${selected ? "max-h-24 py-2 opacity-100" : ""}
          `}
				>
					{detailRows.map((row) => (
						<div key={row.label}>
							<span className="font-medium text-gray-800">{row.label}:</span>{" "}
							{row.value}
						</div>
					))}
				</div>
			)}
		</button>
	);
};
