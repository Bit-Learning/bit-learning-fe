import { useState } from "react";
import { FileText, Eye, Search, Edit, ChevronDown } from "lucide-react";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { useMyPublishRequests } from "../queries/useQuestion";
import {
	ApprovalStatus,
	QuestionApprovalParams,
	type QuestionResponse,
} from "../types/question.type";
import { Pagination } from "@/shared/components/Pagination";
import {
	getTypeBadge,
	getStatusBadge,
	getDifficultyBadge,
} from "../utils/question.utils";
import { DetailModal } from "./DetailModal";
import { EditAndResubmitModal } from "./EditAndResubmitModal";

const PAGE_SIZE = 10;

const selectCls =
	"appearance-none pl-3 pr-8 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer";

export default function QuestionApprovalTableView() {
	const [page, setPage] = useState(0);
	const [selectedQuestion, setSelectedQuestion] =
		useState<QuestionResponse | null>(null);
	const [editingQuestion, setEditingQuestion] =
		useState<QuestionResponse | null>(null);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<ApprovalStatus | "">("");

	const params: QuestionApprovalParams = {
		page,
		size: PAGE_SIZE,
		status: statusFilter || undefined,
	};

	const { data, isLoading, refetch } = useMyPublishRequests(params);
	const questions: QuestionResponse[] = data?.data ?? [];
	const totalPages = data?.page?.totalPages ?? 0;

	const filtered = search
		? questions.filter((q) =>
				q.content.toLowerCase().includes(search.toLowerCase()),
			)
		: questions;

	const resetPage = () => setPage(0);

	const formatDate = (d: string) =>
		new Date(d).toLocaleDateString("vi-VN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});

	return (
		<div className="bg-slate-50 mx-auto p-8">
			<div className="mb-6">
				<h1 className="text-3xl font-bold">Yêu cầu phê duyệt</h1>
				<p className="text-lg text-slate-500 mt-1">
					Theo dõi trạng thái phê duyệt các câu hỏi.
				</p>
			</div>

			<div className="flex flex-col md:flex-row gap-3 mb-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
					<input
						className="w-full pl-9 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm transition-all shadow-sm"
						placeholder="Tìm kiếm câu hỏi..."
						type="text"
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							resetPage();
						}}
					/>
				</div>

				<div className="relative">
					<select
						value={statusFilter}
						onChange={(e) => {
							setStatusFilter(e.target.value as ApprovalStatus | "");
							resetPage();
						}}
						className={selectCls}
					>
						<option value="">Trạng thái: Tất cả</option>
						<option value={ApprovalStatus.PENDING}>Chờ duyệt</option>
						<option value={ApprovalStatus.APPROVED}>Đã duyệt</option>
						<option value={ApprovalStatus.REJECTED}>Từ chối</option>
					</select>
					<ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
				</div>
			</div>

			{isLoading ? (
				<div className="space-y-2">
					{[1, 2, 3, 4, 5].map((i) => (
						<Skeleton key={i} className="h-16 w-full rounded-lg" />
					))}
				</div>
			) : filtered.length === 0 ? (
				<div className="flex flex-col items-center justify-center h-64 text-center">
					<FileText className="w-16 h-16 text-slate-300 mb-4" />
					<h3 className="text-lg font-medium text-slate-900 mb-2">
						Không có câu hỏi nào
					</h3>
					<p className="text-sm text-slate-500">
						{search || statusFilter
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
									<th className="text-left p-4 font-semibold text-md text-gray-800 uppercase tracking-wider w-100">
										NỘI DUNG CÂU HỎI
									</th>
									<th className="text-left p-4 font-semibold text-md text-gray-800 uppercase tracking-wider w-30">
										MỨC ĐỘ
									</th>
									<th className="text-left p-4 font-semibold text-md text-gray-800 uppercase tracking-wider">
										LOẠI
									</th>
									<th className="text-left p-4 font-semibold text-md text-gray-800 uppercase tracking-wider">
										MÔN HỌC
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
								{filtered.map((question: QuestionResponse) => (
									<tr
										key={question.id}
										onClick={() => setSelectedQuestion(question)}
										className="hover:bg-slate-50 transition-colors cursor-pointer"
									>
										<td className="px-6 py-4">
											<span className="line-clamp-1 text-md font-semibold text-slate-800 dark:text-blue-400 hover:underline">
												{question.content}
											</span>
										</td>
										<td className="p-4 text-sm">
											{getDifficultyBadge(question.questionLevel)}
										</td>
										<td className="p-4 text-sm text-gray-700">
											{getTypeBadge(question.questionType)}
										</td>
										<td className="p-4 text-sm text-gray-700">
											{question.subject?.name}
										</td>
										<td className="p-4 text-sm">
											{getStatusBadge(question.approvalStatus)}
										</td>
										<td className="px-2 py-4">
											<div
												className="flex items-center justify-center gap-2"
												onClick={(e) => e.stopPropagation()}
											>
												{question.approvalStatus === ApprovalStatus.REJECTED ? (
													<>
														<button
															title="Xem chi tiết lý do từ chối"
															className="cursor-pointer p-2 text-slate-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
															onClick={() => setSelectedQuestion(question)}
														>
															<Eye className="h-6 w-6" />
														</button>

														<button
															title="Sửa & Gửi lại"
															onClick={() => setEditingQuestion(question)}
															className="flex items-center gap-1.5 px-3 py-1.5 text-md font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
														>
															<Edit className="w-5 h-5" />
															Gửi lại
														</button>
													</>
												) : (
													<button
														title="Xem chi tiết"
														className="cursor-pointer p-2 text-slate-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
														onClick={() => setSelectedQuestion(question)}
													>
														<Eye className="h-6 w-6" />
													</button>
												)}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<div className="mt-4 flex items-center justify-between">
						<p className="text-sm text-slate-600">
							Hiển thị{" "}
							<span className="font-semibold">
								{page * PAGE_SIZE + 1}–
								{Math.min((page + 1) * PAGE_SIZE, filtered.length)}
							</span>{" "}
							trong <span className="font-semibold">{filtered.length}</span> câu
							hỏi
						</p>
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

			{selectedQuestion && (
				<DetailModal
					question={selectedQuestion}
					onClose={() => setSelectedQuestion(null)}
					formatDate={formatDate}
				/>
			)}
			{editingQuestion && (
				<EditAndResubmitModal
					question={editingQuestion}
					onClose={() => setEditingQuestion(null)}
					onSuccess={() => refetch()}
				/>
			)}
		</div>
	);
}
