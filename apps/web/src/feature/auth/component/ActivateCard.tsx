import { useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useActivateAccount } from "../queries/useAuth";

const ActivateCard: React.FC = () => {
	const search = useSearch({ from: "/api/auth/activate" });
	const navigate = useNavigate();
	const {
		mutate: activateAccount,
		isSuccess,
		isError,
		error,
	} = useActivateAccount();
	const [activationStatus, setActivationStatus] = useState<
		"pending" | "success" | "error"
	>("pending");

	useEffect(() => {
		const key = (search as any)?.key;

		if (!key) {
			setActivationStatus("error");
			return;
		}
		activateAccount(key);
	}, [search, activateAccount]);

	useEffect(() => {
		if (isSuccess) {
			setActivationStatus("success");
			setTimeout(() => {
				navigate({ to: "/signin" });
			}, 3000);
		}

		if (isError) {
			setActivationStatus("error");
		}
	}, [isSuccess, isError, navigate]);

	return (
		<div className="bg-linear-to-br flex min-h-screen items-center justify-center from-gray-50 to-gray-100 px-4 py-12 sm:px-6 lg:px-8">
			<div className="w-full max-w-md">
				<div className="rounded-xl bg-white p-8 shadow-lg">
					<div className="text-center">
						<h2 className="text-3xl font-bold tracking-tight text-gray-900">
							Kích hoạt tài khoản
						</h2>
						<p className="mt-2 text-sm text-gray-600">
							Đang xác thực thông tin của bạn
						</p>
					</div>

					<div className="mt-8">
						{activationStatus === "pending" && (
							<div className="text-center">
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
									<Loader2 className="h-12 w-12 animate-spin text-blue-600" />
								</div>
								<p className="text-base font-medium text-gray-700">
									Đang kích hoạt tài khoản của bạn...
								</p>
								<p className="mt-1 text-sm text-gray-500">
									Vui lòng đợi trong giây lát
								</p>
							</div>
						)}

						{activationStatus === "success" && (
							<div className="text-center">
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
									<CheckCircle2 className="h-10 w-10 text-green-600" />
								</div>
								<h3 className="mb-2 text-xl font-semibold text-gray-900">
									Kích hoạt thành công!
								</h3>
								<p className="mb-1 text-gray-600">
									Tài khoản của bạn đã được kích hoạt thành công.
								</p>
								<p className="mb-6 text-sm text-gray-500">
									Đang chuyển hướng đến trang đăng nhập...
								</p>
								<Button
									onClick={() => navigate({ to: "/signin" })}
									className="w-full"
									size="lg"
								>
									Đăng nhập ngay
								</Button>
							</div>
						)}

						{activationStatus === "error" && (
							<div className="text-center">
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
									<XCircle className="h-10 w-10 text-red-600" />
								</div>
								<h3 className="mb-2 text-xl font-semibold text-gray-900">
									Kích hoạt thất bại
								</h3>
								<p className="mb-6 text-gray-600">
									{(error as any)?.response?.data?.message ||
										"Liên kết kích hoạt không hợp lệ hoặc đã hết hạn."}
								</p>
								<div className="space-y-3">
									<Button
										onClick={() => navigate({ to: "/signup" })}
										className="w-full"
										size="lg"
									>
										Đăng ký lại
									</Button>
									<Button
										onClick={() => navigate({ to: "/signin" })}
										variant="outline"
										className="w-full"
										size="lg"
									>
										Quay lại đăng nhập
									</Button>
								</div>
							</div>
						)}
					</div>
				</div>

				<p className="mt-4 text-center text-sm text-gray-500">
					Bạn cần hỗ trợ?{" "}
					<a
						href="/support"
						className="font-medium text-blue-600 hover:text-blue-500"
					>
						Liên hệ với chúng tôi
					</a>
				</p>
			</div>
		</div>
	);
};

export default ActivateCard;
