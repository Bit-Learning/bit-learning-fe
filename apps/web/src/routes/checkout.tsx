import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { CreatePaymentURL } from "@/feature/payment/service/paymentService";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/Card";
import { toast } from "@workspace/ui/components/Sonner";
import CardTransaction from "@workspace/ui/components/uiverse/plastic-goose-38/CardTransaction";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/update/select";
import {
	CheckCircle,
	ChevronLeftIcon,
	CreditCard,
	Lock,
	Sparkles,
	Wallet,
	Zap,
} from "lucide-react";
import * as React from "react";
import { useSelector } from "react-redux";

export const Route = createFileRoute("/checkout")({
	component: CheckoutPage,
});

function CheckoutPage() {
	const navigate = useNavigate();
	const { userInfo } = useSelector(selectAuthStateInfo);
	const [amount, setAmount] = React.useState<string>("");
	const [method, setMethod] = React.useState("vnpay");
	const [isProcessing, setIsProcessing] = React.useState(false);
	const MIN_AMOUNT = 10000;

	const parsed = Number.parseFloat(amount);
	const isNumber = !Number.isNaN(parsed);
	const valid = isNumber && parsed >= MIN_AMOUNT;

	const handleConfirm = async () => {
		if (!valid || !userInfo?.wallet?.id) return;

		setIsProcessing(true);
		try {
			const res = await CreatePaymentURL({
				amount: parsed,
				description: "Nạp tiền vào ví",
				walletId: userInfo.wallet.id,
			});

			if (res.data.data?.url) {
				window.location.href = res.data.data.url;
			} else {
				toast.error({ title: "Không nhận được đường dẫn thanh toán" });
			}
		} catch (error) {
			console.error("Payment error:", error);
			toast.error({ title: "Đã xảy ra lỗi trong quá trình thanh toán" });
		} finally {
			setIsProcessing(false);
		}
	};

	const quickAmounts = [50000, 100000, 200000, 500000, 1000000];

	return (
		<div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
			<div className="container mx-auto px-2 py-4 md:py-8">
				{/* Back Button */}
				<div className="mb-6 shrink-0">
					<Link
						to="/user-profile"
						className="group inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-white/80 hover:text-blue-600 hover:shadow-sm dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-blue-400"
					>
						<ChevronLeftIcon className="size-5 transition-transform group-hover:-translate-x-1" />
						<span>Trang chủ</span>
					</Link>
				</div>

				<div className="mx-auto max-w-7xl">
					{/* Header */}
					<div className="mb-8 flex items-center justify-start gap-20 text-left">
						<img
							src="./Logo.png"
							alt="Bithub Logo"
							className="h-10 w-36 object-contain"
						/>

						<h1 className="mb-3 bg-linear-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-4xl font-bold text-transparent dark:from-white dark:via-blue-200 dark:to-indigo-200 md:text-5xl">
							Nạp tiền vào ví
						</h1>
					</div>

					<div className="grid gap-6 lg:grid-cols-5">
						{/* Main Form */}
						<div className="lg:col-span-3">
							<Card className=" overflow-hidden border-0 shadow-xl shadow-gray-200/50 backdrop-blur-sm dark:shadow-gray-900/50">
								<CardHeader className="border-b border-gray-100 bg-linear-to-r from-white to-gray-50/50 dark:border-gray-800 dark:from-gray-900 dark:to-gray-800/50">
									<CardTitle className="flex items-center gap-3 text-xl">
										<div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
											<Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
										</div>
										Thông tin nạp tiền
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-8 p-6 md:p-6">
									{/* Payment Method */}
									<div className="space-y-3">
										<label
											htmlFor="payment-method"
											className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
										>
											<CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
											Phương thức thanh toán
										</label>
										<Select value={method} onValueChange={setMethod}>
											<SelectTrigger
												id="payment-method"
												className="h-14 w-full border-gray-200 bg-white transition-all hover:border-blue-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600"
											>
												<SelectValue placeholder="Chọn phương thức" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="vnpay">
													<div className="flex items-center gap-3 py-1">
														<div className="rounded bg-blue-100 p-1.5 dark:bg-blue-900/30">
															<CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
														</div>
														<div className="flex flex-row">
															<div className="font-medium">VNPAY</div>
															<div className="text-xs text-gray-500">
																Thanh toán nhanh chóng
															</div>
														</div>
													</div>
												</SelectItem>
												<SelectItem disabled value="momo">
													<div className="flex items-center gap-3 py-1 opacity-50">
														<div className="rounded bg-gray-100 p-1.5 dark:bg-gray-800">
															<CreditCard className="h-4 w-4" />
														</div>
														<div>
															<div className="font-medium">Momo</div>
															<div className="text-xs text-gray-500">
																Sắp ra mắt
															</div>
														</div>
													</div>
												</SelectItem>
												<SelectItem disabled value="zalopay">
													<div className="flex items-center gap-3 py-1 opacity-50">
														<div className="rounded bg-gray-100 p-1.5 dark:bg-gray-800">
															<CreditCard className="h-4 w-4" />
														</div>
														<div>
															<div className="font-medium">ZaloPay</div>
															<div className="text-xs text-gray-500">
																Sắp ra mắt
															</div>
														</div>
													</div>
												</SelectItem>
												<SelectItem disabled value="visa">
													<div className="flex items-center gap-3 py-1 opacity-50">
														<div className="rounded bg-gray-100 p-1.5 dark:bg-gray-800">
															<CreditCard className="h-4 w-4" />
														</div>
														<div>
															<div className="font-medium">Visa/Mastercard</div>
															<div className="text-xs text-gray-500">
																Sắp ra mắt
															</div>
														</div>
													</div>
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									{/* Quick Amounts */}
									<div className="space-y-3">
										<p className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
											<Zap className="h-4 w-4 text-amber-500" />
											Chọn nhanh
										</p>
										<div className="grid grid-cols-3 gap-3 md:grid-cols-5">
											{quickAmounts.map((quickAmount) => (
												<Button
													key={quickAmount}
													type="button"
													variant={
														parsed === quickAmount ? "default" : "outline"
													}
													onClick={() => setAmount(quickAmount.toString())}
													className={`relative h-14 overflow-hidden font-semibold transition-all hover:scale-105 ${
														parsed === quickAmount
															? "bg-linear-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30"
															: "border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-600 dark:hover:bg-blue-900/20"
													}`}
												>
													<span className="text-sm md:text-base">
														{(quickAmount / 1000).toLocaleString("vi-VN")}K
													</span>
													{parsed === quickAmount && (
														<div className="absolute inset-0 -z-10 animate-pulse bg-linear-to-br from-blue-400 to-indigo-400 opacity-50" />
													)}
												</Button>
											))}
										</div>
									</div>

									{/* Amount Input */}
									<div className="space-y-3">
										<label
											htmlFor="amount"
											className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
										>
											<Sparkles className="h-4 w-4 text-purple-500" />
											Số tiền (VNĐ)
										</label>
										<div className="relative">
											<input
												id="amount"
												type="number"
												min="0"
												step="1000"
												value={amount}
												onChange={(e) => setAmount(e.target.value)}
												className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-2xl font-bold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900/30"
												placeholder="Nhập số tiền"
											/>
											<div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-xl font-semibold text-gray-400">
												đ
											</div>
										</div>
										<p className="text-xs text-gray-500 dark:text-gray-400">
											Số tiền tối thiểu: 10.000đ
										</p>

										{amount !== "" && (!isNumber || parsed < MIN_AMOUNT) && (
											<div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
												<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
													<span className="text-xs font-bold text-red-600 dark:text-red-400">
														!
													</span>
												</div>
												<p className="text-sm font-medium text-red-600 dark:text-red-400">
													Số tiền tối thiểu là 10.000đ
												</p>
											</div>
										)}

										{valid && (
											<div className="flex items-center gap-2 rounded-lg bg-linear-to-r from-green-50 to-emerald-50 p-3 dark:from-green-900/20 dark:to-emerald-900/20">
												<CheckCircle className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
												<p className="text-sm font-medium text-green-700 dark:text-green-300">
													Số tiền hợp lệ:{" "}
													<span className="font-bold">
														{parsed.toLocaleString("vi-VN")}đ
													</span>
												</p>
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Summary Sidebar */}
						<div className="lg:col-span-2">
							<Card className="sticky top-24 overflow-hidden border-0 bg-linear-to-br from-white to-gray-50/50 shadow-xl shadow-gray-200/50 backdrop-blur-sm dark:from-gray-900 dark:to-gray-800/50 dark:shadow-gray-900/50">
								<CardHeader className="border-b border-gray-100">
									<CardTitle className="flex items-center gap-2 text-lg">
										<Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
										Tóm tắt đơn hàng
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-6 p-6">
									<div className="space-y-4">
										<div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
											<span className="text-sm text-gray-600 dark:text-gray-400">
												Số tiền nạp:
											</span>
											<span className="text-lg font-bold text-gray-900 dark:text-white">
												{valid ? `${parsed.toLocaleString("vi-VN")}đ` : "0đ"}
											</span>
										</div>

										<div className="flex items-center justify-between rounded-lg ">
											<span className="text-sm text-gray-600 dark:text-gray-400">
												Phí giao dịch:
											</span>
											<span className="font-bold text-green-600 dark:text-green-400">
												Miễn phí
											</span>
										</div>

										<div className="rounded-xl p-4">
											<div className="flex items-center justify-between">
												<span className="text-sm font-medium text-gray-600">
													Tổng cộng:
												</span>
												<span className="text-2xl font-bold text-black">
													{valid ? `${parsed.toLocaleString("vi-VN")}đ` : "0đ"}
												</span>
											</div>
										</div>
									</div>

									{/* Submit Button */}
									<CardTransaction
										label="Tiếp tục thanh toán"
										onClick={handleConfirm}
										disabled={!valid || isProcessing}
									>
										{isProcessing ? (
											<>
												<div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
												Đang xử lý...
											</>
										) : (
											<CardTransaction
												label="Tiếp tục thanh toán"
												currency="VND"
												aria-label="Create transaction"
											/>
										)}
									</CardTransaction>
								</CardContent>
							</Card>
						</div>
					</div>

					{/* Info Section */}
					<div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
						<p className="mt-6 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
							Bằng việc thực hiện giao dịch, bạn xác nhận đã đọc, hiểu và đồng ý
							với các điều khoản liên quan. Số tiền nạp tối thiểu cho mỗi giao
							dịch là{" "}
							<strong className="font-semibold text-gray-700 dark:text-gray-300">
								10.000đ
							</strong>
							và không giới hạn số tiền tối đa. Giao dịch sẽ được xử lý ngay sau
							khi hoàn tất thanh toán và
							<strong className="font-semibold text-gray-700 dark:text-gray-300">
								{" "}
								số dư sẽ được cập nhật vào ví
							</strong>
							tương ứng. Trong trường hợp phát sinh lỗi hoặc chậm trễ ngoài ý
							muốn, vui lòng liên hệ bộ phận hỗ trợ để được kiểm tra và xử lý
							kịp thời.
						</p>

						<h3 className="mb-3 mt-3 font-semibold text-gray-800 dark:text-gray-200">
							Lưu ý
						</h3>

						<ul className="space-y-2 leading-relaxed">
							<li>
								<strong className="font-semibold text-gray-700 dark:text-gray-300">
									Số tiền nạp tối thiểu:
								</strong>{" "}
								10.000đ, không giới hạn tối đa.
							</li>

							<li>
								<strong className="font-semibold text-gray-700 dark:text-gray-300">
									Xử lý giao dịch:
								</strong>{" "}
								Thực hiện ngay lập tức và đảm bảo an toàn.
							</li>

							<li>
								<strong className="font-semibold text-gray-700 dark:text-gray-300">
									Cập nhật số dư:
								</strong>{" "}
								Số dư sẽ được cộng vào ví sau khi thanh toán thành công.
							</li>

							<li>
								<strong className="font-semibold text-gray-700 dark:text-gray-300">
									Hỗ trợ:
								</strong>{" "}
								Vui lòng liên hệ bộ phận hỗ trợ nếu phát sinh sự cố.
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
