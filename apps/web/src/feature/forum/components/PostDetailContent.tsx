import React, { useEffect, useState } from "react";
import {
	ImageIcon,
	Paperclip,
	AtSign,
	ChevronDown,
	Download,
	Pencil,
	X,
	ZoomIn,
	ThumbsUp,
	ThumbsDown,
	MessageCircle,
	MoreHorizontal,
	Calendar,
	Eye,
	FileIcon,
} from "lucide-react";
import { Textarea } from "@workspace/ui/components/Textarea";
import {
	useForumPostById,
	useForumComments,
	useCreateForumComment,
	useReplyForumComment,
	useReactToForumPost,
	useLikeForumComment,
	useForumPosts,
} from "../queries/useForum";
import { CommentItem } from "./CommentItem";
import { AuthorAvatar } from "./AuthorAvatar";
import { useNavigate, useParams } from "@tanstack/react-router";
import { formatDate, formatRelative } from "../utils/forum.utils";
import { useSelector } from "react-redux";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { Separator } from "@workspace/ui/components/Separator";
import { ShareBar } from "./ShareBar";
import type { Post, ReactionSummary, ReactionType } from "../types/forum.type";
import { toast } from "@/shared/components/Sonner";
import { resolveAuthorUsername } from "../utils/author-profile";

const REACTIONS: { type: ReactionType; label: string; icon: string }[] = [
	{ type: "LIKE", label: "Like", icon: "👍" },
	{ type: "LOVE", label: "Love", icon: "❤️" },
	{ type: "HAHA", label: "Haha", icon: "😂" },
	{ type: "WOW", label: "Wow", icon: "😮" },
	{ type: "SAD", label: "Sad", icon: "😢" },
	{ type: "ANGRY", label: "Angry", icon: "😡" },
];

function formatCompactNumber(value: number) {
	if (value >= 1000) {
		return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
	}
	return String(value);
}

function getTopReactionIcons(reactionSummary: ReactionSummary) {
	return Object.entries(reactionSummary)
		.filter(([, count]) => count > 0)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 3)
		.map(
			([type]) =>
				REACTIONS.find((reaction) => reaction.type === type)?.icon ?? "👍",
		);
}

function getReactionIcon(type?: ReactionType | null) {
	return REACTIONS.find((reaction) => reaction.type === type)?.icon ?? "👍";
}

function ReactionButton({
	post,
	onReact,
	disabled,
}: {
	post: Post;
	onReact: (reactionType: ReactionType) => void;
	disabled?: boolean;
}) {
	const topReactionIcons = getTopReactionIcons(post.reactionSummary);
	const activeReaction = post.currentUserReaction;

	return (
		<div className="group relative">
			<button
				type="button"
				disabled={disabled}
				onClick={() => onReact("LIKE")}
				className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition ${
					activeReaction
						? "border-blue-200 bg-blue-50 text-blue-700"
						: "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
				}`}
			>
				<span className="text-base">{getReactionIcon(activeReaction)}</span>
				{/* <span>{activeReaction ? activeReaction.toLowerCase() : "Like"}</span> */}
				{post.totalReactions > 0 && (
					<span className="flex items-center gap-1 text-slate-500">
						{topReactionIcons.length > 0 && (
							<span className="flex -space-x-1">
								{topReactionIcons.map((icon) => (
									<span key={icon} className="rounded-full text-2xl">
										{icon}
									</span>
								))}
							</span>
						)}
						{formatCompactNumber(post.totalReactions)}
					</span>
				)}
			</button>

			<div className="pointer-events-none absolute bottom-full left-0 z-20 mb-3 flex translate-y-2 gap-1 rounded-full border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
				{REACTIONS.map((reaction) => (
					<button
						key={reaction.type}
						type="button"
						title={reaction.label}
						className="flex h-10 w-10 items-center justify-center rounded-full text-lg transition hover:-translate-y-1 hover:bg-slate-100"
						onClick={() => onReact(reaction.type)}
					>
						{reaction.icon}
					</button>
				))}
			</div>
		</div>
	);
}

const PostDetailContent: React.FC = () => {
	const { id } = useParams({ from: "/_layout/forum/post/$id" });
	const postId = Number(id);
	const navigate = useNavigate();

	const [comment, setComment] = useState("");
	const [replyingTo, setReplyingTo] = useState<number | null>(null);
	const [lightboxImg, setLightboxImg] = useState<string | null>(null);
	const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);

	const { data: postResponse, isLoading: isPostLoading } =
		useForumPostById(postId);
	const { data: commentsResponse, isLoading: isCommentsLoading } =
		useForumComments(postId);
	const { data: postsResponse } = useForumPosts({ page: 0, size: 20 });

	const selectedPost = postResponse?.data ?? null;
	const comments = commentsResponse?.data ?? [];
	const allPosts = postsResponse?.data ?? [];

	// Lấy top 5 bài viết xem nhiều nhất (sắp xếp theo likes)
	const trendingPosts = [...allPosts]
		.filter((p) => p.id !== postId) // Loại bỏ bài hiện tại
		.sort((a, b) => b.likes - a.likes)
		.slice(0, 5);

	const createCommentMutation = useCreateForumComment();
	const replyCommentMutation = useReplyForumComment();
	const reactMutation = useReactToForumPost();
	const likeCommentMutation = useLikeForumComment();
	const { userInfo } = useSelector(selectAuthStateInfo);

	const canEdit = !!userInfo && selectedPost?.author?.id === userInfo.id;

	const handleRequireAuthForComment = () => {
		toast.error({ title: "Vui lòng đăng nhập để bình luận." });
		navigate({ to: "/signin" });
	};

	const handleSubmitComment = () => {
		if (!userInfo) {
			handleRequireAuthForComment();
			return;
		}

		if (!comment.trim()) return;

		if (replyingTo) {
			replyCommentMutation.mutate({ id: replyingTo, content: comment });
			setReplyingTo(null);
		} else {
			createCommentMutation.mutate({ postId, content: comment });
		}

		setComment("");
	};

	const handleReact = (reactionType: ReactionType) => {
		if (!selectedPost) return;
		if (!userInfo) {
			toast.error({ title: "Vui lòng đăng nhập để thả cảm xúc." });
			navigate({ to: "/signin" });
			return;
		}

		reactMutation.mutate({ id: selectedPost.id, reactionType });
	};

	const imageAttachments = (selectedPost?.attachments ?? []).filter(
		(a) => a.type === "IMAGE",
	);
	const fileAttachments = (selectedPost?.attachments ?? []).filter(
		(a) => a.type !== "IMAGE",
	);

	useEffect(() => {
		setActiveImageUrl(imageAttachments[0]?.url ?? null);
	}, [selectedPost?.id, imageAttachments]);

	if (isPostLoading) {
		return (
			<div className="min-h-screen bg-white">
				<div className="bg-white border-b border-gray-200 shadow-sm">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
						<nav className="text-md text-gray-500 flex items-center">
							<span
								onClick={() => navigate({ to: "/" })}
								className="hover:text-gray-700 cursor-pointer"
							>
								Trang chủ
							</span>
							<span className="mx-2 text-gray-400">/</span>
							<span
								onClick={() => navigate({ to: "/forum" })}
								className="hover:text-gray-700 cursor-pointer"
							>
								Diễn đàn
							</span>
						</nav>
					</div>
				</div>

				<div className="max-w-4xl mx-auto px-6 py-8 animate-pulse space-y-5">
					<div className="flex items-center gap-3">
						<div className="w-12 h-12 rounded-full bg-gray-100 shrink-0" />
						<div className="space-y-2">
							<div className="h-3.5 w-28 bg-gray-100 rounded-full" />
							<div className="h-3 w-44 bg-gray-100 rounded-full" />
						</div>
					</div>
					<div className="flex gap-2">
						<div className="h-6 w-16 bg-gray-100 rounded-full" />
						<div className="h-6 w-20 bg-gray-100 rounded-full" />
					</div>
					<div className="space-y-2">
						<div className="h-7 w-3/4 bg-gray-100 rounded-md" />
						<div className="h-7 w-1/2 bg-gray-100 rounded-md" />
					</div>
					<div className="h-72 w-full bg-gray-100 rounded-md" />
					<div className="space-y-2 pt-2">
						{[1, 2, 3, 4].map((i) => (
							<div
								key={i}
								className="h-4 bg-gray-100 rounded"
								style={{ width: `${90 - i * 10}%` }}
							/>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (!selectedPost) return null;

	const authorFullName =
		`${selectedPost.author.firstName} ${selectedPost.author.lastName}`.trim();
	const handleViewAuthorProfile = async () => {
		const username = await resolveAuthorUsername(selectedPost.author);
		navigate({
			to: "/profile/$username",
			params: { username },
		});
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{lightboxImg && (
				<div
					className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
					onClick={() => setLightboxImg(null)}
				>
					<button
						className="absolute top-4 right-4 text-white/60 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"
						onClick={() => setLightboxImg(null)}
					>
						<X className="w-6 h-6" />
					</button>
					<img
						src={lightboxImg}
						alt=""
						className="max-w-full max-h-full rounded-xl object-contain shadow-2xl"
						onClick={(e) => e.stopPropagation()}
					/>
				</div>
			)}

			<div className="bg-white border-b border-gray-200 shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<nav className="text-md text-gray-500 flex items-center">
						<span
							onClick={() => navigate({ to: "/" })}
							className="hover:text-gray-700 cursor-pointer"
						>
							Trang chủ
						</span>
						<span className="mx-2 text-gray-400">/</span>
						<span
							onClick={() => navigate({ to: "/forum" })}
							className="hover:text-gray-700 cursor-pointer"
						>
							Diễn đàn
						</span>
						<span className="mx-2 text-gray-400">/</span>
						<span className="text-gray-700 font-medium">
							{selectedPost.title}
						</span>
					</nav>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
				<div className="flex gap-4 items-start">
					<div className="flex-1 min-w-0 bg-white rounded-md shadow-sm border border-gray-200 p-8">
						<div className="pb-5 flex items-start justify-between">
							<div className="flex items-center gap-3.5">
								<button
									type="button"
									onClick={handleViewAuthorProfile}
									className="shrink-0 cursor-pointer"
								>
									<AuthorAvatar author={selectedPost.author} size="lg" />
								</button>
								<div>
									<button
										type="button"
										onClick={handleViewAuthorProfile}
										className="cursor-pointer text-md font-bold leading-none text-gray-900 transition-colors hover:text-gray-700"
									>
										{authorFullName}
									</button>
									<div className="flex items-center gap-1.5 mt-1">
										<Calendar className="w-4 h-4 text-gray-400" />
										<span className="text-sm text-gray-400">
											{formatDate(selectedPost.createdAt)}
										</span>
										<span className="text-gray-300">·</span>
										<span className="text-sm text-gray-400">
											{formatRelative(selectedPost.createdAt)}
										</span>
										{selectedPost.isEdited && (
											<>
												<span className="text-gray-300">·</span>
												<span className="text-xs text-gray-400 italic">
													đã chỉnh sửa
												</span>
											</>
										)}
									</div>
								</div>
							</div>
							<div className="flex items-center gap-2">
								{canEdit && (
									<button
										type="button"
										onClick={() =>
											navigate({
												to: "/forum/$id/edit",
												params: { id: String(selectedPost.id) },
											})
										}
										className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
									>
										<Pencil className="w-3.5 h-3.5" />
										<span>Chỉnh sửa</span>
									</button>
								)}
								<button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
									<MoreHorizontal className="w-5 h-5" />
								</button>
							</div>
						</div>

						<h1 className="text-3xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
							{selectedPost.title}
						</h1>

						{imageAttachments.length > 0 && (
							<div className="mb-6 space-y-3 overflow-hidden rounded-md">
								<div
									className="group relative cursor-zoom-in overflow-hidden rounded-2xl bg-slate-100"
									onClick={() =>
										activeImageUrl && setLightboxImg(activeImageUrl)
									}
								>
									<img
										src={activeImageUrl ?? imageAttachments[0]?.url}
										alt=""
										className="max-h-[42rem] w-full object-cover"
									/>
									<div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
										<ZoomIn className="h-9 w-9 text-white opacity-0 transition-opacity drop-shadow-lg group-hover:opacity-80" />
									</div>
									{imageAttachments.length > 1 ? (
										<div className="absolute left-4 top-4 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
											Ảnh{" "}
											{Math.max(
												imageAttachments.findIndex(
													(attachment) => attachment.url === activeImageUrl,
												) + 1,
												1,
											)}
											/{imageAttachments.length}
										</div>
									) : null}
								</div>

								{imageAttachments.length > 1 ? (
									<div className="flex gap-2 overflow-x-auto pb-1">
										{imageAttachments.map((attachment) => {
											const isActive = attachment.url === activeImageUrl;
											return (
												<button
													key={attachment.id}
													type="button"
													onClick={() => setActiveImageUrl(attachment.url)}
													className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border transition ${
														isActive
															? "border-blue-500 ring-2 ring-blue-100"
															: "border-slate-200 hover:border-slate-300"
													}`}
												>
													<img
														src={attachment.url}
														alt=""
														className="h-full w-full object-cover"
													/>
													{isActive ? (
														<div className="absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-black/45 to-transparent" />
													) : null}
												</button>
											);
										})}
									</div>
								) : null}
							</div>
						)}

						<div className="mb-8">
							<p className="text-md text-gray-800 leading-[1.8] whitespace-pre-wrap">
								{selectedPost.content}
							</p>
						</div>
						{selectedPost.hashtags.length > 0 && (
							<div className="flex flex-wrap gap-1.5 mb-4">
								{selectedPost.hashtags.map((tag) => (
									<span
										key={tag.id}
										className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full font-medium"
									>
										#{tag.name}
									</span>
								))}
							</div>
						)}

						{fileAttachments.length > 0 && (
							<div className="mb-8 space-y-2">
								<p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
									Tài liệu đính kèm
								</p>
								{fileAttachments.map((file) => (
									<a
										key={file.id}
										href={file.url}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50/50 transition-all group shadow-sm"
									>
										<div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
											<Paperclip className="w-4 h-4 text-blue-600" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-gray-700 group-hover:text-blue-700 truncate transition-colors">
												Tài liệu
											</p>
											<p className="text-xs text-gray-400">{file.type}</p>
										</div>
										<Download className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors shrink-0" />
									</a>
								))}
							</div>
						)}

						{(selectedPost.likes > 0 || selectedPost.dislikes > 0) && (
							<div className="px-4 py-2 flex items-center gap-4 text-sm border-t border-gray-100 mt-2">
								{selectedPost.likes > 0 && (
									<span className="flex items-center gap-1.5">
										<ThumbsUp className="w-3.5 h-3.5 fill-blue-500 text-blue-500" />
										<span className="font-medium text-gray-600">
											{selectedPost.likes}
										</span>
									</span>
								)}

								{selectedPost.dislikes > 0 && (
									<span className="flex items-center gap-1.5">
										<ThumbsDown className="w-3.5 h-3.5 fill-red-500 text-red-500" />
										<span className="font-medium text-gray-600">
											{selectedPost.dislikes}
										</span>
									</span>
								)}
							</div>
						)}
						<div className="flex items-center justify-between gap-4 border-t border-b border-gray-100 py-3 mb-10">
							<ReactionButton
								post={selectedPost as Post}
								onReact={handleReact}
								disabled={reactMutation.isPending}
							/>
							<button
								className="cursor-pointer flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
								onClick={() =>
									document
										.getElementById("comment-box")
										?.scrollIntoView({ behavior: "smooth" })
								}
							>
								<MessageCircle className="w-4 h-4" />
								Bình luận
								{comments.length > 0 && (
									<span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-bold">
										{comments.length}
									</span>
								)}
							</button>
						</div>

						<div className="flex items-center justify-between mb-4">
							<h5 className="text-md font-bold text-gray-900">
								Tất cả bình luận
								<span className="ml-1.5 text-gray-400 font-normal">
									({comments.length})
								</span>
							</h5>
							<button className="text-md font-semibold text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors">
								Mới nhất <ChevronDown className="w-5 h-5" />
							</button>
						</div>

						{isCommentsLoading ? (
							<div className="animate-pulse space-y-6 border-t border-gray-100 pt-5 mb-10">
								{[1, 2, 3].map((i) => (
									<div key={i} className="flex gap-3">
										<div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
										<div className="flex-1 space-y-2">
											<div className="h-3.5 w-24 bg-gray-100 rounded-full" />
											<div className="h-3 w-full bg-gray-100 rounded" />
											<div className="h-3 w-3/4 bg-gray-100 rounded" />
										</div>
									</div>
								))}
							</div>
						) : comments.length === 0 ? (
							<div className="text-center py-14 text-gray-400 border-t border-gray-100 mb-10">
								<p className="text-3xl mb-2">💬</p>
								<p className="text-sm">
									Chưa có bình luận. Hãy là người đầu tiên!
								</p>
							</div>
						) : (
							<div className="divide-y divide-gray-100 border-t border-gray-100 mb-10">
								{comments.map((c) => (
									<div key={c.id} className="py-5">
										<CommentItem
											comment={c}
											replyingTo={replyingTo}
											setReplyingTo={setReplyingTo}
											onReply={(id) => setReplyingTo(id)}
											onLike={(id) => likeCommentMutation.mutate(id)}
											onSubmitReply={(content, id) =>
												replyCommentMutation.mutate({ id, content })
											}
											isInteractionDisabled={!userInfo}
											onRequireAuth={handleRequireAuthForComment}
										/>
									</div>
								))}
							</div>
						)}
					</div>

					<aside className="w-80 shrink-0 sticky top-8 self-start">
						<div className="px-4 py-3 border-b border-gray-100 bg-slate-50">
							<div className="flex items-center gap-2">
								<h3 className="text-xl font-bold text-gray-900">
									Tin tức nổi bật
								</h3>
							</div>
						</div>
						<div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
							<div className="divide-y divide-gray-100">
								{trendingPosts.map((post, index) => (
									<div
										key={index}
										onClick={() =>
											navigate({
												to: "/forum/post/$id",
												params: { id: String(post.id) },
											})
										}
										className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
									>
										<div className="flex gap-3">
											{post.attachments.find((a) => a.type === "IMAGE") ? (
												<img
													src={
														post.attachments.find((a) => a.type === "IMAGE")
															?.url
													}
													alt=""
													className="w-24 h-20 object-cover rounded-md shrink-0"
												/>
											) : (
												<div className="w-24 h-20 bg-gray-100 rounded-md shrink-0 flex items-center justify-center">
													<FileIcon className="w-6 h-6 text-gray-300" />
												</div>
											)}
											<div className="flex-1 min-w-0">
												<h4 className="text-md font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug mb-1">
													{post.title}
												</h4>
												<div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
													<ThumbsUp className="w-4 h-4" />
													<span>{post.likes}</span>
												</div>
											</div>
										</div>
									</div>
								))}
							</div>

							{trendingPosts.length === 0 && (
								<div className="p-8 text-center text-gray-400">
									<Eye className="w-8 h-8 mx-auto mb-2 text-gray-300" />
									<p className="text-sm">Chưa có bài viết nào</p>
								</div>
							)}
						</div>
					</aside>
				</div>

				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-bold">
					<ShareBar />
				</div>

				<Separator className="my-0" />

				<div id="comment-box" className="pt-12 pb-32 pl-50 pr-50">
					<div className="flex gap-3">
						{userInfo && <AuthorAvatar author={userInfo} size="lg" />}
						<div className="flex-1 space-y-3">
							<Textarea
								disabled={!userInfo}
								className="min-h-60 bg-white border border-gray-200 rounded-md focus:border-blue-300 focus:ring-2 focus:ring-blue-100 resize-none text-sm transition-all shadow-sm disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
								placeholder={
									userInfo
										? "Bạn nghĩ gì về bài viết này?"
										: "Đăng nhập để viết bình luận"
								}
								value={comment}
								onChange={(e) => setComment(e.target.value)}
							/>
							<div className="flex items-center justify-between gap-4">
								<div className="flex gap-0.5">
									{[
										{
											icon: <ImageIcon className="w-4 h-4" />,
											label: "Thêm ảnh",
										},
										{
											icon: <Paperclip className="w-4 h-4" />,
											label: "Đính kèm",
										},
										{ icon: <AtSign className="w-4 h-4" />, label: "Nhắc tên" },
									].map(({ icon, label }) => (
										<button
											key={label}
											type="button"
											aria-label={label}
											disabled={!userInfo}
											className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
										>
											{icon}
										</button>
									))}
								</div>
								<button
									type="button"
									className={`cursor-pointer px-5 py-3 rounded-md text-md font-bold transition-all ${
										userInfo && comment.trim()
											? "bg-primary text-white shadow-sm"
											: "bg-gray-100 text-gray-400 cursor-not-allowed"
									}`}
									onClick={handleSubmitComment}
									disabled={!userInfo || !comment.trim()}
								>
									Đăng bình luận
								</button>
							</div>
							{!userInfo && (
								<div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
									<span>Đăng nhập để gửi bình luận mới.</span>
									<button
										type="button"
										className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
										onClick={handleRequireAuthForComment}
									>
										Đăng nhập
									</button>
								</div>
							)}
						</div>
					</div>
				</div>

				<Separator className="my-0" />

				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-gray-500">
					&copy; {new Date().getFullYear()} BIT Learning. All rights reserved.
				</div>
			</div>
		</div>
	);
};

export default PostDetailContent;
