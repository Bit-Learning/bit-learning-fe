import React, { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import {
	Copy,
	Edit,
	Trash2,
	Clock,
	HardDrive,
	Globe,
	Tag,
	TrendingUp,
	Plus,
	ArrowLeft,
} from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { cn } from "@workspace/ui/lib/utils";
import { Difficulty, Language } from "../types/coding.type";
import {
	useProblemDetail,
	useProblemStatistics,
	useCreateTestCase,
	useAllTestCases,
} from "../queries/useCoding";
import AddTestCaseModal from "./AddTestCaseModal";
import Loader from "@workspace/ui/components/loader/TerminalLoader";

const MentorProblemDetailContent: React.FC = () => {
	const { id: problemId } = useParams({ strict: false });
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<
		"description" | "testcases" | "templates"
	>("description");
	const [selectedLanguage, setSelectedLanguage] = useState<Language>(
		Language.CPP,
	);
	const [showAddTestCaseModal, setShowAddTestCaseModal] = useState(false);

	const { data: problem, isLoading } = useProblemDetail(
		problemId || "",
		selectedLanguage,
	);
	const { data: statistics } = useProblemStatistics(problemId || "");
	const { data: allTestCases, isLoading: isLoadingTestCases } = useAllTestCases(
		problemId || "",
		{
			enabled: activeTab === "testcases",
		},
	);
	const createTestCase = useCreateTestCase();

	const handleAddTestCase = async (data: {
		input: string;
		expectedOutput: string;
		isSample: boolean;
	}) => {
		try {
			await createTestCase.mutateAsync({
				problemId: problemId || "",
				data,
			});
			setShowAddTestCaseModal(false);
		} catch (error) {
			console.error("Error adding test case:", error);
		}
	};

	if (isLoading || !problem) {
		return <Loader />;
	}

	const getDifficultyBadge = (difficulty: Difficulty) => {
		const configs = {
			EASY: {
				label: "Dễ",
				className:
					"bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
			},
			MEDIUM: {
				label: "Trung bình",
				className:
					"bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400",
			},
			HARD: {
				label: "Khó",
				className:
					"bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400",
			},
		};
		return configs[difficulty];
	};

	const acceptanceRate = statistics
		? (
				(statistics.acceptedSubmissions / statistics.totalSubmissions) *
				100
			).toFixed(1)
		: 0;

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-950">
			<header className="bg-white dark:bg-slate-900 border-b border-slate-400 dark:border-slate-800 sticky top-0 z-10">
				<div className="mx-auto px-8 h-20 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Button
							variant="outline"
							size="lg"
							className="gap-2 border-gray-200 bg-white shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
							onClick={() => navigate({ to: "/mentor/problem" })}
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Quay lại
						</Button>
						<div>
							<h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
								Chi tiết bài tập: {problem.title}
							</h1>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<Button
							variant="outline"
							onClick={() =>
								navigate({ to: `/mentor/problem/${problemId}/edit` })
							}
							className="flex items-center gap-2"
						>
							<Edit className="w-4 h-4" />
							Chỉnh sửa
						</Button>
						<Button
							variant="outline"
							className="flex items-center gap-2 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border-red-100 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20"
						>
							<Trash2 className="w-4 h-4" />
							Xóa
						</Button>
					</div>
				</div>
			</header>

			<div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-400 dark:border-slate-800">
				<div className="mx-auto px-8 py-3 flex items-center gap-6 text-sm">
					<div className="flex items-center gap-2">
						<span className="text-slate-500 dark:text-slate-400 font-medium">
							Độ khó:
						</span>
						<Badge
							className={cn(
								"text-xs font-bold",
								getDifficultyBadge(problem.difficulty).className,
							)}
						>
							{getDifficultyBadge(problem.difficulty).label}
						</Badge>
					</div>
					<div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>
					<div className="flex items-center gap-2">
						<Clock className="w-4 h-4 text-slate-400" />
						<span className="text-slate-600 dark:text-slate-300 font-medium">
							{problem.timeLimitMs}ms
						</span>
					</div>
					<div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>
					<div className="flex items-center gap-2">
						<HardDrive className="w-4 h-4 text-slate-400" />
						<span className="text-slate-600 dark:text-slate-300 font-medium">
							{problem.memoryLimitMb}MB
						</span>
					</div>
					<div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>
					<div className="flex items-center gap-2">
						<Globe className="w-4 h-4 text-slate-400" />
						<span className="text-slate-600 dark:text-slate-300 font-medium">
							{problem.isPublic ? "Công khai" : "Riêng tư"}
						</span>
					</div>
				</div>
			</div>

			<div className="mx-auto px-8 pt-6">
				<div className="flex gap-8 border-b border-slate-300 dark:border-slate-800">
					<button
						onClick={() => setActiveTab("description")}
						className={cn(
							"cursor-pointer pb-4 text-sm font-medium transition-all",
							activeTab === "description"
								? "text-blue-600 font-bold border-b-2 border-blue-600"
								: "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200",
						)}
					>
						Mô tả
					</button>
					<button
						onClick={() => setActiveTab("testcases")}
						className={cn(
							"cursor-pointer pb-4 text-sm font-medium transition-all",
							activeTab === "testcases"
								? "text-blue-600 font-bold border-b-2 border-blue-600"
								: "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200",
						)}
					>
						Test Cases
					</button>
					<button
						onClick={() => setActiveTab("templates")}
						className={cn(
							"cursor-pointer pb-4 text-sm font-medium transition-all",
							activeTab === "templates"
								? "text-blue-600 font-bold border-b-2 border-blue-600"
								: "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200",
						)}
					>
						Mẫu Code
					</button>
				</div>

				<div className="grid grid-cols-12 gap-8 py-8">
					<div className="col-span-9 space-y-8">
						{activeTab === "description" && (
							<div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
								<div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
									{problem.description}
								</div>
								{problem.constraints && (
									<div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
										<p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
											Ràng buộc:{" "}
										</p>
										<div className="font-mono text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
											{problem.constraints}
										</div>
									</div>
								)}
							</div>
						)}

						{activeTab === "testcases" && (
							<div className="space-y-6">
								<div className="flex items-center justify-between">
									<h2 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-white">
										<span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
										Test Case mẫu ({allTestCases?.length || 0})
									</h2>
									<Button
										onClick={() => setShowAddTestCaseModal(true)}
										className="bg-blue-600 hover:bg-blue-700 gap-2"
									>
										<Plus className="w-4 h-4" />
										Thêm Test Case mới
									</Button>
								</div>

								{isLoadingTestCases ? (
									<div className="min-h-screen bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
										<div className="text-center">
											<div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
											<p className="text-blue-600 dark:text-slate-200 font-medium">
												Đang tải test case...
											</p>
										</div>
									</div>
								) : (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{allTestCases?.map((testcase, index) => (
											<Card
												key={testcase.id}
												className="bg-white p-0 dark:bg-slate-900 border-slate-400 dark:border-slate-800 group"
											>
												<div className="px-4 py-3 border-b border-slate-400 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
													<div className="flex items-center gap-2">
														<span className="text-sm font-semibold">
															Test Case #{index + 1}
														</span>

														<Badge
															className={cn(
																"text-[12px] font-bold px-2 py-1",
																testcase.isSample
																	? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
																	: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
															)}
														>
															{testcase.isSample ? "Ví dụ" : "Ẩn"}
														</Badge>
													</div>

													<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
														<Button
															variant="ghost"
															size="sm"
															className="p-1.5 h-auto hover:bg-slate-200 dark:hover:bg-slate-700"
														>
															<Edit className="w-4 h-4 text-slate-500" />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															className="p-1.5 h-auto hover:bg-red-50 dark:hover:bg-red-900/30"
														>
															<Trash2 className="w-4 h-4 text-red-500" />
														</Button>
													</div>
												</div>
												<CardContent className="p-4 space-y-3">
													<div>
														<label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1 block">
															Input
														</label>
														<code className="block w-full p-2 bg-slate-900 text-slate-100 rounded text-xs font-mono whitespace-pre-wrap">
															{testcase.input}
														</code>
													</div>
													<div>
														<label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1 block">
															Output
														</label>
														<code className="block w-full p-2 bg-emerald-950 text-emerald-400 rounded text-xs font-mono whitespace-pre-wrap">
															{testcase.expectedOutput}
														</code>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								)}
							</div>
						)}

						{activeTab === "templates" && (
							<div className="space-y-6">
								<div className="flex items-center justify-between">
									<h2 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-white">
										<span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
										Mẫu Code Khởi Tạo
									</h2>
									<div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
										{Object.values(Language).map((lang) => (
											<button
												key={lang}
												onClick={() => setSelectedLanguage(lang)}
												className={cn(
													"px-4 py-1.5 text-xs font-semibold rounded-md transition-all",
													selectedLanguage === lang
														? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm"
														: "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300",
												)}
											>
												{lang}
											</button>
										))}
									</div>
								</div>
								<Card className="bg-slate-900 overflow-hidden border-slate-800">
									<div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
										<div className="flex items-center gap-4">
											<div className="flex gap-1.5">
												<div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
												<div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
												<div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
											</div>
											<span className="text-[11px] font-mono text-slate-400">
												solution.{selectedLanguage.toLowerCase()}
											</span>
										</div>
										<Button
											variant="ghost"
											size="sm"
											className="text-slate-400 hover:text-white h-auto p-1"
										>
											<Copy className="w-4 h-4" />
										</Button>
									</div>
									<CardContent className="p-4">
										<pre className="font-mono text-sm text-slate-300 overflow-x-auto leading-relaxed">
											{problem.codeTemplate}
										</pre>
									</CardContent>
								</Card>
							</div>
						)}
					</div>

					<div className="col-span-3 space-y-6">
						<Card className="border-slate-400">
							<CardContent className="p-6">
								<h4 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
									<Tag className="w-5 h-5 text-blue-600" />
									Gắn thẻ
								</h4>
								<div className="flex flex-wrap gap-2">
									{problem.tags.map((tag) => (
										<Badge
											key={tag}
											variant="outline"
											className="px-3 py-1 bg-blue-100 dark:bg-slate-800 text-blue-600 dark:text-slate-200 text-xs font-semibold border-blue-400 dark:border-slate-700 hover:border-blue-500/50 cursor-pointer"
										>
											{tag}
										</Badge>
									))}
								</div>
							</CardContent>
						</Card>

						{statistics && (
							<Card className="border-slate-400">
								<CardContent className="p-6">
									<h4 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
										<TrendingUp className="w-5 h-5 text-blue-600" />
										Thống kê
									</h4>
									<div className="space-y-4">
										<div className="flex justify-between items-center text-sm">
											<span className="text-slate-500 dark:text-slate-400">
												Lượt nộp
											</span>
											<span className="font-bold text-slate-800 dark:text-white">
												{statistics.totalSubmissions}
											</span>
										</div>
										<div className="flex justify-between items-center text-sm">
											<span className="text-slate-500 dark:text-slate-400">
												Thành công
											</span>
											<span className="font-bold text-emerald-600">
												{acceptanceRate}%
											</span>
										</div>
										<div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
											<div
												className="bg-emerald-500 h-2 rounded-full transition-all"
												style={{ width: `${acceptanceRate}%` }}
											></div>
										</div>
									</div>
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			</div>

			<AddTestCaseModal
				isOpen={showAddTestCaseModal}
				onClose={() => setShowAddTestCaseModal(false)}
				onSubmit={handleAddTestCase}
				isLoading={createTestCase.isPending}
				problemTitle={problem.title}
			/>
		</div>
	);
};

export default MentorProblemDetailContent;
