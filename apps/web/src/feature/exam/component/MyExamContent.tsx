import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Search, Eye, Edit, Trash2, Clock, FileText } from "lucide-react";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import { useMyExams } from "../queries/useExam";
import { Button } from "@workspace/ui/components/Button";
import { Pagination } from "@/shared/components/Pagination";
import { Input } from "@workspace/ui/components/Input";

const MyExamsContent: React.FC = () => {
	const navigate = useNavigate();
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(0);
	const [size] = useState(10);

	const { data: response, isLoading } = useMyExams({ page, size, search });

	const exams = response?.data || [];
	const pagination = response?.page;

	const getStatusBadge = (isPublished: boolean) => {
		if (isPublished) {
			return (
				<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50">
					<span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
					Đã xuất bản
				</span>
			);
		}
		return (
			<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
				<span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
				Nháp
			</span>
		);
	};

	return (
		<div className="flex-1 p-8 bg-slate-50 dark:bg-slate-950">
			<div className="flex justify-between items-center mb-8">
				<div>
					<h1 className="text-3xl font-bold dark:text-white">Đề thi của tôi</h1>
					<p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
						Quản lý các đề thi bạn đã tạo cho học sinh của mình.
					</p>
				</div>
				<Button
					onClick={() =>
						navigate({ to: "/mentor/question/generate-from-questions" })
					}
					className="cursor-pointer bg-blue-700 hover:bg-blue-500 text-white px-5 py-5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm shadow-blue-500/30"
				>
					<Plus className="h-5 w-5" />
					Tạo đề thi mới
				</Button>
			</div>

			<div className="relative mb-6">
				<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
				<input
					className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
					placeholder="Tìm kiếm theo tên đề thi, mã đề hoặc ngôn ngữ..."
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			</div>

			<div className="bg-white my-6 rounded-md border-2 border-slate-400 overflow-hidden">
				{isLoading ? (
					<div className="p-6 space-y-2">
						{[1, 2, 3, 4, 5].map((i) => (
							<Skeleton key={i} className="h-20 w-full rounded-lg" />
						))}
					</div>
				) : !exams.length ? (
					<div className="p-16 text-center">
						<div className="flex flex-col items-center">
							<FileText className="h-16 w-16 text-slate-400 mb-4" />
							<h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
								{search ? "Không tìm thấy đề thi" : "Chưa có đề thi nào"}
							</h3>
							<p className="text-slate-500 dark:text-slate-400 mb-6">
								{search
									? "Thử tìm kiếm với từ khóa khác"
									: "Bắt đầu bằng cách tạo đề thi đầu tiên"}
							</p>
							{!search && (
								<Button
									onClick={() => navigate({ to: "/mentor/matrix" })}
									className="bg-primary hover:bg-blue-700 text-white px-6 py-5 rounded-xl font-semibold flex items-center gap-2 transition-all"
								>
									<Plus className="h-4 w-4" />
									Tạo đề thi mới
								</Button>
							)}
						</div>
					</div>
				) : (
					<>
						<div className="overflow-x-auto">
							<table className="w-full text-left border-collapse">
								<thead>
									<tr className="border-b border-gray-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
										<th className="px-6 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider">
											Thông tin đề thi
										</th>
										<th className="px-6 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider">
											Mã đề
										</th>
										<th className="px-6 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider">
											Thời gian
										</th>
										<th className="px-6 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider text-center">
											Thang điểm
										</th>
										<th className="px-6 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider">
											Trạng thái
										</th>
										<th className="px-6 py-4 text-xs font-bold text-slate-800 uppercase tracking-wider text-center">
											Thao tác
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100 dark:divide-slate-800">
									{exams.map((exam, index) => (
										<tr
											key={index}
											className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
											onClick={() =>
												navigate({ to: `/mentor/exam/${exam.id}` })
											}
										>
											<td className="px-6 py-4">
												<div className="flex items-center gap-4">
													<div>
														<p className="font-semibold text-slate-900 dark:text-slate-100">
															{exam.name}
														</p>
													</div>
												</div>
											</td>
											<td className="px-6 py-4">
												<span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-slate-300 rounded-md text-xs font-semibold">
													{exam.code}
												</span>
											</td>
											<td className="px-6 py-4 text-slate-600 dark:text-slate-400">
												<div className="flex items-center gap-1.5 text-sm">
													<Clock className="h-4 w-4 opacity-70" />
													{exam.durationInMinutes} ph
												</div>
											</td>
											<td className="px-6 py-4 text-center font-medium text-slate-700 dark:text-slate-300">
												{exam.totalScore}
											</td>
											<td className="px-6 py-4">
												{getStatusBadge(exam.isPublished)}
											</td>
											<td className="px-6 py-4 text-right">
												<div className="flex items-center justify-end gap-2">
													<button
														onClick={(e) => {
															e.stopPropagation();
															navigate({ to: `/mentor/exam/${exam.id}` });
														}}
														className="p-2 text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors"
														title="Xem"
													>
														<Eye className="h-5 w-5" />
													</button>
													<button
														onClick={(e) => {
															e.stopPropagation();
															// TODO: Edit exam
														}}
														className="p-2 text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors"
														title="Sửa"
													>
														<Edit className="h-5 w-5" />
													</button>
													<button
														onClick={(e) => {
															e.stopPropagation();
															// TODO: Delete exam
														}}
														className="p-2 text-slate-400 hover:text-red-500 transition-colors"
														title="Xóa"
													>
														<Trash2 className="h-5 w-5" />
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{pagination && pagination.totalPages > 1 && (
							<Pagination
								currentPage={page}
								totalPages={pagination.totalPages}
								onPageChange={setPage}
							/>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default MyExamsContent;
