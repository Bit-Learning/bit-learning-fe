import type React from "react";
import { Link } from "@tanstack/react-router";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { AuthLayout } from "../auth-layout";
import { OtpForm } from "../components/otp-form";

const Otp: React.FC = () => {
	return (
		<AuthLayout>
			<Card className="gap-4">
				<CardHeader>
					<CardTitle className="text-base tracking-tight text-slate-800">
						Xác thực hai bước
					</CardTitle>
					<CardDescription>
						Vui lòng nhập mã xác thực. <br />
						Chúng tôi đã gửi mã xác thực đến email của bạn.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<OtpForm />
				</CardContent>
				<CardFooter>
					<p className="text-muted-foreground px-8 text-center text-sm">
						Chưa nhận được mã?{" "}
						<Link
							to="/sign-in"
							className="font-semibold text-blue-600 underline-offset-4 hover:underline"
						>
							Gửi lại mã mới.
						</Link>
					</p>
				</CardFooter>
			</Card>
		</AuthLayout>
	);
};

export default Otp;
