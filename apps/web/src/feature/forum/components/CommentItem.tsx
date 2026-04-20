import type React from "react";
import { useState } from "react";
import { ThumbsUp, ThumbsDown, Reply } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import type { Comment } from "../types/forum.type";
import { AuthorAvatar } from "./AuthorAvatar";
import { resolveAuthorUsername } from "../utils/author-profile";

interface CommentItemProps {
	comment: Comment;
	replyingTo: number | null;
	setReplyingTo: (id: number | null) => void;
	onReply: (commentId: number) => void;
	onLike: (commentId: number) => void;
	onDislike: (commentId: number) => void;
	onSubmitReply: (content: string, commentId: number) => void;
	isInteractionDisabled?: boolean;
	onRequireAuth?: () => void;
	currentUserId?: number;
}

export const CommentItem: React.FC<CommentItemProps> = ({
	comment,
	onReply,
	onLike,
	onDislike,
	replyingTo,
	setReplyingTo,
	onSubmitReply,
	isInteractionDisabled = false,
	onRequireAuth,
	currentUserId,
}) => {
	const [replyContent, setReplyContent] = useState("");
	const navigate = useNavigate();

	const isReplying = replyingTo === comment.id;
	const isLikedByCurrentUser =
		!!currentUserId &&
		(comment.userLikes?.some((user) => user.id === currentUserId) ?? false);
	const isDislikedByCurrentUser =
		!!currentUserId &&
		(comment.userDislikes?.some((user) => user.id === currentUserId) ?? false);
	const authorFullName =
		`${comment.author.firstName} ${comment.author.lastName}`.trim();
	const isMentorComment = comment.author.role?.toUpperCase() === "MENTOR";

	const handleViewProfile = async () => {
		const username = await resolveAuthorUsername(comment.author);
		navigate({
			to: "/profile/$username",
			params: { username },
		});
	};

	const formatDate = (date: string) => {
		const now = new Date();
		const commentDate = new Date(date);
		const diffInHours = Math.floor(
			(now.getTime() - commentDate.getTime()) / (1000 * 60 * 60),
		);

		if (diffInHours < 1) return "Vừa xong";
		if (diffInHours < 24) return `${diffInHours} giờ trước`;
		return `${Math.floor(diffInHours / 24)} ngày trước`;
	};

	return (
		<div className="flex items-start gap-4">
			<button
				type="button"
				onClick={handleViewProfile}
				className="shrink-0 cursor-pointer"
			>
				<AuthorAvatar author={comment.author} size="lg" />
			</button>
			<div className="flex-1">
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-3">
						<div className="flex flex-wrap items-center gap-2">
							<button
								type="button"
								onClick={handleViewProfile}
								className="cursor-pointer font-bold text-gray-900 transition-colors hover:text-gray-700"
							>
								{authorFullName}
							</button>
							{isMentorComment ? (
								<span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
									Mentor
								</span>
							) : null}
						</div>
						<span className="text-xs text-gray-500">
							{formatDate(comment.createdAt)}
						</span>
						{comment.isEdited && (
							<span className="text-xs text-gray-400 italic">
								(đã chỉnh sửa)
							</span>
						)}
					</div>
				</div>

				<p className="text-gray-700 text-base leading-relaxed mb-6">
					{comment.content}
				</p>

				<div className="flex items-center gap-6">
					<div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
						<Button
							variant="ghost"
							size="icon"
							className={`h-auto p-0 ${isLikedByCurrentUser ? "text-blue-600" : "text-gray-500 hover:text-blue-600"}`}
							isDisabled={isInteractionDisabled}
							onClick={() => {
								if (isInteractionDisabled) {
									onRequireAuth?.();
									return;
								}
								onLike(comment.id);
							}}
						>
							<ThumbsUp className="w-5 h-5" />
						</Button>
						<span className="text-sm font-bold text-gray-900">
							{comment.likes}
						</span>
						<Button
							variant="ghost"
							size="icon"
							className={`h-auto p-0 ${isDislikedByCurrentUser ? "text-red-600" : "text-gray-500 hover:text-red-600"}`}
							isDisabled={isInteractionDisabled}
							onClick={() => {
								if (isInteractionDisabled) {
									onRequireAuth?.();
									return;
								}
								onDislike(comment.id);
							}}
						>
							<ThumbsDown className="w-5 h-5" />
						</Button>
					</div>
					<Button
						variant="ghost"
						className="text-blue-600 gap-1.5 h-auto p-0 hover:underline font-semibold"
						isDisabled={isInteractionDisabled}
						onClick={() => {
							if (isInteractionDisabled) {
								onRequireAuth?.();
								return;
							}
							setReplyingTo(isReplying ? null : comment.id);
						}}
					>
						<Reply className="w-4 h-4" />
						Trả lời
					</Button>
				</div>

				{isReplying && (
					<div className="mt-4 ml-1">
						<textarea
							className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							rows={3}
							placeholder="Nhập phản hồi..."
							disabled={isInteractionDisabled}
							value={replyContent}
							onChange={(e) => setReplyContent(e.target.value)}
						/>

						<div className="flex justify-end gap-2 mt-2">
							<Button
								variant="ghost"
								onClick={() => {
									setReplyingTo(null);
									setReplyContent("");
								}}
							>
								Huỷ
							</Button>

							<Button
								isDisabled={isInteractionDisabled || !replyContent.trim()}
								onClick={() => {
									if (isInteractionDisabled) {
										onRequireAuth?.();
										return;
									}
									onSubmitReply(replyContent, comment.id);
									setReplyContent("");
									setReplyingTo(null);
								}}
							>
								Gửi
							</Button>
						</div>
					</div>
				)}

				{comment.replies && comment.replies.length > 0 && (
					<div className="mt-8 pl-8 border-l-2 border-gray-100 space-y-6">
						{comment.replies.map((reply) => (
							<CommentItem
								key={reply.id}
								comment={reply}
								replyingTo={replyingTo}
								setReplyingTo={setReplyingTo}
								onReply={onReply}
								onLike={onLike}
								onDislike={onDislike}
								onSubmitReply={onSubmitReply}
								isInteractionDisabled={isInteractionDisabled}
								onRequireAuth={onRequireAuth}
								currentUserId={currentUserId}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
};
