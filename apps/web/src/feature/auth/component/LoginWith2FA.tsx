import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
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
import { ChevronLeftIcon, Mail, Shield } from "lucide-react";
import type React from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { z } from "zod";
import { setAccessToken } from "@/shared/lib/cookies";
import { LoginWith2FA } from "../api/auth.api";
import { setIsAuthenticatedAction, setUserInfoAction } from "../store";

const formSchema = z.object({
	email: z
		.string()
		.max(50, { message: "Email không được vượt quá 50 ký tự" })
		.email({ message: "Email không hợp lệ" }),
	password: z
		.string()
		.min(3, { message: "Mật khẩu phải có ít nhất 3 ký tự" })
		.max(50, { message: "Mật khẩu không được vượt quá 50 ký tự" }),
	totpCode: z
		.string()
		.length(6, { message: "Mã xác thực phải có 6 chữ số" })
		.regex(/^\d+$/, { message: "Mã xác thực chỉ chứa số" }),
});

interface LoginWith2FAFormProps {
	initialEmail?: string;
	initialPassword?: string;
	onBack?: () => void;
}

const LoginWith2FAForm: React.FC<LoginWith2FAFormProps> = ({
	initialEmail = "",
	initialPassword = "",
	onBack,
}) => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: initialEmail,
			password: initialPassword,
			totpCode: "",
		},
	});

	const loginMutation = useMutation({
		mutationFn: (data: { email: string; password: string; totpCode: string }) =>
			LoginWith2FA(data),
		onSuccess: (response) => {
			const userData = response.data.data;
			// Store access token
			setAccessToken(userData.accessToken);

			// Update Redux state
			dispatch(setUserInfoAction(userData.user));
			dispatch(setIsAuthenticatedAction(true));

			toast.success({
				title: "Đăng nhập thành công",
				description: `Chào mừng trở lại, ${userData.user.firstName}!`,
			});
			navigate({ to: "/" });
		},
		onError: (error: any) => {
			const errorMessage =
				error.response?.data?.message || "Đăng nhập thất bại";
			toast.error({
				title: "Lỗi đăng nhập",
				description: errorMessage,
			});
		},
	});

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		loginMutation.mutate({
			email: values.email,
			password: values.password,
			totpCode: values.totpCode,
		});
	};

	return (
		<div className="flex h-full w-full flex-col lg:w-1/2">
			{loginMutation.isPending && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="rounded-lg bg-white p-6 text-center">
						<div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
						<p className="text-gray-600">Đang xác thực...</p>
					</div>
				</div>
			)}

			<div className="shrink-0 p-6">
				{onBack ? (
					<button
						onClick={onBack}
						className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-blue-700"
					>
						<ChevronLeftIcon className="size-5" />
						Quay lại
					</button>
				) : (
					<Link
						to="/signin"
						className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-blue-700"
					>
						<ChevronLeftIcon className="size-5" />
						Đăng nhập thường
					</Link>
				)}
			</div>

			<div className="flex flex-1 items-center justify-center px-6 pb-6">
				<div className="w-full max-w-md">
					<div className="rounded-2xl border border-gray-100 bg-white p-8">
						<div className="mb-6 text-center">
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
								<Shield className="h-8 w-8 text-blue-600" />
							</div>
							<h1 className="mb-2 text-xl font-bold text-gray-900">
								Xác thực hai yếu tố
							</h1>
							<p className="text-sm text-gray-600">
								Nhập mã từ ứng dụng xác thực của bạn
							</p>
						</div>

						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-4"
							>
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm font-semibold text-gray-700">
												Email <span className="text-red-500">*</span>
											</FormLabel>
											<FormControl>
												<div className="relative">
													<Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
													<Input
														placeholder="Nhập email của bạn"
														{...field}
														className="h-11 rounded-xl border-2 border-gray-200 pl-10"
													/>
												</div>
											</FormControl>
											<FormMessage className="text-xs" />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm font-semibold text-gray-700">
												Mật khẩu <span className="text-red-500">*</span>
											</FormLabel>
											<FormControl>
												<Input
													type="password"
													placeholder="Nhập mật khẩu của bạn"
													{...field}
													className="h-11 rounded-xl border-2 border-gray-200"
												/>
											</FormControl>
											<FormMessage className="text-xs" />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="totpCode"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm font-semibold text-gray-700">
												Mã xác thực <span className="text-red-500">*</span>
											</FormLabel>
											<FormControl>
												<Input
													{...field}
													placeholder="000000"
													maxLength={6}
													className="h-14 rounded-xl border-2 border-gray-200 text-center font-mono text-2xl tracking-widest"
													autoComplete="off"
												/>
											</FormControl>
											<FormMessage className="text-xs" />
										</FormItem>
									)}
								/>

								<div className="rounded-lg bg-blue-50 p-3">
									<p className="text-xs text-blue-800">
										💡 Mở ứng dụng xác thực trên điện thoại của bạn để lấy mã 6
										chữ số
									</p>
								</div>

								<Button
									className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-700 to-blue-800 font-semibold text-white shadow-lg hover:from-blue-800 hover:to-blue-900"
									type="submit"
									isDisabled={loginMutation.isPending}
								>
									{loginMutation.isPending ? "Đang xác thực..." : "Đăng nhập"}
								</Button>
							</form>
						</Form>

						<div className="mt-6 text-center">
							<p className="text-sm text-gray-600">
								Gặp vấn đề với xác thực?{" "}
								<Link
									to="/forgot-password"
									className="font-semibold text-blue-700 hover:text-blue-800"
								>
									Khôi phục tài khoản
								</Link>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginWith2FAForm;
