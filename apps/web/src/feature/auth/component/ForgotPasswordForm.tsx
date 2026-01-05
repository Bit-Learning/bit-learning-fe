import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
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
import { ChevronLeftIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useForgotPassword } from "../queries/useAuth";

const formSchema = z.object({
	email: z
		.string()
		.max(50, { message: "Email không được vượt quá 50 ký tự" })
		.email({ message: "Email không hợp lệ" }),
});

const ForgotPasswordForm: React.FC = () => {
	const {
		mutate: forgotPassword,
		isPending: isLoading,
		isSuccess,
	} = useForgotPassword();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		forgotPassword(values.email);
	}

	React.useEffect(() => {
		if (isSuccess) {
			form.reset();
		}
	}, [isSuccess, form]);

	return (
		<div className="flex flex-1 flex-col">
			<div className="mx-auto w-full max-w-md pt-10">
				<Link
					to="/"
					className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
				>
					<ChevronLeftIcon className="size-5" />
					Trang chủ
				</Link>
			</div>

			<div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
				{isSuccess ? (
					<div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
							<svg
								className="h-8 w-8 text-green-600"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
						<h2 className="mb-2 text-xl font-bold text-green-800">
							Email đã được gửi!
						</h2>
						<p className="mb-4 text-sm text-green-700">
							Vui lòng kiểm tra email của bạn để đặt lại mật khẩu.
						</p>
						<p className="text-xs text-green-600">
							Không nhận được email? Kiểm tra thư mục spam hoặc thử lại.
						</p>
						<Link
							to="/signin"
							className="mt-6 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
						>
							Quay lại đăng nhập
						</Link>
					</div>
				) : (
					<div>
						<div className="mb-5 sm:mb-8">
							<h1 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
								Quên Mật Khẩu
							</h1>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Nhập email của bạn để nhận liên kết đặt lại mật khẩu!
							</p>
						</div>

						<div>
							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="space-y-8"
								>
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="mb-2 font-semibold dark:text-white/90">
													Email <span className="text-red-500">*</span>
												</FormLabel>
												<FormControl>
													<Input
														placeholder="stuwme@gmail.com"
														{...field}
														className="focus-visible:border-primary focus-visible:ring-primary h-11 border focus-visible:ring-1 dark:bg-white/5 dark:text-white/90"
													/>
												</FormControl>
												<FormMessage className="text-xs" />
											</FormItem>
										)}
									/>
									<Button
										className="w-full"
										type="submit"
										size={"lg"}
										isDisabled={isLoading}
									>
										{isLoading ? "Đang gửi..." : "Gửi Yêu Cầu"}
									</Button>
								</form>
							</Form>

							<div className="mt-5">
								<p className="text-center text-sm font-normal text-gray-700 sm:text-start dark:text-gray-400">
									Đã có tài khoản?{" "}
									<Link
										to="/signin"
										className="text-primary hover:text-blue-800 dark:text-white/90 dark:hover:text-white/70"
									>
										Đăng nhập
									</Link>
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default ForgotPasswordForm;
