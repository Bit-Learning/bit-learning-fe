import { Button } from "@workspace/ui/components/Button";
import { Textarea } from "@workspace/ui/components/Textarea";
import { Loader2, MessageSquare, Send, Star } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useCourseReviews, usePostReview } from "../queries/useInteraction";
import ReviewItem from "./ReviewItem";

interface CourseReviewsProps {
	courseId: number;
}

const CourseReviews: React.FC<CourseReviewsProps> = ({ courseId }) => {
	const [rating, setRating] = useState(0);
	const [hoverRating, setHoverRating] = useState(0);
	const [comment, setComment] = useState("");
	const [page, setPage] = useState(0);

	const { data, isLoading } = useCourseReviews(
		courseId,
		page,
		5,
		"createdAt",
		"DESC",
	);
	const { mutate: postReview, isPending: isPosting } = usePostReview();

	const handleSubmitReview = () => {
		if (rating === 0) {
			return;
		}

		postReview(
			{
				courseId,
				rating,
				comment: comment.trim() || undefined,
			},
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

	return (
		<div className="space-y-6">
			<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h4 className="mb-4 font-semibold text-gray-900">Đánh giá khóa học</h4>

				<div className="mb-4">
					<label
						htmlFor="rating"
						className="mb-2 block text-sm font-medium text-gray-700"
					>
						Đánh giá của bạn
					</label>
					<input id="rating" type="hidden" value={rating} readOnly />
					<div className="flex items-center gap-2">
						{Array.from({ length: 5 }).map((_, index) => {
							const starValue = index + 1;
							return (
								<button
									key={index}
									type="button"
									onClick={() => setRating(starValue)}
									onMouseEnter={() => setHoverRating(starValue)}
									onMouseLeave={() => setHoverRating(0)}
									className="transition-transform hover:scale-110"
								>
									<Star
										className={`h-8 w-8 ${
											starValue <= (hoverRating || rating)
												? "fill-yellow-400 text-yellow-400"
												: "text-gray-300"
										}`}
									/>
								</button>
							);
						})}
						{rating > 0 && (
							<span className="ml-2 text-sm font-medium text-gray-700">
								{rating}/5 sao
							</span>
						)}
					</div>
				</div>

				<div className="mb-4">
					<label
						htmlFor="comment"
						className="mb-2 block text-sm font-medium text-gray-700"
					>
						Nhận xét (không bắt buộc)
					</label>
					<Textarea
						id="comment"
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
						className="min-h-[100px] resize-none"
					/>
				</div>

				<div className="flex justify-end">
					<Button
						onClick={handleSubmitReview}
						isDisabled={rating === 0 || isPosting}
						className="bg-blue-700 text-white hover:bg-blue-800"
					>
						{isPosting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Đang gửi
							</>
						) : (
							<>
								<Send className="mr-2 h-4 w-4" />
								Gửi đánh giá
							</>
						)}
					</Button>
				</div>
			</div>

			<div className="flex items-center justify-between">
				<h4 className="text-lg font-semibold text-gray-900">
					{pageInfo?.totalElements || 0} đánh giá
				</h4>
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-blue-700" />
				</div>
			) : reviews.length === 0 ? (
				<div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
					<MessageSquare className="mx-auto mb-3 h-12 w-12 text-gray-400" />
					<p className="text-gray-600">
						Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá khóa học này!
					</p>
				</div>
			) : (
				<>
					<div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
						{reviews.map((review) => (
							<ReviewItem key={review.id} review={review} />
						))}
					</div>

					{pageInfo && pageInfo.totalPages > 1 && (
						<div className="flex items-center justify-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage((p) => Math.max(0, p - 1))}
								isDisabled={pageInfo.first}
							>
								Trang trước
							</Button>
							<div className="flex items-center gap-1">
								<span className="px-3 py-1 text-sm text-gray-600">
									Trang {pageInfo.page + 1} / {pageInfo.totalPages}
								</span>
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage((p) => p + 1)}
								isDisabled={pageInfo.last}
							>
								Trang sau
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default CourseReviews;
