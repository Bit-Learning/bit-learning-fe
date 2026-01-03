import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
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
import { toast } from "@workspace/ui/components/Sonner";
import type React from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { z } from "zod";
import { setAuthTokens } from "@/shared/lib/cookies";
import { Complete2FA } from "../api/auth.api";
import { setIsAuthenticatedAction, setUserInfoAction } from "../store";

const totpSchema = z.object({
	totpCode: z
		.string()
		.length(6, { message: "Mã xác thực phải có 6 chữ số" })
		.regex(/^\d+$/, { message: "Mã xác thực chỉ chứa số" }),
});

interface TwoFactorVerificationFormProps {
	email: string;
	onBack: () => void;
}

const TwoFactorVerificationForm: React.FC<TwoFactorVerificationFormProps> = ({
	email,
	onBack,
}) => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const form = useForm({
		resolver: zodResolver(totpSchema),
		defaultValues: {
			totpCode: "",
		},
	});

	const verifyMutation = useMutation({
		mutationFn: (data: { email: string; totpCode: string }) =>
			Complete2FA(data),
		onSuccess: (response) => {
			console.log("[2FA] Complete2FA response:", response);
			const loginData = response.data.data;

			if (!loginData || !loginData.accessToken || !loginData.user) {
				console.error("[2FA] Invalid login data structure:", loginData);
				toast.error({
					title: "Lỗi xác thực",
					description: "Dữ liệu đăng nhập không hợp lệ",
				});
				return;
			}

			console.log("[2FA] Setting auth tokens and user info");

			// Store tokens (refresh token is in HttpOnly cookie, set by backend)
			setAuthTokens(loginData.accessToken);

			// Update Redux state
			dispatch(setUserInfoAction(loginData.user));
			dispatch(setIsAuthenticatedAction(true));

			console.log("[2FA] Auth state updated, showing success message");

			toast.success({
				title: "Đăng nhập thành công",
				description: `Chào mừng trở lại, ${loginData.user.firstName}!`,
			});

			console.log("[2FA] Navigating to home page");

			// Small delay to ensure state is updated before navigation
			setTimeout(() => {
				navigate({ to: "/" });
			}, 100);
		},
		onError: (error: any) => {
			console.error("[2FA] Verification error:", error);
			const errorMessage =
				error.response?.data?.message || "Mã xác thực không hợp lệ";
			toast.error({
				title: "Lỗi xác thực",
				description: errorMessage,
			});
			// Clear the form to allow retry
			form.reset();
		},
	});

	const onSubmit = (values: z.infer<typeof totpSchema>) => {
		console.log("[2FA] Form submitted with:", {
			email,
			totpCode: values.totpCode,
		});
		console.log("[2FA] Calling Complete2FA API...");
		verifyMutation.mutate({
			email,
			totpCode: values.totpCode,
		});
	};

	return (
		<div className="w-full max-w-md">
			{verifyMutation.isPending && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="rounded-lg bg-white p-6 text-center">
						<div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
						<p className="text-gray-600">Đang xác thực...</p>
					</div>
				</div>
			)}

			<div className="rounded-2xl bg-white p-8">
				<div className="mb-6 text-center">
					<div className="mx-auto mb-4 flex items-center justify-center">
						<img
							src="./Logo.png"
							alt="Bithub Logo"
							className="h-10 w-36 object-contain"
						/>
					</div>
					{/* <h1 className="mb-2 text-xl font-bold text-gray-900">Bit Learning</h1> */}
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="totpCode"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-sm font-semibold text-gray-700">
										Nhập mã xác thực <span className="text-red-500">*</span>
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											placeholder="000000"
											maxLength={6}
											className="h-14 rounded-xl border-2 border-gray-200 text-center font-mono text-2xl tracking-widest"
											autoComplete="off"
											autoFocus
										/>
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>

						<div className="rounded-lg">
							<p className="text-sm text-gray-500">
								Nhập mã từ ứng dụng xác thực trên điện thoại của bạn.
							</p>
						</div>

						<div className="space-y-3">
							<Button
								className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-700 to-blue-800 font-semibold text-white shadow-lg hover:from-blue-800 hover:to-blue-900"
								type="submit"
								isDisabled={
									verifyMutation.isPending ||
									form.watch("totpCode").length !== 6
								}
							>
								{verifyMutation.isPending ? "Đang xác thực..." : "Xác nhận"}
							</Button>
						</div>
					</form>
				</Form>

				<div className="mt-6 text-center">
					<p className="text-xs text-gray-500">
						Gặp vấn đề? Liên hệ{" "}
						<a
							href="mailto:support@bithub.com"
							className="text-blue-600 hover:underline"
						>
							hỗ trợ
						</a>
					</p>
				</div>
			</div>
		</div>
	);
};

export default TwoFactorVerificationForm;
