import React, { useState } from "react";
import { Search, Code2, Hash, Heart, RefreshCw, CheckCircle, Send, TrendingUp, Users } from "lucide-react";
import { Input } from "@workspace/ui/components/Input";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { cn } from "@workspace/ui/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { Pagination } from "@/shared/components/Pagination";
import { useProblems, useToggleFavorite } from "../queries/useCoding";
import { DifficultyBadge } from "../components/DifficultyBadge";
import { ProblemStatisticsCell } from "./ProblemStatisticsCell";
import Loader from "@workspace/ui/components/loader/TerminalLoader";

const StudentProblemListContent: React.FC = () => {
	const [search, setSearch] = useState<string>("");
	const [difficulty, setDifficulty] = useState<string>("all");
	const [page, setPage] = useState<number>(0);
	const size = 10;

	const navigate = useNavigate();

	const { data: problemsData, isLoading } = useProblems({
		page,
		size,
		sort: "createdAt,desc",
	});

	const toggleFavorite = useToggleFavorite();

	const problems = problemsData?.data || [];
	const pageInfo = problemsData?.page;
	const totalPages = pageInfo?.totalPages || 0;
	const totalElements = pageInfo?.totalElements || 0;

	const filteredProblems = problems.filter((p) => {
		const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
		const matchDifficulty = difficulty === "all" || p.difficulty === difficulty;
		return matchSearch && matchDifficulty;
	});

	const handleFavorite = (e: React.MouseEvent, problemId: string) => {
		e.stopPropagation();
		toggleFavorite.mutate(problemId);
	};

	const handleProblemClick = (problemId: string) => {
		navigate({ to: `/problem/${problemId}` });
	};

	const handleReset = () => {
		setSearch("");
		setDifficulty("all");
		setPage(0);
	};

	if (isLoading) {
		return <Loader />;
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
				<div className="mb-6">
					<div className="flex items-center gap-4 mb-2">
						<div className="p-3 rounded-lg bg-blue-600">
							<Code2 className="w-7 h-7 text-white" />
						</div>
						<div>
							<h1 className="text-3xl font-bold text-gray-900">
								Danh sách bài tập lập trình
							</h1>
							<nav className="flex text-sm text-gray-500 mt-1">
								<span className="text-gray-900 font-medium">Luyện tập</span>
							</nav>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-12 gap-4">
					<div className="md:col-span-8 relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
						<Input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Tìm kiếm bài tập theo tên..."
							className="pl-10 h-10 bg-white border-gray-200"
						/>
					</div>

					<div className="md:col-span-3">
						<select
							value={difficulty}
							onChange={(e) => setDifficulty(e.target.value)}
							className="w-full h-10 px-3 text-sm rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="all">Tất cả độ khó</option>
							<option value="EASY">Dễ</option>
							<option value="MEDIUM">Trung bình</option>
							<option value="HARD">Khó</option>
						</select>
					</div>

					<div className="md:col-span-1">
						<Button
							variant="outline"
							className="w-full h-10 border-gray-300"
							onClick={handleReset}
						>
							<RefreshCw className="w-4 h-4" />
						</Button>
					</div>
				</div>
				<Card className="bg-white p-0 border-2 border-gray-200 rounded-md">
					<CardContent className="px-0">
						<div className="overflow-x-auto">
							<table className="w-full text-left border-collapse">
								<thead>
									<tr className="bg-gray-50 border-b border-gray-200">
										<th className="px-6 py-4 text-sm font-semibold text-gray-800 uppercase tracking-wider w-35">
											Trạng thái
										</th>

										<th className="px-6 py-4 text-sm font-semibold text-gray-800 uppercase tracking-wider">
											Tên bài tập
										</th>

										<th className="px-6 py-4 text-sm font-semibold text-gray-800 uppercase tracking-wider">
											Độ khó
										</th>

										<th className="px-6 py-4 text-sm font-semibold text-gray-800 uppercase tracking-wider">
											<div className="flex items-center gap-1">
												<Users className="w-3 h-3" />
												Người đã giải
											</div>
										</th>

										<th className="px-6 py-4 text-sm font-semibold text-gray-800 uppercase tracking-wider">
											<div className="flex items-center gap-1">
												<TrendingUp className="w-3 h-3" />
												Tỷ lệ đúng
											</div>
										</th>

										<th className="px-6 py-4 text-sm font-semibold text-gray-800 uppercase tracking-wider">
											Chủ đề
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{filteredProblems.map((problem, index) => (
										<tr
											key={problem.id}
											className="hover:bg-gray-50 transition-colors cursor-pointer group"
											onClick={() => handleProblemClick(problem.id)}
										>
											<td className="px-6 py-4">
												<div className="flex items-center gap-2">
													<button
														onClick={(e) => handleFavorite(e, problem.id)}
														className="p-1 rounded hover:bg-gray-100 transition-colors"
													>
														<Heart
															className={cn(
																"w-4 h-4 transition-colors",
																problem.isFavorite
																	? "fill-red-500 text-red-500"
																	: "text-gray-400",
															)}
														/>
													</button>
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="flex items-center gap-2">
													<span className="text-gray-500 text-sm">
														{page * size + index + 1}.
													</span>
													<span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
														{problem.title}
													</span>
												</div>
											</td>
											<td className="px-6 py-4">
												<DifficultyBadge difficulty={problem.difficulty} />
											</td>
											<ProblemStatisticsCell problemId={problem.id} />
											<td className="px-6 py-4">
												<div className="flex flex-wrap gap-1">
													{problem.tags?.slice(0, 3).map((tag) => (
														<Badge
															key={tag}
															variant="secondary"
															className="text-xs bg-gray-100 text-gray-700 border-gray-200"
														>
															<Hash className="w-2.5 h-2.5 mr-0.5" />
															{tag}
														</Badge>
													))}
													{problem.tags && problem.tags.length > 3 && (
														<Badge
															variant="secondary"
															className="text-xs bg-gray-100 text-gray-700 border-gray-200"
														>
															+{problem.tags.length - 3}
														</Badge>
													)}
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						<div className="px-6 border-t border-gray-200 flex items-center justify-between">
							<p className="text-sm text-gray-800 py-4">
								Hiển thị{" "}
								<span className="font-medium text-gray-900">
									{page * size + 1}
								</span>{" "}
								–{" "}
								<span className="font-medium text-gray-900">
									{Math.min((page + 1) * size, totalElements)}
								</span>{" "}
								trong tổng số{" "}
								<span className="font-medium text-gray-900">
									{totalElements}
								</span>{" "}
								bài tập
							</p>
							{totalPages > 1 && (
								<Pagination
									currentPage={page}
									totalPages={totalPages}
									onPageChange={setPage}
								/>
							)}
						</div>
					</CardContent>
				</Card>
			</main>
		</div>
	);
};

export default StudentProblemListContent;
