import React from "react";
import { Images, Paperclip, ZoomIn } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { type Post, AttachmentType } from "../types/forum.type";
import { Separator } from "@workspace/ui/components/Separator";

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
	onLike: _onLike,
	onDislike: _onDislike,
	showFullContent: _showFullContent = false,
}) => {
	const navigate = useNavigate();

	const goDetail = () =>
		navigate({ to: "/forum/post/$id", params: { id: String(post.id) } });

	const imageAttachments = post.attachments.filter(
		(attachment) => attachment.type === AttachmentType.IMAGE,
	);
	const fileAttachments = post.attachments.filter(
		(attachment) => attachment.type === AttachmentType.FILE,
	);
	const imageUrl = imageAttachments[0]?.url ?? "/graybg.jpg";

	return (
		<div className="overflow-hidden rounded-md border border-gray-200 bg-white transition-shadow hover:shadow-md">
			<div className="group relative cursor-zoom-in" onClick={goDetail}>
				{imageAttachments.length <= 1 ? (
					<div className="relative h-80 overflow-hidden">
						<img
							src={imageUrl}
							alt="Forum thumbnail"
							className="block h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						/>
					</div>
				) : (
					<div className="grid h-80 grid-cols-[minmax(0,1.45fr)_minmax(0,0.85fr)] gap-1 bg-gray-100 p-1">
						<div className="overflow-hidden rounded-l-md">
							<img
								src={imageAttachments[0]?.url ?? imageUrl}
								alt=""
								className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
							/>
						</div>
						<div className="grid grid-rows-2 gap-1">
							{imageAttachments.slice(1, 3).map((attachment, index) => (
								<div
									key={attachment.id}
									className="relative overflow-hidden rounded-r-md"
								>
									<img
										src={attachment.url}
										alt=""
										className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
									/>
									{index === 1 && imageAttachments.length > 3 ? (
										<div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
											<span className="text-lg font-bold">
												+{imageAttachments.length - 3}
											</span>
										</div>
									) : null}
								</div>
							))}
						</div>
					</div>
				)}

				<div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
					<ZoomIn className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-80" />
				</div>

				<div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-2">
					{imageAttachments.length > 1 ? (
						<span className="inline-flex items-center gap-1 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
							<Images className="h-3.5 w-3.5" />
							{imageAttachments.length} ảnh
						</span>
					) : null}
					{fileAttachments.length > 0 ? (
						<span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
							<Paperclip className="h-3.5 w-3.5" />
							{fileAttachments.length} tệp
						</span>
					) : null}
				</div>

				{imageAttachments.length > 1 ? (
					<div className="absolute bottom-3 left-3 right-3 flex gap-2 overflow-hidden">
						{imageAttachments.slice(0, 4).map((attachment, index) => (
							<div
								key={attachment.id}
								className="relative h-12 flex-1 overflow-hidden rounded-md border border-white/30 bg-white/10 backdrop-blur"
							>
								<img
									src={attachment.url}
									alt=""
									className="h-full w-full object-cover"
								/>
								{index === 3 && imageAttachments.length > 4 ? (
									<div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-bold text-white">
										+{imageAttachments.length - 4}
									</div>
								) : null}
							</div>
						))}
					</div>
				) : null}
			</div>

			<div className="px-4 pt-3">
				<h1
					className="min-h-[4rem] cursor-pointer line-clamp-3 text-lg leading-snug font-normal text-gray-900 transition-colors"
					onClick={goDetail}
				>
					{post.title}
				</h1>
			</div>

			<Separator />

			<div className="flex items-center justify-between px-4 py-2">
				<div className="flex items-center justify-center gap-3 text-gray-400">
					<p className="text-md font-normal leading-none">
						{post.author.firstName} {post.author.lastName}
					</p>
					|
					<div className="flex items-center gap-1.5">
						<span className="text-sm">{formatDate(post.createdAt)}</span>
						{post.isEdited ? (
							<span className="text-sm text-gray-400">· đã chỉnh sửa</span>
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
};
