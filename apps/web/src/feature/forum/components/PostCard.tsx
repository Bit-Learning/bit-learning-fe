import React from "react";
import {
	ThumbsUp,
	ThumbsDown,
	MessageCircle,
	MoreHorizontal,
	Download,
	ZoomIn,
	FileText,
	File,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { type Post, AttachmentType } from "../types/forum.type";
import { AuthorAvatar } from "./AuthorAvatar";
import { Separator } from "@workspace/ui/components/Separator";
import { formatRelative } from "../utils/forum.utils";

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

function getFileIcon(url: string) {
	const ext = url.split(".").pop()?.toLowerCase() ?? "";
	if (ext === "pdf") return <FileText className="w-4 h-4" />;
	return <File className="w-4 h-4" />;
}

function getFileIconStyle(url: string): string {
	const ext = url.split(".").pop()?.toLowerCase() ?? "";
	if (ext === "pdf") return "bg-red-50 text-red-500";
	if (["xls", "xlsx", "csv"].includes(ext)) return "bg-green-50 text-green-600";
	if (["ppt", "pptx"].includes(ext)) return "bg-orange-50 text-orange-500";
	return "bg-gray-100 text-gray-500";
}

function getFileName(url: string): string {
	return url.split("/").pop() ?? "Tài liệu đính kèm";
}

export const PostCard: React.FC<PostCardProps> = ({
	post,
	onLike: _onLike,
	onDislike: _onDislike,
	showFullContent: _showFullContent = false,
}) => {
	const navigate = useNavigate();

	const goDetail = () =>
		navigate({ to: "/forum/post/$id", params: { id: String(post.id) } });

	const imageAttachments = post.attachments.filter(
		(a) => a.type === AttachmentType.IMAGE,
	);
	const fileAttachments = post.attachments.filter(
		(a) => a.type === AttachmentType.FILE,
	);

	const firstImage = imageAttachments[0];
	const imageUrl = firstImage?.url ?? "/graybg.jpg";

	return (
		<>
			<div className="bg-white rounded-md border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
				<div className="relative cursor-zoom-in group h-80" onClick={goDetail}>
					<img
						src={imageUrl}
						alt="Forum thumbnail"
						className="w-full h-full object-cover block transition-transform duration-300 group-hover:scale-105"
					/>
					<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
						<ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-80 transition-opacity" />
					</div>
				</div>

				<div className="px-4 pt-3">
					<h1
						className="text-lg font-normal text-gray-900 leading-snug line-clamp-3 min-h-[4rem] cursor-pointer transition-colors"
						onClick={goDetail}
					>
						{post.title}
					</h1>
				</div>

				<Separator />

				<div className="flex items-center justify-between px-4 py-2">
					<div className="flex justify-center items-center gap-3 text-gray-400">
						{/* <AuthorAvatar author={post.author} size="md" /> */}
						<p className="text-md font-normal leading-none">
							{post.author.firstName} {post.author.lastName}
						</p>
						|
						<div className="flex items-center gap-1.5">
							<span className="text-sm">{formatDate(post.createdAt)}</span>
							{post.isEdited && (
								<span className="text-sm text-gray-400">· đã chỉnh sửa</span>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
