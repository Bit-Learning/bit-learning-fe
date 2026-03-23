import BitCoinIcon from "@/shared/components/BitCoinIcon";
import { Button } from "@workspace/ui/components/Button";
import { Award, CheckCircle, Download, Loader2, MessageCircle, Play, ShoppingCart, Video, Zap } from "lucide-react";
import type React from "react";

interface CoursePricingCardProps {
  price: number;
  hasAccess?: boolean;
  isPending: boolean;
  firstLectureId?: number;
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
  onEnroll,
  onAddToCart,
  onBuyNow,
  onStartLearning,
}) => {
  const bitAmount = price;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border-2 border-blue-200 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-6 h-6 text-blue-600" />
        <h3 className="font-bold text-slate-800 dark:text-white text-xl">Đăng ký khóa học</h3>
      </div>

      <div className="text-center mb-8">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-1 font-bold">Giá khóa học</p>
        <p className="text-4xl font-bold text-blue-600">{price === 0 ? "Miễn phí" : `${price.toLocaleString()}đ`}</p>

        {price > 0 && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-md px-3 pt-1">
            <BitCoinIcon size={24} />
            <span className="text-md font-semibold text-amber-700">= {bitAmount.toLocaleString("vi-VN")}</span>
            <span className="text-md font-semibold text-amber-500">BIT</span>
          </div>
        )}
      </div>

      <ul className="space-y-4 mb-8">
        <li className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
            <Video className="w-4 h-4" />
          </div>
          <span>Học trực tuyến mọi lúc, mọi nơi</span>
        </li>
        <li className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600">
            <Download className="w-4 h-4" />
          </div>
          <span>Tài liệu học tập đầy đủ</span>
        </li>
        <li className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
            <MessageCircle className="w-4 h-4" />
          </div>
          <span>Hỗ trợ 24/7 từ giảng viên</span>
        </li>
        <li className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
            <Award className="w-4 h-4" />
          </div>
          <span>Chứng chỉ được công nhận</span>
        </li>
      </ul>

      {firstLectureId && hasAccess && (
        <Button
          onClick={onStartLearning}
          size="lg"
          className="w-full mb-3 bg-green-500 text-white py-5 rounded-md font-bold shadow-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          Vào học ngay
        </Button>
      )}

      {hasAccess ? (
        <Button
          isDisabled
          size="lg"
          className="w-full bg-green-500 text-white py-5 rounded-md font-bold flex items-center justify-center gap-2 opacity-50"
        >
          <CheckCircle className="w-5 h-5" />
          Đã đăng ký
        </Button>
      ) : price === 0 ? (
        <Button
          onClick={onEnroll}
          size="lg"
          isDisabled={isPending}
          className="w-full bg-blue-600 text-white py-5 rounded-md font-bold shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Đăng ký miễn phí
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-3">
          <Button
            onClick={onBuyNow}
            size="lg"
            isDisabled={isPending}
            className="w-full bg-blue-600 text-white py-5 rounded-md font-bold shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Mua ngay
              </>
            )}
          </Button>
          <Button
            onClick={onAddToCart}
            size="lg"
            isDisabled={isPending}
            className="w-full bg-transparent border-2 border-blue-600 text-blue-600 py-5 rounded-md font-bold hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShoppingCart className="w-5" />
            Thêm vào giỏ hàng
          </Button>
        </div>
      )}
    </div>
  );
};
