import { Button } from "@workspace/ui/components/Button";
import { Textarea } from "@workspace/ui/components/Textarea";
import { Loader2, MessageSquare, Send, Star } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useCourseReviews, usePostReview } from "../queries/useInteraction";
import ReviewItem from "./ReviewItem";

interface CourseReviewsProps {
  courseId: number;
  hasAccess?: boolean;
}

const STAR_LABELS = ["", "Tệ", "Không tốt", "Bình thường", "Tốt", "Xuất sắc"];

const CourseReviews: React.FC<CourseReviewsProps> = ({ courseId, hasAccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useCourseReviews(courseId, page, 5, "createdAt", "DESC");
  const { mutate: postReview, isPending: isPosting } = usePostReview();

  const handleSubmitReview = () => {
    if (rating === 0) return;
    postReview(
      { courseId, rating, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          setRating(0);
          setComment("");
        },
      },
    );
  };

  const pageInfo = data?.page;
  const reviews = data?.content || [];
  const activeRating = hoverRating || rating;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="text-center border-b border-gray-200 bg-blue-50 px-6 py-4">
          <h4 className="text-lg font-bold text-gray-900">Viết đánh giá của bạn</h4>
          <p className="mt-0.5 text-sm text-gray-600">
            Chia sẻ trải nghiệm giúp học viên khác đưa ra quyết định đúng đắn
          </p>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-2">
            <p className="ml-2 text-lg font-medium text-gray-700">Đánh giá của bạn:</p>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const val = i + 1;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => (!hasAccess ? undefined : setRating(val))}
                    onMouseEnter={() => (!hasAccess ? undefined : setHoverRating(val))}
                    onMouseLeave={() => (!hasAccess ? undefined : setHoverRating(0))}
                    disabled={!hasAccess}
                    className="rounded-md p-1 transition-transform hover:scale-110 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Star
                      className={`h-9 w-9 transition-colors ${
                        val <= activeRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  </button>
                );
              })}
              {activeRating > 0 && (
                <span className="ml-2 rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
                  {STAR_LABELS[activeRating]}
                </span>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="comment" className="px-2 mb-2 block text-md font-medium text-gray-700">
              Nhận xét
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                hasAccess
                  ? "Khóa học này có điểm gì nổi bật? Bạn học được gì? Có điều gì cần cải thiện không?"
                  : "Đăng ký khóa học để viết đánh giá"
              }
              disabled={!hasAccess}
              className="min-h-28 resize-none rounded-xl border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 text-right text-xs text-gray-400">{comment.length} ký tự</p>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500">* Đánh giá sao là bắt buộc</p>
            <Button
              onClick={handleSubmitReview}
              size="lg"
              isDisabled={!hasAccess || rating === 0 || isPosting}
              className="gap-2 bg-blue-600 px-6 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isPosting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Gửi đánh giá
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-bold text-gray-900">
            Đánh giá từ học viên
            {pageInfo?.totalElements ? (
              <span className="ml-2 rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-semibold text-blue-700">
                {pageInfo.totalElements}
              </span>
            ) : null}
          </h4>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
              <p className="mt-3 text-sm text-gray-500">Đang tải đánh giá...</p>
            </div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <p className="font-medium text-gray-700">Chưa có đánh giá nào</p>
            <p className="mt-1 text-sm text-gray-500">Hãy là người đầu tiên đánh giá khóa học này!</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {reviews.map((review) => (
                <div key={review.id} className="px-6 py-5 transition-colors hover:bg-gray-50">
                  <ReviewItem review={review} />
                </div>
              ))}
            </div>

            {pageInfo && pageInfo.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  isDisabled={pageInfo.first}
                  className="rounded-lg px-4"
                >
                  ← Trang trước
                </Button>
                <span className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                  {pageInfo.page + 1} / {pageInfo.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  isDisabled={pageInfo.last}
                  className="rounded-lg px-4"
                >
                  Trang sau →
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CourseReviews;
