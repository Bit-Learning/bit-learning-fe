import { useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { ShoppingCart, Trash2, ArrowRight, Star, Lock, CheckCircle, Loader2 } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { useCart, useRemoveFromCart } from "../queries/useCart";

const COURSE_LEVEL_LABEL: Record<string, string> = {
  BEGINNING: "Cơ bản",
  INTERMEDIATE: "Trung cấp",
  ADVANCED: "Nâng cao",
};

const CartContent: React.FC = () => {
  const navigate = useNavigate();
  const { data: courses, isLoading } = useCart();
  const { mutate: removeFromCart } = useRemoveFromCart();
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const allIds = useMemo(() => new Set((courses ?? []).map((c) => c.id)), [courses]);

  const isAllSelected = allIds.size > 0 && [...allIds].every((id) => selectedIds.has(id));

  const toggleAll = () => {
    if (isAllSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(allIds));
  };

  const toggleOne = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRemoveItem = (courseId: number) => {
    setRemovingIds((prev) => new Set(prev).add(courseId));
    removeFromCart(courseId, {
      onSettled: () => {
        setRemovingIds((prev) => {
          const next = new Set(prev);
          next.delete(courseId);
          return next;
        });
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(courseId);
          return next;
        });
      },
    });
  };

  const handleCheckout = () => {
    const ids = [...selectedIds].join(",");
    navigate({ to: "/checkout", search: { ids } });
  };

  const summary = useMemo(() => {
    if (!courses || courses.length === 0) return { itemCount: 0, total: 0 };
    const selected = courses.filter((c) => selectedIds.has(c.id));
    return { itemCount: selected.length, total: selected.reduce((sum, c) => sum + c.price, 0) };
  }, [courses, selectedIds]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-600">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
        <ShoppingCart className="mb-4 h-24 w-24 text-gray-300" />
        <h2 className="mb-2 text-2xl font-bold text-gray-800">Giỏ hàng trống</h2>
        <p className="mb-6 text-gray-500">Hãy thêm khóa học vào giỏ hàng để bắt đầu học tập!</p>
        <button
          onClick={() => navigate({ to: "/courses" })}
          className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Khám phá khóa học
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">Giỏ hàng của bạn</h1>
          <p className="mt-1 text-gray-500">{courses.length} khóa học đang chờ bạn</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="">
              <div className="flex items-center justify-between border-b border-gray-100 py-4">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-2 rounded-full bg-blue-600" />
                  <h2 className="font-bold text-lg text-gray-900">Khóa học ({courses.length})</h2>
                </div>
                <button
                  type="button"
                  onClick={toggleAll}
                  className={`cursor-pointer flex items-center gap-2 rounded-md border bg-white px-3 py-1.5 text-md font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-600 transition-colors ${
                    isAllSelected ? " border-blue-600" : "border-gray-200"
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-colors ${
                      isAllSelected ? "bg-blue-600 border-blue-600" : "border-gray-300"
                    }`}
                  >
                    {isAllSelected && (
                      <svg viewBox="0 0 10 10" className="h-2.5 w-2.5">
                        <polyline
                          points="1.5,5 4,7.5 8.5,2.5"
                          fill="none"
                          stroke="white"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  Chọn tất cả
                </button>
              </div>

              <div className="divide-y divide-gray-50 space-y-3">
                {courses.map((course) => {
                  const isSelected = selectedIds.has(course.id);
                  return (
                    <div
                      key={course.id}
                      className={`group flex items-center gap-4 rounded-xl border border-gray-100 bg-[#f2f3fd] px-4
                 transition-all hover:shadow-md hover:border-gray-200 py-5  ${isSelected ? "bg-blue-100 shadow-md " : ""}`}
                    >
                      <button type="button" onClick={() => toggleOne(course.id)} className="shrink-0 self-center">
                        <div
                          className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                            isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300 hover:border-blue-400"
                          }`}
                        >
                          {isSelected && (
                            <svg viewBox="0 0 10 10" className="h-3 w-3">
                              <polyline
                                points="1.5,5 4,7.5 8.5,2.5"
                                fill="none"
                                stroke="white"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                      </button>

                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        onClick={() => toggleOne(course.id)}
                        className="h-20 w-28 shrink-0 rounded-lg object-cover cursor-pointer"
                      />

                      <div className="min-w-0 flex-1">
                        <h3 className="mb-1 font-semibold text-gray-900 line-clamp-2 leading-snug">{course.title}</h3>
                        <p className="text-xs text-gray-500">
                          🎓 Lớp: {course.grade}
                          {course.level && ` · ${COURSE_LEVEL_LABEL[course.level] ?? course.level}`}
                        </p>
                        <div className="mt-1 flex items-center gap-1">
                          <span className="text-xs font-medium text-gray-600">{course.ratingStar}</span>
                        </div>
                        <p className="mt-1.5 text-lg font-bold text-blue-600">{course.price.toLocaleString()}đ</p>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(course.id)}
                        disabled={removingIds.has(course.id)}
                        className="cursor-pointer flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 font-medium text-red-500 hover:bg-red-100 disabled:opacity-50 transition-colors"
                      >
                        {removingIds.has(course.id) ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-xl bg-white shadow-sm border border-gray-100">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="font-bold text-lg text-gray-900">Tổng quan đơn hàng</h2>
              </div>

              <div className="space-y-3 px-6 py-5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Khóa học đã chọn</span>
                  <span className="font-medium text-gray-900">
                    {summary.itemCount} / {courses.length}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-gray-900">Tổng cộng</span>
                    <div className="text-right">
                      <p className="text-2xl font-black text-blue-600">{summary.total.toLocaleString()}đ</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-5">
                <Button
                  onClick={handleCheckout}
                  isDisabled={summary.itemCount === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-6 text-base font-bold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  Tiến hành thanh toán
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>

              <div className="mx-6 mb-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-center gap-2 text-blue-900 mb-2">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm font-semibold">Thanh toán an toàn</span>
                </div>
                <ul className="space-y-1.5 text-xs text-blue-700">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                    Truy cập khóa học trọn đời
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                    Chứng chỉ sau khi hoàn thành
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                    Thanh toán đa dạng: Ví điện tử, thẻ ngân hàng, chuyển khoản
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartContent;
