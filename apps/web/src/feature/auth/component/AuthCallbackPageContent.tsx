import { Loader2, XCircle } from "lucide-react";

interface Props {
	hasError: string | boolean | null;
	localError: string | null;
	error: unknown;
}

function AuthCallbackPageContent({ hasError, localError, error }: Props) {
	return (
		<div className="flex min-h-screen items-center justify-center from-gray-50 to-gray-100">
			<div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-xl">
				{hasError ? (
					<>
						<div className="mb-4 flex justify-center">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
								<XCircle className="h-8 w-8 text-red-600" />
							</div>
						</div>
						<h2 className="mb-2 text-xl font-bold text-gray-900">
							Đăng nhập thất bại
						</h2>
						<p className="text-sm text-gray-600">
							{localError ||
								(error as any)?.response?.data?.message ||
								"Đã xảy ra lỗi"}
						</p>
						<p className="mt-4 text-xs text-gray-500">
							Đang chuyển hướng về trang đăng nhập...
						</p>
					</>
				) : (
					<>
						<Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-gray-900" />
						<h2 className="mb-2 text-xl font-bold text-gray-900">
							Đang xử lý đăng nhập
						</h2>
						<p className="text-sm text-gray-600">
							Vui lòng đợi trong khi chúng tôi xác thực thông tin của bạn...
						</p>
						<div className="mt-6 flex justify-center gap-2">
							<div className="h-2 w-2 animate-bounce rounded-full bg-gray-900 [animation-delay:-0.3s]" />
							<div className="h-2 w-2 animate-bounce rounded-full bg-gray-900 [animation-delay:-0.15s]" />
							<div className="h-2 w-2 animate-bounce rounded-full bg-gray-900" />
						</div>
					</>
				)}
			</div>
		</div>
	);
}
export default AuthCallbackPageContent;
