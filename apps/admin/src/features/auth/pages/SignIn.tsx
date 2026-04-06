import type React from "react";
import { cn } from "@/shared/lib/utils";
import dashboard from "@/shared/assets/dashboard.jpg";
import { UserAuthForm } from "../components/user-auth-form";

const SignIn: React.FC = () => {
	return (
		<div className="container relative grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
			<div className="flex h-full flex-col items-center justify-center bg-white px-6 lg:p-8">
				<div className="mx-auto w-full max-w-sm space-y-8">
					<div className="space-y-1 text-center">
						<div className="flex items-center justify-center gap-2">
							<img
								src="./Logo.png"
								alt="Bit Learning Logo"
								className="h-10 w-full object-contain"
							/>
						</div>
					</div>

					<UserAuthForm />

					<p className="text-center text-xs text-slate-400">
						Bằng cách đăng nhập, bạn đồng ý với{" "}
						<a
							href="/terms"
							className="underline underline-offset-2 hover:text-blue-600"
						>
							Điều khoản dịch vụ
						</a>{" "}
						và{" "}
						<a
							href="/privacy"
							className="underline underline-offset-2 hover:text-blue-600"
						>
							Chính sách bảo mật
						</a>
						.
					</p>
				</div>
			</div>

			<div
				className={cn(
					"bg-slate-100 relative h-full overflow-hidden max-lg:hidden",
					"[&>img]:absolute [&>img]:inset-0 [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>img]:object-top-left [&>img]:select-none",
				)}
			>
				<img src={dashboard} width={1024} height={1151} alt="Dashboard" />
			</div>
		</div>
	);
};

export default SignIn;
