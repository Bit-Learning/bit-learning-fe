import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import { useBypassLogin, useLogin } from "../queries/useAuth";

const formSchema = z.object({
	email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
	password: z
		.string()
		.min(1, "Vui lòng nhập mật khẩu")
		.min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
	redirectTo?: string;
}

export const UserAuthForm: React.FC<UserAuthFormProps> = ({
	className,
	redirectTo,
	...props
}) => {
	const { mutate: login, isPending: isLoading } = useLogin({
		redirectTo,
		on2FARequired: (email: any) => {
			toast.info(`Yêu cầu xác thực 2FA cho ${email}`);
		},
	});

	const { bypassLogin: bypassAsAdmin } = useBypassLogin({
		redirectTo,
		role: "ADMIN",
	});
	const { bypassLogin: bypassAsManager } = useBypassLogin({
		redirectTo,
		role: "MANAGER",
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { email: "", password: "" },
	});

	function onSubmit(data: z.infer<typeof formSchema>) {
		// ✅ FIX: Remove hardcoded role, let backend determine it
		login({
			email: data.email,
			password: data.password,
		});
	}

	const fillMockAdminAccount = () => {
		form.setValue("email", "admin@gmail.com");
		form.setValue("password", "123456");
		toast.info("Đã điền thông tin tài khoản Admin");
	};

	const fillMockManagerAccount = () => {
		form.setValue("email", "manager@gmail.com");
		form.setValue("password", "123456");
		toast.info("Đã điền thông tin tài khoản Manager");
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className={cn("grid gap-5", className)}
				{...props}
			>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-[#aaa]">Email</FormLabel>
							<FormControl>
								<Input
									placeholder="name@gmail.com"
									className="border-[#0f0]/30 bg-[#333] text-white placeholder:text-gray-500 focus:border-[#0f0] focus:ring-[#0f0]"
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
						<FormItem className="relative">
							<FormLabel className="text-[#aaa]">Mật khẩu</FormLabel>
							<FormControl>
								<PasswordInput
									placeholder="********"
									className="border-[#0f0]/30 bg-[#333] text-white placeholder:text-gray-500 focus:border-[#0f0] focus:ring-[#0f0]"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button
					size="lg"
					className="mt-2 bg-[#0f0] text-black hover:bg-[#00ff00]/80"
					disabled={isLoading}
				>
					{isLoading ? <Loader2 className="animate-spin" /> : <LogIn />}
					Đăng nhập
				</Button>

				{import.meta.env.DEV && (
					<div className="space-y-2">
						{/* Mock Account Buttons */}
						<div className="grid grid-cols-2 gap-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={fillMockAdminAccount}
								className="border-[#0f0]/30 text-[#0f0] hover:bg-[#0f0]/10 hover:text-[#0f0]"
								disabled={isLoading}
							>
								📝 Admin Mock
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={fillMockManagerAccount}
								className="border-[#0f0]/30 text-[#0f0] hover:bg-[#0f0]/10 hover:text-[#0f0]"
								disabled={isLoading}
							>
								📝 Manager Mock
							</Button>
						</div>

						{/* Bypass Buttons */}
						<div className="grid grid-cols-2 gap-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={bypassAsAdmin}
								className="border-[#0f0]/50 bg-[#0f0]/10 text-[#0f0] hover:bg-[#0f0]/20 hover:text-[#0f0]"
								disabled={isLoading}
							>
								🚀 Bypass Admin
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={bypassAsManager}
								className="border-yellow-500/50 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-500"
								disabled={isLoading}
							>
								🚀 Bypass Manager
							</Button>
						</div>
					</div>
				)}
			</form>
		</Form>
	);
};
