import React, { useState } from "react";
import { Lock, Key, ShieldCheck, Save, Info } from "lucide-react";
import { Card } from "@workspace/ui/components/Card";
import { Button } from "@workspace/ui/components/Button";
import { Input } from "@workspace/ui/components/Input";
import { useChangePassword, useUserProfile } from "../queries/useUser";
import { toast } from "@/shared/components/Sonner";

export const PasswordContent: React.FC = () => {
	const { data: userProfile } = useUserProfile();
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmNewPassword, setConfirmNewPassword] = useState("");

	const changePasswordMutation = useChangePassword();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (newPassword !== confirmNewPassword) {
			toast.error({
				title: "Mật khẩu không khớp",
				description: "Vui lòng xác nhận lại mật khẩu mới",
			});
			return;
		}

		if (newPassword.length < 8) {
			toast.error({
				title: "Mật khẩu quá ngắn",
				description: "Mật khẩu phải có ít nhất 8 ký tự",
			});
			return;
		}

		changePasswordMutation.mutate(
			{
				email: userProfile?.email || "",
				currentPassword,
				newPassword,
				confirmNewPassword,
			},
			{
				onSuccess: () => {
					setCurrentPassword("");
					setNewPassword("");
					setConfirmNewPassword("");
				},
			},
		);
	};

	return (
		<div className="grow space-y-8">
			<Card className="p-8 md:p-10">
				<div className="flex items-center gap-3 mb-8">
					<div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
						<Lock className="w-7 h-7 text-primary" />
					</div>
					<div>
						<h2 className="text-2xl font-bold text-slate-900">Đổi mật khẩu</h2>
						<p className="text-sm text-slate-500 mt-0.5">
							Vui lòng nhập mật khẩu hiện tại và mật khẩu mới để cập nhật.
						</p>
					</div>
				</div>

				<div className="max-w-xl space-y-6">
					<div className="space-y-2">
						<label className="text-sm font-semibold text-slate-700">
							Mật khẩu hiện tại
						</label>
						<div className="relative">
							<Key className="absolute inset-y-0 left-0 flex items-center ml-4 mt-2 text-slate-400 w-5 h-5" />
							<Input
								className="pl-11"
								type="password"
								placeholder="Nhập mật khẩu hiện tại"
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-semibold text-slate-700">
							Mật khẩu mới
						</label>
						<div className="relative">
							<Lock className="absolute inset-y-0 left-0 flex items-center ml-4 mt-2 text-slate-400 w-5 h-5" />
							<Input
								className="pl-11"
								type="password"
								placeholder="Nhập mật khẩu mới"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
							/>
						</div>
						<p className="text-[12px] text-slate-400">
							Mật khẩu phải bao gồm ít nhất 8 ký tự, bao gồm chữ cái và số.
						</p>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-semibold text-slate-700">
							Xác nhận mật khẩu mới
						</label>
						<div className="relative">
							<ShieldCheck className="absolute inset-y-0 left-0 flex items-center ml-4 mt-2 text-slate-400 w-5 h-5" />
							<Input
								className="pl-11"
								type="password"
								placeholder="Xác nhận lại mật khẩu mới"
								value={confirmNewPassword}
								onChange={(e) => setConfirmNewPassword(e.target.value)}
							/>
						</div>
					</div>

					<div className="pt-6 flex flex-col sm:flex-row gap-4">
						<Button
							size="lg"
							className="px-10"
							onClick={handleSubmit}
							isDisabled={changePasswordMutation.isPending}
						>
							<Save className="w-5 h-5 mr-2" />
							{changePasswordMutation.isPending
								? "Đang cập nhật..."
								: "Cập nhật mật khẩu"}
						</Button>
						<Button
							variant="outline"
							size="lg"
							className="px-10"
							onClick={() => {
								setCurrentPassword("");
								setNewPassword("");
								setConfirmNewPassword("");
							}}
						>
							Hủy bỏ
						</Button>
					</div>
				</div>

				<div className="mt-12 p-6 rounded-2xl bg-amber-50 border border-amber-100">
					<div className="flex gap-4">
						<Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
						<div>
							<h4 className="text-sm font-bold text-amber-900">
								Lưu ý bảo mật
							</h4>
							<p className="text-sm text-amber-800/80 mt-1 leading-relaxed">
								Sau khi đổi mật khẩu thành công, bạn có thể phải đăng nhập lại
								trên tất cả các thiết bị đang hoạt động để đảm bảo tính an toàn
								cho tài khoản của mình.
							</p>
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
};
