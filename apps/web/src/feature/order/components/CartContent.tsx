import { useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/Card";
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  Star,
  Lock,
  CheckCircle,
  Sparkles,
  AlertCircle,
  Loader2,
  BookOpen,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { useCart, useRemoveFromCart } from "../queries/useCart";

const CartContent: React.FC = () => {
  const navigate = useNavigate();
  const { data: courses, isLoading } = useCart();
  const { mutate: removeFromCart, isPending: removePending } = useRemoveFromCart();
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

  const handleRemoveItem = (courseId: number) => {
    setRemovingIds((prev) => new Set(prev).add(courseId));
    removeFromCart(courseId, {
      onSettled: () => {
        setRemovingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(courseId);
          return newSet;
        });
      },
    });
  };

  const handleCheckout = () => {
    navigate({ to: "/checkout" });
  };

  const summary = useMemo(() => {
    if (!courses || courses.length === 0) {
      return { itemCount: 0, total: 0 };
    }

    const total = courses.reduce((sum, course) => sum + course.price, 0);

    return {
      itemCount: courses.length,
      total,
    };
  }, [courses]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-125 items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-blue-600" />
              <p className="text-lg font-medium text-gray-700">Đang tải giỏ hàng...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-125 flex-col items-center justify-center rounded-3xl bg-white p-12 shadow-xl">
            <ShoppingCart className="mb-6 h-32 w-32 text-gray-300" />
            <h2 className="mb-3 text-3xl font-bold text-gray-900">Giỏ hàng trống</h2>
            <p className="mb-8 text-center text-lg text-gray-600">Hãy thêm khóa học vào giỏ hàng để bắt đầu học tập!</p>
            <Button
              onClick={() => navigate({ to: "/courses" })}
              className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-8 py-3 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg"
            >
              Khám phá khóa học
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="mb-3 bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-4xl font-black text-transparent md:text-5xl">
            Giỏ hàng của bạn
          </h1>
          <p className="text-lg text-gray-600">{courses.length} khóa học đang chờ bạn</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="overflow-hidden shadow-xl">
              <CardHeader className="bg-linear-to-r from-gray-800 to-gray-900 p-6">
                <CardTitle className="flex items-center gap-3 text-white">
                  <ShoppingCart className="h-7 w-7" />
                  <span className="text-2xl">Khóa học ({courses.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {courses.map((course, index) => (
                  <div
                    key={course.id}
                    className="group overflow-hidden rounded-2xl border-2 border-gray-100 bg-linear-to-br from-white to-gray-50 p-5 transition-all hover:border-blue-200 hover:shadow-lg"
                    style={{
                      animation: "fadeIn 0.5s ease-out",
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: "backwards",
                    }}
                  >
                    <div className="flex gap-4">
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="h-28 w-40 shrink-0 rounded-xl object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <h3 className="mb-2 text-lg font-bold text-gray-900 line-clamp-2">{course.title}</h3>
                        <p className="mb-3 text-sm text-gray-600">{course.instructorName}</p>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{course.ratingStar}</span>
                          </div>
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                            Lớp {course.grade}
                          </span>
                          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                            {course.level}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-end justify-between">
                        <div className="text-right">
                          <span className="text-2xl font-black text-blue-600">{course.price.toLocaleString()}đ</span>
                        </div>

                        <Button
                          onClick={() => handleRemoveItem(course.id)}
                          isDisabled={removingIds.has(course.id)}
                          className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-100 disabled:opacity-50"
                        >
                          {removingIds.has(course.id) ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Đang xóa...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4" />
                              Xóa
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8 overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="bg-linear-to-br from-blue-600 via-indigo-600 to-purple-600 p-6">
                <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
                  <Sparkles className="h-6 w-6" />
                  Tổng quan đơn hàng
                </h2>
              </div>

              <div className="space-y-6 p-6">
                <div className="space-y-4 rounded-xl bg-linear-to-br from-gray-50 to-blue-50 p-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Số lượng khóa học</span>
                    <span className="font-semibold text-gray-900">{summary.itemCount}</span>
                  </div>

                  <div className="flex justify-between border-t-2 border-gray-200 pt-4">
                    <span className="text-xl font-bold text-gray-900">Tổng cộng</span>
                    <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-black text-transparent">
                      {summary.total.toLocaleString()}đ
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="group flex w-full items-center justify-center gap-3 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 py-6 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                >
                  Tiến hành thanh toán
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>

                <div className="space-y-3 rounded-xl border-2 border-blue-100 bg-blue-50 p-4">
                  <div className="flex items-center gap-2 text-blue-900">
                    <Lock className="h-5 w-5" />
                    <span className="font-semibold">Thanh toán an toàn</span>
                  </div>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 shrink-0" />
                      Truy cập khóa học trọn đời
                    </li>

                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 shrink-0" />
                      Chứng chỉ sau khi hoàn thành
                    </li>

                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 shrink-0" />
                      Thanh toán đa dạng: Ví điện tử, thẻ ngân hàng, chuyển khoản
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CartContent;
