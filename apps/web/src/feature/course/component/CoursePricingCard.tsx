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
  const discount = price > 0 ? Math.round((1 - price / originalPrice) * 100) : 0;

  const infoItems = [
    totalHours && { icon: <Clock className="h-4 w-4" />, label: `${totalHours} giờ học` },
    totalTexts && { icon: <FileText className="h-4 w-4" />, label: `${totalTexts} bài đọc` },
    totalVideos && { icon: <Video className="h-4 w-4" />, label: `${totalVideos} video` },
    totalQuizzes && { icon: <HelpCircle className="h-4 w-4" />, label: `${totalQuizzes} bài kiểm tra` },
    { icon: <Infinity className="h-4 w-4" />, label: "Truy cập trọn đời" },
    { icon: <Award className="h-4 w-4" />, label: "Chứng chỉ khi hoàn thành khóa học" },
  ].filter(Boolean) as { icon: React.ReactNode; label: string }[];

  return (
    <div className="rounded-xl overflow-hidden bg-[#1a2744] text-white">
      <div className="px-6 pt-6 pb-4 border-b border-white/10">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-white">
            {price === 0 ? "Miễn phí" : `${price.toLocaleString("vi-VN")}đ`}
          </span>
        </div>
        {price > 0 && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <BitCoinIcon size={20} />
            <span className="text-sm font-semibold text-amber-400">= {price.toLocaleString("vi-VN")}</span>
            <span className="text-sm font-semibold text-amber-500">BIT</span>
          </div>
        )}
      </div>

      <div className="px-6 py-5 border-b border-white/10">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Thông tin khóa học</h4>
        <ul className="space-y-2">
          {infoItems.map((item, i) => (
            <li key={i} className="flex items-center gap-2.5 text-sm text-gray-300">
              <span className="text-blue-400">{item.icon}</span>
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="px-6 py-5 space-y-2.5">
        {hasAccess ? (
          <>
            {firstLectureId && (
              <button
                onClick={onStartLearning}
                className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700"
              >
                <Play className="h-4 w-4" />
                Vào học ngay →
              </button>
            )}
          </>
        ) : price === 0 ? (
          <button
            onClick={onEnroll}
            disabled={isPending}
            className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {isPending ? "Đang xử lý..." : "Đăng ký miễn phí"}
          </button>
        ) : (
          <>
            <button
              onClick={onBuyNow}
              disabled={isPending}
              className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 py-3 text-sm font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              {isPending ? "Đang xử lý..." : "Mua ngay"}
            </button>
            <button
              onClick={onAddToCart}
              disabled={isPending}
              className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 py-3 text-sm font-bold text-white transition-colors hover:bg-green-600 disabled:opacity-60"
            >
              <ShoppingCart className="h-4 w-4" />
              Thêm vào giỏ hàng
            </button>
          </>
        )}
      </div>
    </div>
  );
};
