import {
	Award,
	CheckCircle,
	Clock,
	FileText,
	HelpCircle,
	Infinity,
	Loader2,
	Play,
	Video,
	Zap,
	ShoppingCart,
} from "lucide-react";
import type React from "react";
import BitCoinIcon from "@/shared/components/BitCoinIcon";

interface CoursePricingCardProps {
	price: number;
	hasAccess?: boolean;
	isPending: boolean;
	firstLectureId?: number;
	totalHours?: number;
	totalVideos?: number;
	totalTexts?: number;
	totalQuizzes?: number;
	onEnroll: () => void;
	onAddToCart: () => void;
	onBuyNow: () => void;
	onStartLearning?: () => void;
}

export const CoursePricingCard: React.FC<CoursePricingCardProps> = ({
	price,
	hasAccess,
	isPending,
	firstLectureId,
	totalHours,
	totalVideos,
	totalTexts,
	totalQuizzes,
	onEnroll,
	onAddToCart,
	onBuyNow,
	onStartLearning,
}) => {
	const originalPrice = price > 0 ? Math.round(price / 0.77) : 0;
	const discount =
		price > 0 ? Math.round((1 - price / originalPrice) * 100) : 0;

	const infoItems = [
		totalHours && {
			icon: <Clock className="h-4 w-4" />,
			label: `${totalHours} giờ học`,
		},
		totalTexts && {
			icon: <FileText className="h-4 w-4" />,
			label: `${totalTexts} bài đọc`,
		},
		totalVideos && {
			icon: <Video className="h-4 w-4" />,
			label: `${totalVideos} video`,
		},
		totalQuizzes && {
			icon: <HelpCircle className="h-4 w-4" />,
			label: `${totalQuizzes} bài kiểm tra`,
		},
		{ icon: <Infinity className="h-4 w-4" />, label: "Truy cập trọn đời" },
		{
			icon: <Award className="h-4 w-4" />,
			label: "Chứng chỉ khi hoàn thành khóa học",
		},
	].filter(Boolean) as { icon: React.ReactNode; label: string }[];

	return (
		<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
			<div className="border-b border-slate-100 px-6 py-6">
				<div className="flex items-baseline gap-3">
					<span className="text-3xl font-bold tracking-tight text-slate-900">
						{price === 0 ? "Miễn phí" : `${price.toLocaleString("vi-VN")} đ`}
					</span>
				</div>

				{price > 0 && (
					<div className="mt-2 flex items-center gap-1.5 text-sm text-amber-600">
						<span className="font-medium">
							~ {price.toLocaleString("vi-VN")}
						</span>
						<BitCoinIcon size={18} />
					</div>
				)}
			</div>

			<div className="border-b border-slate-100 px-6 py-5">
				<h4 className="mb-3 text-sm font-semibold text-slate-900">
					Thông tin khóa học
				</h4>
				<ul className="space-y-3">
					{infoItems.map((item, i) => (
						<li
							key={i}
							className="flex items-center gap-2.5 text-sm text-slate-600"
						>
							<span className="text-slate-400">{item.icon}</span>
							<span>{item.label}</span>
						</li>
					))}
				</ul>
			</div>

			<div className="space-y-3 px-6 py-5">
				{hasAccess ? (
					<>
						{firstLectureId && (
							<button
								onClick={onStartLearning}
								className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
							>
								<Play className="h-4 w-4" />
								Vào học ngay
							</button>
						)}
					</>
				) : price === 0 ? (
					<button
						onClick={onEnroll}
						disabled={isPending}
						className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isPending && <Loader2 className="h-4 w-4 animate-spin" />}
						{isPending ? "Đang xử lý..." : "Đăng ký miễn phí"}
					</button>
				) : (
					<>
						<button
							onClick={onBuyNow}
							disabled={isPending}
							className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isPending && <Loader2 className="h-4 w-4 animate-spin" />}
							{isPending ? "Đang xử lý..." : "Mua ngay"}
						</button>

						<button
							onClick={onAddToCart}
							disabled={isPending}
							className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
						>
							Thêm vào giỏ hàng
						</button>
					</>
				)}
			</div>
		</div>
	);
};
