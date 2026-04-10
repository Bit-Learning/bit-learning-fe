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
import { Checkbox } from "@workspace/ui/components/Checkbox";
import { Label } from "@workspace/ui/components/label";
import { toast } from "@/shared/components/Sonner";
import { useAppDispatch } from "@/shared/redux/store";
import {
	EyeClosedIcon,
	EyeIcon,
	ChevronLeftIcon,
	User2Icon,
	Mail,
	User,
	LogInIcon,
} from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { z } from "zod";
import { selectAuthStateInfo } from "../store/auth.selectors";
import { setErrorAction } from "../store";
import { useLoginUser, useRegister } from "../queries/useAuth";
import TwoFactorVerificationForm from "./TwoFactorVerificationForm";
import Logo from "./Logo";
import { cn } from "@workspace/ui/lib/utils";

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

const mentorRegisterSchema = z
	.object({
		email: z
			.string()
			.max(50, { message: "Email không được vượt quá 50 ký tự" })
			.email({ message: "Email không hợp lệ" }),
		password: z
			.string()
			.min(3, { message: "Mật khẩu phải có ít nhất 3 ký tự" })
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

const MentorRegisterForm: React.FC<{ onBack: () => void }> = ({ onBack }) => {
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
		if (isSuccess) {
			const timer = setTimeout(() => {
				onBack();
			}, 2000);
			return () => clearTimeout(timer);
		}
	}, [isSuccess, onBack]);

	function onSubmit(values: TMentorRegisterFormValues) {
		const specialties = values.specialties
			?.split(",")
			.map((item) => item.trim())
			.filter(Boolean);

		const yearsOfExperience = values.yearsOfExperience
			? Number(values.yearsOfExperience)
			: undefined;
		const studentsCount = values.studentsCount
			? Number(values.studentsCount)
			: undefined;
		const coursesCount = values.coursesCount
			? Number(values.coursesCount)
			: undefined;

		register({
			email: values.email,
			password: values.password,
			firstName: values.firstName,
			lastName: values.lastName,
			role: values.role,
			specialties,
			yearsOfExperience,
			company: values.company || undefined,
			studentsCount,
			coursesCount,
		});
	}

	return (
		<>
			<div className="mb-6 text-left">
				<h1 className="mb-2 text-xl font-bold text-gray-900">
					Đăng ký tài khoản
				</h1>
				<p className="text-sm text-gray-600">
					Tạo tài khoản Mentor để bắt đầu dạy học trên Bit Learning
				</p>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
											placeholder="mentor@email.com"
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
									Xác nhận mật khẩu <span className="text-red-500">*</span>
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

					<div className="mt-2 border-t border-gray-100 pt-4">
						<p className="mb-3 text-sm font-semibold text-gray-800">
							Thông tin Mentor
						</p>
						<FormField
							control={form.control}
							name="specialties"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-sm font-semibold text-gray-700">
										Lĩnh vực chuyên môn
									</FormLabel>
									<FormControl>
										<Input
											placeholder="Ví dụ: Frontend, Backend, DevOps"
											{...field}
											className="h-11 rounded-xl border-2 border-gray-200 transition-all duration-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
										/>
									</FormControl>
									<p className="mt-1 text-xs text-gray-500">
										Nhập các chuyên môn, cách nhau bởi dấu phẩy.
									</p>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>

						<div className="mt-3 grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="yearsOfExperience"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-semibold text-gray-700">
											Số năm kinh nghiệm
										</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={0}
												max={50}
												placeholder="Ví dụ: 5"
												{...field}
												className="h-11 rounded-xl border-2 border-gray-200 transition-all duration-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
									<FormItem>
										<FormLabel className="text-sm font-semibold text-gray-700">
											Công ty hiện tại (tuỳ chọn)
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Ví dụ: Bit Learning, FPT Software"
												{...field}
												className="h-11 rounded-xl border-2 border-gray-200 transition-all duration-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
											/>
										</FormControl>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>
						</div>

						<div className="mt-3 grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="studentsCount"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-semibold text-gray-700">
											Số lượng học viên (ước tính)
										</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={0}
												placeholder="Ví dụ: 100"
												{...field}
												className="h-11 rounded-xl border-2 border-gray-200 transition-all duration-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
									<FormItem>
										<FormLabel className="text-sm font-semibold text-gray-700">
											Số khoá học đã dạy (ước tính)
										</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={0}
												placeholder="Ví dụ: 5"
												{...field}
												className="h-11 rounded-xl border-2 border-gray-200 transition-all duration-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
											/>
										</FormControl>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>
						</div>
					</div>

					<Button
						className="bg-linear-to-r h-11 w-full rounded-xl bg-primary font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-800 hover:to-blue-900 hover:shadow-xl"
						type="submit"
						isDisabled={isRegistering}
					>
						{isRegistering ? "Đang đăng ký..." : "Tạo tài khoản"}
					</Button>

					<button
						type="button"
						onClick={onBack}
						className="mt-3 w-full text-center text-xs font-medium text-primary underline-offset-2 hover:underline"
					>
						Quay lại đăng nhập Mentor
					</button>
				</form>
			</Form>
		</>
	);
};

const MentorSigninForm: React.FC = () => {
	const { isAuthenticated, errorMsg } = useSelector(selectAuthStateInfo);
	const dispatch = useAppDispatch();
	const [showPassword, setShowPassword] = React.useState(false);
	const [hasRedirected, setHasRedirected] = React.useState(false);
	const [show2FAForm, setShow2FAForm] = React.useState(false);
	const [isRegisterMode, setIsRegisterMode] = React.useState(false);
	const [userEmail, setUserEmail] = React.useState("");
	const navigate = useNavigate();

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

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	} as const);

	// Clear any previous auth error when opening mentor auth page
	React.useEffect(() => {
		dispatch(setErrorAction(null));
	}, [dispatch]);

	React.useEffect(() => {
		if (isAuthenticated && !hasRedirected && !show2FAForm) {
			setHasRedirected(true);
			navigate({ to: "/" });
		}
	}, [isAuthenticated, navigate, hasRedirected, show2FAForm]);

	async function onSubmit(values: z.infer<typeof formSchema>) {
		login({
			email: values.email,
			password: values.password,
			role: "MENTOR",
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
					<Logo />

					<div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
						{show2FAForm ? (
							<TwoFactorVerificationForm
								email={userEmail}
								onBack={() => {
									setShow2FAForm(false);
									setUserEmail("");
								}}
							/>
						) : isRegisterMode ? (
							<MentorRegisterForm onBack={() => setIsRegisterMode(false)} />
						) : (
							<>
								<div className="mb-6 text-left">
									<h1 className="text-[32px] font-bold tracking-[-0.03em] text-slate-900 dark:text-white">
										Chào mừng bạn đến với <br /> Bit Learning!
									</h1>
									<p className="max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
										Cùng nhau chia sẻ kiến thức và kinh nghiệm để phát triển
										cộng đồng học tập trực tuyến tốt hơn.
									</p>
								</div>

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
																placeholder="mentor@email.com"
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
																placeholder="Nhập mật khẩu"
																{...field}
																className="h-11 rounded-xl border-2 border-gray-200 pl-10 pr-12 transition-all duration-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
															/>
															<button
																type="button"
																onClick={() => setShowPassword(!showPassword)}
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

										<div className="flex flex-col gap-3">
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
													className="text-sm font-medium text-primary"
												>
													Quên mật khẩu?
												</Link>
											</div>

											<div className="flex items-center justify-start gap-2 text-xs text-gray-500">
												<Checkbox
													id="mentor-register-toggle"
													isSelected={isRegisterMode}
													onChange={(checked) => setIsRegisterMode(checked)}
												></Checkbox>
												<Label
													htmlFor="mentor-register-toggle"
													className="cursor-pointer text-sm text-gray-600"
												>
													Tôi chưa có tài khoản, đăng ký Mentor mới
												</Label>
											</div>
										</div>

										<Button
											className={cn(
												"h-13 w-full rounded-2xl text-sm font-semibold text-white bg-primary-orange shadow-[0_10px_24px_rgba(37,99,235,0.22)] transition-all duration-200",
												"hover:translate-y-px active:translate-y-0",
											)}
											type="submit"
											isDisabled={isLoading}
										>
											{isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
										</Button>
									</form>
								</Form>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default MentorSigninForm;
