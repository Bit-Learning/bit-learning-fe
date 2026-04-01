import { zodResolver } from "@hookform/resolvers/zod";
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
import {
	ChevronLeftIcon,
	EyeClosedIcon,
	EyeIcon,
	Mail,
	User,
} from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRegister } from "../queries/useAuth";
import { useGoogleOAuth2Config } from "../queries/useOAuth2";
import { toast } from "@/shared/components/Sonner";

const formSchema = z
	.object({
		email: z
			.string()
			.max(50, { message: "Email không được vượt quá 50 ký tự" })
			.email({ message: "Email không hợp lệ" }),
		password: z
			.string()
			.min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" })
			.max(50, { message: "Mật khẩu không được vượt quá 50 ký tự" })
			.regex(/(?=.*[a-z])/, {
				message: "Mật khẩu phải chứa ít nhất 1 chữ thường",
			})
			.regex(/(?=.*[A-Z])/, { message: "Mật khẩu phải chứa ít nhất 1 chữ hoa" })
			.regex(/(?=.*[0-9])/, { message: "Mật khẩu phải chứa ít nhất 1 chữ số" })
			.regex(/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/, {
				message: "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt",
			}),
		confirmPassword: z
			.string()
			.min(6, { message: "Vui lòng xác nhận mật khẩu" }),
		firstName: z.string().min(1, { message: "Họ không được để trống" }),
		lastName: z.string().min(1, { message: "Tên không được để trống" }),
		role: z.enum(["STUDENT"], { message: "Vai trò không hợp lệ" }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Mật khẩu và xác nhận mật khẩu không khớp",
		path: ["confirmPassword"],
	});

const SignUpForm: React.FC = () => {
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = React.useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

	const {
		data: googleOAuth2Config,
		isError: isOAuth2Error,
		error: oauthError,
	} = useGoogleOAuth2Config();
	const [hasShownOAuthError, setHasShownOAuthError] = React.useState(false);
	const [hasShownGitHubOAuthError, setHasShownGitHubOAuthError] =
		React.useState(false);

	const {
		mutate: register,
		isPending: isRegistering,
		isSuccess,
	} = useRegister();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
			firstName: "",
			lastName: "",
			role: "STUDENT",
		},
	});

	React.useEffect(() => {
		if (isSuccess) {
			const timer = setTimeout(() => {
				navigate({ to: "/signin" });
			}, 2000);
			return () => clearTimeout(timer);
		}
	}, [isSuccess, navigate]);

	function onSubmit(values: z.infer<typeof formSchema>) {
		register({
			email: values.email,
			password: values.password,
			firstName: values.firstName,
			lastName: values.lastName,
			role: values.role,
		});
	}

	return (
		<div className="flex h-full w-full flex-col lg:w-1/2">
			{isRegistering && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="rounded-lg bg-white p-6 text-center">
						<div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
						<p className="text-gray-600">Đang đăng ký...</p>
					</div>
				</div>
			)}

			<div className="shrink-0 p-6">
				<Link
					to="/"
					className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-primary"
				>
					<ChevronLeftIcon className="size-5" />
					Trang chủ
				</Link>
			</div>

			<div className="flex flex-1 items-center justify-center px-6 pb-6">
				<div className="w-full max-w-xl">
					<div className="mb-8 flex items-center justify-center">
						<img
							src="./Logo.png"
							alt="Bit Learning Logo"
							className="h-10 w-36 object-contain"
						/>
					</div>

					<div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
						<div className="mb-6 text-center">
							<h1 className="mb-2 text-xl font-bold text-gray-900">
								Tạo tài khoản mới
							</h1>
							<p className="text-sm text-gray-600">
								Tham gia cộng đồng Bit Learning để học tập và phát triển
							</p>
						</div>

						<div className="mb-6 flex items-center justify-center">
							<button
								className="inline-flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white px-7 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
								type="button"
								onClick={() => {
									if (googleOAuth2Config?.authorizationUrl) {
										window.location.href = googleOAuth2Config.authorizationUrl;
									} else if (isOAuth2Error) {
										toast.error({
											title: "Lỗi kết nối",
											description:
												"Không thể kết nối đến dịch vụ Google OAuth2. Vui lòng thử lại sau hoặc đăng nhập bằng email.",
										});
									} else {
										toast.warning({
											title: "Đang tải",
											description:
												"Đang tải cấu hình Google. Vui lòng thử lại trong giây lát.",
										});
									}
								}}
								disabled={isOAuth2Error}
								title={
									isOAuth2Error
										? "Dịch vụ Google OAuth2 không khả dụng"
										: undefined
								}
							>
								<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
									<path
										d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z"
										fill="#4285F4"
									/>
									<path
										d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z"
										fill="#34A853"
									/>
									<path
										d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z"
										fill="#FBBC05"
									/>
									<path
										d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z"
										fill="#EB4335"
									/>
								</svg>
								Tiếp tục với Google
							</button>
						</div>

						<div className="relative py-3">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-gray-200" />
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="bg-white px-4 text-gray-500">
									hoặc đăng ký với email
								</span>
							</div>
						</div>

						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-4"
							>
								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="firstName"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-sm font-semibold text-gray-700">
													Họ <span className="text-red-500">*</span>
												</FormLabel>
												<FormControl>
													<div className="relative">
														<User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
														<Input
															placeholder="Họ"
															{...field}
															className="h-11 rounded-xl border-2 border-gray-200 pl-10 transition-all duration-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
														/>
													</div>
												</FormControl>
												<FormMessage className="text-xs" />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="lastName"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-sm font-semibold text-gray-700">
													Tên <span className="text-red-500">*</span>
												</FormLabel>
												<FormControl>
													<div className="relative">
														<User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
														<Input
															placeholder="Tên"
															{...field}
															className="h-11 rounded-xl border-2 border-gray-200 pl-10 transition-all duration-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
														/>
													</div>
												</FormControl>
												<FormMessage className="text-xs" />
											</FormItem>
										)}
									/>
								</div>

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
													<Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
													<Input
														placeholder="Nhập email của bạn"
														{...field}
														className="h-11 rounded-xl border-2 border-gray-200 pl-10 transition-all duration-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
												<div className="relative">
													<div className="absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-gray-400">
														<div className="h-2 w-2 rounded-full bg-white" />
													</div>
													<Input
														type={showPassword ? "text" : "password"}
														placeholder="Tạo mật khẩu mạnh"
														{...field}
														className="h-11 rounded-xl border-2 border-gray-200 pl-10 pr-12 transition-all duration-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
													/>
													<button
														type="button"
														onClick={() => setShowPassword(!showPassword)}
														className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
													>
														{showPassword ? (
															<EyeIcon className="h-5 w-5" />
														) : (
															<EyeClosedIcon className="h-5 w-5" />
														)}
													</button>
												</div>
											</FormControl>
											<FormMessage className="text-xs" />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="confirmPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm font-semibold text-gray-700">
												Xác nhận mật khẩu{" "}
												<span className="text-red-500">*</span>
											</FormLabel>
											<FormControl>
												<div className="relative">
													<div className="absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-gray-400">
														<div className="h-2 w-2 rounded-full bg-white" />
													</div>
													<Input
														type={showConfirmPassword ? "text" : "password"}
														placeholder="Nhập lại mật khẩu"
														{...field}
														className="h-11 rounded-xl border-2 border-gray-200 pl-10 pr-12 transition-all duration-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
													/>
													<button
														type="button"
														onClick={() =>
															setShowConfirmPassword(!showConfirmPassword)
														}
														className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
													>
														{showConfirmPassword ? (
															<EyeIcon className="h-5 w-5" />
														) : (
															<EyeClosedIcon className="h-5 w-5" />
														)}
													</button>
												</div>
											</FormControl>
											<FormMessage className="text-xs" />
										</FormItem>
									)}
								/>

								<Button
									className="bg-linear-to-r h-11 w-full rounded-xl bg-primary-orange font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl"
									type="submit"
									isDisabled={isRegistering}
								>
									{isRegistering ? "Đang đăng ký..." : "Tạo tài khoản"}
								</Button>
							</form>
						</Form>

						<div className="mt-6 text-center">
							<p className="text-sm text-gray-600">
								Đã có tài khoản?{" "}
								<Link
									to="/signin"
									className="font-semibold text-primary transition-colors"
								>
									Đăng nhập ngay
								</Link>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SignUpForm;
