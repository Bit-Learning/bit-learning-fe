import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { IconFacebook, IconGithub } from "@/shared/assets/brand-icons";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/shared/lib/utils";

const formSchema = z
	.object({
		email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
		password: z
			.string()
			.min(1, "Vui lòng nhập mật khẩu")
			.min(7, "Mật khẩu phải có ít nhất 7 ký tự"),
		confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Mật khẩu xác nhận không khớp.",
		path: ["confirmPassword"],
	});

export function SignUpForm({
	className,
	...props
}: React.HTMLAttributes<HTMLFormElement>) {
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { email: "", password: "", confirmPassword: "" },
	});

	function onSubmit(data: z.infer<typeof formSchema>) {
		setIsLoading(true);
		console.log(data);
		setTimeout(() => {
			setIsLoading(false);
		}, 3000);
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className={cn("grid gap-4", className)}
				{...props}
			>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm font-semibold text-slate-600">
								Email
							</FormLabel>
							<FormControl>
								<Input
									placeholder="ten@example.com"
									className="h-11 rounded-lg border-2 focus:border-blue-500"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm font-semibold text-slate-600">
								Mật khẩu
							</FormLabel>
							<FormControl>
								<PasswordInput
									placeholder="••••••••"
									className="h-11 rounded-lg border-2 focus:border-blue-500"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="confirmPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm font-semibold text-slate-600">
								Xác nhận mật khẩu
							</FormLabel>
							<FormControl>
								<PasswordInput
									placeholder="••••••••"
									className="h-11 rounded-lg border-2 focus:border-blue-500"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button
					className="mt-1 h-11 w-full rounded-lg bg-primary font-semibold text-white hover:bg-blue-700"
					disabled={isLoading}
				>
					Tạo tài khoản
				</Button>

				<div className="relative my-1">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t border-slate-200" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-background px-2 text-slate-400">
							Hoặc tiếp tục với
						</span>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-2">
					<Button
						variant="outline"
						className="w-full rounded-lg border-2 hover:border-slate-300"
						type="button"
						disabled={isLoading}
					>
						<IconGithub className="h-4 w-4" /> GitHub
					</Button>
					<Button
						variant="outline"
						className="w-full rounded-lg border-2 hover:border-slate-300"
						type="button"
						disabled={isLoading}
					>
						<IconFacebook className="h-4 w-4" /> Facebook
					</Button>
				</div>
			</form>
		</Form>
	);
}
