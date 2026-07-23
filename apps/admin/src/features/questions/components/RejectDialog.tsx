import { useState } from "react";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface RejectDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (reason: string) => void;
	count: number;
	isPending?: boolean;
}

export function RejectDialog({
	open,
	onOpenChange,
	onConfirm,
	count,
	isPending = false,
}: RejectDialogProps) {
	const [reason, setReason] = useState("");

	const handleConfirm = () => {
		if (!reason.trim()) {
			toast.error("Vui lòng nhập lý do từ chối", {
				description:
					"Lý do từ chối là bắt buộc khi từ chối câu hỏi. Vui lòng cung cấp lý do để người gửi có thể chỉnh sửa lại.",
			});
			return;
		}
		onConfirm(reason);
	};

	const handleOpenChange = (o: boolean) => {
		if (isPending) return;
		if (!o) setReason("");
		onOpenChange(o);
	};

	return (
		<AlertDialog open={open} onOpenChange={handleOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Từ chối câu hỏi</AlertDialogTitle>
					<AlertDialogDescription>
						Bạn đang từ chối{" "}
						<span className="font-semibold text-foreground">{count}</span> câu
						hỏi. Vui lòng nhập lý do để người gửi có thể chỉnh sửa lại.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<div className="space-y-2">
					<Label htmlFor="reason">Lý do từ chối *</Label>
					<Textarea
						id="reason"
						placeholder="Ví dụ: Câu hỏi chưa rõ ràng, cần bổ sung thêm thông tin..."
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						rows={4}
						disabled={isPending}
					/>
				</div>

				<AlertDialogFooter>
					<AlertDialogCancel onClick={() => setReason("")} disabled={isPending}>
						Hủy
					</AlertDialogCancel>
					<Button
						onClick={handleConfirm}
						disabled={isPending}
						className="bg-destructive hover:bg-destructive/90 gap-2 text-white"
					>
						{isPending ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Đang xử lý...
							</>
						) : (
							<>
								<XCircle className="h-4 w-4" />
								Xác nhận từ chối
							</>
						)}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
