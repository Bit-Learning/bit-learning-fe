import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { Checkbox } from "@workspace/ui/components/Checkbox";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/Form";
import { Input } from "@workspace/ui/components/Input";
import { Label } from "@workspace/ui/components/label";
import { toast } from "@workspace/ui/components/Sonner";
import {
	ChevronLeftIcon,
	EyeClosedIcon,
	EyeIcon,
	Mail,
	QrCode,
} from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { z } from "zod";
import { selectAuthStateInfo } from "../../auth/store/auth.selectors";
import {
	useGitHubOAuth2Config,
	useGoogleOAuth2Config,
} from "../hook/useOAuth2";
import { useLogin } from "../queries/useAuth";

const formSchema = z.object({
	email: z
		.string()
		.max(50, { message: "Email không được vượt quá 50 ký tự" })
		.email({ message: "Email không hợp lệ" }),
	password: z
		.string()
		.min(3, { message: "Mật khẩu phải có ít nhất 3 ký tự" })
		.max(50, { message: "Mật khẩu không được vượt quá 50 ký tự" }),
});

import QRCodeLogin from "./QRCodeLogin";
import TwoFactorVerificationForm from "./TwoFactorVerificationForm";

const SignInForm: React.FC = () => {
	const { isAuthenticated, errorMsg } = useSelector(selectAuthStateInfo);
	const [showPassword, setShowPassword] = React.useState(false);
	const [hasRedirected, setHasRedirected] = React.useState(false);
	const [show2FAForm, setShow2FAForm] = React.useState(false);
	const [userEmail, setUserEmail] = React.useState("");
	const [activeTab, setActiveTab] = React.useState<"email" | "qr">("email");
	const navigate = useNavigate();

	const { mutate: login, isPending: isLoading } = useLogin({
		on2FARequired: (email: string) => {
			setUserEmail(email);
			setShow2FAForm(true);
			toast.info({
				title: "Yêu cầu xác thực 2FA",
				description:
					"Vui lòng nhập mã xác thực từ ứng dụng Authenticator của bạn",
			});
		},
	});

	const {
		data: googleOAuth2Config,
		isError: isOAuth2Error,
		error: oauthError,
	} = useGoogleOAuth2Config();
	const {
		data: githubOAuth2Config,
		isError: isGitHubOAuth2Error,
		error: githubOauthError,
	} = useGitHubOAuth2Config();
	const [hasShownOAuthError, setHasShownOAuthError] = React.useState(false);
	const [hasShownGitHubOAuthError, setHasShownGitHubOAuthError] =
		React.useState(false);

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	} as const);

	React.useEffect(() => {
		console.log(
			"SignInForm: isAuthenticated changed:",
			isAuthenticated,
			"hasRedirected:",
			hasRedirected,
			"show2FAForm:",
			show2FAForm,
		);
		// Don't redirect if showing 2FA form - let TwoFactorVerificationForm handle navigation
		if (isAuthenticated && !hasRedirected && !show2FAForm) {
			console.log("SignInForm: Redirecting to home...");
			setHasRedirected(true);
			navigate({ to: "/" });
		}
	}, [isAuthenticated, navigate, hasRedirected, show2FAForm]);

	React.useEffect(() => {
		if (isOAuth2Error && !hasShownOAuthError) {
			console.error(
				"[OAuth2] Failed to load Google OAuth2 configuration:",
				oauthError,
			);
			setHasShownOAuthError(true);
		}
	}, [isOAuth2Error, hasShownOAuthError, oauthError]);

	React.useEffect(() => {
		if (isGitHubOAuth2Error && !hasShownGitHubOAuthError) {
			console.error(
				"[OAuth2] Failed to load GitHub OAuth2 configuration:",
				githubOauthError,
			);
			setHasShownGitHubOAuthError(true);
		}
	}, [isGitHubOAuth2Error, hasShownGitHubOAuthError, githubOauthError]);

	async function onSubmit(values: z.infer<typeof formSchema>) {
		login({
			email: values.email,
			password: values.password,
		});
	}

	return (
		<div className="flex h-full w-full flex-col lg:w-1/2">
			{isLoading && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="rounded-lg bg-white p-6 text-center">
						<div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
						<p className="text-gray-600">Đang đăng nhập...</p>
					</div>
				</div>
			)}

			<div className="shrink-0 p-6">
				<Link
					to="/"
					className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-blue-700 dark:text-gray-400 dark:hover:text-blue-400"
				>
					<ChevronLeftIcon className="size-5" />
					Trang chủ
				</Link>
			</div>

			<div className="flex flex-1 items-center justify-center px-6 pb-6">
				<div className="w-full max-w-md">
					<div className="mb-8 flex items-center justify-center lg:hidden">
						<div className="flex items-center space-x-2">
							<img
								src="./Logo.png"
								alt="Bithub Logo"
								className="h-10 w-36 object-contain"
							/>
						</div>
					</div>

					<div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
						{show2FAForm ? (
							<TwoFactorVerificationForm
								email={userEmail}
								onBack={() => {
									console.log("[SigninForm] User clicked back from 2FA form");
									setShow2FAForm(false);
									setUserEmail("");
								}}
							/>
						) : (
							<>
								<div className="mb-6 text-center">
									<div className="mb-4 flex justify-center">
										<div className="flex items-center space-x-2">
											<img
												src="./Logo.png"
												alt="Bithub Logo"
												className="h-8 w-24 object-contain"
											/>
										</div>
									</div>
									<h1 className="mb-2 text-xl font-bold text-gray-900">
										Chào mừng trở lại!
									</h1>
									<p className="text-sm text-gray-600">
										Đăng nhập để truy cập tài khoản của bạn
									</p>
								</div>

								{/* Login Method Tabs */}
								<div className="mb-6 flex rounded-lg border border-gray-200 bg-gray-50 p-1">
									<button
										type="button"
										onClick={() => setActiveTab("email")}
										className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
											activeTab === "email"
												? "bg-white text-gray-900 shadow-sm"
												: "text-gray-600 hover:text-gray-900"
										}`}
									>
										<Mail className="h-4 w-4" />
										<span>Email</span>
									</button>
									<button
										type="button"
										onClick={() => setActiveTab("qr")}
										className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
											activeTab === "qr"
												? "bg-white text-gray-900 shadow-sm"
												: "text-gray-600 hover:text-gray-900"
										}`}
									>
										<QrCode className="h-4 w-4" />
										<span>Mã QR</span>
									</button>
								</div>

								{/* Tab Content */}
								{activeTab === "email" ? (
									<>
										{errorMsg && (
											<div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
												<div className="flex items-center">
													<div className="shrink-0">
														<svg
															className="h-5 w-5 text-red-400"
															viewBox="0 0 20 20"
															fill="currentColor"
														>
															<path
																fillRule="evenodd"
																d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
																clipRule="evenodd"
															/>
														</svg>
													</div>
													<div className="ml-3">
														<p className="text-sm text-red-800">{errorMsg}</p>
													</div>
												</div>
											</div>
										)}

										<div className="mb-6 grid grid-cols-2 gap-3">
											<button
												type="button"
												onClick={() => {
													if (googleOAuth2Config?.authorizationUrl) {
														window.location.href =
															googleOAuth2Config.authorizationUrl;
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
												className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
												title={
													isOAuth2Error
														? "Dịch vụ Google OAuth2 không khả dụng"
														: undefined
												}
											>
												<svg
													width="20"
													height="20"
													viewBox="0 0 20 20"
													fill="none"
													xmlns="http://www.w3.org/2000/svg"
												>
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
												<span className="hidden sm:inline">Google</span>
											</button>
											<button
												type="button"
												onClick={() => {
													if (githubOAuth2Config?.authorizationUrl) {
														window.location.href =
															githubOAuth2Config.authorizationUrl;
													} else if (isGitHubOAuth2Error) {
														toast.error({
															title: "Lỗi kết nối",
															description:
																"Không thể kết nối đến dịch vụ GitHub OAuth2. Vui lòng thử lại sau hoặc đăng nhập bằng email.",
														});
													} else {
														toast.warning({
															title: "Đang tải",
															description:
																"Đang tải cấu hình GitHub. Vui lòng thử lại trong giây lát.",
														});
													}
												}}
												disabled={isGitHubOAuth2Error}
												className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
												title={
													isGitHubOAuth2Error
														? "Dịch vụ GitHub OAuth2 không khả dụng"
														: undefined
												}
											>
												<svg
													width="20"
													height="20"
													viewBox="0 0 20 20"
													fill="currentColor"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														fillRule="evenodd"
														clipRule="evenodd"
														d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 18.165 20 14.418 20 10c0-5.523-4.477-10-10-10z"
													/>
												</svg>
												<span className="hidden sm:inline">GitHub</span>
											</button>
										</div>

										<div className="relative py-3">
											<div className="absolute inset-0 flex items-center">
												<div className="w-full border-t border-gray-200" />
											</div>
											<div className="relative flex justify-center text-sm">
												<span className="bg-white px-4 text-gray-500">
													hoặc đăng nhập với email
												</span>
											</div>
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
																	<div className="absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 transform items-center justify-center rounded-full bg-gray-400">
																		<div className="h-2 w-2 rounded-full bg-white" />
																	</div>
																	<Input
																		type={showPassword ? "text" : "password"}
																		placeholder="Nhập mật khẩu của bạn"
																		{...field}
																		className="h-11 rounded-xl border-2 border-gray-200 pl-10 pr-12 transition-all duration-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
																	/>
																	<button
																		type="button"
																		onClick={() =>
																			setShowPassword(!showPassword)
																		}
																		className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 transition-colors hover:text-gray-600"
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

												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<Checkbox
															id="remember-me"
															className="cursor-pointer"
														/>
														<Label
															htmlFor="remember-me"
															className="cursor-pointer text-sm text-gray-600"
														>
															Ghi nhớ đăng nhập
														</Label>
													</div>
													<Link
														to="/forgot-password"
														className="text-sm font-medium text-blue-700 transition-colors hover:text-blue-800"
													>
														Quên mật khẩu?
													</Link>
												</div>

												<Button
													className="bg-linear-to-r h-11 w-full rounded-xl from-blue-700 to-blue-800 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-800 hover:to-blue-900 hover:shadow-xl"
													type="submit"
													isDisabled={isLoading}
												>
													{isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
												</Button>
											</form>
										</Form>

										<div className="mt-6 space-y-3 text-center">
											<p className="text-sm text-gray-600">
												Chưa có tài khoản?{" "}
												<Link
													to="/signup"
													className="font-semibold text-blue-700 transition-colors hover:text-blue-800"
												>
													Đăng ký ngay
												</Link>
											</p>
										</div>
									</>
								) : (
									<QRCodeLogin />
								)}
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default SignInForm;
