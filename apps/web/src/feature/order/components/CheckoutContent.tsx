import { useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/Card";
import { Input } from "@workspace/ui/components/Input";
import { CreditCard, Loader2, ShoppingBag, Sparkles, Star, Wallet, Zap, ArrowLeft, Package } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { useCreateOrder } from "@/feature/order/queries/useOrder";
import { PaymentMethod } from "@/feature/order/types/order.type";
import { useCart } from "../queries/useCart";
import { useCourseDetail } from "@/feature/course/queries/useCourse";
import { PaymentMethodCard } from "./PaymentMethodCard";

const CheckoutContent: React.FC = () => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { courseId?: number };

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.VNPAY);
  const [voucherCodes, setVoucherCodes] = useState<Record<number, string>>({});

  const { data: cartCourses, isLoading: cartLoading } = useCart();

  const { data: singleCourse, isLoading: courseLoading } = useCourseDetail(search.courseId);

  const { mutate: createOrder, isPending } = useCreateOrder();

  const isDirectCheckout = !!search.courseId;
  const isLoading = isDirectCheckout ? courseLoading : cartLoading;

  const courses = useMemo(() => {
    if (isDirectCheckout && singleCourse) {
      return [singleCourse];
    }
    return cartCourses || [];
  }, [isDirectCheckout, singleCourse, cartCourses]);

  const cartSummary = useMemo(() => {
    if (!courses || courses.length === 0) {
      return { totalItems: 0, totalAmount: 0 };
    }

    const totalAmount = courses.reduce((sum, course) => sum + course.price, 0);

    return {
      totalItems: courses.length,
      totalAmount,
    };
  }, [courses]);

  const handleCheckout = () => {
    if (!courses || courses.length === 0) return;

    const orderDetails = courses.map((course) => ({
      courseId: course.id,
      voucherCode: voucherCodes[course.id] || undefined,
    }));

    createOrder({
      paymentMethod,
      details: orderDetails,
    });
  };

  const handleBack = () => {
    if (isDirectCheckout) {
      navigate({ to: "/courses/$id", params: { id: String(search.courseId) } });
    } else {
      navigate({ to: "/cart" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-150 items-center justify-center bg-linear-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-blue-600" />
          <p className="text-lg font-medium text-gray-700">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex min-h-125 flex-col items-center justify-center rounded-3xl bg-white p-12 shadow-xl">
            <ShoppingBag className="mb-6 h-32 w-32 text-gray-300" />
            <h3 className="mb-3 text-3xl font-bold text-gray-900">
              {isDirectCheckout ? "Không tìm thấy khóa học" : "Giỏ hàng trống"}
            </h3>
            <p className="mb-8 text-center text-lg text-gray-600">
              {isDirectCheckout
                ? "Khóa học bạn đang tìm không tồn tại hoặc đã bị xóa"
                : "Vui lòng thêm khóa học vào giỏ hàng trước khi thanh toán"}
            </p>
            <div className="flex gap-4">
              {!isDirectCheckout && (
                <Button
                  onClick={() => navigate({ to: "/cart" })}
                  className="rounded-xl bg-gray-200 px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-300"
                >
                  Quay lại giỏ hàng
                </Button>
              )}
              <Button
                onClick={() => navigate({ to: "/courses" })}
                className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg"
              >
                Khám phá khóa học
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        <button
          onClick={handleBack}
          className="mb-6 cursor-pointer flex items-center gap-2 text-gray-600 transition-colors hover:text-blue-600"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-semibold">{isDirectCheckout ? "Quay lại khóa học" : "Quay lại giỏ hàng"}</span>
        </button>

        <div className="mb-8 text-center">
          <h1 className="mb-3 bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-4xl font-black text-transparent md:text-5xl">
            Thanh toán
          </h1>
          <p className="text-lg text-gray-600">Chỉ còn một bước nữa để bắt đầu học tập!</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="overflow-hidden shadow-xl">
              <CardHeader className="bg-linear-to-r from-gray-800 to-gray-900 p-6">
                <CardTitle className="flex items-center gap-3 text-white">
                  <Package className="h-7 w-7" />
                  <span className="text-2xl">
                    {isDirectCheckout ? "Khóa học" : `Khóa học đã chọn (${cartSummary.totalItems})`}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {courses.map((course, index) => (
                  <div
                    key={course.id}
                    className="overflow-hidden rounded-2xl border-2 border-gray-100 bg-linear-to-br from-white to-gray-50 p-5 transition-all hover:border-blue-200 hover:shadow-md"
                    style={{
                      animation: "slideIn 0.5s ease-out",
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: "backwards",
                    }}
                  >
                    <div className="flex gap-4">
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="h-24 w-32 shrink-0 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="mb-2 font-bold text-gray-900 line-clamp-2">{course.title}</h4>
                        <p className="mb-3 text-sm text-gray-600">{course.instructorName}</p>

                        <div className="mb-3 flex items-center gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{course.ratingStar}</span>
                          </div>
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                            Lớp {course.grade}
                          </span>
                        </div>

                        <Input
                          placeholder="Nhập mã voucher (nếu có)"
                          value={voucherCodes[course.id] || ""}
                          onChange={(e) =>
                            setVoucherCodes((prev) => ({
                              ...prev,
                              [course.id]: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border-gray-300 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-2xl font-black text-blue-600">{course.price.toLocaleString()}đ</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="overflow-hidden shadow-xl">
              <CardHeader className="bg-linear-to-r from-blue-600 to-indigo-600 p-6">
                <CardTitle className="flex items-center gap-3 text-white">
                  <CreditCard className="h-7 w-7" />
                  <span className="text-2xl">Phương thức thanh toán</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <PaymentMethodCard
                    selected={paymentMethod === PaymentMethod.VNPAY}
                    onClick={() => setPaymentMethod(PaymentMethod.VNPAY)}
                    icon={<CreditCard className="h-10 w-10 text-white" />}
                    title="VNPay"
                    description="Thanh toán qua VNPay - An toàn & nhanh chóng"
                    borderColor="border-blue-600"
                    bgGradient="bg-linear-to-br from-blue-50 to-indigo-50"
                    iconBg="bg-linear-to-br from-blue-500 to-blue-600"
                    checkColor="text-blue-600"
                  />

                  <PaymentMethodCard
                    selected={paymentMethod === PaymentMethod.PAYOS}
                    onClick={() => setPaymentMethod(PaymentMethod.PAYOS)}
                    icon={<CreditCard className="h-10 w-10 text-white" />}
                    title="PayOS"
                    description="Thanh toán qua PayOS - Đơn giản & tiện lợi"
                    borderColor="border-green-600"
                    bgGradient="bg-linear-to-br from-green-50 to-emerald-50"
                    iconBg="bg-linear-to-br from-green-500 to-emerald-600"
                    checkColor="text-green-600"
                  />

                  <PaymentMethodCard
                    selected={paymentMethod === PaymentMethod.WALLET}
                    onClick={() => setPaymentMethod(PaymentMethod.WALLET)}
                    icon={<Wallet className="h-10 w-10 text-white" />}
                    title="Ví BitHub"
                    description="Thanh toán bằng số dư ví - Tức thì"
                    borderColor="border-purple-600"
                    bgGradient="bg-linear-to-br from-purple-50 to-pink-50"
                    iconBg="bg-linear-to-br from-purple-500 to-pink-600"
                    checkColor="text-purple-600"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8 overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="bg-linear-to-br from-blue-600 via-indigo-600 to-purple-600 p-6">
                <CardTitle className="flex items-center gap-3 text-white">
                  <Sparkles className="h-7 w-7" />
                  <span className="text-2xl">Tổng quan thanh toán</span>
                </CardTitle>
              </div>

              <CardContent className="space-y-6 p-6">
                {isDirectCheckout && (
                  <div className="rounded-lg bg-blue-50 p-3 text-sm">
                    <div className="flex items-center gap-2 text-blue-900">
                      <Zap className="h-4 w-4" />
                      <span className="font-semibold">Thanh toán nhanh</span>
                    </div>
                    <p className="mt-1 text-blue-700">Bạn đang mua 1 khóa học</p>
                  </div>
                )}

                <div className="space-y-4 rounded-2xl bg-linear-to-br from-gray-50 to-blue-50 p-5">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Số lượng</span>
                    <span className="font-bold text-gray-900">{cartSummary.totalItems} khóa học</span>
                  </div>

                  <div className="flex justify-between border-t-2 border-gray-300 pt-4">
                    <span className="text-xl font-bold text-gray-900">Tổng thanh toán</span>
                    <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-black text-transparent">
                      {cartSummary.totalAmount.toLocaleString()}đ
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  isDisabled={isPending}
                  className="group w-full rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 py-5 text-lg font-bold text-white shadow-2xl transition-all hover:scale-105 hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
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

                <p className="text-center text-xs text-gray-600">
                  Bằng việc thanh toán, bạn đồng ý với{" "}
                  <a href="/terms" className="font-semibold text-blue-600 hover:underline">
                    Điều khoản dịch vụ
                  </a>{" "}
                  của chúng tôi
                </p>
              </CardContent>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CheckoutContent;
