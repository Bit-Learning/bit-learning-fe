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
import { CourseCertificate } from "./CourseCertificate";

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
    toast.success({ title: isLiked ? "Đã bỏ yêu thích" : "Đã thêm vào yêu thích" });
  };

  const handleShare = () => {
    if (navigator.share && course) {
      navigator.share({ title: course.title, text: course.description, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success({ title: "Đã copy link khóa học" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="flex h-96 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />
              <p className="text-lg font-medium text-gray-700">Đang tải thông tin khóa học...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="py-12 text-center">
            <BookOpen className="mx-auto mb-4 h-20 w-20 text-gray-400" />
            <h3 className="mb-2 text-2xl font-bold text-gray-900">Không tìm thấy khóa học</h3>
            <p className="mb-6 text-gray-600">{error ? (error as Error).message : ""}</p>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => navigate({ to: "/courses" })}>
              Về trang khóa học
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <button
          type="button"
          className="cursor-pointer mb-6 inline-flex items-center text-gray-600 transition-all hover:text-blue-700"
          onClick={() => navigate({ to: "/courses" })}
        >
          <ChevronLeft className="mr-1 h-5 w-5" />
          <span className="font-medium">Danh sách khóa học</span>
        </button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <CourseHero
              course={course}
              hasAccess={hasAccess}
              isLiked={isLiked}
              onLike={handleLike}
              onShare={handleShare}
            />

            {hasAccess && (
              <CourseCertificate
                courseId={course.id}
                courseName={course.title}
                progressPercentage={course.progressPercentage ?? 0}
              />
            )}

            <CourseTabs course={course} hasAccess={hasAccess} />
          </div>

          <div className="space-y-6">
            <CoursePricingCard
              price={course.price}
              hasAccess={hasAccess}
              isPending={cartPending || enrollPending}
              onEnroll={handleEnroll}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              firstLectureId={course.sections?.[0]?.lectures?.[0]?.id}
              onStartLearning={() => {
                const firstId = course.sections?.[0]?.lectures?.[0]?.id;
                if (firstId) navigate({ to: "/lectures/$id", params: { id: String(firstId) } });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailContent;
