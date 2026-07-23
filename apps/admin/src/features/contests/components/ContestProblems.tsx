import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
	Plus,
	Trash2,
	Loader2,
	Eye,
	Pencil,
	BookOpen,
	Clock,
	Database,
	BarChart2,
	ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";
import { useContestProblems, useRemoveProblem } from "../queries/useContest";
import { ContestStatus } from "../types/contest.type";
import type { ContestProblemListDTO } from "../types/contest.type";
import {
	DIFFICULTY_CONFIG,
	calcAcceptanceRate,
	getAcceptanceColor,
} from "../utils/contest.util";
import ConfirmModal from "./ConfirmModal";
import ProblemDetailDrawer from "./ProblemDetailDrawer";
import EditContestProblemModal from "./EditContestProblemModal";

interface ContestProblemsProps {
	contestId: string;
	status: ContestStatus;
}

const ContestProblems: React.FC<ContestProblemsProps> = ({
	contestId,
	status,
}) => {
	const navigate = useNavigate();
	const { data: problems, isLoading } = useContestProblems(contestId);
	const removeProblem = useRemoveProblem();

	const [removingId, setRemovingId] = useState<string | null>(null);
	const [drawerProblem, setDrawerProblem] =
		useState<ContestProblemListDTO | null>(null);
	const [editingProblem, setEditingProblem] =
		useState<ContestProblemListDTO | null>(null);

	const canEdit =
		status === ContestStatus.UPCOMING || status === ContestStatus.RUNNING;
	const canAdd = status === ContestStatus.UPCOMING;
	const canDelete = status === ContestStatus.UPCOMING;

	const handleRemove = async () => {
		if (!removingId) return;
		try {
			await removeProblem.mutateAsync({
				contestId,
				contestProblemId: removingId,
			});
		} catch (err: any) {
			toast.error("Xóa bài tập thất bại!", {
				description: err?.response?.data?.message,
			});
		} finally {
			setRemovingId(null);
		}
	};

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center py-16 gap-3">
				<Loader2 className="w-10 h-10 animate-spin text-blue-600" />
				<p className="text-sm text-gray-500">Đang tải danh sách bài tập...</p>
			</div>
		);
	}

	const removingProblem = problems?.find(
		(p) => p.contestProblemId === removingId,
	);

	return (
		<>
			<ConfirmModal
				open={!!removingId}
				variant="danger"
				title="Xóa bài tập khỏi kỳ thi"
				description={`Bạn có chắc chắn muốn xóa "${removingProblem?.title || ""}"? Hành động này không thể hoàn tác.`}
				confirmLabel="Xóa bài tập"
				onConfirm={handleRemove}
				onCancel={() => setRemovingId(null)}
			/>

			{drawerProblem && (
				<ProblemDetailDrawer
					problem={drawerProblem}
					contestId={contestId}
					onClose={() => setDrawerProblem(null)}
					canEdit={canEdit}
					onEdit={() => {
						setDrawerProblem(null);
						setEditingProblem(drawerProblem);
					}}
				/>
			)}

			{editingProblem && (
				<EditContestProblemModal
					contestId={contestId}
					contestProblemId={editingProblem.contestProblemId}
					problemId={editingProblem.problemId}
					problemTitle={editingProblem.title}
					onClose={() => setEditingProblem(null)}
				/>
			)}

			<div className="max-w-7xl mx-auto">
				<div className="flex items-center justify-between mb-6">
					<div>
						<h3 className="text-lg font-bold text-gray-900">
							Danh sách bài tập
							<span className="ml-2 text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-0.5">
								{problems?.length || 0}
							</span>
						</h3>
						<p className="text-sm text-gray-500 mt-0.5">
							Quản lý các bài toán trong kỳ thi
						</p>
					</div>
					{canAdd && (
						<Button
							onClick={() =>
								navigate({ to: `/contests/${contestId}/manage-problems` })
							}
							className="gap-2 bg-primary hover:bg-blue-700 text-white"
						>
							<Plus className="w-4 h-4" />
							Thêm bài tập
						</Button>
					)}
				</div>

				<Card className="bg-white border-gray-200 shadow-sm overflow-hidden py-0">
					<CardContent className="p-0">
						{!problems || problems.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-16 gap-3">
								<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
									<BookOpen className="w-8 h-8 text-gray-400" />
								</div>
								<p className="text-base font-bold text-gray-800">
									Chưa có bài tập nào
								</p>
								<p className="text-sm text-gray-500">
									Thêm bài tập vào cuộc thi để bắt đầu
								</p>
								{canAdd && (
									<Button
										onClick={() =>
											navigate({ to: `/contests/${contestId}/manage-problems` })
										}
										className="mt-2 gap-2 bg-primary hover:bg-blue-700 text-white"
									>
										<Plus className="w-4 h-4" />
										Thêm bài tập đầu tiên
									</Button>
								)}
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-left border-collapse">
									<thead>
										<tr className="bg-gray-50 border-b border-gray-200">
											<th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
												Mã / Tên bài tập
											</th>
											<th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
												Độ khó
											</th>
											<th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">
												<span className="inline-flex items-center gap-1">
													<Clock className="w-3.5 h-3.5" />
													Thời gian
												</span>
											</th>
											<th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">
												<span className="inline-flex items-center gap-1">
													<Database className="w-3.5 h-3.5" />
													Bộ nhớ
												</span>
											</th>
											<th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">
												Lượt nộp
											</th>
											<th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">
												AC
											</th>
											<th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
												<span className="inline-flex items-center gap-1">
													<BarChart2 className="w-3.5 h-3.5" />
													Tỉ lệ AC
												</span>
											</th>
											<th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">
												Thao tác
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-100">
										{problems.map((problem) => {
											const rate = calcAcceptanceRate(
												problem.totalAccepted,
												problem.totalSubmissions,
											);
											const cfg = DIFFICULTY_CONFIG[problem.difficulty];
											return (
												<tr
													key={problem.contestProblemId}
													className="hover:bg-gray-50 transition-colors group"
												>
													<td className="px-6 py-4">
														<div className="flex flex-col gap-0.5">
															<span className="text-xs font-bold text-blue-600">
																{problem.label}
															</span>
															<button
																onClick={() => setDrawerProblem(problem)}
																className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-left hover:underline inline-flex items-center gap-1"
															>
																{problem.title}
																<ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
															</button>
														</div>
													</td>
													<td className="px-6 py-4">
														<Badge
															variant="outline"
															className={cn(
																"text-xs font-bold border px-2 py-0.5 rounded-md",
																cfg?.className,
															)}
														>
															{cfg?.label || problem.difficulty}
														</Badge>
													</td>
													<td className="px-6 py-4 text-center">
														<span className="text-sm font-medium text-gray-700">
															{problem.timeLimitMs / 1000}s
														</span>
													</td>
													<td className="px-6 py-4 text-center">
														<span className="text-sm font-medium text-gray-700">
															{problem.memoryLimitMb} MB
														</span>
													</td>
													<td className="px-6 py-4 text-center">
														<span className="text-sm font-semibold text-gray-800">
															{problem.totalSubmissions.toLocaleString()}
														</span>
													</td>
													<td className="px-6 py-4 text-center">
														<span className="text-sm font-semibold text-gray-800">
															{problem.totalAccepted.toLocaleString()}
														</span>
													</td>
													<td className="px-6 py-4">
														<div className="flex items-center gap-2">
															<div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
																<div
																	className="h-full rounded-full"
																	style={{
																		width: `${rate}%`,
																		backgroundColor: getAcceptanceColor(rate),
																	}}
																/>
															</div>
															<span className="text-xs font-bold text-gray-600 w-8">
																{rate}%
															</span>
														</div>
													</td>
													<td className="px-6 py-4">
														<div className="flex items-center justify-end gap-0.5">
															<button
																onClick={() => setDrawerProblem(problem)}
																className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
																title="Xem chi tiết"
															>
																<Eye className="w-4 h-4" />
															</button>
															{canEdit && (
																<button
																	onClick={() => setEditingProblem(problem)}
																	className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
																	title="Chỉnh sửa"
																>
																	<Pencil className="w-4 h-4" />
																</button>
															)}
															{canDelete && (
																<button
																	onClick={() =>
																		setRemovingId(problem.contestProblemId)
																	}
																	disabled={removeProblem.isPending}
																	className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-40"
																	title="Xóa khỏi kỳ thi"
																>
																	<Trash2 className="w-4 h-4" />
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
						)}
					</CardContent>
				</Card>
			</div>
		</>
	);
};

export default ContestProblems;
