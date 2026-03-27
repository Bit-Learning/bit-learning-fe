import React from "react";
import {
	ThumbsUp,
	ThumbsDown,
	MessageCircle,
	Share2,
	MoreHorizontal,
	ChevronRight,
	Paperclip,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import type { Post } from "../types/forum.type";
import { AuthorAvatar } from "./AuthorAvatar";

interface PostCardProps {
	post: Post;
	onLike: (id: number) => void;
	onDislike: (id: number) => void;
	onViewDetails?: (id: number) => void;
	showFullContent?: boolean;
	showActions?: boolean;
}

function formatDate(date: string): string {
	const diffH = Math.floor((Date.now() - new Date(date).getTime()) / 3_600_000);
	if (diffH < 1) return "Vừa xong";
	if (diffH < 24) return `${diffH} giờ trước`;
	const days = Math.floor(diffH / 24);
	if (days < 30) return `${days} ngày trước`;
	return new Date(date).toLocaleDateString("vi-VN");
}

export const PostCard: React.FC<PostCardProps> = ({
	post,
	onLike,
	onDislike,
	onViewDetails,
	showFullContent = false,
}) => {
	const navigate = useNavigate();
	const goDetail = () =>
		navigate({ to: "/forum/post/$id", params: { id: String(post.id) } });

	const imageAttachments = post.attachments.filter((a) => a.type === "IMAGE");
	const fileAttachments = post.attachments.filter((a) => a.type !== "IMAGE");

	return (
		<div className="bg-white rounded-md border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
			<div className="flex items-center justify-between px-4 pt-4 pb-2">
				<div className="flex items-center gap-3">
					<AuthorAvatar author={post.author} size="md" />
					<div>
						<p className="text-sm font-bold text-gray-900 leading-none">
							{post.author.firstName} {post.author.lastName}
						</p>
						<div className="flex items-center gap-1.5 mt-1">
							<span className="text-xs text-gray-400">
								{formatDate(post.createdAt)}
							</span>
							{post.isEdited && (
								<span className="text-xs text-gray-400">· đã chỉnh sửa</span>
							)}
						</div>
					</div>
				</div>
				<button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
					<MoreHorizontal className="w-5 h-5" />
				</button>
			</div>

			{post.hashtags.length > 0 && (
				<div className="px-4 pb-2 flex flex-wrap gap-1.5">
					{post.hashtags.slice(0, 4).map((tag) => (
						<span
							key={tag.id}
							className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full font-medium"
						>
							#{tag.name}
						</span>
					))}
				</div>
			)}

			<div className="px-4 pb-3">
				<h2
					className="text-[15px] font-bold text-gray-900 mb-1.5 hover:text-blue-600 cursor-pointer transition-colors leading-snug"
					onClick={goDetail}
				>
					{post.title}
				</h2>
				<p
					className={`text-sm text-gray-600 leading-relaxed ${!showFullContent ? "line-clamp-3" : ""}`}
				>
					{post.content}
				</p>
			</div>

			{(post.likes > 0 || post.dislikes > 0) && (
				<div className="px-4 py-2 flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 mt-2">
					<span>{post.likes > 0 ? `👍 ${post.likes}` : ""}</span>
					<span>{post.dislikes > 0 ? `${post.dislikes} không thích` : ""}</span>
				</div>
			)}

			<div
				className={`flex items-center border-t border-gray-100 mx-0 ${post.likes > 0 || post.dislikes > 0 ? "" : "mt-2"}`}
			>
				<button
					className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors ${
						post.likes > 0
							? "text-blue-600 hover:bg-blue-50"
							: "text-gray-500 hover:bg-gray-50"
					}`}
					onClick={() => onLike(post.id)}
				>
					<ThumbsUp
						className={`w-4 h-4 ${post.likes > 0 ? "fill-blue-600" : ""}`}
					/>
					Thích
				</button>
				<button
					className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
					onClick={() => onDislike(post.id)}
				>
					<ThumbsDown className="w-4 h-4" />
					Không thích
				</button>
				<button
					className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
					onClick={goDetail}
				>
					<MessageCircle className="w-4 h-4" />
					Bình luận
				</button>
				<button className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
					<Share2 className="w-4 h-4" />
					Chia sẻ
				</button>
			</div>

			{!showFullContent && onViewDetails && (
				<div className="px-4 pb-3 border-t border-gray-50 pt-2">
					<button
						className="w-full text-sm text-blue-600 font-semibold hover:bg-blue-50 py-2 rounded-xl transition-colors flex items-center justify-center gap-1"
						onClick={() => onViewDetails(post.id)}
					>
						Xem toàn bộ bài viết
						<ChevronRight className="w-4 h-4" />
					</button>
				</div>
			)}
		</div>
	);
};
