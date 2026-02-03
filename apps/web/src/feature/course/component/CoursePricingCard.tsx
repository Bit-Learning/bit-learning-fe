import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent, CardTitle } from "@workspace/ui/components/Card";
import { Award, CheckCircle, Download, Loader2, MessageCircle, ShoppingCart, Video, Zap } from "lucide-react";
import type React from "react";

interface CoursePricingCardProps {
  price: number;
  hasAccess?: boolean;
  isPending: boolean;
  onEnroll: () => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

const CoursePricingCard: React.FC<CoursePricingCardProps> = ({
  price,
  hasAccess,
  isPending,
  onEnroll,
  onAddToCart,
  onBuyNow,
}) => {
  return (
    <Card className="top-4 overflow-hidden rounded-3xl border-0 shadow-2xl">
      <div className="p-4">
        <CardTitle className="flex items-center gap-2 text-black">
          <Award className="h-6 w-6" />
          <span className="text-xl">Đăng ký khóa học</span>
        </CardTitle>
      </div>

      <CardContent className="space-y-4 p-4">
        <div className="text-center">
          <div className="mb-2 text-sm font-medium text-gray-600">Giá khóa học</div>
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-5xl font-black text-transparent">
            {price === 0 ? "Miễn phí" : `${price.toLocaleString()}đ`}
          </div>
        </div>

        <div className="space-y-3 rounded-2xl bg-linear-to-br from-gray-50 to-blue-50 p-4">
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
              <Video className="h-4 w-4 text-blue-600" />
            </div>
            <span>Học trực tuyến mọi lúc, mọi nơi</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
              <Download className="h-4 w-4 text-green-600" />
            </div>
            <span>Tài liệu học tập đầy đủ</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
              <MessageCircle className="h-4 w-4 text-purple-600" />
            </div>
            <span>Hỗ trợ 24/7 từ giảng viên</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
              <Award className="h-4 w-4 text-orange-600" />
            </div>
            <span>Chứng chỉ được công nhận</span>
          </div>
        </div>

        {hasAccess ? (
          <Button
            isDisabled
            className="w-full rounded-md bg-linear-to-r from-green-500 to-emerald-500 py-6 text-lg font-bold text-black"
          >
            <CheckCircle className="mr-2 h-8 w-8" />
            Đã đăng ký
          </Button>
        ) : price === 0 ? (
          <Button
            onClick={onEnroll}
            isDisabled={isPending}
            className="w-full rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 py-4 text-lg font-semibold text-white shadow-xl transition-all hover:scale-105 hover:from-blue-700 hover:to-indigo-700 hover:shadow-2xl"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5" />
                Đăng ký miễn phí
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            <Button
              onClick={onBuyNow}
              isDisabled={isPending}
              className="group w-full rounded-xl bg-linear-to-r from-blue-500 to-indigo-500 py-5 text-lg font-semibold text-white shadow-xl transition-all hover:scale-105 hover:from-blue-700 hover:to-indigo-700 hover:shadow-2xl"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  Mua ngay
                </>
              )}
            </Button>
            <Button
              onClick={onAddToCart}
              isDisabled={isPending}
              variant="outline"
              className="w-full rounded-xl border-2 border-blue-600 py-5 text-lg font-semibold text-blue-600 transition-all hover:scale-105 hover:bg-blue-100"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Thêm vào giỏ hàng
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CoursePricingCard;
