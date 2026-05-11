import { useState } from "react";
import type React from "react";
import { cn } from "@/shared/lib/utils";
import dashboard from "@/shared/assets/dashboard.jpg";
import managerBg from "@/shared/assets/dashboard2.jpg"; // ← swap with your actual asset
import { UserAuthForm } from "../components/user-auth-form";

interface SignInProps {
	adminBackgroundUrl?: string;
	managerBackgroundUrl?: string;
}

const SignIn: React.FC<SignInProps> = ({
	adminBackgroundUrl = dashboard,
	managerBackgroundUrl = managerBg,
}) => {
	const [role, setRole] = useState<"ADMIN" | "MANAGER">("ADMIN");
	const isManager = role === "MANAGER";

	return (
		<div className="relative h-svh w-full overflow-hidden lg:flex">
			{/* ── Form Panel ─────────────────────────────────────────────── */}
			<div
				className={cn(
					"absolute inset-y-0 flex w-full flex-col items-center justify-center bg-white px-6 transition-all duration-500 ease-in-out lg:w-1/2 lg:px-8",
					isManager ? "lg:translate-x-full" : "lg:translate-x-0",
					"z-10",
				)}
				style={{ willChange: "transform" }}
			>
				<div className="mx-auto w-full max-w-sm space-y-8">
					<div className="space-y-1 text-center">
						<div className="flex items-center justify-center gap-2">
							<img
								src="/Logo.png"
								alt="Bit Learning Logo"
								className="h-10 w-full object-contain"
							/>
						</div>
					</div>

					<UserAuthForm onRoleChange={setRole} />

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

			{/* ── Background Panel ───────────────────────────────────────── */}
			<div
				className={cn(
					"absolute inset-y-0 hidden w-1/2 overflow-hidden transition-all duration-500 ease-in-out lg:block",
					isManager ? "left-0" : "left-1/2",
				)}
				style={{ willChange: "transform" }}
			>
				{/* Color overlay */}
				<div
					className={cn(
						"absolute inset-0 z-10 opacity-20",
						isManager
							? "bg-linear-to-r from-orange-900 to-transparent"
							: "bg-linear-to-l from-blue-900 to-transparent",
					)}
				/>

				{/* Admin background — visible by default, fades out on Manager */}
				<img
					src={adminBackgroundUrl}
					alt="Admin Background"
					className={cn(
						"absolute inset-0 h-full w-full select-none object-cover object-top-left transition-opacity duration-500",
						isManager ? "opacity-0" : "opacity-100",
					)}
					draggable={false}
				/>

				{/* Manager background — hidden by default, fades in on Manager */}
				<img
					src={managerBackgroundUrl}
					alt="Manager Background"
					className={cn(
						"absolute inset-0 h-full w-full select-none object-cover object-top-left transition-opacity duration-500",
						isManager ? "opacity-100" : "opacity-0",
					)}
					draggable={false}
				/>
			</div>
		</div>
	);
};

export default SignIn;
