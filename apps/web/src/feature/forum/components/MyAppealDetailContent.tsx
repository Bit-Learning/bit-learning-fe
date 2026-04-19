import React from "react";
import {
	CheckCircle2,
	Clock3,
	ExternalLink,
	Flame,
	Lock,
	MessageSquare,
	PenSquare,
	ShieldAlert,
} from "lucide-react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useSelector } from "react-redux";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { AppealCommentThread } from "./AppealCommentThread";
import { useMyPostAppealDetail } from "../queries/useForum";
import {
	formatAppealDate,
	getAppealStatusLabel,
	getAppealUserName,
} from "../utils/appeal.utils";

const MyAppealDetailContent: React.FC = () => {
	const { id } = useParams({ from: "/_layout/forum/appeals/$id" });
	const ticketId = Number(id);
	const navigate = useNavigate();
	const { userInfo } = useSelector(selectAuthStateInfo);

	const {
		data: appeal,
		isLoading,
		isError,
	} = useMyPostAppealDetail(ticketId, !!userInfo);

	if (!userInfo) {
		return (
			<div className="min-h-screen bg-gray-50 px-4 py-20">
				<div className="mx-auto max-w-xl rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
					<h1 className="text-2xl font-bold text-slate-900">
						Đăng nhập để xem chi tiết khiếu nại
					</h1>
					<p className="mt-3 text-sm leading-6 text-slate-500">
						Chỉ chủ sở hữu ticket mới có thể theo dõi luồng trao đổi này.
					</p>
					<button
						type="button"
						onClick={() => navigate({ to: "/signin" })}
						className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
					>
						Đi tới đăng nhập
					</button>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50">
				<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
					<div className="animate-pulse space-y-4">
						<div className="h-6 w-52 rounded-full bg-slate-100" />
						<div className="h-48 rounded-[28px] bg-slate-100" />
						<div className="h-80 rounded-[28px] bg-slate-100" />
					</div>
				</div>
			</div>
		);
	}

	if (isError || !appeal) {
		return (
			<div className="min-h-screen bg-gray-50 px-4 py-20">
				<div className="mx-auto max-w-xl rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
					<h1 className="text-2xl font-bold text-slate-900">
						Không thể mở ticket này
					</h1>
					<p className="mt-3 text-sm leading-6 text-slate-500">
						Ticket có thể không tồn tại, hoặc bạn không có quyền truy cập.
					</p>
					<button
						type="button"
						onClick={() => navigate({ to: "/forum/appeals" })}
						className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
					>
						Quay lại danh sách khiếu nại
					</button>
				</div>
			</div>
		);
	}

	const isClosed = appeal.status === "CLOSED";
	const isPostUnlocked = !!appeal.post && !appeal.post.isBanned;

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="border-b border-gray-200 bg-white shadow-sm">
				<div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
					<nav className="flex items-center text-md text-gray-500">
						<span
							onClick={() => navigate({ to: "/" })}
							className="cursor-pointer hover:text-gray-700"
						>
							Trang chủ
						</span>
						<span className="mx-2 text-gray-400">/</span>
						<span
							onClick={() => navigate({ to: "/forum" })}
							className="cursor-pointer hover:text-gray-700"
						>
							Diễn đàn
						</span>
						<span className="mx-2 text-gray-400">/</span>
						<span
							onClick={() => navigate({ to: "/forum/appeals" })}
							className="cursor-pointer hover:text-gray-700"
						>
							Khiếu nại của tôi
						</span>
						<span className="mx-2 text-gray-400">/</span>
						<span className="font-medium text-gray-700">{appeal.code}</span>
					</nav>
				</div>
			</div>

			<div className="mx-auto flex max-w-7xl items-start gap-5 px-4 py-8 sm:px-6 lg:px-8">
				<aside className="sticky top-8 w-56 shrink-0 space-y-3 self-start">
					<div className="overflow-hidden rounded-md border border-gray-200 bg-white">
						<div className="space-y-0.5 px-2 py-2">
							<button
								className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left text-md font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
								onClick={() => navigate({ to: "/forum" })}
							>
								<Flame className="h-4 w-4" />
								Bảng tin
							</button>
							<button
								className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left text-md font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
								onClick={() => navigate({ to: "/forum/my" })}
							>
								<PenSquare className="h-4 w-4" />
								Bài viết của tôi
							</button>
							<button
								className="flex w-full cursor-pointer items-center gap-2.5 rounded-md bg-blue-50 px-3 py-2 text-left text-md font-semibold text-primary"
								onClick={() => navigate({ to: "/forum/appeals" })}
							>
								<MessageSquare className="h-4 w-4" />
								Khiếu nại của tôi
							</button>
						</div>
					</div>
				</aside>

				<div className="min-w-0 flex-1 space-y-4">
					<section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
						<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
							<div className="space-y-3">
								<div className="flex flex-wrap items-center gap-2">
									<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
										{appeal.code}
									</span>
									<span
										className={`rounded-full px-3 py-1 text-xs font-semibold ${
											isClosed
												? "bg-slate-100 text-slate-600"
												: "bg-amber-100 text-amber-700"
										}`}
									>
										{getAppealStatusLabel(appeal.status)}
									</span>
									<span
										className={`rounded-full px-3 py-1 text-xs font-semibold ${
											isPostUnlocked
												? "bg-green-100 text-green-700"
												: "bg-red-100 text-red-600"
										}`}
									>
										{isPostUnlocked
											? "Bài viết đã được mở lại"
											: "Bài viết vẫn đang bị khóa"}
									</span>
								</div>

								<div>
									<h1 className="text-2xl font-bold text-slate-900">
										{appeal.post?.title || appeal.title}
									</h1>
									<p className="mt-2 text-sm leading-6 text-slate-500">
										Tạo lúc {formatAppealDate(appeal.createdAt)}.
										{appeal.resolvedBy
											? ` Admin phụ trách hiện tại: ${getAppealUserName(appeal.resolvedBy)}.`
											: ""}
									</p>
								</div>
							</div>

							<div className="flex flex-wrap items-center gap-2">
								<button
									type="button"
									onClick={() => navigate({ to: "/forum/appeals" })}
									className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
								>
									Quay lại danh sách
								</button>
								{appeal.post?.id && isPostUnlocked ? (
									<button
										type="button"
										onClick={() =>
											navigate({
												to: "/forum/post/$id",
												params: { id: String(appeal.post?.id) },
											})
										}
										className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
									>
										<ExternalLink className="h-4 w-4" />
										Xem bài viết
									</button>
								) : null}
							</div>
						</div>
					</section>

					<div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
						<div className="space-y-4">
							<section className="rounded-[28px] border border-red-100 bg-red-50/70 p-6 shadow-sm">
								<div className="flex items-center gap-3">
									<div className="rounded-2xl bg-red-100 p-3 text-red-600">
										<ShieldAlert className="h-5 w-5" />
									</div>
									<div>
										<h2 className="text-lg font-semibold text-red-900">
											Lý do khóa ban đầu
										</h2>
										<p className="text-sm text-red-700">
											Thông tin được lưu lại cùng ticket khi bạn gửi khiếu nại.
										</p>
									</div>
								</div>
								<p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-red-950">
									{appeal.originalBanReason?.trim() ||
										"Quản trị viên chưa cung cấp lý do chi tiết."}
								</p>
							</section>

							<section className="rounded-[28px] border border-blue-100 bg-blue-50/70 p-6 shadow-sm">
								<div className="flex items-center gap-3">
									<div className="rounded-2xl bg-blue-100 p-3 text-primary">
										<MessageSquare className="h-5 w-5" />
									</div>
									<div>
										<h2 className="text-lg font-semibold text-slate-900">
											Khiếu nại bạn đã gửi
										</h2>
										<p className="text-sm text-slate-500">
											Nội dung quản trị viên đang dựa vào để xem xét ticket này.
										</p>
									</div>
								</div>
								<p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
									{appeal.appealMessage}
								</p>
							</section>
						</div>

						<section className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
							<h2 className="text-lg font-semibold text-slate-900">
								Thông tin liên quan
							</h2>

							<div className="rounded-3xl bg-slate-50 p-4">
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
									Trạng thái ticket
								</p>
								<div className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
									{isClosed ? (
										<CheckCircle2 className="h-4 w-4 text-slate-500" />
									) : (
										<Clock3 className="h-4 w-4 text-amber-500" />
									)}
									{getAppealStatusLabel(appeal.status)}
								</div>
							</div>

							<div className="rounded-3xl bg-slate-50 p-4">
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
									Trạng thái bài viết
								</p>
								<div className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
									<Lock
										className={`h-4 w-4 ${
											isPostUnlocked ? "text-green-600" : "text-red-500"
										}`}
									/>
									{isPostUnlocked
										? "Đã được mở lại"
										: "Vẫn đang bị khóa công khai"}
								</div>
								{appeal.post?.categoryName ? (
									<p className="mt-2 text-sm text-slate-500">
										Danh mục: {appeal.post.categoryName}
									</p>
								) : null}
							</div>

							<div className="rounded-3xl bg-slate-50 p-4">
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
									Bài viết liên quan
								</p>
								<p className="mt-3 text-sm font-semibold text-slate-900">
									{appeal.post?.title || appeal.title}
								</p>
							</div>
						</section>
					</div>

					<AppealCommentThread
						ticketId={appeal.id}
						comments={appeal.comments}
						isClosed={isClosed}
					/>
				</div>
			</div>
		</div>
	);
};

export default MyAppealDetailContent;
