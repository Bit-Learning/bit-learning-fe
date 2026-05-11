import React, { useState } from "react";
import { Lock, Key, ShieldCheck, Save, Eye, EyeOff } from "lucide-react";
import { Card } from "@workspace/ui/components/Card";
import { Button } from "@workspace/ui/components/Button";
import { useChangePassword, useUserProfile } from "../queries/useUser";
import { toast } from "@/shared/components/Sonner";

export const PasswordContent: React.FC = () => {
	const { data: userProfile } = useUserProfile();

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmNewPassword, setConfirmNewPassword] = useState("");

	const [showCurrent, setShowCurrent] = useState(false);
	const [showNew, setShowNew] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);

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

	const inputClass =
		"w-full pl-12 pr-10 py-2 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm";

	return (
		<div className="grow space-y-4">
			<Card className="px-6 py-8 min-h-screen">
				<div className="flex items-center gap-3 mb-8">
					<div>
						<h2 className="text-2xl font-bold text-slate-900">Đổi mật khẩu</h2>
						<p className="text-md text-slate-500 mt-0.5">
							Vui lòng nhập mật khẩu hiện tại và mật khẩu mới để cập nhật.
						</p>
					</div>
				</div>

				<div className="max-w-2xl space-y-6 px-0">
					<div>
						<label className="block text-md font-semibold text-slate-700 mb-2">
							Mật khẩu hiện tại
						</label>
						<div className="relative">
							<Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
							<input
								className={inputClass}
								type={showCurrent ? "text" : "password"}
								placeholder="Nhập mật khẩu hiện tại"
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
							/>
							<button
								type="button"
								onClick={() => setShowCurrent(!showCurrent)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
							>
								{showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
							</button>
						</div>
					</div>

					<div>
						<label className="block text-md font-semibold text-slate-700 mb-2">
							Mật khẩu mới
						</label>
						<div className="relative">
							<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
							<input
								className={inputClass}
								type={showNew ? "text" : "password"}
								placeholder="Nhập mật khẩu mới"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
							/>
							<button
								type="button"
								onClick={() => setShowNew(!showNew)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
							>
								{showNew ? <EyeOff size={18} /> : <Eye size={18} />}
							</button>
						</div>
					</div>

					<div>
						<label className="block text-md font-semibold text-slate-700 mb-2">
							Xác nhận mật khẩu mới
						</label>
						<div className="relative">
							<ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
							<input
								className={inputClass}
								type={showConfirm ? "text" : "password"}
								placeholder="Xác nhận lại mật khẩu mới"
								value={confirmNewPassword}
								onChange={(e) => setConfirmNewPassword(e.target.value)}
							/>
							<button
								type="button"
								onClick={() => setShowConfirm(!showConfirm)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
							>
								{showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
							</button>
						</div>
					</div>

					<div className="pt-6 flex flex-col sm:flex-row gap-4">
						<Button
							size="lg"
							className="px-8 py-5 text-md"
							onClick={handleSubmit}
							isDisabled={changePasswordMutation.isPending}
						>
							{changePasswordMutation.isPending
								? "Đang cập nhật..."
								: "Cập nhật mật khẩu"}
						</Button>

						<Button
							variant="outline"
							size="lg"
							className="px-8 py-5 text-md"
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
			</Card>
		</div>
	);
};
