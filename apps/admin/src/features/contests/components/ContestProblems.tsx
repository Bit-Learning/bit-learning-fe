import React from "react";
import { useContestProblems, useRemoveProblem } from "../queries/useContest";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Trash2, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/lib/utils";

interface ContestProblemsProps {
	contestId: string;
}

export const ContestProblems: React.FC<ContestProblemsProps> = ({
	contestId,
}) => {
	const navigate = useNavigate();
	const { data: problems, isLoading } = useContestProblems(contestId);
	const removeProblem = useRemoveProblem();

	const getDifficultyBadge = (difficulty: string) => {
		const config: Record<string, string> = {
			Dễ: "bg-green-100 text-green-700 border-green-200",
			"Trung bình": "bg-orange-100 text-orange-700 border-orange-200",
			Khó: "bg-red-100 text-red-700 border-red-200",
		};

		const className = config[difficulty] || config["Trung bình"];

		return (
			<Badge
				variant="outline"
				className={cn(
					"px-2 py-1 rounded-md text-xs font-bold border",
					className,
				)}
			>
				{difficulty}
			</Badge>
		);
	};

	const calculateAcceptanceRate = (accepted: number, total: number) => {
		if (total === 0) return 0;
		return Math.round((accepted / total) * 100);
	};

	const handleManageProblems = () => {
		navigate({ to: `/contests/${contestId}/manage-problems` });
	};

	const handleRemoveProblem = (contestProblemId: string) => {
		if (confirm("Bạn có chắc chắn muốn xóa bài tập này?")) {
			removeProblem.mutate({ contestId, contestProblemId });
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-center">
					<Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-3" />
					<p className="text-gray-600">Đang tải danh sách bài tập...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h3 className="text-lg font-bold text-gray-900">
						Danh sách bài tập ({problems?.length || 0})
					</h3>
					<p className="text-sm text-gray-600">
						Quản lý các bài toán trong kỳ thi này
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						onClick={handleManageProblems}
						className="gap-2 border-gray-300"
					>
						<Settings className="w-4 h-4" />
						Quản lý bài tập
					</Button>
					<Button
						onClick={handleManageProblems}
						className="gap-2 bg-primary hover:bg-blue-700 text-white"
					>
						<Plus className="w-4 h-4" />
						Thêm bài tập
					</Button>
				</div>
			</div>

			<Card className="bg-white p-0 border-gray-200">
				<CardContent className="p-0">
					{!problems || problems.length === 0 ? (
						<div className="text-center py-12">
							<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<Plus className="w-8 h-8 text-gray-400" />
							</div>
							<h4 className="text-lg font-bold text-gray-900 mb-2">
								Chưa có bài tập nào
							</h4>
							<p className="text-sm text-gray-600 mb-4">
								Thêm bài tập vào cuộc thi để bắt đầu
							</p>
							<Button
								onClick={handleManageProblems}
								className="gap-2 bg-primary hover:bg-blue-700 text-white"
							>
								<Plus className="w-4 h-4" />
								Thêm bài tập đầu tiên
							</Button>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-left border-collapse">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600">
											Mã / Tên bài tập
										</th>
										<th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600">
											Độ khó
										</th>
										<th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600 text-center">
											Lượt nộp
										</th>
										<th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600 text-center">
											Đã giải
										</th>
										<th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600">
											Tỉ lệ AC
										</th>
										<th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600 text-right">
											Thao tác
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{problems.map((problem) => {
										const acceptanceRate = calculateAcceptanceRate(
											problem.totalAccepted,
											problem.totalSubmissions,
										);
										const progressColor =
											acceptanceRate > 60
												? "#22c55e"
												: acceptanceRate > 30
													? "#f59e0b"
													: "#ef4444";

										return (
											<tr
												key={problem.contestProblemId}
												className="hover:bg-gray-50 transition-colors group"
											>
												<td className="px-6 py-4">
													<div className="flex flex-col">
														<span className="text-xs font-bold text-blue-600 mb-0.5">
															{problem.label}
														</span>
														<span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
															{problem.title}
														</span>
													</div>
												</td>
												<td className="px-6 py-4">
													{getDifficultyBadge(problem.difficulty)}
												</td>
												<td className="px-6 py-4 text-center">
													<span className="text-sm font-medium text-gray-900">
														{problem.totalSubmissions.toLocaleString()}
													</span>
												</td>
												<td className="px-6 py-4 text-center">
													<span className="text-sm font-medium text-gray-900">
														{problem.totalAccepted.toLocaleString()}
													</span>
												</td>
												<td className="px-6 py-4">
													<div className="flex items-center gap-2">
														<div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
															<div
																className="h-full rounded-full transition-all"
																style={{
																	width: `${acceptanceRate}%`,
																	backgroundColor: progressColor,
																}}
															/>
														</div>
														<span className="text-xs font-semibold text-gray-600">
															{acceptanceRate}%
														</span>
													</div>
												</td>
												<td className="px-6 py-4 text-right">
													<button
														onClick={() =>
															handleRemoveProblem(problem.contestProblemId)
														}
														disabled={removeProblem.isPending}
														className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50"
														title="Xóa bài tập"
													>
														<Trash2 className="w-5 h-5" />
													</button>
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
	);
};
