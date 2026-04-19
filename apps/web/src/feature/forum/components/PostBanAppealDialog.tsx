import React, { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Textarea } from "@workspace/ui/components/Textarea";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogTitle,
} from "@workspace/ui/components/update/dialog";
import { useAppealBannedForumPost } from "../queries/useForum";
import type { Post } from "../types/forum.type";

interface PostBanAppealDialogProps {
	post: Post | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const PostBanAppealDialog: React.FC<PostBanAppealDialogProps> = ({
	post,
	open,
	onOpenChange,
}) => {
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const appealMutation = useAppealBannedForumPost();

	useEffect(() => {
		if (!open) {
			setMessage("");
			setError("");
		}
	}, [open, post?.id]);

	if (!post) return null;

	const blockReason =
		post.banReason?.trim() || "Quản trị viên chưa để lại lý do chi tiết.";

	const handleSubmit = () => {
		const trimmedMessage = message.trim();
		if (!trimmedMessage) {
			setError("Vui lòng nhập nội dung khiếu nại.");
			return;
		}

		appealMutation.mutate(
			{
				id: post.id,
				data: {
					message: trimmedMessage,
				},
			},
			{
				onSuccess: () => {
					onOpenChange(false);
				},
			},
		);
	};

	return (
		<Dialog modal open={open} onOpenChange={onOpenChange}>
			<DialogOverlay />
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle>Gửi khiếu nại bài viết bị khóa</DialogTitle>
					<DialogDescription>
						Mô tả rõ vì sao bài viết nên được xem xét mở khóa lại. Khiếu nại sẽ
						được chuyển tới quản trị viên phụ trách.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="rounded-2xl border border-red-100 bg-red-50/80 p-4">
						<div className="flex items-start gap-3">
							<div className="rounded-full bg-red-100 p-2 text-red-600">
								<ShieldAlert className="h-4 w-4" />
							</div>
							<div className="space-y-2">
								<p className="text-sm font-semibold text-red-900">
									{post.title}
								</p>
								<div className="rounded-xl bg-white/70 px-3 py-2 text-sm text-red-800">
									<span className="font-semibold">Lý do khóa:</span>{" "}
									{blockReason}
								</div>
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="post-ban-appeal-message"
							className="block text-sm font-semibold text-slate-800"
						>
							Nội dung khiếu nại
						</label>
						<Textarea
							id="post-ban-appeal-message"
							value={message}
							onChange={(event) => {
								setMessage(event.target.value);
								if (error) {
									setError("");
								}
							}}
							className="min-h-36"
							placeholder="Giải thích ngắn gọn bối cảnh, nội dung bạn muốn chỉnh sửa hoặc lý do bạn cho rằng quyết định khóa cần được xem xét lại."
						/>
						{error ? (
							<p className="text-sm text-red-600">{error}</p>
						) : (
							<p className="text-sm text-slate-500">
								Nêu cụ thể để quản trị viên có đủ ngữ cảnh xử lý nhanh hơn.
							</p>
						)}
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						isDisabled={appealMutation.isPending}
					>
						Để sau
					</Button>
					<Button onClick={handleSubmit} isDisabled={appealMutation.isPending}>
						{appealMutation.isPending ? "Đang gửi..." : "Gửi khiếu nại"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
