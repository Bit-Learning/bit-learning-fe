import React from "react";
import {
	AlertCircle,
	CheckCircle,
	Edit,
	Eye,
	FileIcon,
	Images,
	Lock,
	Paperclip,
	ThumbsUp,
	Trash2,
} from "lucide-react";
import { type Post, AttachmentType } from "../types/forum.type";

interface PostRowProps {
	post: Post;
	formatDate: (d: string) => string;
	canEdit: boolean;
	onEdit: () => void;
	onDelete: () => void;
	onView: () => void;
	onAppeal?: () => void;
	appealLabel?: string;
	isAppealSubmitted?: boolean;
}

export const PostRow: React.FC<PostRowProps> = ({
	post,
	formatDate,
	canEdit,
	onEdit,
	onDelete,
	onView,
	onAppeal,
	appealLabel,
	isAppealSubmitted,
}) => {
	const imageAttachments = post.attachments.filter(
		(attachment) => attachment.type === AttachmentType.IMAGE,
	);
	const fileAttachments = post.attachments.filter(
		(attachment) => attachment.type === AttachmentType.FILE,
	);
	const heroImage = imageAttachments[0];
	const sideImages = imageAttachments.slice(1, 3);

	return (
		<div
			className={`group overflow-hidden rounded-md border transition-all ${
				post.isBanned
					? "border-red-100 bg-red-50/20"
					: "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
			}`}
		>
			<div className="flex flex-col sm:flex-row">
				<div className="hidden w-72 shrink-0 sm:block">
					{heroImage ? (
						<div className="relative grid h-full min-h-44 grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)] gap-1 bg-slate-100 p-1">
							<div className="overflow-hidden rounded-l-md">
								<img
									src={heroImage.url}
									alt={post.title}
									className="h-full w-full object-cover"
								/>
							</div>
							<div className="grid grid-rows-2 gap-1">
								{sideImages.length > 0 ? (
									sideImages.map((attachment, index) => (
										<div
											key={attachment.id}
											className="relative overflow-hidden rounded-r-md"
										>
											<img
												src={attachment.url}
												alt=""
												className="h-full w-full object-cover"
											/>
											{index === 1 && imageAttachments.length > 3 ? (
												<div className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-bold text-white">
													+{imageAttachments.length - 3}
												</div>
											) : null}
										</div>
									))
								) : (
									<div className="row-span-2 rounded-r-md bg-slate-50" />
								)}
							</div>

							<div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-2">
								{imageAttachments.length > 1 ? (
									<span className="inline-flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
										<Images className="h-3.5 w-3.5" />
										{imageAttachments.length} ảnh
									</span>
								) : null}
								{fileAttachments.length > 0 ? (
									<span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 backdrop-blur">
										<Paperclip className="h-3.5 w-3.5" />
										{fileAttachments.length} tệp
									</span>
								) : null}
							</div>
						</div>
					) : (
						<div className="flex h-full min-h-44 items-center justify-center bg-gray-50">
							<FileIcon className="h-6 w-6 text-gray-300" />
						</div>
					)}
				</div>

				<div className="flex min-w-0 flex-1 flex-col justify-between p-4">
					<div>
						<div className="mb-2 flex items-start justify-between gap-3">
							<div className="flex flex-wrap items-center gap-2">
								{post.isBanned ? (
									<span className="inline-flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600">
										<Lock className="h-2.5 w-2.5" /> Bị khóa
									</span>
								) : (
									<span className="inline-flex items-center gap-1 rounded-full border border-green-100 bg-green-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-600">
										<CheckCircle className="h-2.5 w-2.5" /> Đã đăng
									</span>
								)}

								{post.hashtags.slice(0, 2).map((tag) => (
									<span
										key={tag.id}
										className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-primary"
									>
										#{tag.name}
									</span>
								))}
							</div>

							<div className="flex shrink-0 items-center gap-2 transition-opacity">
								<button
									className="cursor-pointer rounded-md p-1.5 text-gray-400 transition-all hover:bg-blue-50 hover:text-blue-600"
									onClick={onView}
								>
									<Eye className="h-5 w-5" />
								</button>
								{!post.isBanned && canEdit ? (
									<button
										className="cursor-pointer rounded-md p-1.5 text-gray-400 transition-all hover:bg-blue-50 hover:text-blue-600"
										onClick={onEdit}
									>
										<Edit className="h-5 w-5" />
									</button>
								) : null}
								{!post.isBanned ? (
									<button
										className="cursor-pointer rounded-md p-1.5 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500"
										onClick={onDelete}
									>
										<Trash2 className="h-5 w-5" />
									</button>
								) : onAppeal ? (
									<button
										className={`cursor-pointer rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-all ${
											isAppealSubmitted
												? "border-blue-200 text-blue-600 hover:bg-blue-50"
												: "border-red-200 text-red-600 hover:bg-red-100"
										}`}
										onClick={onAppeal}
									>
										{appealLabel ?? "Khiếu nại"}
									</button>
								) : null}
							</div>
						</div>

						<h3
							className={`mb-1 text-sm leading-snug font-semibold transition-colors ${
								post.isBanned
									? "text-gray-400 line-through"
									: "cursor-pointer text-gray-800 group-hover:text-primary"
							}`}
							onClick={!post.isBanned ? onView : undefined}
						>
							{post.title}
						</h3>

						<p
							className={`text-xs ${post.isBanned ? "text-gray-400" : "text-gray-500"} ${
								imageAttachments.length > 1 ? "line-clamp-2" : "line-clamp-1"
							}`}
						>
							{post.content}
						</p>

						{imageAttachments.length > 1 ? (
							<div className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:hidden">
								{imageAttachments.slice(0, 4).map((attachment, index) => (
									<div
										key={attachment.id}
										className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200"
									>
										<img
											src={attachment.url}
											alt=""
											className="h-full w-full object-cover"
										/>
										{index === 3 && imageAttachments.length > 4 ? (
											<div className="absolute inset-0 flex items-center justify-center bg-black/45 text-xs font-bold text-white">
												+{imageAttachments.length - 4}
											</div>
										) : null}
									</div>
								))}
							</div>
						) : null}
					</div>

					<div className="mt-3 border-t border-gray-100 pt-2.5">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3 text-xs text-gray-400">
								{!post.isBanned ? (
									<span className="flex items-center gap-1">
										<ThumbsUp className="h-3 w-3" />
										{post.likes}
									</span>
								) : null}
								<span className="flex items-center gap-1">
									<Eye className="h-3 w-3" />
									{post.likes + post.dislikes}
								</span>
								{imageAttachments.length > 1 ? (
									<span className="hidden items-center gap-1 sm:inline-flex">
										<Images className="h-3 w-3" />
										{imageAttachments.length}
									</span>
								) : null}
								{fileAttachments.length > 0 ? (
									<span className="hidden items-center gap-1 sm:inline-flex">
										<Paperclip className="h-3 w-3" />
										{fileAttachments.length}
									</span>
								) : null}
							</div>

							<span className="text-xs text-gray-400">
								{post.isBanned
									? `Khóa ${formatDate(post.updatedAt)}`
									: formatDate(post.createdAt)}
							</span>
						</div>

						{post.isBanned ? (
							<div className="mt-2 rounded-xl border border-red-100 bg-white/70 px-3 py-2 text-xs text-red-700">
								<div className="mb-1 flex items-center gap-1.5 font-semibold text-red-500">
									<AlertCircle className="h-3.5 w-3.5" />
									Lý do khóa
								</div>
								<p className="leading-5">
									{post.banReason?.trim() || "Vi phạm tiêu chuẩn cộng đồng"}
								</p>
							</div>
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
};
