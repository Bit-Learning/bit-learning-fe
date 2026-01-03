import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/Button";
import { toast } from "@workspace/ui/components/Sonner";
import { Shield, ShieldCheck, ShieldOff } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Disable2FA } from "../api/auth.api";
import Enable2FAComponent from "./Enable2FA";

interface TwoFactorSettingsProps {
	is2FAEnabled: boolean;
	userEmail?: string;
}

const TwoFactorSettings: React.FC<TwoFactorSettingsProps> = ({
	is2FAEnabled,
	userEmail,
}) => {
	const [showEnable2FA, setShowEnable2FA] = useState(false);
	const [showDisableConfirm, setShowDisableConfirm] = useState(false);
	const queryClient = useQueryClient();

	const disableMutation = useMutation({
		mutationFn: Disable2FA,
		onSuccess: () => {
			toast.success({
				title: "Thành công",
				description: "Xác thực hai yếu tố đã được tắt",
			});
			queryClient.invalidateQueries({ queryKey: ["userProfile"] });
			setShowDisableConfirm(false);
		},
		onError: (error: any) => {
			toast.error({
				title: "Lỗi",
				description:
					error.response?.data?.message || "Không thể tắt xác thực hai yếu tố",
			});
		},
	});

	const handleDisable = () => {
		disableMutation.mutate();
	};

	if (showEnable2FA) {
		return (
			<Enable2FAComponent
				onSuccess={() => {
					setShowEnable2FA(false);
					queryClient.invalidateQueries({ queryKey: ["userProfile"] });
				}}
				onCancel={() => setShowEnable2FA(false)}
			/>
		);
	}

	return (
		<div className="mx-auto w-full max-w-2xl">
			<div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
				<div className="flex items-start gap-4">
					<div
						className={`flex h-12 w-12 items-center justify-center rounded-xl ${
							is2FAEnabled ? "bg-green-100" : "bg-gray-100"
						}`}
					>
						{is2FAEnabled ? (
							<ShieldCheck className="h-6 w-6 text-green-600" />
						) : (
							<Shield className="h-6 w-6 text-gray-600" />
						)}
					</div>

					<div className="flex-1">
						<h3 className="text-lg font-semibold text-gray-900">
							Xác thực hai yếu tố (2FA)
						</h3>
						<p className="mt-1 text-sm text-gray-600">
							{is2FAEnabled
								? "Tài khoản của bạn được bảo vệ bằng xác thực hai yếu tố"
								: "Thêm một lớp bảo mật bổ sung cho tài khoản của bạn"}
						</p>

						{is2FAEnabled && userEmail && (
							<div className="mt-3 rounded-lg bg-green-50 p-3">
								<p className="text-sm text-green-800">
									✓ Xác thực hai yếu tố đang hoạt động cho{" "}
									<strong>{userEmail}</strong>
								</p>
							</div>
						)}

						<div className="mt-4 flex gap-3">
							{!is2FAEnabled ? (
								<Button
									onClick={() => setShowEnable2FA(true)}
									className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 font-semibold text-white hover:from-blue-700 hover:to-blue-800"
								>
									Bật xác thực hai yếu tố
								</Button>
							) : !showDisableConfirm ? (
								<Button
									onClick={() => setShowDisableConfirm(true)}
									variant="outline"
									className="rounded-xl border-2 border-red-200 font-semibold text-red-600 hover:bg-red-50"
								>
									<ShieldOff className="mr-2 h-4 w-4" />
									Tắt xác thực hai yếu tố
								</Button>
							) : (
								<div className="flex items-center gap-3">
									<span className="text-sm font-medium text-gray-700">
										Bạn có chắc chắn muốn tắt?
									</span>
									<Button
										onClick={handleDisable}
										isDisabled={disableMutation.isPending}
										size="sm"
										className="rounded-lg bg-red-600 text-white hover:bg-red-700"
									>
										{disableMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
									</Button>
									<Button
										onClick={() => setShowDisableConfirm(false)}
										variant="outline"
										size="sm"
										className="rounded-lg"
									>
										Hủy
									</Button>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{!is2FAEnabled && (
				<div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
					<h4 className="mb-2 text-sm font-semibold text-gray-900">
						Ứng dụng xác thực được khuyến nghị:
					</h4>
					<ul className="space-y-1 text-sm text-gray-600">
						<li>• Google Authenticator (iOS/Android)</li>
						<li>• Microsoft Authenticator (iOS/Android)</li>
						<li>• Authy (iOS/Android/Desktop)</li>
						<li>• 1Password (iOS/Android/Desktop)</li>
					</ul>
				</div>
			)}
		</div>
	);
};

export default TwoFactorSettings;
