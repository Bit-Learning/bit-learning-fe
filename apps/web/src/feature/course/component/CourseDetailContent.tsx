import { useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { toast } from "@/shared/components/Sonner";
import { BookOpen, ChevronLeft } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useCourseDetail } from "../queries/useCourse";
import { useCourseAccess, useEnrollCourse } from "../queries/useEnroll";
import { useAddToCart } from "@/feature/order/queries/useCart";
import { CourseHero } from "./CourseHero";
import { CourseTabs } from "./CourseTabs";
import { CoursePricingCard } from "./CoursePricingCard";

const CourseDetailContent: React.FC = () => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);

  const { data: course, isLoading, error } = useCourseDetail();
  const { data: enrollAccess } = useCourseAccess(course?.id || 0);
  const hasAccess = enrollAccess;

  const { mutate: enroll, isPending: enrollPending } = useEnrollCourse();
  const { mutate: addToCart, isPending: cartPending } = useAddToCart();

  const handleEnroll = () => {
    if (course?.id) enroll(course.id);
  };
  const handleAddToCart = () => {
    if (course?.id) addToCart(course.id, { onSuccess: () => {} });
  };
  const handleBuyNow = () => {
    if (course?.id) navigate({ to: "/checkout", search: { courseId: course.id } });
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success({
      title: isLiked ? "Đã bỏ yêu thích" : "Đã thêm vào yêu thích",
    });
  };

  const handleShare = () => {
    if (navigator.share && course) {
      navigator.share({
        title: course.title,
        text: course.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success({ title: "Đã copy link khóa học" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="text-gray-600">Đang tải thông tin khóa học...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h3 className="mb-2 text-xl font-bold text-gray-900">Không tìm thấy khóa học</h3>
          <Button className="mt-4 bg-blue-600 text-white" onClick={() => navigate({ to: "/courses" })}>
            Về trang khóa học
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="text-md text-gray-500 flex items-center">
            <span onClick={() => navigate({ to: "/" })} className="hover:text-blue-600 cursor-pointer">
              Trang chủ
            </span>
            <span className="mx-2 text-gray-400">/</span>
            <span onClick={() => navigate({ to: "/courses" })} className="hover:text-blue-600 cursor-pointer">
              Danh sách khóa học
            </span>{" "}
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-blue-600 font-medium">{course.title}</span>
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-3">
            <CourseHero
              course={course}
              hasAccess={hasAccess}
              isLiked={isLiked}
              onLike={handleLike}
              onShare={handleShare}
            />
            <CourseTabs course={course} hasAccess={hasAccess} />
          </div>

          <div className="space-y-4">
            <div className="lg:sticky lg:top-4">
              <CoursePricingCard
                price={course.price}
                hasAccess={hasAccess}
                isPending={cartPending || enrollPending}
                firstLectureId={course.sections?.[0]?.lectures?.[0]?.id}
                totalLectures={course.totalLectures}
                onEnroll={handleEnroll}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                onStartLearning={() => {
                  const firstSection = course.sections?.find((s) => !s.isDeleted);

                  const firstLecture = firstSection?.lectures?.find((l) => !l.isDeleted);

                  const firstId = firstLecture?.id;
                  if (firstId)
                    navigate({
                      to: "/lectures/$id",
                      params: { id: String(firstId) },
                    });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailContent;
