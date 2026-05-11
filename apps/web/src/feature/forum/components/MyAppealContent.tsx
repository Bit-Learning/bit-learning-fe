import React, { useMemo, useState } from "react";
import {
	CheckCircle2,
	Clock3,
	Flame,
	Inbox,
	MessageSquare,
	PenSquare,
	Search,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useSelector } from "react-redux";
import { Pagination } from "@/shared/components/Pagination";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { useMyPostAppeals } from "../queries/useForum";
import type { AppealTicketStatus } from "../types/forum.type";
import { formatAppealDate, getAppealStatusLabel } from "../utils/appeal.utils";

type AppealFilter = "ALL" | AppealTicketStatus;

const FILTERS: {
	key: AppealFilter;
	label: string;
	icon: React.ReactNode;
}[] = [
	{
		key: "ALL",
		label: "Tất cả",
		icon: <MessageSquare className="h-3.5 w-3.5" />,
	},
	{
		key: "OPEN",
		label: "Đang mở",
		icon: <Clock3 className="h-3.5 w-3.5" />,
	},
	{
		key: "CLOSED",
		label: "Đã đóng",
		icon: <CheckCircle2 className="h-3.5 w-3.5" />,
	},
];

const MyAppealContent: React.FC = () => {
	const navigate = useNavigate();
	const [page, setPage] = useState(0);
	const [searchQuery, setSearchQuery] = useState("");
	const [activeFilter, setActiveFilter] = useState<AppealFilter>("ALL");
	const { userInfo } = useSelector(selectAuthStateInfo);

	const { data, isLoading } = useMyPostAppeals(
		page,
		10,
		activeFilter === "ALL" ? undefined : activeFilter,
		!!userInfo,
	);

	const appeals = data?.content ?? [];
	const pagination = data?.page;

	const filteredAppeals = useMemo(() => {
		if (!searchQuery.trim()) return appeals;

		const query = searchQuery.trim().toLowerCase();
		return appeals.filter((appeal) =>
			[
				appeal.code,
				appeal.title,
				appeal.appealMessage,
				appeal.originalBanReason,
				appeal.post?.title,
			]
				.filter(Boolean)
				.some((value) => (value ?? "").toLowerCase().includes(query)),
		);
	}, [appeals, searchQuery]);

	if (!userInfo) {
		return (
			<div className="min-h-screen bg-gray-50 px-4 py-20">
				<div className="mx-auto max-w-xl rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
					<h1 className="text-2xl font-bold text-slate-900">
						Đăng nhập để xem khiếu nại của bạn
					</h1>
					<p className="mt-3 text-sm leading-6 text-slate-500">
						Inbox khiếu nại chỉ hiển thị các ticket do chính bạn gửi cho quản
						trị viên.
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

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="border-b border-gray-200 bg-white shadow-sm">
				<div className="mx-auto flex max-w-7xl items-center px-4 py-4 sm:px-6 lg:px-8">
					<nav className="flex items-center text-md text-gray-500">
						<span
							onClick={() => navigate({ to: "/" })}
							className="cursor-pointer hover:text-gray-700"
						>
							Trang chủ
						</span>
						<span className="mx-2 text-gray-400">/</span>
						<span className="font-medium text-gray-700">Khiếu nại của tôi</span>
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
							<button className="flex w-full cursor-pointer items-center gap-2.5 rounded-md bg-blue-50 px-3 py-2 text-left text-md font-semibold text-primary">
								<MessageSquare className="h-4 w-4" />
								Khiếu nại của tôi
							</button>
						</div>
					</div>

					{/* <div className="rounded-md border border-gray-200 bg-white p-4">
						<p className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
							Inbox
						</p>
						<p className="text-sm leading-6 text-slate-500">
							Theo dõi phản hồi từ quản trị viên với các bài viết đã bị khóa.
						</p>
					</div> */}
				</aside>

				<div className="min-w-0 flex-1 space-y-4">
					<div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
						<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
							<div>
								<h1 className="text-xl font-semibold text-slate-900">
									Khiếu nại bài viết
								</h1>
								<p className="mt-1 text-sm text-slate-500">
									Danh sách các yêu cầu mở khóa bài viết bạn đã gửi.
								</p>
							</div>

							<div className="relative w-full max-w-md">
								<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
								<input
									value={searchQuery}
									onChange={(event) => setSearchQuery(event.target.value)}
									placeholder="Tìm theo mã ticket, bài viết hoặc nội dung..."
									className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
								/>
							</div>
						</div>

						<div className="mt-5 flex flex-wrap items-center gap-2">
							{FILTERS.map(({ key, label, icon }) => (
								<button
									key={key}
									type="button"
									onClick={() => {
										setActiveFilter(key);
										setPage(0);
									}}
									className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
										activeFilter === key
											? "bg-primary text-white"
											: "bg-slate-100 text-slate-600 hover:bg-slate-200"
									}`}
								>
									{icon}
									{label}
								</button>
							))}
						</div>
					</div>

					{isLoading ? (
						<div className="space-y-3">
							{Array.from({ length: 3 }).map((_, index) => (
								<div
									key={index}
									className="animate-pulse rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
								>
									<div className="h-5 w-48 rounded-full bg-slate-100" />
									<div className="mt-4 h-4 w-full rounded-full bg-slate-100" />
									<div className="mt-2 h-4 w-3/4 rounded-full bg-slate-100" />
								</div>
							))}
						</div>
					) : filteredAppeals.length === 0 ? (
						<div className="rounded-[28px] border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
							<Inbox className="mx-auto h-10 w-10 text-slate-300" />
							<h2 className="mt-4 text-lg font-semibold text-slate-700">
								{searchQuery
									? `Không tìm thấy kết quả cho "${searchQuery}"`
									: "Bạn chưa có khiếu nại nào"}
							</h2>
							<p className="mt-2 text-sm leading-6 text-slate-500">
								{searchQuery
									? "Thử thay đổi từ khóa hoặc mở bộ lọc khác."
									: "Khi một bài viết bị khóa và bạn gửi khiếu nại, ticket sẽ xuất hiện ở đây."}
							</p>
						</div>
					) : (
						<div className="space-y-3">
							{filteredAppeals.map((appeal) => {
								const isClosed = appeal.status === "CLOSED";
								const isPostUnlocked = !!appeal.post && !appeal.post.isBanned;

								return (
									<div
										key={appeal.id}
										className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
									>
										<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
											<div className="min-w-0 flex-1 space-y-4">
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
															: "Bài viết vẫn bị khóa"}
													</span>
												</div>

												<div>
													<h2 className="text-lg font-semibold text-slate-900">
														{appeal.post?.title || appeal.title}
													</h2>
													<p className="mt-1 text-sm text-slate-500">
														Cập nhật gần nhất:{" "}
														{formatAppealDate(appeal.updatedAt)}
													</p>
												</div>

												<div className="grid gap-3 lg:grid-cols-2">
													<div className="rounded-2xl border border-red-100 bg-red-50/70 p-4">
														<p className="text-xs font-semibold uppercase tracking-wide text-red-500">
															Lý do khóa ban đầu
														</p>
														<p className="mt-2 text-sm leading-6 text-red-900">
															{appeal.originalBanReason?.trim() ||
																"Quản trị viên chưa để lại lý do chi tiết."}
														</p>
													</div>
													<div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
														<p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
															Nội dung khiếu nại
														</p>
														<p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">
															{appeal.appealMessage}
														</p>
													</div>
												</div>
											</div>

											{/* <div className="flex shrink-0 items-center gap-2">
												<button
													type="button"
													onClick={() =>
														navigate({
															to: "/forum/appeals/$id",
															params: { id: String(appeal.id) },
														})
													}
													className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
												>
													Xem chi tiết
												</button>
											</div> */}
										</div>
									</div>
								);
							})}
						</div>
					)}

					{pagination && pagination.totalPages > 1 ? (
						<Pagination
							currentPage={page}
							totalPages={pagination.totalPages}
							onPageChange={setPage}
						/>
					) : null}
				</div>
			</div>
		</div>
	);
};

export default MyAppealContent;
