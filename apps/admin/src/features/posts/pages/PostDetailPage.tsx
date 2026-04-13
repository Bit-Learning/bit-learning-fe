/* biome-ignore-all lint/security/noDangerouslySetInnerHtml: backend stores authored rich HTML for forum posts. */
import type React from "react";
import { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
	ArrowLeft,
	Ban,
	CalendarClock,
	Eye,
	File,
	Flame,
	MessageSquare,
	Shield,
	Star,
	Tag,
	ThumbsDown,
	ThumbsUp,
} from "lucide-react";
import { Header } from "@/layout/header";
import { Main } from "@/layout/main";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { CommentItem } from "../components/CommentItem";
import {
	getAuthorInitials,
	getAuthorName,
	getPostExcerpt,
	getPostTags,
	getTotalAttachments,
} from "../post.utils";
import {
	useBanPost,
	useFeaturePost,
	useGetComments,
	useGetPostDetail,
} from "../queries/usePost";
import { AttachmentType } from "../types/post.type";

export const PostDetailPage: React.FC = () => {
	const { id } = useParams({ strict: false });
	const navigate = useNavigate();
	const postId = Number.parseInt(id || "0", 10);
	const commentSkeletonKeys = [
		"comment-skeleton-1",
		"comment-skeleton-2",
		"comment-skeleton-3",
	];

	const [confirmDialog, setConfirmDialog] = useState<{
		open: boolean;
		action: "ban" | "unban" | null;
	}>({ open: false, action: null });
	const [blockReason, setBlockReason] = useState("");
	const [blockReasonError, setBlockReasonError] = useState("");

	const { data: post, isLoading: postLoading } = useGetPostDetail(postId);
	const { data: comments, isLoading: commentsLoading } = useGetComments(postId);
	const { mutate: banPost, isPending: banPending } = useBanPost();
	const { mutate: featurePost, isPending: featurePending } = useFeaturePost();

	const tags = post ? getPostTags(post) : [];

	const handleOpenConfirm = (action: "ban" | "unban") => {
		if (action === "ban") {
			setBlockReason(post?.banReason || "");
		} else {
			setBlockReason("");
		}
		setBlockReasonError("");
		setConfirmDialog({ open: true, action });
	};

	const handleConfirm = () => {
		if (confirmDialog.action === "ban" && !blockReason.trim()) {
			setBlockReasonError("Vui lòng nhập lý do khóa bài viết");
			return;
		}

		if (confirmDialog.action === "ban" || confirmDialog.action === "unban") {
			banPost({
				id: postId,
				isBanned: post?.isBanned || false,
				reason: confirmDialog.action === "ban" ? blockReason.trim() : undefined,
			});
		}
		setBlockReason("");
		setBlockReasonError("");
		setConfirmDialog({ open: false, action: null });
	};

	const handleCancel = () => {
		setBlockReason("");
		setBlockReasonError("");
		setConfirmDialog({ open: false, action: null });
	};

	const handleFeatureToggle = () => {
		featurePost({ id: postId, isFeatured: post.isFeatured });
	};

	if (postLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<Skeleton className="mb-6 h-8 w-48" />
				<Skeleton className="h-96 w-full" />
			</div>
		);
	}

	if (!post) {
		return (
			<div className="container mx-auto px-4 py-8">
				<p className="text-destructive">Không tìm thấy bài viết</p>
			</div>
		);
	}

	return (
		<>
			<Header />

			<div className="flex flex-1 flex-col gap-2 sm:gap-6 p-6">
				<Button
					variant="link"
					className="mb-6"
					onClick={() => navigate({ to: "/posts" })}
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Quay lại danh sách
				</Button>

				<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
					<div className="space-y-6 lg:col-span-2">
						<Card>
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
											<span className="font-mono">#{post.id}</span>
											<span className="font-mono">{post.slug}</span>
											{post.category && (
												<Badge variant="outline">{post.category.name}</Badge>
											)}
											{post.isFeatured && (
												<Badge variant="secondary">Nổi bật</Badge>
											)}
											{post.isTrending && (
												<Badge variant="outline">Trending</Badge>
											)}
										</div>
										<CardTitle className="mb-2 text-3xl">
											{post.title}
										</CardTitle>
										<p className="mb-4 text-sm text-muted-foreground">
											{getPostExcerpt(post)}
										</p>
										<div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
											<div className="flex items-center gap-2">
												<Avatar className="h-7 w-7">
													<AvatarImage
														src={post.author.avatar}
														alt={getAuthorName(post.author)}
													/>
													<AvatarFallback>
														{getAuthorInitials(post.author)}
													</AvatarFallback>
												</Avatar>
												<span>{getAuthorName(post.author)}</span>
											</div>
											<span>•</span>
											<div className="flex items-center gap-1">
												<CalendarClock className="h-4 w-4" />
												<span>
													{new Date(post.createdAt).toLocaleString("vi-VN")}
												</span>
											</div>
											<span>•</span>
											<div className="flex items-center gap-1">
												<Eye className="h-4 w-4" />
												<span>
													{post.viewsCount.toLocaleString("vi-VN")} lượt xem
												</span>
											</div>
										</div>
									</div>
									<div className="flex gap-2">
										{post.isBanned && (
											<Badge variant="destructive">Bị khóa</Badge>
										)}
										{post.isEdited && (
											<Badge variant="secondary">Đã chỉnh sửa</Badge>
										)}
									</div>
								</div>
							</CardHeader>

							<CardContent className="space-y-4">
								<div className="rounded-xl border bg-background p-6">
									<div
										dangerouslySetInnerHTML={{
											__html: post.content || "<p>Không có nội dung</p>",
										}}
										className="lecture-content prose prose-sm max-w-none"
									/>
								</div>

								{post.attachments.length > 0 && (
									<>
										<Separator />
										<div>
											<h3 className="mb-3 text-lg font-semibold">
												Tệp đính kèm
											</h3>
											<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
												{post.attachments.map((attachment) => (
													<a
														key={attachment.id}
														href={attachment.url}
														target="_blank"
														rel="noreferrer"
														className="overflow-hidden rounded-lg border transition-shadow hover:shadow-md"
													>
														{attachment.type === AttachmentType.IMAGE ? (
															<img
																src={attachment.url}
																alt={`Attachment ${attachment.id}`}
																className="h-32 w-full object-cover"
															/>
														) : (
															<div className="flex h-32 w-full items-center justify-center bg-slate-100">
																<File className="h-12 w-12 text-slate-400" />
															</div>
														)}
													</a>
												))}
											</div>
										</div>
									</>
								)}

								{tags.length > 0 && (
									<>
										<Separator />
										<div>
											<h3 className="mb-3 text-lg font-semibold">Hashtags</h3>
											<div className="flex flex-wrap gap-2">
												{tags.map((tag) => (
													<Badge key={tag.id} variant="outline">
														<Tag className="mr-1 h-3 w-3" />
														{tag.name}
													</Badge>
												))}
											</div>
										</div>
									</>
								)}

								<Separator />

								<div className="flex flex-wrap items-center gap-4">
									<Button variant="outline" size="sm">
										<ThumbsUp className="mr-2 h-4 w-4" />
										{post.likes}
									</Button>
									<Button variant="outline" size="sm">
										<ThumbsDown className="mr-2 h-4 w-4" />
										{post.dislikes}
									</Button>
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<MessageSquare className="h-4 w-4" />
										<span>{post.commentsCount} bình luận</span>
									</div>
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Flame className="h-4 w-4" />
										<span>{post.totalReactions} tổng phản ứng</span>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Bình luận ({post.commentsCount})</CardTitle>
							</CardHeader>
							<CardContent>
								{commentsLoading ? (
									<div className="space-y-4">
										{commentSkeletonKeys.map((skeletonKey) => (
											<Skeleton key={skeletonKey} className="h-24 w-full" />
										))}
									</div>
								) : comments && comments.length > 0 ? (
									<div className="space-y-4">
										{comments.map((comment) => (
											<CommentItem
												key={comment.id}
												comment={comment}
												postId={postId}
											/>
										))}
									</div>
								) : (
									<p className="py-8 text-center text-muted-foreground">
										Chưa có bình luận nào
									</p>
								)}
							</CardContent>
						</Card>
					</div>

					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Thông tin</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Slug</span>
									<span className="font-mono font-semibold">{post.slug}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Danh mục</span>
									<span className="font-semibold">
										{post.category?.name || "Chưa phân loại"}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Lượt xem</span>
									<span className="font-semibold">
										{post.viewsCount.toLocaleString("vi-VN")}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Bình luận</span>
									<span className="font-semibold">{post.commentsCount}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Tổng phản ứng</span>
									<span className="font-semibold">{post.totalReactions}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Lượt thích</span>
									<span className="font-semibold">{post.likes}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">
										Lượt không thích
									</span>
									<span className="font-semibold">{post.dislikes}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Tệp đính kèm</span>
									<span className="font-semibold">
										{getTotalAttachments(post)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Hashtags</span>
									<span className="font-semibold">{tags.length}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">
										Cho phép chỉnh sửa
									</span>
									<span className="font-semibold">
										{post.isEditAllowed ? "Có" : "Không"}
									</span>
								</div>
								{post.isBanned && post.banReason ? (
									<div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-4">
										<span className="text-sm font-semibold text-red-700">
											Lý do khóa
										</span>
										<p className="text-sm leading-6 text-red-900">
											{post.banReason}
										</p>
									</div>
								) : null}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Hành động</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<Button
									className="w-full"
									variant={post.isFeatured ? "outline" : "default"}
									onClick={handleFeatureToggle}
									disabled={featurePending || banPending}
								>
									<Star
										className={`mr-2 h-4 w-4 ${post.isFeatured ? "fill-current" : ""}`}
									/>
									{post.isFeatured ? "Bỏ nổi bật" : "Đánh dấu nổi bật"}
								</Button>
								{!post.isBanned ? (
									<Button
										className="w-full"
										variant="destructive"
										onClick={() => handleOpenConfirm("ban")}
										disabled={banPending || featurePending}
									>
										<Ban className="mr-2 h-4 w-4" />
										Khóa bài viết
									</Button>
								) : (
									<Button
										className="w-full"
										onClick={() => handleOpenConfirm("unban")}
										disabled={banPending || featurePending}
									>
										<Shield className="mr-2 h-4 w-4" />
										Mở khóa bài viết
									</Button>
								)}
							</CardContent>
						</Card>
					</div>
				</div>

				<AlertDialog
					open={confirmDialog.open}
					onOpenChange={(open) => !open && handleCancel()}
				>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								{confirmDialog.action === "ban" && "Xác nhận khóa bài viết"}
								{confirmDialog.action === "unban" &&
									"Xác nhận mở khóa bài viết"}
							</AlertDialogTitle>
							<AlertDialogDescription>
								{confirmDialog.action === "ban" &&
									"Bạn có chắc chắn muốn khóa bài viết này? Bài viết sẽ không còn hiển thị công khai."}
								{confirmDialog.action === "unban" &&
									"Bạn có chắc chắn muốn mở khóa bài viết này? Bài viết sẽ hiển thị công khai trở lại."}
							</AlertDialogDescription>
						</AlertDialogHeader>
						{confirmDialog.action === "ban" ? (
							<div className="space-y-2">
								<Textarea
									value={blockReason}
									onChange={(event) => {
										setBlockReason(event.target.value);
										if (blockReasonError) {
											setBlockReasonError("");
										}
									}}
									placeholder="Nhập lý do khóa bài viết để gửi email cho tác giả"
									className="min-h-28"
								/>
								{blockReasonError ? (
									<p className="text-sm text-red-600">{blockReasonError}</p>
								) : null}
							</div>
						) : null}
						<AlertDialogFooter>
							<AlertDialogCancel onClick={handleCancel}>
								Hủy bỏ
							</AlertDialogCancel>
							<AlertDialogAction onClick={handleConfirm}>
								Xác nhận
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</>
	);
};
