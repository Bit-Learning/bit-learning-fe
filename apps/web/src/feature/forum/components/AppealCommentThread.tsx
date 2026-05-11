import React, { useState } from "react";
import { MessageSquare, Reply, Send } from "lucide-react";
import { Textarea } from "@workspace/ui/components/Textarea";
import {
	useCommentOnMyPostAppeal,
	useReplyOnMyPostAppealComment,
} from "../queries/useForum";
import type { AppealUser, TicketCommentDetail } from "../types/forum.type";
import { formatAppealDate, getAppealUserName } from "../utils/appeal.utils";

interface AppealCommentThreadProps {
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

const AppealAvatar: React.FC<{ user?: AppealUser | null }> = ({ user }) => {
	const authorName = getAppealUserName(user);

	if (user?.avatar) {
		return (
			<div className="h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
				<img
					src={user.avatar}
					alt={authorName}
					className="h-full w-full object-cover"
				/>
			</div>
		);
	}

	return (
		<div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-200 bg-blue-100 text-sm font-bold text-blue-700">
			{getInitials(authorName) || "?"}
		</div>
	);
};

const ReplyComposer: React.FC<{
	isPending: boolean;
	onCancel?: () => void;
	onSubmit: (content: string) => void;
	placeholder: string;
	submitLabel: string;
}> = ({ isPending, onCancel, onSubmit, placeholder, submitLabel }) => {
	const [value, setValue] = useState("");

	return (
		<div className="space-y-3">
			<Textarea
				value={value}
				onChange={(event) => setValue(event.target.value)}
				placeholder={placeholder}
				disabled={isPending}
				className="min-h-28 rounded-2xl border border-slate-200 bg-white"
			/>
			<div className="flex items-center justify-end gap-2">
				{onCancel ? (
					<button
						type="button"
						onClick={onCancel}
						disabled={isPending}
						className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
					>
						Hủy
					</button>
				) : null}
				<button
					type="button"
					onClick={() => {
						const trimmedValue = value.trim();
						if (!trimmedValue) return;
						onSubmit(trimmedValue);
						setValue("");
					}}
					disabled={isPending || !value.trim()}
					className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
				>
					<Send className="h-4 w-4" />
					{submitLabel}
				</button>
			</div>
		</div>
	);
};

const CommentNode: React.FC<{
	comment: TicketCommentDetail;
	isClosed: boolean;
	isReplyPending: boolean;
	onReply: (ticketCommentId: number, content: string) => void;
}> = ({ comment, isClosed, isReplyPending, onReply }) => {
	const [isReplying, setIsReplying] = useState(false);
	const authorName = getAppealUserName(comment.author);

	return (
		<div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
			<div className="flex items-start gap-3">
				<AppealAvatar user={comment.author} />
				<div className="min-w-0 flex-1 space-y-2">
					<div className="flex flex-wrap items-center gap-2">
						<p className="text-sm font-semibold text-slate-900">{authorName}</p>
						<span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
							{formatAppealDate(comment.createdAt)}
						</span>
					</div>
					<p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
						{comment.content}
					</p>
					<button
						type="button"
						onClick={() => setIsReplying((currentValue) => !currentValue)}
						disabled={isClosed}
						className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
					>
						<Reply className="h-4 w-4" />
						Trả lời
					</button>
				</div>
			</div>

			{isReplying ? (
				<div className="ml-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4">
					<ReplyComposer
						onSubmit={(content) => {
							onReply(comment.id, content);
							setIsReplying(false);
						}}
						onCancel={() => setIsReplying(false)}
						isPending={isReplyPending}
						placeholder="Nhập phản hồi của bạn cho quản trị viên..."
						submitLabel="Gửi trả lời"
					/>
				</div>
			) : null}

			{comment.replies.length > 0 ? (
				<div className="ml-4 space-y-3 border-l border-slate-200 pl-4">
					{comment.replies.map((reply) => {
						const replyAuthorName = getAppealUserName(reply.author);
						return (
							<div
								key={reply.id}
								className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4"
							>
								<AppealAvatar user={reply.author} />
								<div className="min-w-0 flex-1 space-y-1">
									<div className="flex flex-wrap items-center gap-2">
										<p className="text-sm font-semibold text-slate-900">
											{replyAuthorName}
										</p>
										<span className="text-xs text-slate-500">
											{formatAppealDate(reply.createdAt)}
										</span>
									</div>
									<p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
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

export const AppealCommentThread: React.FC<AppealCommentThreadProps> = ({
	ticketId,
	comments,
	isClosed,
}) => {
	const commentMutation = useCommentOnMyPostAppeal();
	const replyMutation = useReplyOnMyPostAppealComment();

	return (
		<section className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
			<div className="flex items-center gap-3">
				<div className="rounded-2xl bg-blue-50 p-3 text-primary">
					<MessageSquare className="h-5 w-5" />
				</div>
				<div>
					<h2 className="text-lg font-semibold text-slate-900">
						Trao đổi với quản trị viên
					</h2>
					<p className="text-sm text-slate-500">
						Lịch sử phản hồi trong ticket khiếu nại này.
					</p>
				</div>
			</div>

			{isClosed ? (
				<div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-500">
					Khiếu nại đã đóng nên bạn không thể gửi thêm phản hồi mới.
				</div>
			) : (
				<div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
					<ReplyComposer
						onSubmit={(content) =>
							commentMutation.mutate({
								id: ticketId,
								content,
							})
						}
						isPending={commentMutation.isPending}
						placeholder="Nhập phản hồi hoặc bổ sung thông tin cho quản trị viên..."
						submitLabel="Gửi phản hồi"
					/>
				</div>
			)}

			{comments.length > 0 ? (
				<div className="space-y-4">
					{comments.map((comment) => (
						<CommentNode
							key={comment.id}
							comment={comment}
							isClosed={isClosed}
							isReplyPending={replyMutation.isPending}
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
				<div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
					Chưa có phản hồi nào trong ticket này.
				</div>
			)}
		</section>
	);
};
