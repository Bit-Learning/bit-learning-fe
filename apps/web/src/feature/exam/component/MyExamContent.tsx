import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
	Plus,
	Search,
	Eye,
	Edit,
	Trash2,
	Clock,
	FileText,
	Send,
	ChevronDown,
} from "lucide-react";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { Button } from "@workspace/ui/components/Button";
import { Pagination } from "@/shared/components/Pagination";
import DeleteConfirmModal from "@/shared/components/DeleteConfirmModal";
import { cn } from "@workspace/ui/lib/utils";
import { useMyExams, useDeleteExam } from "../queries/useExam";
import { useSubjectsList } from "@/feature/matrix/queries/useSubject";
import type {
	ApprovalStatus,
	ExamBriefResponse,
	ExamSearchParams,
	ExamType,
} from "../types/exam.type";
import { EditExamModal } from "./EditExamModal";

const TYPE_LABELS: Record<ExamType, { label: string; className: string }> = {
	EXAM: {
		label: "Đề thi",
		className:
			"bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
	},
	PRACTICE: {
		label: "Luyện tập",
		className:
			"bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
	},
};

const APPROVAL_CONFIG: Record<
	ApprovalStatus,
	{ label: string; className: string }
> = {
	NONE: {
		label: "Nháp",
		className:
			"bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
	},
	PENDING: {
		label: "Chờ duyệt",
		className:
			"bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
	},
	APPROVED: {
		label: "Đã duyệt",
		className:
			"bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
	},
	REJECTED: {
		label: "Bị từ chối",
		className:
			"bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800",
	},
};

function useDebounce<T>(value: T, delay: number): T {
	const [debounced, setDebounced] = useState(value);
	useEffect(() => {
		const timer = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(timer);
	}, [value, delay]);
	return debounced;
}

const MyExamsContent: React.FC = () => {
	const navigate = useNavigate();
	const [searchInput, setSearchInput] = useState("");
	const [filterSubjectId, setFilterSubjectId] = useState<number | undefined>(
		undefined,
	);
	const [filterApproval, setFilterApproval] = useState<ApprovalStatus | "">("");
	const [page, setPage] = useState(0);
	const [editingExam, setEditingExam] = useState<ExamBriefResponse | null>(
		null,
	);
	const [deletingExam, setDeletingExam] = useState<ExamBriefResponse | null>(
		null,
	);

	const debouncedSearch = useDebounce(searchInput, 400);
	const { mutate: deleteExam, isPending: isDeleting } = useDeleteExam();

	const { data: subjectsData } = useSubjectsList();
	const subjects = subjectsData || [];

	const params: ExamSearchParams = {
		page,
		size: 20,
		search: debouncedSearch || undefined,
		subjectId: filterSubjectId,
		approvalStatus: filterApproval || undefined,
	};

	const { data: examsData, isLoading } = useMyExams(params);

	const exams: ExamBriefResponse[] = examsData?.data || [];
	const pagination = examsData?.page;

	const hasActiveFilter =
		!!searchInput || !!filterSubjectId || !!filterApproval;

	const handleConfirmDelete = () => {
		if (!deletingExam) return;
		deleteExam(deletingExam.id, { onSuccess: () => setDeletingExam(null) });
	};

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-950">
			<div className="p-6 lg:p-8 mx-auto">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
					<div>
						<h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
							Đề thi của tôi
						</h1>
						<p className="text-slate-500 text-lg dark:text-slate-400 mt-1">
							Quản lý và theo dõi các đề thi đã tạo
						</p>
					</div>
					<Button
						onClick={() =>
							navigate({ to: "/mentor/exam/generate-from-questions" })
						}
						className="cursor-pointer bg-blue-700 hover:bg-white hover:text-blue-600 hover:border-blue-600 text-white text-md px-5 py-5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm shadow-blue-500/30"
					>
						<Plus className="h-4 w-4" />
						Tạo đề thi mới
					</Button>
				</div>

				<div className="flex flex-col md:flex-row gap-4 mb-5">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
						<input
							className="w-full pl-9 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm transition-all shadow-sm"
							placeholder="Tìm kiếm đề thi..."
							value={searchInput}
							onChange={(e) => {
								setSearchInput(e.target.value);
								setPage(0);
							}}
						/>
					</div>
					<div className="flex gap-3 flex-wrap">
						{subjects.length > 0 && (
							<div className="relative">
								<select
									value={filterSubjectId ?? ""}
									onChange={(e) => {
										setFilterSubjectId(
											e.target.value ? Number(e.target.value) : undefined,
										);
										setPage(0);
									}}
									className="appearance-none pl-3 pr-8 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
								>
									<option value="">Môn: Tất cả</option>
									{subjects.map((s: any) => (
										<option key={s.id} value={s.id}>
											{s.name}
										</option>
									))}
								</select>
								<ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
							</div>
						)}
						<div className="relative">
							<select
								value={filterApproval}
								onChange={(e) => {
									setFilterApproval(e.target.value as ApprovalStatus | "");
									setPage(0);
								}}
								className="appearance-none pl-3 pr-8 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
							>
								<option value="">Trạng thái: Tất cả</option>
								<option value="NONE">Nháp</option>
								<option value="PENDING">Chờ duyệt</option>
								<option value="APPROVED">Đã duyệt</option>
								<option value="REJECTED">Bị từ chối</option>
							</select>
							<ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
						</div>
						{hasActiveFilter && (
							<button
								onClick={() => {
									setSearchInput("");
									setFilterSubjectId(undefined);
									setFilterApproval("");
									setPage(0);
								}}
								className="text-sm text-slate-500 hover:text-red-500 transition-colors whitespace-nowrap underline"
							>
								Xóa bộ lọc
							</button>
						)}
					</div>
				</div>

				<div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
					{isLoading ? (
						<div className="p-4 space-y-2">
							{[...Array(5)].map((_, i) => (
								<Skeleton key={i} className="h-16 w-full rounded-lg" />
							))}
						</div>
					) : !exams.length ? (
						<div className="p-16 text-center">
							<FileText className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
							<h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
								{hasActiveFilter
									? "Không tìm thấy đề thi"
									: "Chưa có đề thi nào"}
							</h3>
							{!hasActiveFilter && (
								<Button
									onClick={() =>
										navigate({ to: "/mentor/exam/generate-from-questions" })
									}
									className="cursor-pointer bg-blue-700 hover:bg-white hover:text-blue-600 hover:border-blue-600 text-white text-md px-5 py-5 rounded-lg font-medium gap-2 transition-all shadow-sm shadow-blue-500/30"
								>
									<Plus className="h-4 w-4" />
									Tạo đề thi mới
								</Button>
							)}
						</div>
					) : (
						<>
							<div className="overflow-x-auto">
								<table className="w-full text-left">
									<thead>
										<tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
											<th className="p-4 font-semibold text-md text-gray-800 uppercase tracking-wider">
												Thông tin đề thi
											</th>
											<th className="p-4 font-semibold text-md text-gray-800 uppercase tracking-wider text-center">
												Mã đề
											</th>
											<th className="p-4 font-semibold text-md text-gray-800 uppercase tracking-wider">
												Loại
											</th>
											<th className="p-4 font-semibold text-md text-gray-800 uppercase tracking-wider">
												Thời gian
											</th>
											<th className="p-4 font-semibold text-md text-gray-800 uppercase tracking-wider text-center">
												Điểm
											</th>
											<th className="p-4 font-semibold text-md text-gray-800 uppercase tracking-wider text-center">
												Trạng thái
											</th>
											<th className="p-4 font-semibold text-md text-gray-800 uppercase tracking-wider text-center">
												Thao tác
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-100 dark:divide-slate-800">
										{exams.map((exam) => {
											const approval = APPROVAL_CONFIG[exam.approvalStatus];
											const typeConf = TYPE_LABELS[exam.type];
											return (
												<tr
													key={exam.id}
													onClick={() =>
														navigate({ to: `/mentor/exam/${exam.id}` })
													}
													className={cn(
														"cursor-pointer transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30",
													)}
												>
													<td className="px-4 py-3.5">
														<span className="line-clamp-1 text-md font-semibold text-slate-800 dark:text-blue-400 hover:underline">
															{exam.name}
														</span>
													</td>
													<td className="px-4 py-3.5">
														<span className="line-clamp-1 text-center px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-slate-300 rounded-md text-sm font-semibold font-mono">
															{exam.code}
														</span>
													</td>
													<td className="px-4 py-3.5">
														<span
															className={cn(
																"inline-flex items-center px-2 py-0.5 rounded-md text-sm font-medium",
																typeConf.className,
															)}
														>
															{typeConf.label}
														</span>
													</td>
													<td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
														<div className="flex items-center gap-1.5 text-sm">
															<Clock className="h-4 w-4 opacity-70" />
															{exam.durationInMinutes} ph
														</div>
													</td>
													<td className="px-4 py-3.5 text-center text-sm font-medium text-slate-700 dark:text-slate-300">
														{exam.totalScore}
													</td>
													<td className="px-4 py-3.5 text-center">
														<span
															className={cn(
																"inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium",
																approval.className,
															)}
														>
															{approval.label}
														</span>
													</td>
													<td
														className="px-4 py-3.5 text-center"
														onClick={(e) => e.stopPropagation()}
													>
														<div className="flex items-center justify-center gap-1">
															<button
																onClick={() =>
																	navigate({ to: `/mentor/exam/${exam.id}` })
																}
																className="cursor-pointer p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
																title="Xem"
															>
																<Eye className="h-6 w-6" />
															</button>
															<button
																onClick={() => setEditingExam(exam)}
																disabled={exam.approvalStatus === "PENDING"}
																className="cursor-pointer p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg transition-colors"
																title="Sửa"
															>
																<Edit className="h-6 w-6" />
															</button>
															<button
																onClick={() => setDeletingExam(exam)}
																disabled={exam.approvalStatus === "PENDING"}
																className="cursor-pointer p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
																title="Xóa"
															>
																<Trash2 className="h-6 w-6" />
															</button>
														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>

							{pagination && pagination.totalPages > 1 && (
								<div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
									<span className="text-sm text-slate-500">
										{pagination.totalElements} đề thi
									</span>
									<Pagination
										currentPage={page}
										totalPages={pagination.totalPages}
										onPageChange={setPage}
									/>
								</div>
							)}
						</>
					)}
				</div>
			</div>

			{editingExam && (
				<EditExamModal
					exam={editingExam}
					onClose={() => setEditingExam(null)}
				/>
			)}

			<DeleteConfirmModal
				open={!!deletingExam}
				onClose={() => setDeletingExam(null)}
				onConfirm={handleConfirmDelete}
				itemName={deletingExam?.name}
				isPending={isDeleting}
			/>
		</div>
	);
};

export default MyExamsContent;
