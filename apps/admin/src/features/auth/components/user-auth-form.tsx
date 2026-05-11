import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { useLogin } from "../queries/useAuth";
import type { TAdminLoginRequest } from "../types/auth.types";

const formSchema = z.object({
	email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
	password: z
		.string()
		.min(1, "Vui lòng nhập mật khẩu")
		.min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
	role: z.enum(["ADMIN", "MANAGER"]),
});

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
	redirectTo?: string;
	onRoleChange?: (role: "ADMIN" | "MANAGER") => void;
}

export const UserAuthForm: React.FC<UserAuthFormProps> = ({
	className,
	redirectTo,
	onRoleChange,
	...props
}) => {
	const { mutate: login, isPending: isLoading } = useLogin({
		redirectTo,
		on2FARequired: (email: string) => {
			toast.info(`Yêu cầu xác thực 2 bước cho ${email}`);
		},
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
			role: "ADMIN",
		},
	});

	const selectedRole = form.watch("role");
	const isAdmin = selectedRole === "ADMIN";

	function handleRoleChange(role: "ADMIN" | "MANAGER") {
		form.setValue("role", role, {
			shouldValidate: true,
			shouldDirty: true,
		});
		onRoleChange?.(role);
	}

	function onSubmit(data: z.infer<typeof formSchema>) {
		login({
			email: data.email,
			password: data.password,
			role: data.role,
		} as TAdminLoginRequest);
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className={cn(
					"rounded-[28px] border border-slate-200/80 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)]",
					"space-y-6",
					"dark:border-slate-800 dark:bg-slate-950",
					className,
				)}
				{...props}
			>
				{/* Header */}
				<div className="space-y-2">
					<h2 className="text-[32px] font-bold tracking-[-0.03em] text-slate-900 dark:text-white">
						Đăng nhập hệ thống
					</h2>
					<p className="max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
						Truy cập khu vực quản trị với quyền phù hợp cho tài khoản của bạn.
					</p>
				</div>

				{/* Role */}
				<FormField
					control={form.control}
					name="role"
					render={({ field }) => (
						<FormItem className="space-y-3">
							<FormLabel className="text-sm font-semibold text-slate-800 dark:text-slate-200">
								Vai trò đăng nhập
							</FormLabel>

							<FormControl>
								<div className="space-y-2">
									<div className="relative grid grid-cols-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-900">
										<div
											className={cn(
												"absolute left-1 top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-[14px] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)] transition-transform duration-300 ease-out dark:bg-slate-800",
												field.value === "MANAGER" && "translate-x-full",
											)}
										/>

										<button
											type="button"
											onClick={() => handleRoleChange("ADMIN")}
											className={cn(
												"relative z-10 rounded-[14px] px-4 py-3 text-sm font-semibold transition-colors duration-200",
												field.value === "ADMIN"
													? "text-slate-900 dark:text-white"
													: "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
											)}
										>
											Admin
										</button>

										<button
											type="button"
											onClick={() => handleRoleChange("MANAGER")}
											className={cn(
												"relative z-10 rounded-[14px] px-4 py-3 text-sm font-semibold transition-colors duration-200",
												field.value === "MANAGER"
													? "text-slate-900 dark:text-white"
													: "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
											)}
										>
											Manager
										</button>
									</div>

									<FormDescription className="text-xs text-slate-500 dark:text-slate-400">
										Chọn đúng quyền để vào đúng khu vực quản trị.
									</FormDescription>
								</div>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Email */}
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem className="space-y-2.5">
							<FormLabel className="text-sm font-semibold text-slate-800 dark:text-slate-200">
								Email
							</FormLabel>
							<FormControl>
								<Input
									placeholder="ten@example.com"
									className={cn(
										"h-13 rounded-2xl border bg-white px-4 text-[15px] shadow-none transition-all",
										"border-slate-200 placeholder:text-slate-400",
										"dark:border-slate-800 dark:bg-slate-900",
										isAdmin
											? "focus-visible:ring-4 focus-visible:ring-blue-500/10"
											: "focus-visible:ring-4 focus-visible:ring-orange-500/10",
									)}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Password */}
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem className="space-y-2.5">
							<FormLabel className="text-sm font-semibold text-slate-800 dark:text-slate-200">
								Mật khẩu
							</FormLabel>
							<FormControl>
								<PasswordInput
									placeholder="••••••••"
									className={cn(
										"h-13 rounded-2xl border bg-white px-4 text-[15px] shadow-none transition-all",
										"border-slate-200 placeholder:text-slate-400",
										"dark:border-slate-800 dark:bg-slate-900",
										isAdmin
											? "focus-visible:ring-4 focus-visible:ring-blue-500/10"
											: "focus-visible:ring-4 focus-visible:ring-orange-500/10",
									)}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Submit */}
				<div className="space-y-3 pt-1">
					<Button
						type="submit"
						size="lg"
						disabled={isLoading}
						className={cn(
							"h-13 w-full rounded-2xl text-sm font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)] transition-all duration-200",
							"hover:translate-y-[-1px] active:translate-y-0",
							isAdmin
								? "bg-blue-600 hover:bg-blue-700"
								: "bg-orange-500 hover:bg-orange-600",
						)}
					>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Đang đăng nhập...
							</>
						) : (
							"Đăng nhập"
						)}
					</Button>

					<p className="text-center text-xs leading-6 text-slate-500 dark:text-slate-400">
						Bằng cách đăng nhập, bạn xác nhận đang sử dụng đúng tài khoản được
						cấp quyền.
					</p>
				</div>
			</form>
		</Form>
	);
};
