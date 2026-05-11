import { useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { CreditCard, Loader2, ShoppingBag, Star, Wallet, ArrowLeft, Shield, Trash2, ArrowRight } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { useCreateOrder } from "@/feature/order/queries/useOrder";
import { PaymentMethod } from "@/feature/order/types/order.type";
import { useCart } from "../queries/useCart";
import { useCourseDetail } from "@/feature/course/queries/useCourse";
import { useUserProfile } from "@/feature/user/queries/useUser";
import { PaymentMethodCard } from "./PaymentMethodCard";
import BitCoinIcon from "@/shared/components/BitCoinIcon";

const COURSE_LEVEL_LABEL: Record<string, string> = {
  BEGINNING: "Cơ bản",
  INTERMEDIATE: "Trung cấp",
  ADVANCED: "Nâng cao",
};

const CheckoutContent: React.FC = () => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { courseId?: number; ids?: string };

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.VNPAY);
  const [removedIds, setRemovedIds] = useState<Set<number>>(new Set());

  const { data: cartCourses, isLoading: cartLoading } = useCart();
  const { data: singleCourse, isLoading: courseLoading } = useCourseDetail(search.courseId);
  const { mutate: createOrder, isPending } = useCreateOrder();
  const { data: userProfile } = useUserProfile();

  const walletBalance = userProfile?.wallet?.balance ?? 0;
  const isDirectCheckout = !!search.courseId;
  const isLoading = isDirectCheckout ? courseLoading : cartLoading;

  const selectedIds = useMemo(() => {
    if (!search.ids) return null;
    return new Set(search.ids.split(",").map(Number));
  }, [search.ids]);

  const courses = useMemo(() => {
    const base =
      isDirectCheckout && singleCourse
        ? [singleCourse]
        : (cartCourses || []).filter((c) => !selectedIds || selectedIds.has(c.id));
    return base.filter((c) => !removedIds.has(c.id));
  }, [isDirectCheckout, singleCourse, cartCourses, selectedIds, removedIds]);

  const cartSummary = useMemo(() => {
    if (!courses || courses.length === 0) return { totalItems: 0, totalAmount: 0 };
    const totalAmount = courses.reduce((sum, course) => sum + course.price, 0);
    return { totalItems: courses.length, totalAmount };
  }, [courses]);

  const isWalletInsufficient = paymentMethod === PaymentMethod.WALLET && walletBalance < cartSummary.totalAmount;
  const isWalletPayment = paymentMethod === PaymentMethod.WALLET;

  const handleCheckout = () => {
    if (!courses || courses.length === 0) return;
    if (isWalletInsufficient) return;
    createOrder({
      paymentMethod,
      details: courses.map((course) => ({ courseId: course.id })),
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
        <ShoppingBag className="mb-4 h-24 w-24 text-gray-300" />
        <h3 className="mb-2 text-2xl font-bold text-gray-800">
          {isDirectCheckout ? "Không tìm thấy khóa học" : "Không có khóa học nào"}
        </h3>
        <p className="mb-6 text-gray-500">
          {isDirectCheckout ? "Khóa học không tồn tại hoặc đã bị xóa" : "Vui lòng quay lại giỏ hàng để chọn khóa học"}
        </p>
        <div className="flex gap-3">
          {!isDirectCheckout && (
            <button
              onClick={() => navigate({ to: "/cart" })}
              className="cursor-pointer rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Quay lại giỏ hàng
            </button>
          )}
          <button
            onClick={() => navigate({ to: "/courses" })}
            className="cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Khám phá khóa học
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <button
          onClick={handleBack}
          className="cursor-pointer mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {isDirectCheckout ? "Quay lại khóa học" : "Quay lại giỏ hàng"}
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">Thanh toán</h1>
          <p className="mt-1 text-gray-500">Hoàn tất đăng ký khóa học của bạn để bắt đầu học ngay hôm nay.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="">
              <div className="flex items-center justify-between border-b border-gray-100  py-4">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-2 rounded-full bg-blue-600" />
                  <h2 className="font-bold text-lg text-gray-900">Khóa học đã chọn</h2>
                </div>
                <span className="text-md text-gray-600">{cartSummary.totalItems} Khóa học</span>
              </div>

              <div className="divide-y divide-gray-50">
                <div className="space-y-3">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-[#f2f3fd] px-4 py-3
                 transition-all hover:shadow-md hover:border-gray-200"
                    >
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="h-20 w-28 shrink-0 rounded-lg object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <h4 className="mb-1 font-semibold text-gray-900 line-clamp-2 leading-snug">{course.title}</h4>

                        <p className="text-xs text-gray-500">
                          🎓 Lớp: {course.grade}
                          {course.level && ` · ${COURSE_LEVEL_LABEL[course.level] ?? course.level}`}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1">
                          <p className={`text-lg font-bold ${isWalletPayment ? "text-amber-700" : "text-blue-600"}`}>
                            {course.price.toLocaleString()}
                          </p>
                          {isWalletPayment ? (
                            <BitCoinIcon size={20} />
                          ) : (
                            <span className="text-lg font-bold text-blue-600">đ</span>
                          )}
                        </div>
                      </div>

                      {!isDirectCheckout && courses.length > 1 && (
                        <button
                          onClick={() => setRemovedIds((prev) => new Set(prev).add(course.id))}
                          className="cursor-pointer flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 font-medium text-red-500 hover:bg-red-100 disabled:opacity-50 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="">
              <div className="flex items-center gap-2 border-b border-gray-100 py-4">
                <span className="h-6 w-2 rounded-full bg-orange-500" />
                <h2 className="font-bold text-lg text-gray-900">Phương thức thanh toán</h2>
              </div>

              <div className="space-y-3 p-6">
                <PaymentMethodCard
                  selected={paymentMethod === PaymentMethod.VNPAY}
                  onClick={() => setPaymentMethod(PaymentMethod.VNPAY)}
                  logoSrc="/vendors/vnpay_logo.png"
                  logoAlt="VNPAY logo"
                  title="VNPAY"
                  description="Thanh toán qua ứng dụng ngân hàng hoặc thẻ ATM."
                  detailRows={[
                    { label: "Cổng", value: "VNPAY" },
                    { label: "Xử lý", value: "Tức thì" },
                    { label: "Bảo mật", value: "TLS mã hóa" },
                    { label: "Hỗ trợ", value: "24/7" },
                  ]}
                />

                <PaymentMethodCard
                  selected={paymentMethod === PaymentMethod.PAYOS}
                  onClick={() => setPaymentMethod(PaymentMethod.PAYOS)}
                  logoSrc="/vendors/payos_logo.png"
                  logoAlt="PayOS logo"
                  title="PayOS"
                  description="Hệ thống thanh toán nhanh chóng, bảo mật cao."
                  detailRows={[
                    { label: "Cổng", value: "PayOS" },
                    { label: "Xử lý", value: "Tức thì" },
                    { label: "Bảo mật", value: "TLS mã hóa" },
                    { label: "Hỗ trợ", value: "24/7" },
                  ]}
                />

                <PaymentMethodCard
                  selected={paymentMethod === PaymentMethod.WALLET}
                  onClick={() => setPaymentMethod(PaymentMethod.WALLET)}
                  logoFallback={<Wallet className="h-6 w-6 text-green-600" />}
                  title="Ví BitLearning"
                  description="Thanh toán bằng số dư ví - Tức thì."
                  walletBalance={walletBalance}
                  totalAmount={cartSummary.totalAmount}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-md bg-white shadow-sm border border-gray-100">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="font-bold text-xl text-gray-900">Tổng quan thanh toán</h2>
              </div>

              <div className="space-y-3 px-6 py-5">
                <div className="flex justify-between text-md text-gray-600">
                  <span>Tạm tính ({cartSummary.totalItems} sản phẩm)</span>
                  <div className="flex items-center gap-1">
                    <span className={`font-medium ${isWalletPayment ? "text-amber-700" : "text-gray-900"}`}>
                      {cartSummary.totalAmount.toLocaleString()}
                    </span>
                    {isWalletPayment ? <BitCoinIcon size={20} /> : <span className="font-medium text-gray-900">đ</span>}
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-xl text-gray-900">Tổng tiền</span>
                    <div className="flex items-center gap-1">
                      <p className={`text-2xl font-black ${isWalletPayment ? "text-amber-700" : "text-blue-600"}`}>
                        {cartSummary.totalAmount.toLocaleString()}
                      </p>
                      {isWalletPayment ? (
                        <BitCoinIcon size={24} />
                      ) : (
                        <span className="text-2xl font-black text-blue-600">đ</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {isWalletInsufficient && (
                <div className="mx-6 mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-600">
                  <p className="font-semibold">⚠ Số dư không đủ</p>
                  <p className="mt-0.5 flex items-center gap-1">
                    Cần thêm{" "}
                    <span className="font-bold">{(cartSummary.totalAmount - walletBalance).toLocaleString()}</span>
                    <BitCoinIcon size={16} />.{" "}
                    <a href="/profile/top-up" className="underline font-semibold hover:text-red-700">
                      Nạp thêm ngay
                    </a>
                  </p>
                </div>
              )}

              <div className="px-6 pb-5">
                <Button
                  onClick={handleCheckout}
                  isDisabled={isPending || isWalletInsufficient || cartSummary.totalItems === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-6 text-base font-bold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      Thanh toán ngay
                      <ArrowRight />
                    </>
                  )}
                </Button>

                <div className="mt-3 flex items-start justify-center gap-0.5 text-center text-xs text-gray-400">
                  <Shield className="mt-px h-3.5 w-3.5 shrink-0" />
                  <span>Thông tin của bạn được bảo mật tuyệt đối theo tiêu chuẩn quốc tế.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutContent;
