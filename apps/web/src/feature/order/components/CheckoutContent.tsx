import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/Card";
import { Input } from "@workspace/ui/components/Input";
import { CheckCircle, CreditCard, Loader2, Lock, ShoppingBag, Sparkles, Wallet, Zap } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useCreateOrder } from "@/feature/order/queries/useOrder";
import { PaymentMethod } from "@/feature/order/types/order.type";
import { useCart } from "../queries/useCart";
import { PaymentMethodCard } from "./PaymentMethodCard";

const CheckoutContent: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.VNPAY);
  const [voucherCodes, setVoucherCodes] = useState<Record<number, string>>({});

  const { data: cart, isLoading: cartLoading } = useCart();
  const { mutate: createOrder, isPending } = useCreateOrder();

  const handleCheckout = () => {
    if (!cart || cart.totalItems === 0) return;

    const orderDetails = cart.items.map((item) => ({
      courseId: item.courseId,
      voucherCode: voucherCodes[item.courseId] || item.voucherCode,
    }));

    createOrder({
      paymentMethod,
      details: orderDetails,
    });
  };

  if (cartLoading) {
    return (
      <div className="flex min-h-125 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
          <p className="text-lg text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.totalItems === 0) {
    return (
      <div className="flex min-h-125 flex-col items-center justify-center rounded-3xl bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-12">
        <ShoppingBag className="mb-6 h-24 w-24 text-gray-400" />
        <h3 className="mb-3 text-3xl font-bold text-gray-900">Giỏ hàng trống</h3>
        <p className="text-center text-lg text-gray-600">Vui lòng thêm khóa học vào giỏ hàng trước khi thanh toán</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="mb-3 bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-5xl font-black text-transparent">
          Thanh toán
        </h1>
        <p className="text-lg text-gray-600">Chỉ còn một bước nữa để bắt đầu học tập!</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="overflow-hidden rounded-3xl border-0 shadow-xl">
            <CardHeader className="bg-linear-to-r from-blue-600 to-indigo-600 p-6">
              <CardTitle className="flex items-center gap-3 text-white">
                <CreditCard className="h-7 w-7" />
                <span className="text-2xl">Phương thức thanh toán</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <PaymentMethodCard
                  method={PaymentMethod.VNPAY}
                  selected={paymentMethod === PaymentMethod.VNPAY}
                  onClick={() => setPaymentMethod(PaymentMethod.VNPAY)}
                  icon={<CreditCard className="h-10 w-10 text-white" />}
                  title="VNPay"
                  description="Thanh toán qua VNPay - An toàn & nhanh chóng"
                  gradientFrom="from-blue-500"
                  gradientTo="to-blue-600"
                  borderColor="border-blue-600"
                  bgGradient="bg-linear-to-br from-blue-50 to-indigo-50"
                  iconBg="bg-linear-to-br from-blue-500 to-blue-600"
                  checkColor="text-blue-600"
                />

                <PaymentMethodCard
                  method={PaymentMethod.PAYOS}
                  selected={paymentMethod === PaymentMethod.PAYOS}
                  onClick={() => setPaymentMethod(PaymentMethod.PAYOS)}
                  icon={<CreditCard className="h-10 w-10 text-white" />}
                  title="PayOS"
                  description="Thanh toán qua PayOS - Đơn giản & tiện lợi"
                  gradientFrom="from-green-500"
                  gradientTo="to-emerald-600"
                  borderColor="border-green-600"
                  bgGradient="bg-linear-to-br from-green-50 to-emerald-50"
                  iconBg="bg-linear-to-br from-green-500 to-emerald-600"
                  checkColor="text-green-600"
                />

                <PaymentMethodCard
                  method={PaymentMethod.WALLET}
                  selected={paymentMethod === PaymentMethod.WALLET}
                  onClick={() => setPaymentMethod(PaymentMethod.WALLET)}
                  icon={<Wallet className="h-10 w-10 text-white" />}
                  title="Ví BitHub"
                  description="Thanh toán bằng số dư ví - Tức thì"
                  gradientFrom="from-purple-500"
                  gradientTo="to-pink-600"
                  borderColor="border-purple-600"
                  bgGradient="bg-linear-to-br from-purple-50 to-pink-50"
                  iconBg="bg-linear-to-br from-purple-500 to-pink-600"
                  checkColor="text-purple-600"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-3xl border-0 shadow-xl">
            <CardHeader className="bg-linear-to-r from-gray-800 to-gray-900 p-6">
              <CardTitle className="flex items-center gap-3 text-white">
                <ShoppingBag className="h-7 w-7" />
                <span className="text-2xl">Khóa học ({cart.totalItems})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {cart.items.map((item, index) => (
                <div
                  key={item.courseId}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-linear-to-br from-white to-gray-50 p-5 transition-all hover:shadow-lg"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex gap-4">
                    <img
                      src={item.courseThumbnail}
                      alt={item.courseTitle}
                      className="h-20 w-28 shrink-0 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="mb-1 truncate font-bold text-gray-900">{item.courseTitle}</h4>
                      <p className="mb-3 text-sm text-gray-600">{item.instructorName}</p>

                      <Input
                        placeholder="Nhập mã voucher (nếu có)"
                        value={voucherCodes[item.courseId] || item.voucherCode || ""}
                        onChange={(e) =>
                          setVoucherCodes((prev) => ({
                            ...prev,
                            [item.courseId]: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="shrink-0 text-right">
                      {item.discountAmount && item.discountAmount > 0 ? (
                        <>
                          <div className="text-2xl font-black text-blue-600">{item.finalPrice.toLocaleString()}đ</div>
                          <div className="text-sm text-gray-500 line-through">{item.coursePrice.toLocaleString()}đ</div>
                          <div className="mt-1 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                            Giảm {item.discountAmount.toLocaleString()}đ
                          </div>
                        </>
                      ) : (
                        <div className="text-2xl font-black text-blue-600">{item.coursePrice.toLocaleString()}đ</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6 overflow-hidden rounded-3xl border-0 shadow-2xl">
            <div className="bg-linear-to-br from-blue-600 via-indigo-600 to-purple-600 p-6">
              <CardTitle className="flex items-center gap-3 text-white">
                <Sparkles className="h-7 w-7" />
                <span className="text-2xl">Tổng quan</span>
              </CardTitle>
            </div>

            <CardContent className="space-y-6 p-6">
              <div className="space-y-4 rounded-2xl bg-linear-to-br from-gray-50 to-blue-50 p-5">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Tạm tính</span>
                  <span className="font-bold text-gray-900">
                    {cart.items.reduce((sum: number, item) => sum + item.coursePrice, 0).toLocaleString()}đ
                  </span>
                </div>

                {cart.items.some((item) => item.discountAmount) && (
                  <div className="flex justify-between border-t border-gray-200 pt-4">
                    <span className="font-medium text-gray-600">Giảm giá</span>
                    <span className="font-bold text-green-600">
                      -{cart.items.reduce((sum, item) => sum + (item.discountAmount || 0), 0).toLocaleString()}đ
                    </span>
                  </div>
                )}

                <div className="flex justify-between border-t-2 border-gray-300 pt-4">
                  <span className="text-xl font-bold text-gray-900">Tổng cộng</span>
                  <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-black text-transparent">
                    {cart.totalAmount.toLocaleString()}đ
                  </span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                isDisabled={isPending}
                className="group w-full rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 py-5 text-lg font-bold text-white shadow-2xl transition-all hover:scale-105 hover:from-blue-700 hover:to-indigo-700"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-6 w-6 transition-transform group-hover:scale-110" />
                    Xác nhận thanh toán
                  </>
                )}
              </Button>

              <div className="space-y-3 rounded-2xl bg-green-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <Lock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-green-900">Thanh toán bảo mật</p>
                    <p className="text-xs text-green-700">Mã hóa SSL 256-bit</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-green-900">Đảm bảo hoàn tiền</p>
                    <p className="text-xs text-green-700">100% trong vòng 7 ngày</p>
                  </div>
                </div>
              </div>

              <p className="text-center text-xs text-gray-600">
                Bằng việc thanh toán, bạn đồng ý với{" "}
                <a href="/terms" className="font-semibold text-blue-600 hover:underline">
                  Điều khoản dịch vụ
                </a>{" "}
                của chúng tôi
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutContent;
