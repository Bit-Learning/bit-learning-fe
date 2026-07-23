import React from "react";
import { AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface ConfirmModalProps {
	open: boolean;
	title: string;
	description: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: "danger" | "info";
	onConfirm: () => void;
	onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
	open,
	title,
	description,
	confirmLabel = "Xác nhận",
	cancelLabel = "Hủy",
	variant = "danger",
	onConfirm,
	onCancel,
}) => {
	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-black/40 backdrop-blur-sm"
				onClick={onCancel}
			/>
			<div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
				<div className="flex items-start gap-4 mb-5">
					<div
						className={cn(
							"shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
							variant === "danger" ? "bg-red-100" : "bg-blue-100",
						)}
					>
						{variant === "danger" ? (
							<AlertTriangle className="w-5 h-5 text-red-600" />
						) : (
							<Info className="w-5 h-5 text-blue-600" />
						)}
					</div>
					<div>
						<h3 className="text-base font-bold text-gray-900 mb-1">{title}</h3>
						<p className="text-sm text-gray-500 leading-relaxed">
							{description}
						</p>
					</div>
				</div>
				<div className="flex items-center justify-end gap-3">
					<Button
						variant="outline"
						onClick={onCancel}
						className="border-gray-200 text-gray-600 hover:bg-gray-50"
					>
						{cancelLabel}
					</Button>
					<Button
						onClick={onConfirm}
						className={cn(
							"text-white",
							variant === "danger"
								? "bg-red-600 hover:bg-red-700"
								: "bg-blue-600 hover:bg-blue-700",
						)}
					>
						{confirmLabel}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmModal;
