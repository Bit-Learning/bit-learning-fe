import React, { useState, useMemo, useEffect } from "react";
import {
	Search,
	Plus,
	Check,
	X,
	Filter,
	Code,
	AlertCircle,
	ArrowLeft,
	Loader2,
} from "lucide-react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Difficulty, ProblemBriefResponse } from "../types/problem.type";
import { useProblems, useProblemDetail } from "../queries/useProblem";
import {
	useAddProblem,
	useRemoveProblem,
	useContestProblems,
} from "../queries/useContest";
import { cn } from "@/shared/lib/utils";

const AddContestProblems: React.FC = () => {
	const navigate = useNavigate();
	const { id: contestId } = useParams({
		from: "/_authenticated/contests/$id/manage-problems",
	});

	const { data: availableProblemsData, isLoading: isLoadingProblems } =
		useProblems();
	const { data: contestProblems, isLoading: isLoadingContestProblems } =
		useContestProblems(contestId);
	const addProblemMutation = useAddProblem();
	const removeProblemMutation = useRemoveProblem();

	const availableProblems = availableProblemsData?.data || [];

	const [activeProblem, setActiveProblem] =
		useState<ProblemBriefResponse | null>(null);
	const [activeTab, setActiveTab] = useState<
		"content" | "testcases" | "details"
	>("content");
	const [searchQuery, setSearchQuery] = useState("");
	const [difficultyFilter, setDifficultyFilter] = useState<string>("Tất cả");

	useEffect(() => {
		if (!activeProblem && availableProblems.length > 0) {
			setActiveProblem(availableProblems[0]!);
		}
	}, [availableProblems, activeProblem]);

	const { data: problemDetailData, isLoading: isLoadingDetail } =
		useProblemDetail(activeProblem?.id || "", undefined, {
			enabled: !!activeProblem,
		});

	const problemDetail = problemDetailData;

	const getDifficultyColor = (difficulty: string) => {
		const colors: Record<string, string> = {
			[Difficulty.EASY]: "bg-green-100 text-green-700 border-green-200",
			[Difficulty.MEDIUM]: "bg-orange-100 text-orange-700 border-orange-200",
			[Difficulty.HARD]: "bg-red-100 text-red-700 border-red-200",
		};
		return colors[difficulty] || colors[Difficulty.MEDIUM];
	};

	const getDifficultyLabel = (difficulty: Difficulty | string) => {
		const labels: Record<string, string> = {
			[Difficulty.EASY]: "Dễ",
			[Difficulty.MEDIUM]: "Trung bình",
			[Difficulty.HARD]: "Khó",
			Dễ: "Dễ",
			"Trung bình": "Trung bình",
			Khó: "Khó",
		};
		return labels[difficulty] || "Trung bình";
	};

	const isProblemInContest = (problemId: string) => {
		return contestProblems?.some((p) => p.problemId === problemId) || false;
	};

	const getContestProblem = (problemId: string) => {
		return contestProblems?.find((p) => p.problemId === problemId);
	};

	const handleAddProblem = async (problem: ProblemBriefResponse) => {
		if (!contestProblems) return;

		try {
			await addProblemMutation.mutateAsync({
				contestId,
				request: {
					problemId: problem.id,
					orderIndex: contestProblems.length + 1,
				},
			});
		} catch (error) {
			alert("Không thể thêm bài tập. Vui lòng thử lại!");
		}
	};

	const handleRemoveProblem = async (problem: ProblemBriefResponse) => {
		const contestProblem = getContestProblem(problem.id);
		if (!contestProblem) return;

		try {
			await removeProblemMutation.mutateAsync({
				contestId,
				contestProblemId: contestProblem.contestProblemId,
			});
		} catch (error) {
			alert("Không thể gỡ bài tập. Vui lòng thử lại!");
		}
	};

	const toggleProblem = (problem: ProblemBriefResponse) => {
		if (isProblemInContest(problem.id)) {
			handleRemoveProblem(problem);
		} else {
			handleAddProblem(problem);
		}
	};

	const handleClearAll = async () => {
		if (!contestProblems || contestProblems.length === 0) return;

		if (
			confirm(
				`Bạn có chắc chắn muốn xóa tất cả ${contestProblems.length} bài tập?`,
			)
		) {
			try {
				for (const problem of contestProblems) {
					await removeProblemMutation.mutateAsync({
						contestId,
						contestProblemId: problem.contestProblemId,
					});
				}
			} catch (error) {
				alert("Có lỗi xảy ra khi xóa bài tập!");
			}
		}
	};

	const handleBack = () => {
		navigate({ to: `/contests/${contestId}` });
	};

	const handleComplete = () => {
		navigate({ to: `/contests/${contestId}` });
	};

	const filteredProblems = useMemo(() => {
		return availableProblems.filter((problem) => {
			const matchesSearch =
				problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				problem.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
				problem.tags.some((tag) =>
					tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
				);

			let matchesDifficulty = true;
			if (difficultyFilter !== "Tất cả") {
				const difficultyMap: Record<string, Difficulty> = {
					Dễ: Difficulty.EASY,
					"Trung bình": Difficulty.MEDIUM,
					Khó: Difficulty.HARD,
				};
				matchesDifficulty =
					problem.difficulty === difficultyMap[difficultyFilter];
			}

			return matchesSearch && matchesDifficulty;
		});
	}, [availableProblems, searchQuery, difficultyFilter]);

	const currentProblemData = activeProblem
		? getContestProblem(activeProblem.id)
		: null;
	const isProcessing =
		addProblemMutation.isPending || removeProblemMutation.isPending;

	if (isLoadingProblems || isLoadingContestProblems) {
		return (
			<div className="flex items-center justify-center h-screen bg-gray-50">
				<div className="text-center">
					<Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
					<p className="text-gray-600">Đang tải danh sách bài tập...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-screen overflow-hidden bg-gray-50">
			{/* Main content area */}
			<div className="flex flex-1 overflow-hidden">
				{/* Left panel */}
				<div className="w-105 border-r border-gray-200 flex flex-col bg-white">
					<div className="p-4 border-b border-gray-200 space-y-3">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
							<input
								type="text"
								placeholder="Tìm kiếm bài tập..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="flex gap-2">
								{["Tất cả", "Dễ", "Trung bình", "Khó"].map((filter) => (
									<button
										key={filter}
										onClick={() => setDifficultyFilter(filter)}
										className={cn(
											"px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
											difficultyFilter === filter
												? "bg-primary text-white"
												: "text-gray-600 bg-gray-100 hover:bg-gray-200",
										)}
									>
										{filter === "Trung bình" ? "T.Bình" : filter}
									</button>
								))}
							</div>
							<button className="p-1.5 text-gray-400 hover:text-gray-600">
								<Filter className="w-5 h-5" />
							</button>
						</div>
					</div>

					<div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
						{filteredProblems.length === 0 ? (
							<div className="text-center py-12">
								<AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
								<p className="text-gray-500">Không tìm thấy bài tập nào</p>
							</div>
						) : (
							filteredProblems.map((problem) => {
								const isSelected = isProblemInContest(problem.id);
								const isActive = activeProblem?.id === problem.id;

								return (
									<div
										key={problem.id}
										onClick={() => setActiveProblem(problem)}
										className={cn(
											"p-4 rounded-xl border transition-all cursor-pointer group relative",
											isActive
												? "bg-blue-50 border-blue-200 ring-1 ring-blue-500/20"
												: "border-transparent bg-white hover:border-gray-200 shadow-sm",
										)}
									>
										<div className="flex justify-between items-start mb-1">
											<h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors pr-8">
												{problem.title}
											</h4>
											<button
												onClick={(e) => {
													e.stopPropagation();
													toggleProblem(problem);
												}}
												disabled={isProcessing}
												className={cn(
													"absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center shadow-md transition-all",
													isProcessing && "cursor-not-allowed opacity-50",
													isSelected
														? "bg-primary text-white"
														: "border border-gray-200 text-gray-400 hover:bg-primary hover:text-white hover:border-blue-600",
												)}
											>
												{isProcessing ? (
													<Loader2 className="w-4 h-4 animate-spin" />
												) : isSelected ? (
													<Check className="w-4 h-4" />
												) : (
													<Plus className="w-4 h-4" />
												)}
											</button>
										</div>

										<div className="flex items-center gap-2 mb-2">
											<Badge
												variant="outline"
												className={cn(
													"px-2 py-0.5 rounded text-[10px] font-bold border uppercase",
													getDifficultyColor(problem.difficulty),
												)}
											>
												{getDifficultyLabel(problem.difficulty)}
											</Badge>
											<span className="text-[10px] text-gray-400 font-medium">
												{problem.timeLimitMs / 1000}s | {problem.memoryLimitMb}
												MB
											</span>
										</div>

										<p className="text-xs text-gray-500 line-clamp-2">
											{problem.description}
										</p>

										{problem.tags.length > 0 && (
											<div className="flex flex-wrap gap-1 mt-2">
												{problem.tags.slice(0, 3).map((tag) => (
													<span
														key={tag.id}
														className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded"
													>
														{tag.name}
													</span>
												))}
											</div>
										)}
									</div>
								);
							})
						)}
					</div>
				</div>

				{/* Right panel */}
				<div className="flex-1 flex flex-col overflow-hidden">
					<div className="px-8 py-6 bg-white border-b border-gray-200 flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Button
								variant="outline"
								onClick={handleBack}
								className="gap-2 border-gray-300"
							>
								<ArrowLeft className="w-4 h-4" />
								Quay lại
							</Button>
							<div className="h-6 w-px bg-gray-200"></div>
							<h2 className="text-2xl font-bold text-gray-900">
								{activeProblem?.title || "Chọn bài tập"}
							</h2>
							{activeProblem && (
								<Badge
									variant="outline"
									className={cn(
										"px-2.5 py-1 rounded-md text-[11px] font-bold border uppercase",
										getDifficultyColor(activeProblem.difficulty),
									)}
								>
									{getDifficultyLabel(activeProblem.difficulty)}
								</Badge>
							)}
						</div>

						{activeProblem && (
							<div className="flex items-center gap-3">
								{currentProblemData ? (
									<Button
										variant="outline"
										onClick={() => toggleProblem(activeProblem)}
										disabled={isProcessing}
										className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
									>
										{isProcessing ? (
											<Loader2 className="w-4 h-4 animate-spin" />
										) : (
											<X className="w-4 h-4" />
										)}
										Gỡ khỏi kỳ thi
									</Button>
								) : (
									<Button
										onClick={() => handleAddProblem(activeProblem)}
										disabled={isProcessing}
										className="gap-2 bg-primary hover:bg-blue-700 text-white"
									>
										{isProcessing ? (
											<Loader2 className="w-4 h-4 animate-spin" />
										) : (
											<Plus className="w-4 h-4" />
										)}
										Thêm vào kỳ thi
									</Button>
								)}
							</div>
						)}
					</div>

					<div className="px-8 bg-white border-b border-gray-200">
						<div className="flex gap-8">
							{[
								{ id: "content", label: "Nội dung đề bài" },
								{ id: "testcases", label: "Test Case mẫu" },
								{ id: "details", label: "Thông tin chi tiết" },
							].map((tab) => (
								<button
									key={tab.id}
									onClick={() =>
										setActiveTab(tab.id as "content" | "testcases" | "details")
									}
									className={cn(
										"py-4 text-sm font-bold transition-colors border-b-2",
										activeTab === tab.id
											? "text-blue-600 border-blue-600"
											: "text-gray-500 border-transparent hover:text-gray-700",
									)}
								>
									{tab.label}
								</button>
							))}
						</div>
					</div>

					<div className="flex-1 overflow-y-auto p-8 bg-gray-50">
						{!activeProblem ? (
							<div className="flex items-center justify-center h-full">
								<p className="text-gray-500">
									Chọn một bài tập để xem chi tiết
								</p>
							</div>
						) : isLoadingDetail ? (
							<div className="flex items-center justify-center h-full">
								<div className="text-center">
									<Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-3" />
									<p className="text-gray-600">Đang tải chi tiết bài tập...</p>
								</div>
							</div>
						) : (
							<div className="max-w-4xl mx-auto">
								{activeTab === "content" && problemDetail && (
									<div className="bg-white rounded-xl p-6 border border-gray-200">
										<div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
											{problemDetail.description}
										</div>
									</div>
								)}

								{activeTab === "testcases" && problemDetail && (
									<div className="space-y-4">
										<h3 className="text-lg font-bold text-gray-900 mb-4">
											Test Case mẫu ({problemDetail.sampleTestcases.length})
										</h3>
										{problemDetail.sampleTestcases.map((testcase, index) => (
											<div
												key={testcase.id}
												className="bg-white p-6 rounded-xl border border-gray-200"
											>
												<h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
													<Code className="w-4 h-4 text-blue-600" />
													Test Case #{index + 1}
												</h4>
												<div className="grid grid-cols-2 gap-6">
													<div>
														<p className="text-xs font-bold text-gray-500 uppercase mb-2">
															Input
														</p>
														<pre className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm font-mono whitespace-pre">
															{testcase.input}
														</pre>
													</div>
													<div>
														<p className="text-xs font-bold text-gray-500 uppercase mb-2">
															Expected Output
														</p>
														<pre className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm font-mono whitespace-pre">
															{testcase.expectedOutput}
														</pre>
													</div>
												</div>
											</div>
										))}
									</div>
								)}

								{activeTab === "details" && problemDetail && (
									<div className="space-y-6">
										<div className="grid grid-cols-2 gap-6">
											<div className="p-4 rounded-xl bg-white border border-gray-200">
												<p className="text-xs font-bold text-gray-500 uppercase mb-2">
													Thời gian giới hạn
												</p>
												<p className="text-2xl font-bold text-gray-900">
													{problemDetail.timeLimitMs / 1000}s
												</p>
											</div>
											<div className="p-4 rounded-xl bg-white border border-gray-200">
												<p className="text-xs font-bold text-gray-500 uppercase mb-2">
													Bộ nhớ giới hạn
												</p>
												<p className="text-2xl font-bold text-gray-900">
													{problemDetail.memoryLimitMb} MB
												</p>
											</div>
										</div>

										{problemDetail.tags.length > 0 && (
											<div className="p-4 rounded-xl bg-white border border-gray-200">
												<p className="text-xs font-bold text-gray-500 uppercase mb-3">
													Tags
												</p>
												<div className="flex flex-wrap gap-2">
													{problemDetail.tags.map((tag) => (
														<Badge
															key={tag.id}
															variant="outline"
															className="px-3 py-1 bg-blue-50 text-blue-600 border-blue-200"
														>
															{tag.name}
														</Badge>
													))}
												</div>
											</div>
										)}

										<div className="p-4 rounded-xl bg-white border border-gray-200">
											<p className="text-xs font-bold text-gray-500 uppercase mb-2">
												Code Template
											</p>
											<pre className="bg-gray-50 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap border border-gray-200">
												{problemDetail.codeTemplate}
											</pre>
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Bottom bar - scoped to this page, not fixed to viewport */}
			<div className="shrink-0 h-16 bg-white border-t border-gray-200 px-8 flex items-center justify-between shadow-lg">
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium text-gray-600">
							Đã chọn{" "}
							<span className="text-blue-600 font-bold">
								{contestProblems?.length || 0}
							</span>{" "}
							bài tập:
						</span>
						<div className="flex items-center gap-1.5 overflow-x-auto max-w-150">
							{contestProblems?.map((cp) => (
								<span
									key={cp.contestProblemId}
									className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-200 whitespace-nowrap"
								>
									<span className="opacity-60 text-[10px]">{cp.label}</span>{" "}
									{cp.title}
								</span>
							))}
						</div>
					</div>
				</div>

				<div className="flex items-center gap-4">
					<button
						onClick={handleClearAll}
						disabled={
							!contestProblems || contestProblems.length === 0 || isProcessing
						}
						className="text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Xóa tất cả
					</button>
					<Button
						onClick={handleComplete}
						className="gap-2 shadow-lg bg-primary hover:bg-blue-700 text-white"
					>
						<Check className="w-4 h-4" />
						Hoàn tất
					</Button>
				</div>
			</div>
		</div>
	);
};

export default AddContestProblems;
