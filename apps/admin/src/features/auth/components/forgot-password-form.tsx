import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import { cn, sleep } from "@/shared/lib/utils";

const formSchema = z.object({
	email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
});

export function ForgotPasswordForm({
	className,
	...props
}: React.HTMLAttributes<HTMLFormElement>) {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { email: "" },
	});

	function onSubmit(data: z.infer<typeof formSchema>) {
		setIsLoading(true);

		toast.promise(sleep(2000), {
			loading: "Đang gửi email...",
			success: () => {
				setIsLoading(false);
				form.reset();
				navigate({ to: "/otp" });
				return `Đã gửi email đến ${data.email}`;
			},
			error: () => {
				setIsLoading(false);
				return "Gửi email thất bại. Vui lòng thử lại.";
			},
		});
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className={cn("grid gap-3", className)}
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
									className="h-11 rounded-lg border-2 focus:border-blue-500 focus:ring-blue-100"
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
					Tiếp tục
					{isLoading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<ArrowRight className="h-4 w-4" />
					)}
				</Button>
			</form>
		</Form>
	);
}
