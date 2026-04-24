import { useNavigate } from "@tanstack/react-router";
import { toast } from "@/shared/components/Sonner";
import { useAddToCart } from "@/feature/order/queries/useCart";
import { useCourseDetail } from "../queries/useCourse";
import BitCoinIcon from "@/shared/components/BitCoinIcon";
import { BookOpen, Clock, Loader2, Play, Star, Users } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CoursePreview } from "../types/course.type";
import { useCourseAccess, useEnrollCourse } from "../queries/useEnroll";

const LEVEL_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  BEGINNING: { label: "Cơ bản", badgeClass: "bg-emerald-500" },
  INTERMEDIATE: { label: "Trung bình", badgeClass: "bg-amber-500" },
  ADVANCED: { label: "Nâng cao", badgeClass: "bg-violet-600" },
};

interface PopupPosition {
  top: number;
  left?: number;
  right?: number;
  side: "left" | "right";
}

const CoursePopup: React.FC<{
  courseId: number;
  position: PopupPosition;
  cartPending?: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}> = ({ courseId, position, cartPending, onAddToCart, onBuyNow, onMouseEnter, onMouseLeave }) => {
  const navigate = useNavigate();
  const { data: course, isLoading } = useCourseDetail(courseId);
  const level = course?.level ? LEVEL_CONFIG[course.level] : null;
  const totalHours = course?.totalDuration ? Math.round(course.totalDuration / 3600) : null;
  const { data: enrollAccess } = useCourseAccess(course?.id || 0);
  const hasAccess = enrollAccess;
  const { mutate: enroll, isPending: enrollPending } = useEnrollCourse();

  const isPending = cartPending || enrollPending;
  const handleEnroll = () => {
    if (course?.id) enroll(course.id);
  };
  const style: React.CSSProperties = {
    position: "fixed",
    top: position.top,
    zIndex: 9999,
    width: 320,
    ...(position.side === "right" ? { left: position.left } : { right: window.innerWidth - (position.right ?? 0) }),
  };

  return createPortal(
    <div
      style={style}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={`absolute top-6 w-3 h-3 bg-white dark:bg-slate-900 ${
          position.side === "right"
            ? "-left-1.75 border-b border-l border-slate-200 dark:border-slate-700 rotate-45"
            : "-right-1.75 border-t border-r border-slate-200 dark:border-slate-700 rotate-45"
        }`}
      />

      <div className="p-5">
        {isLoading || !course ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                Khóa học
              </span>
              {level && (
                <span className={`text-sm px-2.5 py-1 rounded-md font-medium text-white ${level.badgeClass}`}>
                  {level.label}
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug mb-2.5">{course.title}</h3>

            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
              {totalHours != null && (
                <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  {totalHours} giờ học
                </span>
              )}
              {course.totalLectures != null && (
                <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <BookOpen className="w-3.5 h-3.5" />
                  {course.totalLectures} bài
                </span>
              )}
              {course.ratingCount != null && (
                <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <Users className="w-3.5 h-3.5" />
                  {course.ratingCount.toLocaleString("vi-VN")} đánh giá
                </span>
              )}
            </div>

            {course.description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 mb-3">
                {course.description}
              </p>
            )}

            {course.outcome && (
              <ul className="mb-4 space-y-1.5">
                {course.outcome
                  .split("\n")
                  .filter(Boolean)
                  .slice(0, 3)
                  .map((line, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="mt-0.5 text-emerald-500 shrink-0 font-bold">✓</span>
                      <span className="leading-relaxed">{line}</span>
                    </li>
                  ))}
              </ul>
            )}

            <div className="space-y-2">
              {hasAccess ? (
                <>
                  <button
                    onClick={() => {
                      const firstId = course.sections?.[0]?.lectures?.[0]?.id;
                      if (firstId)
                        navigate({
                          to: "/lectures/$id",
                          params: { id: String(firstId) },
                        });
                    }}
                    className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <Play className="h-4 w-4" />
                    Vào học ngay
                  </button>
                </>
              ) : course.price === 0 ? (
                <button
                  onClick={handleEnroll}
                  disabled={isPending}
                  className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isPending ? "Đang xử lý..." : "Đăng ký miễn phí"}
                </button>
              ) : (
                <>
                  <button
                    onClick={onBuyNow}
                    disabled={isPending}
                    className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isPending ? "Đang xử lý..." : "Mua ngay"}
                  </button>

                  <button
                    onClick={onAddToCart}
                    disabled={isPending}
                    className="cursor-pointer flex w-full items-center justify-center rounded-xl border border-slate-400 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Thêm vào giỏ hàng
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
};

interface CourseCardProps {
  course: CoursePreview;
  onClick: () => void;
  onMouseEnter?: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick, onMouseEnter }) => {
  const navigate = useNavigate();
  const { mutate: addToCart, isPending: cartPending } = useAddToCart();
  const [showPopup, setShowPopup] = useState(false);
  const [popupPos, setPopupPos] = useState<PopupPosition | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    hideTimer.current = setTimeout(() => setShowPopup(false), 120);
  }, [clearHideTimer]);

  const handleCardEnter = useCallback(() => {
    clearHideTimer();
    onMouseEnter?.();
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const POPUP_W = 332;
    const GAP = 12;
    const goRight = rect.right + POPUP_W + GAP < window.innerWidth;
    const side: "left" | "right" = goRight ? "right" : "left";
    setPopupPos({
      top: rect.top,
      left: side === "right" ? rect.right + GAP : undefined,
      right: side === "left" ? window.innerWidth - rect.left + GAP : undefined,
      side,
    });
    setShowPopup(true);
  }, [clearHideTimer, onMouseEnter]);

  useEffect(() => () => clearHideTimer(), [clearHideTimer]);

  const handleAddToCart = () => {
    if (!course.id) return;
    addToCart(course.id, {});
  };

  const handleBuyNow = () => {
    if (!course.id) return;
    navigate({ to: "/checkout", search: { courseId: course.id } });
  };

  return (
    <div
      ref={cardRef}
      className="group cursor-pointer overflow-hidden rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5"
      onClick={onClick}
      onMouseEnter={handleCardEnter}
      onMouseLeave={scheduleHide}
    >
      <div className="relative h-44 w-full overflow-hidden">
        <img
          src={course.thumbnailUrl}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
            <Play className="ml-1 h-5 w-5 text-gray-800" />
          </div>
        </div>
      </div>

      <div className="space-y-2 px-4 py-3">
        <h3 className="line-clamp-2 h-14 text-lg font-bold text-slate-900 dark:text-white transition-colors group-hover:text-blue-700 dark:group-hover:text-blue-400 leading-snug">
          {course.title}
        </h3>

        <p className="text-sm text-slate-400 dark:text-slate-500 truncate">bitlearning</p>

        <div className="flex items-center gap-1.5">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.floor(course.ratingStar ?? 5)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-200 dark:fill-slate-700 dark:text-slate-700"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{course.ratingStar ?? 5}</span>
        </div>

        <div className="flex items-end justify-between pt-1">
          <span
            className={`text-xl font-bold leading-none ${
              course.price === 0 ? "text-emerald-600 dark:text-emerald-400" : "text-blue-700 dark:text-blue-400"
            }`}
          >
            {course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString("vi-VN")} đ`}
          </span>

          {course.price > 0 && (
            <span className="flex items-center gap-1 text-sm font-semibold text-amber-600">
              ~ {course.price.toLocaleString("vi-VN")} <BitCoinIcon size={18} />
            </span>
          )}
        </div>
      </div>

      {showPopup && popupPos && (
        <CoursePopup
          courseId={course.id}
          position={popupPos}
          cartPending={cartPending}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onMouseEnter={clearHideTimer}
          onMouseLeave={scheduleHide}
        />
      )}
    </div>
  );
};

export { CourseCard };
export default CourseCard;
