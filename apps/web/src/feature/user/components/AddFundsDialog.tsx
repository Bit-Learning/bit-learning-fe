import { Button } from "@workspace/ui/components/Button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogTitle,
} from "@workspace/ui/components/update/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/update/select";
import * as React from "react";

interface AddFundsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm?: (amount: number) => void;
}

export const AddFundsDialog = ({
	open,
	onOpenChange,
	onConfirm,
}: AddFundsDialogProps) => {
	const [amount, setAmount] = React.useState<string>("");
	const [method, setMethod] = React.useState("vnpay");
	const MIN_AMOUNT = 10000;

	React.useEffect(() => {
		if (open) setAmount("");
	}, [open]);

	const parsed = Number.parseFloat(amount);
	const isNumber = !Number.isNaN(parsed);
	const valid = isNumber && parsed >= MIN_AMOUNT;

	const handleConfirm = () => {
		if (!valid) return;
		onConfirm?.(parsed);
		onOpenChange(false);
	};

	return (
		<Dialog modal open={open} onOpenChange={onOpenChange}>
			<DialogOverlay />
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Nạp tiền</DialogTitle>
				</DialogHeader>

				<div className="space-y-3">
					<DialogDescription>
						Nhập số tiền bạn muốn nạp vào ví.
					</DialogDescription>

					{/* Select phương thức nạp */}
					<div>
						<label
							htmlFor="payment-method"
							className="mb-1 block text-sm font-medium"
						>
							Phương thức nạp
						</label>
						<Select value={method} onValueChange={setMethod}>
							<SelectTrigger id="payment-method" className="w-full">
								<SelectValue placeholder="Chọn phương thức" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="vnpay">VNPAY</SelectItem>
								<SelectItem disabled value="momo">
									Momo
								</SelectItem>
								<SelectItem disabled value="zalopay">
									ZaloPay
								</SelectItem>
								<SelectItem disabled value="visa">
									Thẻ Visa/Mastercard
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Input số tiền */}
					<div>
						<input
							type="number"
							min="0"
							step="0.01"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							className="focus:ring-primary w-full rounded-md border bg-transparent px-3 py-2 outline-none focus:ring-2"
							placeholder="Số tiền (vd: 100.000)"
						/>
					</div>

					{/* Validation */}
					{amount !== "" && (!isNumber || parsed < MIN_AMOUNT) && (
						<p className="text-sm text-red-600">Số tiền tối thiểu là 10.000</p>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Hủy
					</Button>
					<Button onClick={handleConfirm} isDisabled={!valid}>
						Tiếp tục
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AddFundsDialog;
