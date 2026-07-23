import { useState, useMemo } from "react";
import { Code2, Eye, Search, Send, X } from "lucide-react";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import {
	useGetMyPublishRequests,
	useRequestPublish,
} from "../queries/useCoding";
import type { ApprovalFilters } from "../types/coding.type";
import { ApprovalStatus, Difficulty } from "../types/coding.type";
import { Pagination } from "@/shared/components/Pagination";
import { cn } from "@workspace/ui/lib/utils";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { useNavigate } from "@tanstack/react-router";

const PAGE_SIZE = 10;

const normalize = (str: string) =>
	str
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase();

const difficultyConfig: Record<
	Difficulty,
	{ label: string; className: string }
> = {
	[Difficulty.EASY]: {
		label: "Dễ",
		className:
			"bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
	},
	[Difficulty.MEDIUM]: {
		label: "Trung bình",
		className:
			"bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
	},
	[Difficulty.HARD]: {
		label: "Khó",
		className:
			"bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800",
	},
};

const approvalConfig: Record<
	ApprovalStatus,
	{ label: string; className: string }
> = {
	[ApprovalStatus.NONE]: {
		label: "Chưa gửi",
		className:
			"bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
	},
	[ApprovalStatus.PENDING]: {
		label: "Chờ duyệt",
		className:
			"bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
	},
	[ApprovalStatus.APPROVED]: {
		label: "Đã duyệt",
		className:
			"bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
	},
	[ApprovalStatus.REJECTED]: {
		label: "Bị từ chối",
		className:
			"bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800",
	},
};

export default function ProblemApprovalTableView() {
	const [page, setPage] = useState(0);
	const navigate = useNavigate();

	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [confirmProblem, setConfirmProblem] = useState<any | null>(null);

	const requestPublish = useRequestPublish();

	const filters: ApprovalFilters = {
		page,
		size: PAGE_SIZE,
		status:
			statusFilter !== "all" ? (statusFilter as ApprovalStatus) : undefined,
	};

	const { data, isLoading } = useGetMyPublishRequests(filters);
	const rawData = data?.data ?? [];
	const totalPages = data?.page?.totalPages ?? 0;

	const filteredProblems = useMemo(() => {
		return rawData.filter((p: any) => {
			if (!search) return true;

			return normalize(p.title).includes(normalize(search));
		});
	}, [rawData, search]);

	const resetPage = () => setPage(0);

	const handleConfirmResubmit = () => {
		if (!confirmProblem) return;
		requestPublish.mutate([confirmProblem.id], {
			onSuccess: () => setConfirmProblem(null),
		});
	};

	const selectCls =
		"px-3 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary shadow-sm min-w-35";

	return (
		<div className="bg-slate-50 mx-auto p-8">
			<div className="mb-6">
				<h1 className="text-3xl font-bold">Yêu cầu phê duyệt bài tập</h1>
				<p className=" text-slate-500 mt-1 text-lg">
					Theo dõi trạng thái phê duyệt các bài tập thực hành.
				</p>
			</div>

			<div className="flex flex-col md:flex-row gap-3 mb-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
					<input
						className="w-full pl-9 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm transition-all shadow-sm"
						placeholder="Tìm kiếm bài tập..."
						type="text"
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							resetPage();
						}}
					/>
				</div>
				<select
					value={statusFilter}
					onChange={(e) => {
						setStatusFilter(e.target.value);
						resetPage();
					}}
					className={selectCls}
				>
					<option value="all">Trạng thái: Tất cả</option>
					<option value={ApprovalStatus.PENDING}>Chờ duyệt</option>
					<option value={ApprovalStatus.APPROVED}>Đã duyệt</option>
					<option value={ApprovalStatus.REJECTED}>Bị từ chối</option>
				</select>
			</div>

			{isLoading ? (
				<div className="space-y-2">
					{[1, 2, 3, 4, 5].map((i) => (
						<Skeleton key={i} className="h-16 w-full rounded-lg" />
					))}
				</div>
			) : filteredProblems.length === 0 ? (
				<div className="flex flex-col items-center justify-center h-64 text-center">
					<Code2 className="w-16 h-16 text-slate-300 mb-4" />
					<h3 className="text-lg font-medium text-slate-900 mb-2">
						Không có bài tập nào
					</h3>
					<p className="text-sm text-slate-500">
						{search || statusFilter !== "all"
							? "Thử tìm kiếm với từ khóa hoặc bộ lọc khác"
							: "Chưa có yêu cầu phê duyệt nào"}
					</p>
				</div>
			) : (
				<>
					<div className="bg-white rounded-md border border-slate-300 overflow-hidden">
						<table className="w-full">
							<thead className="bg-slate-50 border-b border-slate-300">
								<tr>
									<th className="text-left p-4 font-semibold text-md text-gray-800 uppercase tracking-wider">
										TIÊU ĐỀ
									</th>
									<th className="text-center p-4 font-semibold text-md text-gray-800 uppercase tracking-wider w-48 ">
										ĐỘ KHÓ
									</th>
									<th className="p-4 font-semibold text-md text-gray-800 uppercase tracking-wider text-left">
										Lớp
									</th>
									<th className="text-left p-4 font-semibold text-md text-gray-800 uppercase tracking-wider w-35">
										TRẠNG THÁI
									</th>
									<th className="text-center p-4 font-semibold text-md text-gray-800 uppercase tracking-wider w-48">
										Thao tác
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-200">
								{filteredProblems.map((problem: any) => {
									const difficulty =
										difficultyConfig[problem.difficulty as Difficulty];
									const approval =
										approvalConfig[problem.approvalStatus as ApprovalStatus];
									return (
										<tr
											key={problem.id}
											className="hover:bg-slate-50 transition-colors cursor-pointer"
										>
											<td className="px-6 py-4">
												<span className="line-clamp-1 text-md font-semibold text-slate-800 dark:text-blue-400 hover:underline">
													{problem.title}
												</span>
												{problem.tags?.length > 0 && (
													<p className="text-xs text-slate-400 mt-0.5 font-mono">
														{problem.tags.map((t: any) => t.name).join(", ")}
													</p>
												)}
											</td>
											<td className="p-4 text-sm text-center">
												{difficulty && (
													<span
														className={cn(
															"inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium",
															difficulty.className,
														)}
													>
														{difficulty.label}
													</span>
												)}
											</td>
											<td className="p-4 text-md text-slate-700 dark:text-slate-400 whitespace-nowrap">
												{problem.classLevel}
											</td>
											<td className="p-4 text-sm">
												{approval && (
													<span
														className={cn(
															"inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium",
															approval.className,
														)}
													>
														{approval.label}
													</span>
												)}
											</td>
											<td className="px-2 py-4">
												<div
													className="flex items-center justify-center gap-2"
													onClick={(e) => e.stopPropagation()}
												>
													{problem.approvalStatus ===
													ApprovalStatus.REJECTED ? (
														<>
															<button
																title="Xem chi tiết lý do từ chối"
																className="cursor-pointer p-2 text-slate-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
																onClick={() =>
																	navigate({
																		to: `/mentor/problem/${problem.id}`,
																	})
																}
															>
																<Eye className="h-6 w-6" />
															</button>
															<button
																title="Gửi lại yêu cầu duyệt"
																onClick={() => setConfirmProblem(problem)}
																className="flex items-center gap-1.5 px-3 py-1.5 text-md font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
															>
																<Send className="w-4 h-4" />
																Gửi lại
															</button>
														</>
													) : (
														<button
															title="Xem chi tiết"
															className="cursor-pointer p-2 text-slate-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
															onClick={() =>
																navigate({
																	to: `/mentor/problem/${problem.id}`,
																})
															}
														>
															<Eye className="h-6 w-6" />
														</button>
													)}
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>

					<div className="mt-4 flex items-center justify-between">
						<p className="text-sm text-slate-600"></p>
						{totalPages > 1 && (
							<Pagination
								currentPage={page}
								totalPages={totalPages}
								onPageChange={setPage}
							/>
						)}
					</div>
				</>
			)}

			<AlertDialog
				open={!!confirmProblem}
				onOpenChange={(open) => {
					if (!open) setConfirmProblem(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Xác nhận gửi lại yêu cầu phê duyệt
						</AlertDialogTitle>
						<AlertDialogDescription>
							Bạn đang gửi lại bài tập{" "}
							<span className="font-semibold text-gray-900">
								"{confirmProblem?.title}"
							</span>{" "}
							để phê duyệt. Bài tập sẽ được xem xét lại bởi quản trị viên.
							<br />
							<br />
							Bạn có chắc chắn muốn tiếp tục?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={requestPublish.isPending}>
							Hủy
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirmResubmit}
							disabled={requestPublish.isPending}
						>
							{requestPublish.isPending ? "Đang gửi..." : "Gửi yêu cầu"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
