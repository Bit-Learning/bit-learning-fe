"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, LockOpen, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "@/components/Sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateUserAccountStatus } from "../api/UserService";
import type { User } from "../data/schema";

type UserDeleteDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentRow: User;
};

export function UsersDeleteDialog({
	open,
	onOpenChange,
	currentRow,
}: UserDeleteDialogProps) {
	const queryClient = useQueryClient();
	const [value, setValue] = useState("");
	const [reason, setReason] = useState("");

	const isDisabled = currentRow.accountStatus === "DISABLED";
	const requiresReason = !isDisabled;
	const isFormValid =
		value.trim() === currentRow.email &&
		(!requiresReason || reason.trim().length > 0);

	useEffect(() => {
		if (!open) {
			setValue("");
			setReason("");
		}
	}, [open]);

	const { mutate, isPending } = useMutation({
		mutationFn: updateUserAccountStatus,
		onSuccess: async () => {
			toast.success({
				title: isDisabled
					? "Khôi phục người dùng thành công"
					: "Khóa mềm người dùng thành công",
			});
			onOpenChange(false);
			await queryClient.invalidateQueries({ queryKey: ["users"] });
		},
		onError: () => {
			toast.error({
				title: isDisabled
					? "Không thể khôi phục người dùng"
					: "Không thể khóa mềm người dùng",
			});
		},
	});

	const handleConfirm = () => {
		if (!isFormValid) return;

		mutate({
			userId: currentRow.id,
			status: isDisabled ? "ACTIVE" : "DISABLED",
			reason: isDisabled ? undefined : reason.trim(),
		});
	};

	return (
		<ConfirmDialog
			open={open}
			onOpenChange={onOpenChange}
			handleConfirm={handleConfirm}
			disabled={!isFormValid || isPending}
			isLoading={isPending}
			title={
				<span className="text-destructive">
					{isDisabled ? (
						<LockOpen
							className="stroke-destructive me-1 inline-block"
							size={18}
						/>
					) : (
						<UserX className="stroke-destructive me-1 inline-block" size={18} />
					)}
					{isDisabled ? " Mở lại người dùng" : " Khóa mềm người dùng"}
				</span>
			}
			desc={
				<div className="space-y-4">
					<p className="mb-2">
						{isDisabled ? (
							<>
								Bạn có chắc muốn mở lại tài khoản{" "}
								<span className="font-bold">{currentRow.email}</span>?
							</>
						) : (
							<>
								Bạn có chắc muốn khóa mềm tài khoản{" "}
								<span className="font-bold">{currentRow.email}</span>?
							</>
						)}
						<br />
						{isDisabled
							? "Người dùng sẽ có thể đăng nhập trở lại."
							: "Người dùng sẽ bị chặn đăng nhập nhưng dữ liệu vẫn được giữ lại."}
					</p>

					<Label className="my-2">
						Email xác nhận:
						<Input
							value={value}
							onChange={(e) => setValue(e.target.value)}
							placeholder="Nhập email để xác nhận."
						/>
					</Label>

					{!isDisabled ? (
						<Label className="my-2 block">
							Lý do khóa mềm:
							<Textarea
								value={reason}
								onChange={(e) => setReason(e.target.value)}
								placeholder="Nhập lý do khóa để gửi mail thông báo và hướng dẫn khiếu nại."
								className="mt-2 min-h-28"
							/>
						</Label>
					) : null}

					<Alert variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertTitle>Cảnh báo</AlertTitle>
						<AlertDescription>
							{isDisabled
								? "Hành động này sẽ mở lại quyền truy cập cho người dùng."
								: "Hành động này sẽ gửi email thông báo cho người dùng và cho phép họ khiếu nại."}
						</AlertDescription>
					</Alert>
				</div>
			}
			confirmText={isDisabled ? "Mở lại" : "Khóa mềm"}
			cancelBtnText="Hủy"
			destructive
		/>
	);
}
