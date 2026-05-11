import { cn } from "@workspace/ui/lib/utils";
import { Loader2, XCircle } from "lucide-react";

interface Props {
	hasError: string | boolean | null;
	localError: string | null;
	error: unknown;
	fullScreen?: boolean;
}

function getErrorMessage(error: unknown) {
	if (
		typeof error === "object" &&
		error !== null &&
		"response" in error &&
		typeof error.response === "object" &&
		error.response !== null &&
		"data" in error.response &&
		typeof error.response.data === "object" &&
		error.response.data !== null &&
		"message" in error.response.data &&
		typeof error.response.data.message === "string"
	) {
		return error.response.data.message;
	}

	return "Đã xảy ra lỗi";
}

function AuthCallbackPageContent({
	hasError,
	localError,
	error,
	fullScreen = false,
}: Props) {
	const wrapperClassName = fullScreen
		? "flex min-h-screen items-center justify-center bg-slate-50 px-4 py-6"
		: "flex min-h-[320px] w-full items-center justify-center";

	const cardClassName = fullScreen
		? "w-full max-w-md rounded-[28px] border border-slate-200 bg-white/95 p-6 text-center shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur sm:p-8"
		: "w-full rounded-[24px] border border-slate-200 bg-white/95 p-6 text-center shadow-none";

	return (
		<div className={wrapperClassName}>
			<div className={cardClassName}>
				{hasError ? (
					<>
						<div className="mb-5 flex justify-center">
							<div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
								<XCircle className="h-7 w-7 text-red-600" />
							</div>
						</div>
						<h2 className="mb-2 text-xl font-bold tracking-[-0.03em] text-slate-900">
							Đăng nhập thất bại
						</h2>
						<p className="text-sm leading-6 text-slate-500">
							{localError || getErrorMessage(error)}
						</p>
						<p className="mt-4 text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
							Đang chuyển hướng về trang đăng nhập...
						</p>
					</>
				) : (
					<>
						<div className="mb-5 flex justify-center">
							<div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
								<div className="absolute inset-0 rounded-full border border-slate-200" />
								<Loader2 className="h-7 w-7 animate-spin text-slate-700" />
							</div>
						</div>
						<h2 className="mb-2 text-xl font-bold tracking-[-0.03em] text-slate-900">
							Đang xử lý đăng nhập
						</h2>
						<p className="text-sm leading-6 text-slate-500">
							Vui lòng đợi trong khi chúng tôi xác thực thông tin của bạn...
						</p>
						<div className="mt-6 flex items-center justify-center gap-2">
							<div
								className={cn(
									"h-2.5 w-2.5 animate-bounce rounded-full bg-slate-900 [animation-delay:-0.3s]",
								)}
							/>
							<div
								className={cn(
									"h-2.5 w-2.5 animate-bounce rounded-full bg-slate-900 [animation-delay:-0.15s]",
								)}
							/>
							<div className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-900" />
						</div>
					</>
				)}
			</div>
		</div>
	);
}
export default AuthCallbackPageContent;
