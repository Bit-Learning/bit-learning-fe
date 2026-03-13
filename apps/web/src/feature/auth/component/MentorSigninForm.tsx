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
import {
	EyeClosedIcon,
	EyeIcon,
	ChevronLeftIcon,
	User2Icon,
	Mail,
} from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { z } from "zod";
import { selectAuthStateInfo } from "../store/auth.selectors";
import { useLogin } from "../queries/useAuth";
import TwoFactorVerificationForm from "./TwoFactorVerificationForm";

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

const MentorSigninForm: React.FC = () => {
	const { isAuthenticated, errorMsg } = useSelector(selectAuthStateInfo);
	const [showPassword, setShowPassword] = React.useState(false);
	const [hasRedirected, setHasRedirected] = React.useState(false);
	const [show2FAForm, setShow2FAForm] = React.useState(false);
	const [userEmail, setUserEmail] = React.useState("");
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

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	} as const);

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
					<div className="mb-8 flex items-center justify-center">
						<div className="flex items-center space-x-2">
							<img
								src="/Logo.png"
								alt="Bit Learning Logo"
								className="h-10 w-36 object-contain"
							/>
						</div>
					</div>

					<div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
						{show2FAForm ? (
							<TwoFactorVerificationForm
								email={userEmail}
								onBack={() => {
									setShow2FAForm(false);
									setUserEmail("");
								}}
							/>
						) : (
							<>
								<div className="mb-6 text-center">
									<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
										<User2Icon className="h-6 w-6" />
									</div>
									<h1 className="mb-2 text-xl font-bold text-gray-900">
										Đăng nhập Mentor
									</h1>
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
																placeholder="Nhập email Mentor của bạn"
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

										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<Checkbox id="remember-me" className="cursor-pointer" />
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
											{isLoading ? "Đang đăng nhập..." : "Đăng nhập Mentor"}
										</Button>
									</form>
								</Form>

								<div className="mt-6 text-center text-xs text-gray-500">
									<p>
										Bạn là học viên?{" "}
										<button
											type="button"
											onClick={() => navigate({ to: "/signin" })}
											className="font-semibold text-blue-700 underline-offset-2 hover:underline"
										>
											Đăng nhập học viên
										</button>
									</p>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default MentorSigninForm;
