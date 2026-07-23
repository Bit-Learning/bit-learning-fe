import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/Button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/Form";
import { Input } from "@workspace/ui/components/Input";
import { toast } from "@/shared/components/Sonner";
import { Copy, Shield } from "lucide-react";
import QRCode from "qrcode";
import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authApi } from "../api/auth.api";
import type { TTwoFactorAuthResponse } from "../types/auth.type";

const verifySchema = z.object({
	totpCode: z
		.string()
		.length(6, { message: "Mã xác thực phải có 6 chữ số" })
		.regex(/^\d+$/, { message: "Mã xác thực chỉ chứa số" }),
});

interface Enable2FAProps {
	onSuccess?: () => void;
	onCancel?: () => void;
}

const Enable2FAComponent: React.FC<Enable2FAProps> = ({
	onSuccess,
	onCancel,
}) => {
	const [step, setStep] = useState<"enable" | "verify">("enable");
	const [qrData, setQrData] = useState<TTwoFactorAuthResponse | null>(null);
	const [qrCodeImage, setQrCodeImage] = useState<string>("");
	const queryClient = useQueryClient();

	const form = useForm({
		resolver: zodResolver(verifySchema),
		defaultValues: {
			totpCode: "",
		},
	});

	// Mutation to enable 2FA
	const enableMutation = useMutation({
		mutationFn: authApi.enable2FA,
		onSuccess: async (response) => {
			const data: TTwoFactorAuthResponse = response.data.data;
			setQrData(data);
			setStep("verify");

			// Generate QR code image from the URL
			try {
				const qrImageUrl = await QRCode.toDataURL(data.qrCodeUrl, {
					width: 300,
					margin: 2,
					color: {
						dark: "#000000",
						light: "#FFFFFF",
					},
				});
				setQrCodeImage(qrImageUrl);
			} catch (error) {
				console.error("Error generating QR code:", error);
				toast.error({
					title: "Lỗi",
					description:
						"Không thể tạo mã QR. Vui lòng sử dụng mã nhập thủ công.",
				});
			}
		},
		onError: (error: any) => {
			toast.error({
				title: "Lỗi",
				description:
					error.response?.data?.message || "Không thể bật xác thực hai yếu tố",
			});
		},
	});

	// Mutation to verify TOTP code
	const verifyMutation = useMutation({
		mutationFn: (data: { totpCode: string }) => authApi.verify2FA(data),
		onSuccess: () => {
			toast.success({
				title: "Thành công",
				description: "Xác thực hai yếu tố đã được kích hoạt!",
			});
			queryClient.invalidateQueries({ queryKey: ["userProfile"] });
			onSuccess?.();
		},
		onError: (error: any) => {
			toast.error({
				title: "Lỗi",
				description:
					error.response?.data?.message || "Mã xác thực không hợp lệ",
			});
		},
	});

	const handleEnable = () => {
		enableMutation.mutate();
	};

	const handleVerify = (values: z.infer<typeof verifySchema>) => {
		verifyMutation.mutate({ totpCode: values.totpCode });
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		toast.success({
			title: "Đã sao chép",
			description: "Mã đã được sao chép vào clipboard",
		});
	};

	return (
		<div className="mx-auto w-full max-w-2xl">
			<div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
				<div className="mb-6 text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
						<Shield className="h-8 w-8 text-blue-600" />
					</div>
					<h2 className="text-2xl font-bold text-gray-900">
						Xác thực hai yếu tố (2FA)
					</h2>
					<p className="mt-2 text-sm text-gray-600">
						Tăng cường bảo mật tài khoản của bạn với xác thực hai yếu tố
					</p>
				</div>

				{step === "enable" && (
					<div className="space-y-6">
						<div className="rounded-lg bg-blue-50 p-4">
							<h3 className="mb-2 font-semibold text-blue-900">Bạn sẽ cần:</h3>
							<ul className="list-inside list-disc space-y-1 text-sm text-blue-800">
								<li>
									Ứng dụng xác thực (Google Authenticator, Microsoft
									Authenticator, Authy)
								</li>
								<li>Điện thoại di động để quét mã QR</li>
							</ul>
						</div>

						<div className="space-y-4">
							<Button
								onClick={handleEnable}
								isDisabled={enableMutation.isPending}
								className="h-12 w-full rounded-xl bg-blue-600 font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-blue-800"
							>
								{enableMutation.isPending
									? "Đang xử lý..."
									: "Bật xác thực hai yếu tố"}
							</Button>

							{onCancel && (
								<Button
									onClick={onCancel}
									variant="outline"
									className="h-12 w-full rounded-xl border-2 border-gray-300 font-semibold text-gray-700 hover:bg-gray-50"
								>
									Hủy
								</Button>
							)}
						</div>
					</div>
				)}

				{step === "verify" && qrData && (
					<div className="space-y-6">
						<div className="space-y-4">
							<div className="text-center">
								<h3 className="mb-3 font-semibold text-gray-900">
									Bước 1: Quét mã QR
								</h3>
								<p className="mb-4 text-sm text-gray-600">
									Mở ứng dụng xác thực trên điện thoại và quét mã QR dưới đây
								</p>

								{qrCodeImage && (
									<div className="inline-block rounded-xl border-2 border-gray-200 bg-white p-4">
										<img
											src={qrCodeImage}
											alt="QR Code for 2FA"
											className="h-64 w-64"
										/>
									</div>
								)}
							</div>

							<div className="rounded-lg bg-gray-50 p-4">
								<p className="mb-2 text-sm font-semibold text-gray-700">
									Không thể quét mã? Nhập thủ công:
								</p>
								<div className="flex items-center gap-2">
									<code className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-sm">
										{qrData.manualEntryKey}
									</code>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => copyToClipboard(qrData.manualEntryKey)}
										className="shrink-0"
									>
										<Copy className="h-4 w-4" />
									</Button>
								</div>
							</div>

							<div className="border-t border-gray-200 pt-4">
								<h3 className="mb-3 font-semibold text-gray-900">
									Bước 2: Xác nhận mã
								</h3>
								<p className="mb-4 text-sm text-gray-600">
									Nhập mã 6 chữ số từ ứng dụng xác thực của bạn
								</p>

								<Form {...form}>
									<form
										onSubmit={form.handleSubmit(handleVerify)}
										className="space-y-4"
									>
										<FormField
											control={form.control}
											name="totpCode"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Mã xác thực</FormLabel>
													<FormControl>
														<Input
															{...field}
															placeholder="000000"
															maxLength={6}
															className="h-14 rounded-xl text-center font-mono text-2xl tracking-widest"
															autoComplete="off"
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<div className="flex gap-3">
											<Button
												type="submit"
												isDisabled={
													verifyMutation.isPending ||
													form.watch("totpCode").length !== 6
												}
												className="h-12 flex-1 rounded-xl bg-green-700 font-semibold text-white shadow-md transition-all hover:from-green-700 hover:to-green-800"
											>
												{verifyMutation.isPending
													? "Đang xác thực..."
													: "Xác nhận và kích hoạt"}
											</Button>
											{onCancel && (
												<Button
													type="button"
													onClick={onCancel}
													variant="outline"
													className="h-12 rounded-xl border-2 border-gray-300 font-semibold text-gray-700 hover:bg-gray-50"
												>
													Hủy
												</Button>
											)}
										</div>
									</form>
								</Form>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Enable2FAComponent;
