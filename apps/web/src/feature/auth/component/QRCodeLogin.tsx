import { useNavigate } from "@tanstack/react-router";
import { toast } from "@/shared/components/Sonner";
import { QRCodeSVG } from "qrcode.react";
import React, { useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { authApi } from "../api/auth.api";
import { setErrorAction, setIsAuthenticatedAction } from "../store";
import { getApiBaseUrl } from "@/shared/config/runtime-urls";

enum QRStatus {
	LOADING = "loading",
	PENDING = "pending",
	SCANNED = "scanned",
	CONFIRMED = "confirmed",
	EXPIRED = "expired",
	ERROR = "error",
}

const QRCodeLogin: React.FC = () => {
	const [qrToken, setQrToken] = React.useState<string>("");
	const [status, setStatus] = React.useState<QRStatus>(QRStatus.LOADING);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const eventSourceRef = useRef<EventSource | null>(null);
	const statusRef = useRef<QRStatus>(QRStatus.LOADING);

	useEffect(() => {
		statusRef.current = status;
	}, [status]);

	const generateQR = useCallback(async () => {
		try {
			setStatus(QRStatus.LOADING);
			const response = await authApi.generateQRToken();
			const token = response.data.data.qrToken;

			setQrToken(token);
			setStatus(QRStatus.PENDING);

			// Connect to SSE stream
			const apiBaseUrl = getApiBaseUrl();
			const es = new EventSource(`${apiBaseUrl}/auth/qr/stream/${token}`, {
				withCredentials: true,
			});

			es.addEventListener("QR_EVENT", (event) => {
				const data = JSON.parse(event.data);
				console.log("[QRCodeLogin] Received QR_EVENT:", data);

				switch (data.status) {
					case "SCANNED":
						setStatus(QRStatus.SCANNED);
						toast.info({
							title: "Đã quét mã QR",
							description:
								"Vui lòng xác nhận đăng nhập trên thiết bị di động của bạn",
						});
						break;

					case "CONFIRMED": {
						setStatus(QRStatus.CONFIRMED);
						const accessToken = data.token;

						// Store token and update auth state
						if (accessToken) {
							document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Lax`;

							dispatch(setIsAuthenticatedAction(true));
							dispatch(setErrorAction(null));

							toast.success({
								title: "Đăng nhập thành công!",
								description: "Chào mừng bạn quay trở lại",
							});

							// Close SSE connection
							es.close();

							// Navigate to home
							setTimeout(() => {
								navigate({ to: "/" });
							}, 500);
						}
						break;
					}

					case "EXPIRED":
						setStatus(QRStatus.EXPIRED);
						es.close();
						// No toast needed - UI shows expired state clearly
						break;
				}
			});

			es.onerror = (error) => {
				console.error("[QRCodeLogin] SSE Error:", error);
				// Check if already in a terminal state
				if (
					statusRef.current !== QRStatus.EXPIRED &&
					statusRef.current !== QRStatus.CONFIRMED
				) {
					setStatus(QRStatus.ERROR);
					es.close();
					// Only show error toast for actual connection errors, not timeout
					toast.error({
						title: "Lỗi kết nối",
						description: "Không thể kết nối đến máy chủ. Vui lòng thử lại.",
					});
				}
			};

			eventSourceRef.current = es;
		} catch (error: any) {
			console.error("[QRCodeLogin] Error generating QR:", error);
			setStatus(QRStatus.ERROR);

			// Show specific error message based on error type
			const errorMessage =
				error?.response?.data?.message ||
				"Không thể tạo mã QR. Vui lòng thử lại.";

			toast.error({
				title: "Lỗi",
				description: errorMessage,
			});
		}
	}, [dispatch, navigate]);

	React.useEffect(() => {
		generateQR();

		return () => {
			if (eventSourceRef.current) {
				eventSourceRef.current.close();
			}
		};
	}, [generateQR]);

	const handleRefresh = () => {
		if (eventSourceRef.current) {
			eventSourceRef.current.close();
		}
		generateQR();
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col items-center space-y-4">
				{status === QRStatus.LOADING && (
					<div className="flex h-64 w-64 items-center justify-center rounded-lg border-2 border-gray-200 bg-gray-50">
						<div className="text-center">
							<div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
							<p className="text-sm text-gray-600">Đang tạo mã QR...</p>
						</div>
					</div>
				)}

				{status === QRStatus.PENDING && qrToken && (
					<div className="rounded-lg border-2 border-gray-200 bg-white p-1">
						<QRCodeSVG
							value={qrToken}
							size={256}
							bgColor={"#ffffff"}
							fgColor={"#000000"}
							level={"H"} // QUAN TRỌNG: Mức độ sửa lỗi cao nhất (High)
							marginSize={10}
							imageSettings={{
								src: "/Logo.png", // Đường dẫn logo (để trong thư mục public)
								x: undefined, // Để undefined để tự căn giữa
								y: undefined,
								height: 50, // Chiều cao logo (px)
								width: 50, // Chiều rộng logo (px)
								excavate: true, // true = khoét thủng QR để đặt logo (tránh đè lên chấm)
							}}
						/>
					</div>
				)}

				{status === QRStatus.SCANNED && qrToken && (
					<div className="relative rounded-lg border-2 border-green-200 bg-green-50 p-4">
						<QRCodeSVG
							value={qrToken}
							size={256}
							bgColor={"#ffffff"}
							fgColor={"#000000"}
							level={"H"}
							marginSize={10}
							imageSettings={{
								src: "/Logo.png",
								x: undefined,
								y: undefined,
								height: 50,
								width: 50,
								excavate: true,
							}}
						/>
						<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-green-500 bg-opacity-20 backdrop-blur-sm">
							<div className="rounded-lg bg-white p-4 text-center shadow-lg">
								<div className="mb-2 flex justify-center">
									<svg
										className="h-12 w-12 text-green-500"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</div>
								<p className="font-semibold text-gray-900">Đã quét!</p>
								<p className="text-sm text-gray-600">
									Xác nhận trên điện thoại
								</p>
							</div>
						</div>
					</div>
				)}

				{status === QRStatus.CONFIRMED && (
					<div className="flex h-64 w-64 items-center justify-center rounded-lg border-2 border-green-200 bg-green-50">
						<div className="text-center">
							<div className="mb-2 flex justify-center">
								<svg
									className="h-16 w-16 text-green-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<p className="font-semibold text-gray-900">
								Đăng nhập thành công!
							</p>
							<p className="text-sm text-gray-600">Đang chuyển hướng...</p>
						</div>
					</div>
				)}

				{(status === QRStatus.EXPIRED || status === QRStatus.ERROR) && (
					<div className="relative h-64 w-64">
						{/* QR content with blur effect */}
						<div className="h-full w-full rounded-lg border-2 border-red-200 bg-white p-4 opacity-50 blur-sm transition-all duration-300">
							{qrToken && (
								<QRCodeSVG
									value={qrToken}
									size={208}
									bgColor={"#ffffff"}
									fgColor={"#000000"}
									level={"H"}
									marginSize={0}
									imageSettings={{
										src: "/Logo.png",
										x: undefined,
										y: undefined,
										height: 40,
										width: 40,
										excavate: true,
									}}
								/>
							)}
						</div>

						{/* Overlay when expired/error */}
						<div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm">
							<svg
								className={`mb-3 h-12 w-12 ${status === QRStatus.EXPIRED ? "text-orange-500" : "text-red-500"}`}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								{status === QRStatus.EXPIRED ? (
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								) : (
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									/>
								)}
							</svg>

							<p className="mb-1 text-base font-semibold text-gray-900">
								{status === QRStatus.EXPIRED
									? "Mã QR đã hết hạn"
									: "Không thể tải mã QR"}
							</p>

							<p className="mb-4 px-4 text-center text-xs text-gray-600">
								{status === QRStatus.EXPIRED
									? "Mã QR có hiệu lực trong 2 phút. Vui lòng tạo mã mới."
									: "Vui lòng kiểm tra kết nối mạng và thử lại."}
							</p>

							<button
								type="button"
								onClick={handleRefresh}
								className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
							>
								<svg
									className="h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
									/>
								</svg>
								Tạo mã mới
							</button>
						</div>
					</div>
				)}
			</div>
			<div className="text-center">
				<h2 className="mb-2 text-xl font-bold text-gray-900">
					Đăng nhập bằng mã QR
				</h2>
				<p className="text-sm text-gray-600">
					Quét mã từ Bit Learning Mobile để đăng nhập nhanh chóng
				</p>
			</div>
		</div>
	);
};

export default QRCodeLogin;
