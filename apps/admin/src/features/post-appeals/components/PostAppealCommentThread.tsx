import React, { useState } from "react";
import { MessageSquare, Reply, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatAppealDate, getAppealUserName } from "../post-appeal.utils";
import {
	useCommentOnPostAppeal,
	useReplyPostAppealComment,
} from "../queries/usePostAppeal";
import type { TicketCommentDetail } from "../types/post-appeal.type";

interface PostAppealCommentThreadProps {
	ticketId: number;
	comments: TicketCommentDetail[];
	isClosed: boolean;
}

function getInitials(name: string) {
	return name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");
}

const ReplyComposer: React.FC<{
	onSubmit: (value: string) => void;
	onCancel?: () => void;
	isPending: boolean;
	placeholder: string;
	submitLabel: string;
}> = ({ onSubmit, onCancel, isPending, placeholder, submitLabel }) => {
	const [value, setValue] = useState("");

	return (
		<div className="space-y-3">
			<Textarea
				value={value}
				onChange={(event) => setValue(event.target.value)}
				placeholder={placeholder}
				className="min-h-24"
				disabled={isPending}
			/>
			<div className="flex items-center justify-end gap-2">
				{onCancel ? (
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}
						disabled={isPending}
					>
						Hủy
					</Button>
				) : null}
				<Button
					type="button"
					onClick={() => {
						const trimmedValue = value.trim();
						if (!trimmedValue) return;
						onSubmit(trimmedValue);
						setValue("");
					}}
					disabled={isPending || !value.trim()}
				>
					<Send className="mr-2 h-4 w-4" />
					{submitLabel}
				</Button>
			</div>
		</div>
	);
};

const CommentNode: React.FC<{
	ticketId: number;
	comment: TicketCommentDetail;
	isClosed: boolean;
	replyMutationPending: boolean;
	onReply: (ticketCommentId: number, content: string) => void;
}> = ({ ticketId, comment, isClosed, replyMutationPending, onReply }) => {
	const [isReplying, setIsReplying] = useState(false);
	const authorName = getAppealUserName(comment.author);

	return (
		<div className="space-y-4 rounded-2xl border bg-background p-4">
			<div className="flex items-start gap-3">
				<Avatar className="h-10 w-10">
					<AvatarImage
						src={comment.author?.avatar ?? undefined}
						alt={authorName}
					/>
					<AvatarFallback>{getInitials(authorName)}</AvatarFallback>
				</Avatar>
				<div className="min-w-0 flex-1 space-y-2">
					<div className="flex flex-wrap items-center gap-2">
						<span className="font-semibold">{authorName}</span>
						<Badge variant="outline" className="text-xs">
							{formatAppealDate(comment.createdAt)}
						</Badge>
					</div>
					<p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
						{comment.content}
					</p>
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => setIsReplying((currentValue) => !currentValue)}
							disabled={isClosed}
						>
							<Reply className="mr-2 h-4 w-4" />
							Trả lời
						</Button>
						<span className="text-xs text-muted-foreground">
							Ticket #{ticketId}
						</span>
					</div>
				</div>
			</div>

			{isReplying ? (
				<div className="ml-13 rounded-2xl border border-dashed p-4">
					<ReplyComposer
						onSubmit={(content) => {
							onReply(comment.id, content);
							setIsReplying(false);
						}}
						onCancel={() => setIsReplying(false)}
						isPending={replyMutationPending}
						placeholder="Nhập câu trả lời cho người khiếu nại..."
						submitLabel="Gửi trả lời"
					/>
				</div>
			) : null}

			{comment.replies.length > 0 ? (
				<div className="ml-6 space-y-3 border-l pl-4">
					{comment.replies.map((reply) => {
						const replyAuthorName = getAppealUserName(reply.author);

						return (
							<div
								key={reply.id}
								className="flex items-start gap-3 rounded-xl bg-muted/30 p-3"
							>
								<Avatar className="h-8 w-8">
									<AvatarImage
										src={reply.author?.avatar ?? undefined}
										alt={replyAuthorName}
									/>
									<AvatarFallback>
										{getInitials(replyAuthorName)}
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0 flex-1 space-y-1">
									<div className="flex flex-wrap items-center gap-2">
										<span className="text-sm font-semibold">
											{replyAuthorName}
										</span>
										<span className="text-xs text-muted-foreground">
											{formatAppealDate(reply.createdAt)}
										</span>
									</div>
									<p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
										{reply.content}
									</p>
								</div>
							</div>
						);
					})}
				</div>
			) : null}
		</div>
	);
};

export const PostAppealCommentThread: React.FC<
	PostAppealCommentThreadProps
> = ({ ticketId, comments, isClosed }) => {
	const commentMutation = useCommentOnPostAppeal();
	const replyMutation = useReplyPostAppealComment();

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<MessageSquare className="h-5 w-5" />
					Trao đổi xử lý
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{isClosed ? (
					<div className="rounded-xl border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
						Khiếu nại đã đóng nên không thể gửi thêm phản hồi mới.
					</div>
				) : (
					<div className="rounded-2xl border bg-muted/20 p-4">
						<ReplyComposer
							onSubmit={(content) =>
								commentMutation.mutate({
									id: ticketId,
									content,
								})
							}
							isPending={commentMutation.isPending}
							placeholder="Nhập phản hồi cho người khiếu nại..."
							submitLabel="Gửi phản hồi"
						/>
					</div>
				)}

				{comments.length > 0 ? (
					<div className="space-y-4">
						{comments.map((comment) => (
							<CommentNode
								key={comment.id}
								ticketId={ticketId}
								comment={comment}
								isClosed={isClosed}
								replyMutationPending={replyMutation.isPending}
								onReply={(ticketCommentId, content) =>
									replyMutation.mutate({
										ticketId,
										ticketCommentId,
										content,
									})
								}
							/>
						))}
					</div>
				) : (
					<div className="rounded-xl border border-dashed bg-background p-8 text-center text-sm text-muted-foreground">
						Chưa có phản hồi nào trong ticket này.
					</div>
				)}
			</CardContent>
		</Card>
	);
};
