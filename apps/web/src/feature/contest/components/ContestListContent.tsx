import React from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
	Trophy,
	Star,
	ChevronLeft,
	ChevronRight,
	LayoutDashboard,
	Search,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { ContestListDTO, ContestStatus } from "../types/contest.type";
import { ContestCard } from "./ContestCard";

interface Props {
	contests: ContestListDTO[];
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export const ContestListContent: React.FC<Props> = ({
	contests,
	currentPage,
	totalPages,
	onPageChange,
}) => {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const navigate = useNavigate();
	const [search, setSearch] = React.useState("");
	const [statusFilter, setStatusFilter] = React.useState<"ALL" | ContestStatus>(
		"ALL",
	);

	const isAll = pathname === "/contests";
	const isMine = pathname === "/contests/my";

	const ongoingCount = contests.filter(
		(c) => c.status === ContestStatus.RUNNING,
	).length;
	const upcomingCount = contests.filter(
		(c) => c.status === ContestStatus.UPCOMING,
	).length;
	const endedCount = contests.filter(
		(c) => c.status === ContestStatus.ENDED,
	).length;

	const filteredContests = contests.filter((c) => {
		const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
		const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
		return matchStatus && matchSearch;
	});

	const statusItems = [
		{ label: "Tất cả", value: "ALL", count: contests.length, color: "" },
		{
			label: "Đang diễn ra",
			value: ContestStatus.RUNNING,
			count: ongoingCount,
			color: "text-green-600",
		},
		{
			label: "Sắp tới",
			value: ContestStatus.UPCOMING,
			count: upcomingCount,
			color: "text-blue-600",
		},
		{
			label: "Đã kết thúc",
			value: ContestStatus.ENDED,
			count: endedCount,
			color: "text-slate-500",
		},
	];

	return (
		<div className="min-h-screen bg-white">
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
				<div className="flex gap-8 items-start">
					<aside className="w-64 shrink-0 space-y-4 sticky top-6">
						<div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
							<h3 className="text-sm font-black uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
								<Trophy className="w-4 h-4 text-blue-600" /> Kỳ thi
							</h3>
							<div className="space-y-1.5">
								<div
									onClick={() => navigate({ to: "/contests" })}
									className={cn(
										"flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all text-sm font-semibold",
										isAll
											? "bg-blue-600 text-white shadow"
											: "text-slate-600 hover:bg-slate-50 border border-slate-200",
									)}
								>
									<LayoutDashboard className="w-4 h-4" /> Danh sách kỳ thi
								</div>
								<div
									onClick={() => navigate({ to: "/contests/my" })}
									className={cn(
										"flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all text-sm font-semibold",
										isMine
											? "bg-blue-600 text-white shadow"
											: "text-slate-600 hover:bg-slate-50 border border-slate-200",
									)}
								>
									<Star
										className={cn(
											"w-4 h-4",
											isMine ? "text-white" : "text-amber-400",
										)}
									/>{" "}
									Kỳ thi của tôi
								</div>
							</div>
						</div>

						<div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
							<h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">
								Trạng thái
							</h3>
							<div className="space-y-0.5">
								{statusItems.map((item) => {
									const isActive = statusFilter === item.value;
									return (
										<div
											key={item.value}
											onClick={() => setStatusFilter(item.value as any)}
											className={cn(
												"flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all text-sm font-semibold",
												isActive
													? "bg-blue-50 text-blue-600"
													: "text-slate-600 hover:bg-slate-50",
											)}
										>
											<span className={cn(!isActive && item.color)}>
												{item.label}
											</span>
											<span
												className={cn(
													"text-xs px-2 py-0.5 rounded-full font-bold",
													isActive
														? "bg-blue-100 text-blue-600"
														: "bg-slate-100 text-slate-500",
												)}
											>
												{item.count}
											</span>
										</div>
									);
								})}
							</div>
						</div>
					</aside>

					<div className="flex-1 space-y-6">
						<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
							<div>
								<h1 className="text-3xl font-black text-slate-900 tracking-tight">
									{isMine
										? "Kỳ thi đã đăng ký & tham gia"
										: "Danh sách Cuộc thi"}
								</h1>
								<p className="text-slate-500 mt-1 text-sm">
									{isMine
										? "Danh sách các kỳ thi bạn đã tham gia."
										: "Khám phá và tham gia các cuộc thi lập trình."}
								</p>
							</div>
							<div className="flex items-center gap-2 flex-wrap">
								{ongoingCount > 0 && (
									<span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
										<span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
										{ongoingCount} Đang diễn ra
									</span>
								)}
								{upcomingCount > 0 && (
									<span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
										{upcomingCount} Sắp tới
									</span>
								)}
							</div>
						</div>

						<div className="relative">
							<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
							<input
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Tìm kiếm cuộc thi..."
								className="w-full pl-10 pr-4 h-10 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400"
							/>
						</div>

						{filteredContests.length === 0 ? (
							<div className="text-center py-20 text-slate-400 text-sm">
								Không tìm thấy cuộc thi nào.
							</div>
						) : (
							<div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
								{filteredContests.map((contest) => (
									<ContestCard key={contest.contestId} contest={contest} />
								))}
							</div>
						)}

						{totalPages > 1 && (
							<div className="flex justify-center pt-4">
								<div className="flex items-center gap-1.5">
									<button
										onClick={() => onPageChange(Math.max(0, currentPage - 1))}
										disabled={currentPage === 0}
										className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors"
									>
										<ChevronLeft className="w-4 h-4" />
									</button>
									{Array.from({ length: Math.min(5, totalPages) }).map(
										(_, i) => {
											const page =
												totalPages <= 5
													? i
													: currentPage < 3
														? i
														: currentPage > totalPages - 3
															? totalPages - 5 + i
															: currentPage - 2 + i;
											return (
												<button
													key={page}
													onClick={() => onPageChange(page)}
													className={cn(
														"w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-colors",
														currentPage === page
															? "bg-blue-600 text-white shadow"
															: "border border-slate-200 text-slate-600 hover:bg-slate-100",
													)}
												>
													{page + 1}
												</button>
											);
										},
									)}
									<button
										onClick={() =>
											onPageChange(Math.min(totalPages - 1, currentPage + 1))
										}
										disabled={currentPage === totalPages - 1}
										className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors"
									>
										<ChevronRight className="w-4 h-4" />
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</main>
		</div>
	);
};
