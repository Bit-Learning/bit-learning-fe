import type React from "react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
	AlertTriangle,
	ArrowLeft,
	CheckCheck,
	ExternalLink,
	FileWarning,
	LockOpen,
	ShieldAlert,
} from "lucide-react";
import { Header } from "@/layout/header";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	formatAppealDate,
	getAppealStatusLabel,
	getAppealUserName,
} from "../post-appeal.utils";
import {
	useClosePostAppeal,
	useGetPostAppealDetail,
	useUnbanAppealPost,
} from "../queries/usePostAppeal";
import { PostAppealCommentThread } from "../components/PostAppealCommentThread";

type ConfirmAction = "unban" | "close" | null;

export const PostAppealDetailPage: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams({ strict: false });
	const appealId = Number.parseInt(id || "0", 10);
	const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

	const { data: appeal, isLoading, isError } = useGetPostAppealDetail(appealId);
	const closeAppealMutation = useClosePostAppeal();
	const unbanPostMutation = useUnbanAppealPost();

	const isMutating =
		closeAppealMutation.isPending || unbanPostMutation.isPending;
	const post = appeal?.post ?? null;
	const canCloseAppeal = appeal?.status === "OPEN";
	const canUnbanPost = !!post?.isBanned;

	const confirmConfig = useMemo(() => {
		if (confirmAction === "unban") {
			return {
				title: "Mở khóa bài viết?",
				description:
					"Bài viết sẽ được đưa trở lại trạng thái hiển thị công khai. Khiếu nại vẫn giữ nguyên cho tới khi bạn đóng nó.",
				actionLabel: "Mở khóa bài viết",
			};
		}

		if (confirmAction === "close") {
			return {
				title: "Đóng khiếu nại này?",
				description:
					"Ticket sẽ được chuyển sang trạng thái đã đóng. Bạn chỉ nên làm điều này sau khi đã xử lý xong yêu cầu của người dùng.",
				actionLabel: "Đóng khiếu nại",
			};
		}

		return null;
	}, [confirmAction]);

	const handleConfirm = () => {
		if (!appeal) return;

		if (confirmAction === "unban" && post) {
			unbanPostMutation.mutate({
				postId: post.id,
				ticketId: appeal.id,
			});
		}

		if (confirmAction === "close") {
			closeAppealMutation.mutate({ id: appeal.id });
		}

		setConfirmAction(null);
	};

	if (isLoading) {
		return (
			<>
				<Header />
				<div className="flex flex-1 flex-col gap-6 p-6">
					<Skeleton className="h-10 w-48" />
					<div className="grid gap-6 lg:grid-cols-3">
						<Skeleton className="h-[32rem] w-full lg:col-span-2" />
						<Skeleton className="h-[32rem] w-full" />
					</div>
				</div>
			</>
		);
	}

	if (isError || !appeal) {
		return (
			<>
				<Header />
				<div className="flex flex-1 flex-col gap-6 p-6">
					<Button
						type="button"
						variant="link"
						className="w-fit px-0"
						onClick={() => navigate({ to: "/post-appeals" })}
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Quay lại danh sách khiếu nại
					</Button>

					<Card className="border-destructive/30">
						<CardContent className="flex min-h-60 flex-col items-center justify-center gap-3 py-10 text-center">
							<FileWarning className="h-10 w-10 text-destructive" />
							<div className="space-y-1">
								<p className="font-semibold">
									Không thể tải chi tiết khiếu nại
								</p>
								<p className="text-sm text-muted-foreground">
									Ticket có thể không tồn tại, hoặc tài khoản hiện tại không có
									quyền xem nội dung này.
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</>
		);
	}

	return (
		<>
			<Header />
			<div className="flex flex-1 flex-col gap-6 p-6">
				<Button
					type="button"
					variant="link"
					className="w-fit px-0"
					onClick={() => navigate({ to: "/post-appeals" })}
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Quay lại danh sách khiếu nại
				</Button>

				<div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
					<div className="space-y-2">
						<div className="flex flex-wrap items-center gap-2">
							<Badge
								variant={appeal.status === "OPEN" ? "destructive" : "secondary"}
							>
								{getAppealStatusLabel(appeal.status)}
							</Badge>
							<Badge variant="outline">{appeal.code}</Badge>
							{post ? (
								<Badge variant={post.isBanned ? "destructive" : "secondary"}>
									{post.isBanned
										? "Bài viết vẫn đang bị khóa"
										: "Bài viết đã được mở khóa"}
								</Badge>
							) : null}
						</div>
						<div>
							<h1 className="text-2xl font-bold">
								{post?.title || appeal.title}
							</h1>
							<p className="text-sm text-muted-foreground">
								Khiếu nại được gửi bởi{" "}
								<span className="font-medium text-foreground">
									{getAppealUserName(appeal.createdBy)}
								</span>{" "}
								vào lúc {formatAppealDate(appeal.createdAt)}
							</p>
						</div>
					</div>
				</div>

				<div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)]">
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Nội dung khiếu nại</CardTitle>
								<CardDescription>
									Thông điệp người dùng đã gửi để yêu cầu xem xét mở khóa lại
									bài viết.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="rounded-2xl border bg-muted/30 p-5">
									<p className="whitespace-pre-wrap text-sm leading-7 text-foreground">
										{appeal.appealMessage}
									</p>
								</div>
							</CardContent>
						</Card>

						<Card className="border-red-100">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-red-700">
									<ShieldAlert className="h-5 w-5" />
									Lý do khóa ban đầu
								</CardTitle>
								<CardDescription>
									Thông tin được lưu tại thời điểm bài viết bị khóa.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="rounded-2xl border border-red-100 bg-red-50/80 p-5">
									<p className="whitespace-pre-wrap text-sm leading-7 text-red-950">
										{appeal.originalBanReason?.trim() ||
											"Không tìm thấy lý do khóa cũ trong ticket này."}
									</p>
								</div>
							</CardContent>
						</Card>

						<PostAppealCommentThread
							ticketId={appeal.id}
							comments={appeal.comments ?? []}
							isClosed={appeal.status === "CLOSED"}
						/>

						<Card>
							<CardHeader>
								<CardTitle>Bài viết liên quan</CardTitle>
								<CardDescription>
									Xem trạng thái hiện tại của bài viết và mở trang quản trị bài
									viết nếu cần kiểm tra sâu hơn.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="rounded-2xl border bg-background p-5">
									<div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
										<div className="space-y-2">
											<p className="text-sm text-muted-foreground">
												#{post?.id ?? "--"} {post?.slug ?? ""}
											</p>
											<h3 className="text-lg font-semibold">
												{post?.title ?? "Bài viết không còn khả dụng"}
											</h3>
											<div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
												<span>
													Tác giả bài viết:{" "}
													<span className="font-medium text-foreground">
														{getAppealUserName(post?.author)}
													</span>
												</span>
												{post?.categoryName ? (
													<Badge variant="outline">{post.categoryName}</Badge>
												) : null}
											</div>
										</div>

										{post ? (
											<Button
												type="button"
												variant="outline"
												onClick={() =>
													navigate({
														to: "/posts/$id",
														params: { id: post.id.toString() },
													})
												}
											>
												Mở trang bài viết
												<ExternalLink className="ml-2 h-4 w-4" />
											</Button>
										) : null}
									</div>

									{post ? (
										<div className="mt-4 grid gap-4 md:grid-cols-2">
											<div className="rounded-xl border bg-muted/20 p-4">
												<p className="mb-1 text-sm font-medium">
													Trạng thái hiện tại
												</p>
												<p className="text-sm text-muted-foreground">
													{post.isBanned
														? "Bài viết hiện vẫn đang bị khóa"
														: "Bài viết đã được mở khóa"}
												</p>
											</div>
											<div className="rounded-xl border bg-muted/20 p-4">
												<p className="mb-1 text-sm font-medium">
													Lý do khóa hiện tại
												</p>
												<p className="text-sm text-muted-foreground">
													{post.currentBanReason?.trim() ||
														"Bài viết hiện không còn lý do khóa hoạt động."}
												</p>
											</div>
										</div>
									) : null}
								</div>
							</CardContent>
						</Card>
					</div>

					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Thông tin ticket</CardTitle>
								<CardDescription>
									Thông tin người gửi, người phụ trách và mốc thời gian xử lý.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4 text-sm">
								<div className="rounded-xl border bg-muted/20 p-4">
									<p className="text-muted-foreground">Người khiếu nại</p>
									<p className="mt-1 font-medium">
										{getAppealUserName(appeal.createdBy)}
									</p>
									{appeal.createdBy?.email ? (
										<p className="mt-1 text-muted-foreground">
											{appeal.createdBy.email}
										</p>
									) : null}
								</div>

								<div className="rounded-xl border bg-muted/20 p-4">
									<p className="text-muted-foreground">Admin phụ trách</p>
									<p className="mt-1 font-medium">
										{getAppealUserName(appeal.resolvedBy)}
									</p>
									{appeal.resolvedBy?.email ? (
										<p className="mt-1 text-muted-foreground">
											{appeal.resolvedBy.email}
										</p>
									) : null}
								</div>

								<div className="rounded-xl border bg-muted/20 p-4">
									<p className="text-muted-foreground">Tạo lúc</p>
									<p className="mt-1 font-medium">
										{formatAppealDate(appeal.createdAt)}
									</p>
								</div>

								<div className="rounded-xl border bg-muted/20 p-4">
									<p className="text-muted-foreground">Cập nhật gần nhất</p>
									<p className="mt-1 font-medium">
										{formatAppealDate(appeal.updatedAt)}
									</p>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Hành động</CardTitle>
								<CardDescription>
									Mở lại bài viết hoặc đóng khiếu nại sau khi đã xử lý xong.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<Button
									type="button"
									size="lg"
									className="w-full"
									onClick={() => setConfirmAction("unban")}
									disabled={!canUnbanPost || isMutating}
								>
									<LockOpen className="mr-2 h-4 w-4" />
									{canUnbanPost
										? "Mở khóa bài viết"
										: "Bài viết đã được mở khóa"}
								</Button>
								<Button
									type="button"
									size="lg"
									variant={canCloseAppeal ? "secondary" : "outline"}
									className="w-full"
									onClick={() => setConfirmAction("close")}
									disabled={!canCloseAppeal || isMutating}
								>
									<CheckCheck className="mr-2 h-4 w-4" />
									{canCloseAppeal ? "Đóng khiếu nại" : "Khiếu nại đã được đóng"}
								</Button>

								<div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-950">
									<div className="mb-2 flex items-center gap-2 font-semibold">
										<AlertTriangle className="h-4 w-4" />
										Lưu ý xử lý
									</div>
									<p className="leading-6">
										Nếu bạn mở khóa bài viết, hãy kiểm tra lại nội dung trước
										khi đóng ticket để bảo đảm người dùng đã được phản hồi đúng.
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>

			<AlertDialog
				open={confirmAction !== null}
				onOpenChange={(open) => {
					if (!open) {
						setConfirmAction(null);
					}
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{confirmConfig?.title}</AlertDialogTitle>
						<AlertDialogDescription>
							{confirmConfig?.description}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isMutating}>Hủy</AlertDialogCancel>
						<AlertDialogAction onClick={handleConfirm} disabled={isMutating}>
							{confirmConfig?.actionLabel}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};
