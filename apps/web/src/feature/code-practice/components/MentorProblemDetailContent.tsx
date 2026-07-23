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
	SendHorizonal,
	X,
	Code2,
} from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { cn } from "@workspace/ui/lib/utils";
import { ApprovalStatus, Difficulty, Language } from "../types/coding.type";
import type { TestCaseResponse } from "../types/coding.type";
import {
	useProblemDetail,
	useProblemStatistics,
	useCreateTestCase,
	useUpdateTestCase,
	useDeleteTestCase,
	useAllTestCases,
} from "../queries/useCoding";
import { useRequestPublish } from "../queries/useCoding";
import TestCaseModal from "./TestCaseModal";
import Loader from "@workspace/ui/components/loader/TerminalLoader";
import DeleteConfirmModal from "@/shared/components/DeleteConfirmModal";
import ApprovalModal from "@/shared/components/ApprovalModal";
import EditCodeTemplateModal from "./EditCodeTemplateModal";

const MentorProblemDetailContent: React.FC = () => {
	const { id: problemId } = useParams({ strict: false });
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<
		"description" | "testcases" | "templates"
	>("description");
	const [selectedLanguage, setSelectedLanguage] = useState<Language>(
		Language.CPP,
	);
	const [showAddModal, setShowAddModal] = useState(false);
	const [editingTestCase, setEditingTestCase] =
		useState<TestCaseResponse | null>(null);
	const [deletingTestCase, setDeletingTestCase] =
		useState<TestCaseResponse | null>(null);
	const [showApprovalModal, setShowApprovalModal] = useState(false);
	const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);

	const requestPublish = useRequestPublish();

	const {
		data: problem,
		isLoading,
		refetch: refetchProblem,
	} = useProblemDetail(problemId || "", selectedLanguage);
	const { data: statistics } = useProblemStatistics(problemId || "");
	const { data: allTestCases, isLoading: isLoadingTestCases } = useAllTestCases(
		problemId || "",
		{
			enabled: activeTab === "testcases",
		},
	);
	const createTestCase = useCreateTestCase();
	const updateTestCase = useUpdateTestCase();
	const deleteTestCase = useDeleteTestCase();

	const handleSubmitApproval = () => {
		if (!problemId) return;
		requestPublish.mutate([problemId], {
			onSuccess: async () => {
				await refetchProblem();
				setTimeout(() => {
					setShowApprovalModal(false);
				}, 1000);
			},
		});
	};

	const handleAddTestCase = async (data: {
		input: string;
		expectedOutput: string;
		isSample: boolean;
	}) => {
		try {
			await createTestCase.mutateAsync({ problemId: problemId || "", data });
			setShowAddModal(false);
		} catch (error) {
			console.error("Error adding test case:", error);
		}
	};

	const handleEditTestCase = async (data: {
		input: string;
		expectedOutput: string;
		isSample: boolean;
	}) => {
		if (!editingTestCase) return;
		try {
			await updateTestCase.mutateAsync({
				problemId: problemId || "",
				testCaseId: editingTestCase.id,
				data,
			});
			setEditingTestCase(null);
		} catch (error) {
			console.error("Error updating test case:", error);
		}
	};

	const handleDeleteTestCase = async () => {
		if (!deletingTestCase) return;
		try {
			await deleteTestCase.mutateAsync({
				problemId: problemId || "",
				testCaseId: deletingTestCase.id,
			});
			setDeletingTestCase(null);
		} catch (error) {
			console.error("Error deleting test case:", error);
		}
	};

	if (isLoading || !problem) return <Loader />;

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

	return (
		<div className="min-h-screen bg-white dark:bg-slate-950">
			<header className="bg-white dark:bg-slate-900 border-b border-slate-400 dark:border-slate-800 sticky top-0 z-10">
				<div className="mx-auto px-8 h-20 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Button
							variant="outline"
							size="lg"
							className="mb-2 gap-2 border-gray-400 bg-white shadow-sm transition-all hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
							onClick={() => navigate({ to: "/mentor/problem" })}
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Quay lại
						</Button>
						<h1 className="text-2xl font-bold text-slate-800 dark:text-white">
							Chi tiết bài tập: {problem.title}
						</h1>
					</div>
					<div className="flex items-center gap-3">
						{(problem.approvalStatus === ApprovalStatus.NONE ||
							problem.approvalStatus === ApprovalStatus.REJECTED) && (
							<button
								onClick={() => setShowApprovalModal(true)}
								className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold shadow-sm transition-all duration-150"
							>
								<SendHorizonal className="w-4 h-4" />
								{problem.approvalStatus === ApprovalStatus.REJECTED
									? "Gửi lại yêu cầu"
									: "Gửi yêu cầu phê duyệt"}
							</button>
						)}
						<Button
							onClick={() =>
								navigate({ to: `/mentor/problem/${problemId}/edit` })
							}
							className="flex items-center gap-2 bg-blue-600 text-white p-5"
						>
							<Edit className="w-4 h-4" />
							Chỉnh sửa
						</Button>
						<Button
							variant="outline"
							className="flex items-center gap-2 p-5 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border-red-100 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20"
						>
							<Trash2 className="w-4 h-4" />
							Xóa
						</Button>
					</div>
				</div>
			</header>

			<div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-400 dark:border-slate-800">
				<div className="mx-auto px-8 py-3 flex items-center gap-6 text-md">
					<div className="flex items-center gap-2">
						<span className="text-slate-500 dark:text-slate-400 font-medium">
							Độ khó:
						</span>
						<Badge
							className={cn(
								"text-sm font-bold",
								getDifficultyBadge(problem.difficulty).className,
							)}
						>
							{getDifficultyBadge(problem.difficulty).label}
						</Badge>
					</div>
					<div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
					<div className="flex items-center gap-2">
						<Clock className="w-4 h-4 text-slate-400" />
						<span className="text-slate-600 dark:text-slate-300 font-medium">
							{problem.timeLimitMs}ms
						</span>
					</div>
					<div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
					<div className="flex items-center gap-2">
						<HardDrive className="w-4 h-4 text-slate-400" />
						<span className="text-slate-600 dark:text-slate-300 font-medium">
							{problem.memoryLimitMb}MB
						</span>
					</div>
					<div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
					<div className="flex items-center gap-2">
						<Globe className="w-4 h-4 text-slate-400" />
						<span className="text-slate-600 dark:text-slate-300 font-medium">
							{problem.isPublic ? "Công khai" : "Riêng tư"}
						</span>
					</div>
					<div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

					<div className="flex items-center gap-2">
						{problem.tags.map((tag, index) => (
							<Badge
								key={index}
								variant="outline"
								className="px-3 py-1 bg-blue-100 dark:bg-slate-800 text-blue-600 dark:text-slate-200 text-sm font-semibold border-blue-400 dark:border-slate-700 hover:border-blue-500/50 cursor-pointer"
							>
								{tag.name}
							</Badge>
						))}
					</div>
				</div>
			</div>

			<div className="mx-auto px-8 pt-6">
				{problem.approvalStatus === ApprovalStatus.REJECTED && (
					<div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 mb-4">
						<div className="shrink-0 mt-0.5">
							<svg
								className="h-8 w-8 text-red-500"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						<div>
							<p className="text-sm font-semibold text-red-700">
								Bài tập bị từ chối phê duyệt
							</p>
							<p className="mt-1 text-md text-black">
								Lí do:{" "}
								{(problem as any).rejectReason ?? "Không có lý do cụ thể."}
							</p>
						</div>
					</div>
				)}
				<div className="flex gap-8 border-b border-slate-300 dark:border-slate-800">
					{(["description", "testcases", "templates"] as const).map((tab) => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab)}
							className={cn(
								"cursor-pointer pb-4 text-md font-medium transition-all",
								activeTab === tab
									? "text-blue-600 font-bold border-b-2 border-blue-600"
									: "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200",
							)}
						>
							{tab === "description"
								? "Mô tả"
								: tab === "testcases"
									? "Test Cases"
									: "Mẫu Code"}
						</button>
					))}
				</div>

				<div className="grid grid-cols-12 gap-8 py-8">
					<div className="col-span-9 space-y-8">
						{activeTab === "description" && (
							<div className="prose prose-slate dark:prose-invert max-w-none space-y-4">
								<div className="text-lg text-gray-700 whitespace-pre-wrap">
									{problem.description}
								</div>
								{problem.constraints && (
									<div>
										<p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
											Ràng buộc:
										</p>
										<div className="font-mono text-md text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
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
										<span className="w-1.5 h-6 bg-blue-600 rounded-full" />
										Test Cases ({allTestCases?.length || 0})
									</h2>
									<Button
										onClick={() => setShowAddModal(true)}
										className="bg-blue-600 hover:bg-blue-700 gap-2 p-5 text-md"
									>
										<Plus className="w-4 h-4" />
										Thêm Test Case mới
									</Button>
								</div>

								{isLoadingTestCases ? (
									<div className="flex items-center justify-center py-20">
										<div className="text-center">
											<div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
											<p className="text-md text-slate-500 font-medium">
												Đang tải test case...
											</p>
										</div>
									</div>
								) : allTestCases?.length === 0 ? (
									<div className="flex flex-col items-center justify-center py-20 text-slate-400">
										<div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
											<Plus className="w-6 h-6" />
										</div>
										<p className="font-semibold text-slate-600 dark:text-slate-300">
											Chưa có test case nào
										</p>
										<p className="text-md mt-1">
											Nhấn "Thêm Test Case mới" để bắt đầu
										</p>
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
														<span className="text-md font-semibold">
															Test Case #{index + 1}
														</span>
														<Badge
															className={cn(
																"text-sm font-bold px-2 py-1",
																testcase.isSample
																	? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
																	: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
															)}
														>
															{testcase.isSample ? "Ví dụ" : "Ẩn"}
														</Badge>
													</div>
													<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
														<button
															className="cursor-pointer p-1.5 h-auto hover:bg-amber-50 dark:hover:bg-amber-900/30"
															onClick={() => setEditingTestCase(testcase)}
														>
															<Edit className="w-5 h-5 text-blue-500" />
														</button>
														<button
															className="cursor-pointer p-1.5 h-auto hover:bg-red-50 dark:hover:bg-red-900/30"
															onClick={() => setDeletingTestCase(testcase)}
														>
															<Trash2 className="w-5 h-5 text-red-500" />
														</button>
													</div>
												</div>
												<CardContent className="p-4 space-y-3">
													<div>
														<label className="text-sm uppercase tracking-wider font-bold text-slate-500 mb-1 block">
															Dữ liệu vào
														</label>
														<code className="block w-full p-2 bg-slate-900 text-slate-100 rounded text-md font-mono whitespace-pre-wrap">
															{testcase.input}
														</code>
													</div>
													<div>
														<label className="text-sm uppercase tracking-wider font-bold text-slate-500 mb-1 block">
															Dữ liệu ra
														</label>
														<code className="block w-full p-2 bg-emerald-950 text-emerald-400 rounded text-md font-mono whitespace-pre-wrap">
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
										<span className="w-1.5 h-6 bg-blue-600 rounded-full" />
										Mẫu Code Khởi Tạo
									</h2>
									<div className="flex items-center gap-3">
										<button
											onClick={() => setShowEditTemplateModal(true)}
											className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold shadow-sm transition-all duration-150"
										>
											<Code2 className="w-4 h-4" />
											Chỉnh sửa Template
										</button>
										<div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-md">
											{Object.values(Language).map((lang) => (
												<button
													key={lang}
													onClick={() => setSelectedLanguage(lang)}
													className={cn(
														"px-4 py-1.5 text-sm font-semibold rounded-md transition-all",
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
								</div>

								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<span className="text-sm font-bold uppercase tracking-wider text-slate-600">
											File đơn
										</span>
									</div>
									<Card className="bg-slate-900 overflow-hidden border-slate-800">
										<div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
											<div className="flex items-center gap-4">
												<div className="flex gap-1.5">
													<div className="w-2.5 h-2.5 rounded-full bg-red-500" />
													<div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
													<div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
												</div>
												<span className="text-sm font-mono text-slate-400">
													solution.{selectedLanguage.toLowerCase()}
												</span>
											</div>
											<Button
												variant="ghost"
												size="sm"
												className="text-slate-400 hover:text-white h-auto p-1"
												onClick={() =>
													navigator.clipboard.writeText(
														problem.codeTemplate ?? "",
													)
												}
											>
												<Copy className="w-4 h-4" />
											</Button>
										</div>
										<CardContent className="p-4">
											<pre className="font-mono text-md text-slate-300 overflow-x-auto leading-relaxed">
												{problem.codeTemplate || (
													<span className="text-slate-600 italic">
														Chưa có template
													</span>
												)}
											</pre>
										</CardContent>
									</Card>
								</div>

								{problem.multifileEntryTemplate && (
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<span className="text-sm font-bold uppercase tracking-wider text-slate-600">
												Nhiều file — File chính
											</span>
										</div>
										<Card className="bg-slate-900 overflow-hidden border-blue-900">
											<div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-blue-950/40">
												<div className="flex items-center gap-4">
													<div className="flex gap-1.5">
														<div className="w-2.5 h-2.5 rounded-full bg-red-500" />
														<div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
														<div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
													</div>
													<span className="text-sm font-mono text-blue-300">
														main.{selectedLanguage.toLowerCase()}{" "}
														<span className="text-blue-500">(entry)</span>
													</span>
												</div>
												<Button
													variant="ghost"
													size="sm"
													className="text-slate-400 hover:text-white h-auto p-1"
													onClick={() =>
														navigator.clipboard.writeText(
															problem.multifileEntryTemplate ?? "",
														)
													}
												>
													<Copy className="w-4 h-4" />
												</Button>
											</div>
											<CardContent className="p-4">
												<pre className="font-mono text-md text-blue-200 overflow-x-auto leading-relaxed">
													{problem.multifileEntryTemplate}
												</pre>
											</CardContent>
										</Card>
									</div>
								)}
							</div>
						)}
					</div>

					<div className="col-span-3 space-y-6">
						{statistics && (
							<Card className="border-slate-400">
								<CardContent className="p-6">
									<h4 className="text-md font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
										<TrendingUp className="w-5 h-5 text-blue-600" />
										Thống kê
									</h4>
									<div className="space-y-4">
										<div className="flex justify-between items-center text-md">
											<span className="text-slate-500 dark:text-slate-400">
												Lượt nộp
											</span>
											<span className="font-bold text-slate-800 dark:text-white">
												{statistics.totalSubmissions}
											</span>
										</div>
										<div className="flex justify-between items-center text-md">
											<span className="text-slate-500 dark:text-slate-400">
												Thành công
											</span>
											<span className="font-bold text-emerald-600">
												{statistics.acceptanceRate.toFixed(2)}%
											</span>
										</div>
										<div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
											<div
												className="bg-emerald-500 h-2 rounded-full transition-all"
												style={{ width: `${statistics.acceptanceRate}%` }}
											/>
										</div>
									</div>
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			</div>

			<TestCaseModal
				mode="add"
				isOpen={showAddModal}
				onClose={() => setShowAddModal(false)}
				onSubmit={handleAddTestCase}
				isLoading={createTestCase.isPending}
				problemTitle={problem.title}
			/>
			<TestCaseModal
				mode="edit"
				isOpen={!!editingTestCase}
				onClose={() => setEditingTestCase(null)}
				onSubmit={handleEditTestCase}
				isLoading={updateTestCase.isPending}
				testCase={editingTestCase}
			/>
			<DeleteConfirmModal
				open={!!deletingTestCase}
				onClose={() => setDeletingTestCase(null)}
				onConfirm={handleDeleteTestCase}
				isPending={deleteTestCase.isPending}
				title="Xóa Test Case"
				itemName={
					deletingTestCase
						? `Test Case #${(allTestCases?.findIndex((t) => t.id === deletingTestCase.id) ?? 0) + 1}`
						: undefined
				}
			/>
			<ApprovalModal
				open={showApprovalModal}
				onClose={() => setShowApprovalModal(false)}
				onConfirm={handleSubmitApproval}
				isPending={requestPublish.isPending}
				isSuccess={requestPublish.isSuccess}
				itemName={problem.title}
				type="problem"
			/>
			<EditCodeTemplateModal
				isOpen={showEditTemplateModal}
				onClose={() => setShowEditTemplateModal(false)}
				problemId={problemId || ""}
				problemTitle={problem.title}
			/>
		</div>
	);
};

export default MentorProblemDetailContent;
