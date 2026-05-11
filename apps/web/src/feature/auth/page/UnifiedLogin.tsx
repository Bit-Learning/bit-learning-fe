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
import { cn } from "@workspace/ui/lib/utils";
import {
	ChevronLeftIcon,
	EyeClosedIcon,
	EyeIcon,
	Mail,
	QrCode,
	User,
} from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { z } from "zod";
import { toast } from "@/shared/components/Sonner";
import { useAppDispatch } from "@/shared/redux/store";
import {
	useGitHubOAuth2Config,
	useGoogleOAuth2Config,
} from "../queries/useOAuth2";
import { useLoginUser, useRegister } from "../queries/useAuth";
import { selectAuthStateInfo } from "../store/auth.selectors";
import { setErrorAction } from "../store";
import AuthCallbackPageContent from "../component/AuthCallbackPageContent";
import Logo from "../component/Logo";
import QRCodeLogin from "../component/QRCodeLogin";
import TwoFactorVerificationForm from "../component/TwoFactorVerificationForm";

type LoginRole = "STUDENT" | "MENTOR";

const loginSchema = z.object({
	email: z
		.string()
		.max(50, { message: "Email không được vượt quá 50 ký tự" })
		.email({ message: "Email không hợp lệ" }),
	password: z
		.string()
		.min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" })
		.max(50, { message: "Mật khẩu không được vượt quá 50 ký tự" }),
});

const mentorRegisterSchema = z
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
			.regex(/(?=.*[A-Z])/, {
				message: "Mật khẩu phải chứa ít nhất 1 chữ hoa",
			})
			.regex(/(?=.*[0-9])/, {
				message: "Mật khẩu phải chứa ít nhất 1 chữ số",
			})
			.regex(/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/, {
				message: "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt",
			}),
		confirmPassword: z
			.string()
			.min(1, { message: "Vui lòng xác nhận mật khẩu" }),
		firstName: z.string().min(1, { message: "Họ không được để trống" }),
		lastName: z.string().min(1, { message: "Tên không được để trống" }),
		role: z.enum(["MENTOR"], { message: "Vai trò không hợp lệ" }),
		specialties: z
			.string()
			.max(200, {
				message: "Chuyên môn không được vượt quá 200 ký tự",
			})
			.optional()
			.or(z.literal("")),
		yearsOfExperience: z
			.string()
			.optional()
			.refine(
				(value) => {
					if (!value) return true;
					const num = Number(value);
					return !Number.isNaN(num) && num >= 0 && num <= 50;
				},
				{
					message: "Số năm kinh nghiệm phải là số từ 0 đến 50",
				},
			),
		company: z
			.string()
			.max(100, { message: "Tên công ty không được vượt quá 100 ký tự" })
			.optional()
			.or(z.literal("")),
		studentsCount: z
			.string()
			.optional()
			.refine(
				(value) => {
					if (!value) return true;
					const num = Number(value);
					return !Number.isNaN(num) && num >= 0;
				},
				{
					message: "Số lượng học viên phải là số không âm",
				},
			),
		coursesCount: z
			.string()
			.optional()
			.refine(
				(value) => {
					if (!value) return true;
					const num = Number(value);
					return !Number.isNaN(num) && num >= 0;
				},
				{
					message: "Số lượng khoá học phải là số không âm",
				},
			),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Mật khẩu và xác nhận mật khẩu không khớp",
		path: ["confirmPassword"],
	});

type TMentorRegisterFormValues = z.infer<typeof mentorRegisterSchema>;

const PANEL_ANIMATION_STYLES = `
	@keyframes auth-role-fade-in {
		from {
			opacity: 0;
			transform: translateY(10px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
`;

function LoadingOverlay() {
	return (
		<AuthCallbackPageContent hasError={false} localError={null} error={null} />
	);
}

function ErrorAlert({ message }: { message: string }) {
	return (
		<div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
			<p className="text-sm text-red-800">{message}</p>
		</div>
	);
}

function OAuthButton({
	onClick,
	disabled,
	title,
	children,
}: {
	onClick: () => void;
	disabled?: boolean;
	title?: string;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			title={title}
			className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
		>
			{children}
		</button>
	);
}

function MentorRegisterForm({ onBack }: { onBack: () => void }) {
	const [showPassword, setShowPassword] = React.useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
	const {
		mutate: register,
		isPending: isRegistering,
		isSuccess,
	} = useRegister();

	const form = useForm<TMentorRegisterFormValues>({
		resolver: zodResolver(mentorRegisterSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
			firstName: "",
			lastName: "",
			role: "MENTOR",
			specialties: "",
			yearsOfExperience: "",
			company: "",
			studentsCount: "",
			coursesCount: "",
		},
	});

	React.useEffect(() => {
		if (!isSuccess) return;
		const timer = window.setTimeout(() => {
			onBack();
		}, 2000);
		return () => window.clearTimeout(timer);
	}, [isSuccess, onBack]);

	function onSubmit(values: TMentorRegisterFormValues) {
		const specialties = values.specialties
			?.split(",")
			.map((item) => item.trim())
			.filter(Boolean);

		register({
			email: values.email,
			password: values.password,
			firstName: values.firstName,
			lastName: values.lastName,
			role: values.role,
			specialties,
			yearsOfExperience: values.yearsOfExperience
				? Number(values.yearsOfExperience)
				: undefined,
			company: values.company || undefined,
			studentsCount: values.studentsCount
				? Number(values.studentsCount)
				: undefined,
			coursesCount: values.coursesCount
				? Number(values.coursesCount)
				: undefined,
		});
	}

	return (
		<div className="space-y-3">
			<div className="space-y-1.5">
				<h2 className="text-lg font-bold tracking-[-0.03em] text-slate-900 sm:text-xl">
					Đăng ký tài khoản
				</h2>
				<p className="text-xs leading-5 text-slate-500 sm:text-sm">
					Điền nhanh hồ sơ để gửi yêu cầu xét duyệt.
				</p>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
						<FormField
							control={form.control}
							name="firstName"
							render={({ field }) => (
								<FormItem className="col-span-1">
									<FormLabel className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
										Họ <span className="text-red-500">*</span>
									</FormLabel>
									<FormControl>
										<div className="relative">
											<User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
											<Input
												placeholder="Họ"
												{...field}
												className="h-11 rounded-2xl border-slate-200 pl-9 text-sm focus-visible:ring-4 focus-visible:ring-orange-500/10"
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
								<FormItem className="col-span-1">
									<FormLabel className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
										Tên <span className="text-red-500">*</span>
									</FormLabel>
									<FormControl>
										<div className="relative">
											<User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
											<Input
												placeholder="Tên"
												{...field}
												className="h-11 rounded-2xl border-slate-200 pl-9 text-sm focus-visible:ring-4 focus-visible:ring-orange-500/10"
											/>
										</div>
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem className="col-span-2">
									<FormLabel className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
										Email <span className="text-red-500">*</span>
									</FormLabel>
									<FormControl>
										<div className="relative">
											<Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
											<Input
												placeholder="mentor@email.com"
												{...field}
												className="h-11 rounded-2xl border-slate-200 pl-9 text-sm focus-visible:ring-4 focus-visible:ring-orange-500/10"
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
								<FormItem className="col-span-2">
									<FormLabel className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
										Mật khẩu <span className="text-red-500">*</span>
									</FormLabel>
									<FormControl>
										<div className="relative">
											<div className="absolute left-3 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full bg-slate-400">
												<div className="h-2 w-2 rounded-full bg-white" />
											</div>
											<Input
												type={showPassword ? "text" : "password"}
												placeholder="Tạo mật khẩu mạnh"
												{...field}
												className="h-11 rounded-2xl border-slate-200 pl-9 pr-11 text-sm focus-visible:ring-4 focus-visible:ring-orange-500/10"
											/>
											<button
												type="button"
												onClick={() => setShowPassword((prev) => !prev)}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
											>
												{showPassword ? (
													<EyeIcon className="h-4 w-4" />
												) : (
													<EyeClosedIcon className="h-4 w-4" />
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
								<FormItem className="col-span-2">
									<FormLabel className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
										Xác nhận mật khẩu <span className="text-red-500">*</span>
									</FormLabel>
									<FormControl>
										<div className="relative">
											<div className="absolute left-3 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full bg-slate-400">
												<div className="h-2 w-2 rounded-full bg-white" />
											</div>
											<Input
												type={showConfirmPassword ? "text" : "password"}
												placeholder="Nhập lại mật khẩu"
												{...field}
												className="h-11 rounded-2xl border-slate-200 pl-9 pr-11 text-sm focus-visible:ring-4 focus-visible:ring-orange-500/10"
											/>
											<button
												type="button"
												onClick={() => setShowConfirmPassword((prev) => !prev)}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
											>
												{showConfirmPassword ? (
													<EyeIcon className="h-4 w-4" />
												) : (
													<EyeClosedIcon className="h-4 w-4" />
												)}
											</button>
										</div>
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>
					</div>

					<div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-3">
						<div className="mb-3 flex items-start justify-between gap-3">
							<div>
								<p className="text-sm font-semibold text-slate-800">
									Hồ sơ chuyên môn
								</p>
								<p className="text-xs leading-5 text-slate-500">
									Các trường bên dưới giúp xét duyệt mentor nhanh hơn.
								</p>
							</div>
							<span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-orange-700">
								Tùy chọn
							</span>
						</div>

						<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
							<FormField
								control={form.control}
								name="specialties"
								render={({ field }) => (
									<FormItem className="col-span-2 sm:col-span-4">
										<FormLabel className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
											Lĩnh vực chuyên môn
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Frontend, Backend, DevOps"
												{...field}
												className="h-11 rounded-2xl border-slate-200 bg-white text-sm focus-visible:ring-4 focus-visible:ring-orange-500/10"
											/>
										</FormControl>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="yearsOfExperience"
								render={({ field }) => (
									<FormItem className="col-span-1">
										<FormLabel className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
											Kinh nghiệm
										</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={0}
												max={50}
												placeholder="5 năm"
												{...field}
												className="h-11 rounded-2xl border-slate-200 bg-white text-sm focus-visible:ring-4 focus-visible:ring-orange-500/10"
											/>
										</FormControl>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="company"
								render={({ field }) => (
									<FormItem className="col-span-1 sm:col-span-3">
										<FormLabel className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
											Công ty hiện tại
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Ví dụ: Bit Learning"
												{...field}
												className="h-11 rounded-2xl border-slate-200 bg-white text-sm focus-visible:ring-4 focus-visible:ring-orange-500/10"
											/>
										</FormControl>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="studentsCount"
								render={({ field }) => (
									<FormItem className="col-span-1 sm:col-span-2">
										<FormLabel className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
											Học viên
										</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={0}
												placeholder="100"
												{...field}
												className="h-11 rounded-2xl border-slate-200 bg-white text-sm focus-visible:ring-4 focus-visible:ring-orange-500/10"
											/>
										</FormControl>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="coursesCount"
								render={({ field }) => (
									<FormItem className="col-span-1 sm:col-span-2">
										<FormLabel className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
											Khóa học đã dạy
										</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={0}
												placeholder="5"
												{...field}
												className="h-11 rounded-2xl border-slate-200 bg-white text-sm focus-visible:ring-4 focus-visible:ring-orange-500/10"
											/>
										</FormControl>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3 pt-1">
						<Button
							type="submit"
							className="h-11 rounded-2xl bg-orange-500 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(249,115,22,0.22)] transition-all duration-200 hover:bg-orange-600"
							isDisabled={isRegistering}
						>
							{isRegistering ? "Đang xử lý..." : "Tạo tài khoản"}
						</Button>

						<button
							type="button"
							onClick={onBack}
							className="h-11 rounded-2xl border border-orange-200 bg-white text-sm font-medium text-orange-700 transition-colors hover:bg-orange-50"
						>
							Quay lại
						</button>
					</div>
				</form>
			</Form>
		</div>
	);
}

function StudentAuthSection() {
	const { isAuthenticated, errorMsg } = useSelector(selectAuthStateInfo);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = React.useState(false);
	const [hasRedirected, setHasRedirected] = React.useState(false);
	const [show2FAForm, setShow2FAForm] = React.useState(false);
	const [userEmail, setUserEmail] = React.useState("");
	const [activeTab, setActiveTab] = React.useState<"email" | "qr">("email");
	const [hasShownOAuthError, setHasShownOAuthError] = React.useState(false);
	const [hasShownGitHubOAuthError, setHasShownGitHubOAuthError] =
		React.useState(false);

	const { mutate: login, isPending: isLoading } = useLoginUser({
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

	const form = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	React.useEffect(() => {
		dispatch(setErrorAction(null));
	}, [dispatch]);

	React.useEffect(() => {
		if (isAuthenticated && !hasRedirected && !show2FAForm) {
			setHasRedirected(true);
			navigate({ to: "/" });
		}
	}, [hasRedirected, isAuthenticated, navigate, show2FAForm]);

	React.useEffect(() => {
		if (isOAuth2Error && !hasShownOAuthError) {
			console.error(
				"[OAuth2] Failed to load Google OAuth2 configuration:",
				oauthError,
			);
			setHasShownOAuthError(true);
		}
	}, [hasShownOAuthError, isOAuth2Error, oauthError]);

	React.useEffect(() => {
		if (isGitHubOAuth2Error && !hasShownGitHubOAuthError) {
			console.error(
				"[OAuth2] Failed to load GitHub OAuth2 configuration:",
				githubOauthError,
			);
			setHasShownGitHubOAuthError(true);
		}
	}, [githubOauthError, hasShownGitHubOAuthError, isGitHubOAuth2Error]);

	function onSubmit(values: z.infer<typeof loginSchema>) {
		login({
			email: values.email,
			password: values.password,
			role: "STUDENT",
		});
	}

	if (isLoading) {
		return <LoadingOverlay />;
	}

	if (show2FAForm) {
		return (
			<TwoFactorVerificationForm
				email={userEmail}
				onBack={() => {
					setShow2FAForm(false);
					setUserEmail("");
				}}
			/>
		);
	}

	return (
		<div key="student-auth" className="space-y-5">
			{/* <div className="space-y-2">
				<h2 className="text-2xl font-bold tracking-[-0.03em] text-slate-900">
					Đăng nhập học viên
				</h2>
				<p className="text-sm leading-6 text-slate-500">
					Đăng nhập bằng email, mạng xã hội hoặc quét QR để tiếp tục học tập.
				</p>
			</div> */}

			{/* <div className="rounded-2xl bg-slate-100 p-1">
				<div className="grid grid-cols-2 gap-1">
					<button
						type="button"
						onClick={() => setActiveTab("email")}
						className={cn(
							"flex items-center justify-center gap-2 rounded-[14px] px-4 py-3 text-sm font-semibold transition-all duration-200",
							activeTab === "email"
								? "bg-white text-slate-900 shadow-[0_2px_10px_rgba(15,23,42,0.08)]"
								: "text-slate-500 hover:text-slate-700",
						)}
					>
						<Mail className="h-4 w-4" />
						<span>Email</span>
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("qr")}
						className={cn(
							"flex items-center justify-center gap-2 rounded-[14px] px-4 py-3 text-sm font-semibold transition-all duration-200",
							activeTab === "qr"
								? "bg-white text-slate-900 shadow-[0_2px_10px_rgba(15,23,42,0.08)]"
								: "text-slate-500 hover:text-slate-700",
						)}
					>
						<QrCode className="h-4 w-4" />
						<span>Mã QR</span>
					</button>
				</div>
			</div> */}

			{activeTab === "qr" ? (
				<div
					className="rounded-[24px] border border-slate-200 bg-white p-4"
					style={{
						animation: "auth-role-fade-in 280ms cubic-bezier(.22,1,.36,1)",
					}}
				>
					<QRCodeLogin />
				</div>
			) : (
				<>
					{errorMsg && <ErrorAlert message={errorMsg} />}

					<div className="grid gap-3 sm:grid-cols-2">
						<OAuthButton
							onClick={() => {
								if (googleOAuth2Config?.authorizationUrl) {
									window.location.href = googleOAuth2Config.authorizationUrl;
									return;
								}

								if (isOAuth2Error) {
									toast.error({
										title: "Lỗi kết nối",
										description:
											"Không thể kết nối đến dịch vụ Google OAuth2. Vui lòng thử lại sau hoặc đăng nhập bằng email.",
									});
									return;
								}

								toast.warning({
									title: "Đang tải",
									description:
										"Đang tải cấu hình Google. Vui lòng thử lại trong giây lát.",
								});
							}}
							disabled={isOAuth2Error}
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
							<span>Google</span>
						</OAuthButton>

						<OAuthButton
							onClick={() => {
								if (githubOAuth2Config?.authorizationUrl) {
									window.location.href = githubOAuth2Config.authorizationUrl;
									return;
								}

								if (isGitHubOAuth2Error) {
									toast.error({
										title: "Lỗi kết nối",
										description:
											"Không thể kết nối đến dịch vụ GitHub OAuth2. Vui lòng thử lại sau hoặc đăng nhập bằng email.",
									});
									return;
								}

								toast.warning({
									title: "Đang tải",
									description:
										"Đang tải cấu hình GitHub. Vui lòng thử lại trong giây lát.",
								});
							}}
							disabled={isGitHubOAuth2Error}
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
							<span>GitHub</span>
						</OAuthButton>
					</div>

					<div className="relative py-1">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-slate-200" />
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="bg-white px-4 text-slate-500">
								hoặc đăng nhập với email
							</span>
						</div>
					</div>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-semibold text-slate-800">
											Email <span className="text-red-500">*</span>
										</FormLabel>
										<FormControl>
											<div className="relative">
												<Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
												<Input
													placeholder="Nhập email của bạn"
													{...field}
													className="h-12 rounded-2xl border-slate-200 pl-10 focus-visible:ring-4 focus-visible:ring-blue-500/10"
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
										<FormLabel className="text-sm font-semibold text-slate-800">
											Mật khẩu <span className="text-red-500">*</span>
										</FormLabel>
										<FormControl>
											<div className="relative">
												<div className="absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-slate-400">
													<div className="h-2 w-2 rounded-full bg-white" />
												</div>
												<Input
													type={showPassword ? "text" : "password"}
													placeholder="Nhập mật khẩu của bạn"
													{...field}
													className="h-12 rounded-2xl border-slate-200 pl-10 pr-12 focus-visible:ring-4 focus-visible:ring-blue-500/10"
												/>
												<button
													type="button"
													onClick={() => setShowPassword((prev) => !prev)}
													className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
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

							<div className="flex items-center justify-between gap-3">
								<div className="flex items-center gap-2">
									<Checkbox
										id="student-remember-me"
										className="cursor-pointer"
									/>
									<Label
										htmlFor="student-remember-me"
										className="cursor-pointer text-sm text-slate-600"
									>
										Ghi nhớ đăng nhập
									</Label>
								</div>
								<Link
									to="/forgot-password"
									className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
								>
									Quên mật khẩu?
								</Link>
							</div>

							<Button
								size="lg"
								type="submit"
								isDisabled={isLoading}
								className="h-12 w-full rounded-2xl bg-blue-600 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)] transition-all duration-200 hover:bg-blue-700"
							>
								{isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
							</Button>
						</form>
					</Form>

					<p className="text-center text-sm text-slate-600">
						Chưa có tài khoản?{" "}
						<Link
							to="/signup"
							className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
						>
							Đăng ký ngay
						</Link>
					</p>
				</>
			)}
		</div>
	);
}

function MentorAuthSection({
	isRegisterMode,
	onRegisterModeChange,
}: {
	isRegisterMode: boolean;
	onRegisterModeChange: (isRegisterMode: boolean) => void;
}) {
	const { isAuthenticated, errorMsg } = useSelector(selectAuthStateInfo);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = React.useState(false);
	const [hasRedirected, setHasRedirected] = React.useState(false);
	const [show2FAForm, setShow2FAForm] = React.useState(false);
	const [userEmail, setUserEmail] = React.useState("");

	const { mutate: login, isPending: isLoading } = useLoginUser({
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

	const form = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	React.useEffect(() => {
		dispatch(setErrorAction(null));
	}, [dispatch]);

	React.useEffect(() => {
		if (isAuthenticated && !hasRedirected && !show2FAForm) {
			setHasRedirected(true);
			navigate({ to: "/" });
		}
	}, [hasRedirected, isAuthenticated, navigate, show2FAForm]);

	function onSubmit(values: z.infer<typeof loginSchema>) {
		login({
			email: values.email,
			password: values.password,
			role: "MENTOR",
		});
	}

	if (isLoading) {
		return <LoadingOverlay />;
	}

	if (show2FAForm) {
		return (
			<TwoFactorVerificationForm
				email={userEmail}
				onBack={() => {
					setShow2FAForm(false);
					setUserEmail("");
				}}
			/>
		);
	}

	if (isRegisterMode) {
		return (
			<div key="mentor-register">
				<MentorRegisterForm onBack={() => onRegisterModeChange(false)} />
			</div>
		);
	}

	return (
		<div key="mentor-auth" className="space-y-5">
			{/* <div className="space-y-2">
				<h2 className="text-2xl font-bold tracking-[-0.03em] text-slate-900">
					Đăng nhập Mentor
				</h2>
				<p className="text-sm leading-6 text-slate-500">
					Truy cập khu vực mentor để quản lý nội dung, học viên và hoạt động
					giảng dạy.
				</p>
			</div> */}

			{errorMsg && <ErrorAlert message={errorMsg} />}

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-sm font-semibold text-slate-800">
									Email <span className="text-red-500">*</span>
								</FormLabel>
								<FormControl>
									<div className="relative">
										<Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
										<Input
											placeholder="mentor@email.com"
											{...field}
											className="h-12 rounded-2xl border-slate-200 pl-10 focus-visible:ring-4 focus-visible:ring-orange-500/10"
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
								<FormLabel className="text-sm font-semibold text-slate-800">
									Mật khẩu <span className="text-red-500">*</span>
								</FormLabel>
								<FormControl>
									<div className="relative">
										<div className="absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-slate-400">
											<div className="h-2 w-2 rounded-full bg-white" />
										</div>
										<Input
											type={showPassword ? "text" : "password"}
											placeholder="Nhập mật khẩu"
											{...field}
											className="h-12 rounded-2xl border-slate-200 pl-10 pr-12 focus-visible:ring-4 focus-visible:ring-orange-500/10"
										/>
										<button
											type="button"
											onClick={() => setShowPassword((prev) => !prev)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
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

					<div className="space-y-3">
						<div className="flex items-center justify-between gap-3">
							<div className="flex items-center gap-2">
								<Checkbox id="mentor-remember-me" className="cursor-pointer" />
								<Label
									htmlFor="mentor-remember-me"
									className="cursor-pointer text-sm text-slate-600"
								>
									Ghi nhớ đăng nhập
								</Label>
							</div>
							<Link
								to="/forgot-password"
								className="text-sm font-medium text-orange-600 transition-colors hover:text-orange-700"
							>
								Quên mật khẩu?
							</Link>
						</div>

						<div className="rounded-2xl border border-orange-100 bg-orange-50/70 px-4 py-3">
							<div className="flex items-start gap-3">
								<Checkbox
									id="mentor-register-toggle"
									isSelected={isRegisterMode}
									onChange={onRegisterModeChange}
									className="mt-0.5"
								/>
								<Label
									htmlFor="mentor-register-toggle"
									className="cursor-pointer text-sm leading-6 text-slate-700"
								>
									Tôi chưa có tài khoản, tôi muốn đăng kí tài khoản mới.
								</Label>
							</div>
						</div>
					</div>

					<Button
						type="submit"
						isDisabled={isLoading}
						className="h-12 w-full rounded-2xl bg-orange-500 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(249,115,22,0.24)] transition-all duration-200 hover:bg-orange-600"
					>
						{isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
					</Button>
				</form>
			</Form>
		</div>
	);
}

interface UnifiedLoginPageProps {
	defaultRole?: LoginRole;
	studentBackgroundUrl?: string;
	mentorBackgroundUrl?: string;
}

const ROLE_COPY: Record<
	LoginRole,
	{
		badge: string;
		title: string;
		description: string;
	}
> = {
	STUDENT: {
		badge: "Cổng học viên",
		title: "Đăng nhập hệ thống",
		description: "Tiếp tục hành trình học tập của bạn.",
	},
	MENTOR: {
		badge: "Cổng mentor",
		title: "Đăng nhập hệ thống",
		description: "Dẫn dắt, chia sẻ, tạo giá trị.",
	},
};

const UnifiedLoginPage: React.FC<UnifiedLoginPageProps> = ({
	defaultRole = "STUDENT",
	studentBackgroundUrl = "/auth.jpg",
	mentorBackgroundUrl = "/auth-mentor.jpg",
}) => {
	const dispatch = useAppDispatch();
	const [role, setRole] = React.useState<LoginRole>(defaultRole);
	const [isMentorRegisterMode, setIsMentorRegisterMode] = React.useState(false);
	const studentPanelRef = React.useRef<HTMLDivElement>(null);
	const mentorPanelRef = React.useRef<HTMLDivElement>(null);
	const [activePanelHeight, setActivePanelHeight] = React.useState<
		number | null
	>(null);
	const isMentor = role === "MENTOR";
	const isCompactMentorMode = isMentor && isMentorRegisterMode;
	const copy = ROLE_COPY[role];

	const handleRoleChange = React.useCallback(
		(nextRole: LoginRole) => {
			setRole(nextRole);
			if (nextRole !== "MENTOR") {
				setIsMentorRegisterMode(false);
			}
			dispatch(setErrorAction(null));
		},
		[dispatch],
	);

	React.useEffect(() => {
		setRole(defaultRole);
		setIsMentorRegisterMode(false);
	}, [defaultRole]);

	React.useEffect(() => {
		const studentNode = studentPanelRef.current;
		const mentorNode = mentorPanelRef.current;

		if (!studentNode || !mentorNode) {
			return;
		}

		const updateHeight = () => {
			const nextHeight = isMentor
				? mentorNode.getBoundingClientRect().height
				: studentNode.getBoundingClientRect().height;
			setActivePanelHeight(nextHeight);
		};

		updateHeight();

		const observer = new ResizeObserver(() => {
			updateHeight();
		});

		observer.observe(studentNode);
		observer.observe(mentorNode);
		window.addEventListener("resize", updateHeight);

		return () => {
			observer.disconnect();
			window.removeEventListener("resize", updateHeight);
		};
	}, [isMentor, isMentorRegisterMode]);

	return (
		<>
			<style>{PANEL_ANIMATION_STYLES}</style>

			<div className="relative h-svh overflow-hidden bg-slate-50 lg:bg-white">
				<div
					className={cn(
						"absolute inset-y-0 z-10 flex w-full transform-gpu flex-col justify-center px-4 py-4 transition-transform duration-500 ease-in-out sm:px-6 lg:w-1/2 lg:px-8",
						isMentor ? "lg:translate-x-full" : "lg:translate-x-0",
					)}
					style={{ willChange: "transform" }}
				>
					<div
						className={cn(
							"mx-auto w-full",
							isCompactMentorMode ? "max-w-2xl" : "max-w-xl",
						)}
					>
						<Link
							to="/"
							className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
						>
							<ChevronLeftIcon className="size-5" />
							Trang chủ
						</Link>

						<div
							className={cn(
								"mt-3 rounded-[24px] border bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur transition-[max-width,padding] duration-300 ease-out",
								isCompactMentorMode
									? "p-4 sm:p-5"
									: "p-4 sm:mt-5 sm:rounded-[30px] sm:p-7",
								isMentor ? "border-orange-100" : "border-slate-200",
							)}
						>
							<Logo compact={isCompactMentorMode} />

							<div
								className={cn(
									"space-y-3",
									isCompactMentorMode ? "mb-4" : "mb-5 sm:mb-6 sm:space-y-4",
								)}
							>
								<div className="space-y-2">
									<span
										className={cn(
											"inline-flex rounded-full px-3 py-1 text-xs font-semibold",
											isMentor
												? "bg-orange-50 text-orange-700"
												: "bg-blue-50 text-blue-700",
										)}
									>
										{copy.badge}
									</span>
									<h1
										className={cn(
											"max-w-lg font-bold tracking-[-0.03em] text-slate-900",
											isCompactMentorMode
												? "text-[20px] sm:text-[24px]"
												: "text-[24px] sm:text-[34px]",
										)}
									>
										{isCompactMentorMode
											? "Tạo tài khoản người hướng dẫn"
											: copy.title}
									</h1>
									{!isCompactMentorMode && (
										<p className="max-w-lg text-sm leading-6 text-slate-500">
											{copy.description}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<p className="text-sm font-semibold text-slate-800">
										Vai trò đăng nhập
									</p>
									<div className="relative grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
										<div
											className={cn(
												"absolute left-1 top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-[14px] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)] transition-transform duration-300 ease-out",
												isMentor && "translate-x-full",
											)}
										/>
										<button
											type="button"
											onClick={() => handleRoleChange("STUDENT")}
											className={cn(
												"relative z-10 rounded-[14px] px-4 text-sm font-semibold transition-colors duration-200",
												isCompactMentorMode ? "py-2.5" : "py-3",
												!isMentor
													? "text-slate-900"
													: "text-slate-500 hover:text-slate-700",
											)}
										>
											Học viên
										</button>
										<button
											type="button"
											onClick={() => handleRoleChange("MENTOR")}
											className={cn(
												"relative z-10 rounded-[14px] px-4 text-sm font-semibold transition-colors duration-200",
												isCompactMentorMode ? "py-2.5" : "py-3",
												isMentor
													? "text-slate-900"
													: "text-slate-500 hover:text-slate-700",
											)}
										>
											Người hướng dẫn
										</button>
									</div>
								</div>
							</div>

							<div
								className="relative transition-[height] duration-300 ease-out"
								style={
									activePanelHeight
										? { height: `${activePanelHeight}px` }
										: undefined
								}
							>
								<div
									ref={studentPanelRef}
									aria-hidden={isMentor}
									className={cn(
										"transition-opacity duration-220 ease-out",
										isMentor
											? "pointer-events-none absolute inset-0 opacity-0"
											: "relative opacity-100",
									)}
								>
									<StudentAuthSection />
								</div>

								<div
									ref={mentorPanelRef}
									aria-hidden={!isMentor}
									className={cn(
										"transition-opacity duration-220 ease-out",
										isMentor
											? "relative opacity-100"
											: "pointer-events-none absolute inset-0 opacity-0",
									)}
								>
									<MentorAuthSection
										isRegisterMode={isMentorRegisterMode}
										onRegisterModeChange={setIsMentorRegisterMode}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div
					className={cn(
						"absolute inset-y-0 left-0 hidden w-1/2 transform-gpu overflow-hidden transition-transform duration-500 ease-in-out lg:block",
						isMentor ? "translate-x-0" : "translate-x-full",
					)}
					style={{ willChange: "transform" }}
				>
					<div
						className={cn(
							"absolute inset-0 z-10",
							isMentor
								? "bg-linear-to-r from-orange-950/60 via-orange-900/15 to-transparent"
								: "bg-linear-to-l from-blue-950/60 via-blue-900/15 to-transparent",
						)}
					/>

					<img
						src={studentBackgroundUrl}
						alt="Student authentication background"
						className={cn(
							"absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500",
							isMentor ? "opacity-0" : "opacity-100",
						)}
						draggable={false}
					/>

					<img
						src={mentorBackgroundUrl}
						alt="Mentor authentication background"
						className={cn(
							"absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500",
							isMentor ? "opacity-100" : "opacity-0",
						)}
						draggable={false}
					/>
				</div>
			</div>
		</>
	);
};

export default UnifiedLoginPage;
