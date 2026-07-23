import React, { useState } from "react";
import {
	X,
	Loader2,
	Code2,
	FileText,
	TestTube2,
	Pencil,
	CheckSquare,
	ChevronDown,
	ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import type { ContestProblemListDTO } from "../types/contest.type";
import { DIFFICULTY_CONFIG, LANG_LABELS } from "../utils/contest.util";
import {
	useProblemDetail,
	useAllTestCases,
	useCodeTemplates,
} from "@/features/problems/queries/useProblem";
import { Difficulty, Language } from "@/features/problems/types/problem.type";

interface ProblemDetailDrawerProps {
	problem: ContestProblemListDTO;
	contestId: string;
	onClose: () => void;
	canEdit: boolean;
	onEdit: () => void;
}

type Tab = "description" | "testcases" | "templates";

const ProblemDetailDrawer: React.FC<ProblemDetailDrawerProps> = ({
	problem,
	onClose,
	canEdit,
	onEdit,
}) => {
	const [activeTab, setActiveTab] = useState<Tab>("description");
	const [selectedLang, setSelectedLang] = useState<Language>(Language.PYTHON);

	const { data: detail, isLoading: isLoadingDetail } = useProblemDetail(
		problem.problemId,
		selectedLang,
	);
	const { data: allTestCases, isLoading: isLoadingTC } = useAllTestCases(
		problem.problemId,
	);
	const { data: codeTemplates, isLoading: isLoadingTemplates } =
		useCodeTemplates(problem.problemId);

	const diffCfg =
		DIFFICULTY_CONFIG[problem.difficulty] ||
		DIFFICULTY_CONFIG[Difficulty.MEDIUM];

	const tabs: {
		id: Tab;
		label: string;
		icon: React.ReactNode;
		badge?: number;
	}[] = [
		{
			id: "description",
			label: "Đề bài",
			icon: <FileText className="w-3.5 h-3.5" />,
		},
		{
			id: "testcases",
			label: "Test Cases",
			icon: <TestTube2 className="w-3.5 h-3.5" />,
			badge: allTestCases?.length,
		},
		{
			id: "templates",
			label: "Code Templates",
			icon: <Code2 className="w-3.5 h-3.5" />,
			badge: codeTemplates?.length,
		},
	];

	const activeTemplate = codeTemplates?.find(
		(t) => t.language === selectedLang,
	);

	return (
		<div className="fixed inset-0 z-50 flex">
			<div
				className="absolute inset-0 bg-black/40 backdrop-blur-sm"
				onClick={onClose}
			/>
			<div className="relative ml-auto w-full max-w-2xl bg-white flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-300">
				<div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white shrink-0">
					<div className="flex items-center gap-2.5 min-w-0">
						<span className="shrink-0 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded px-2 py-0.5">
							{problem.label}
						</span>
						<h2 className="text-sm font-bold text-gray-900 truncate">
							{problem.title}
						</h2>
						<Badge
							variant="outline"
							className={cn(
								"shrink-0 text-xs font-bold border",
								diffCfg?.className,
							)}
						>
							{diffCfg?.label}
						</Badge>
					</div>
					<div className="flex items-center gap-2 ml-3 shrink-0">
						{canEdit && (
							<Button
								variant="outline"
								size="sm"
								onClick={onEdit}
								className="gap-1.5 h-8 text-xs border-gray-200 text-gray-700 hover:bg-gray-50"
							>
								<Pencil className="w-3 h-3" />
								Chỉnh sửa
							</Button>
						)}
						<button
							onClick={onClose}
							className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
						>
							<X className="w-4 h-4" />
						</button>
					</div>
				</div>

				<div className="flex border-b border-gray-200 bg-white shrink-0 overflow-x-auto">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={cn(
								"flex items-center gap-1.5 py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap",
								activeTab === tab.id
									? "text-blue-600 border-blue-600"
									: "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-200",
							)}
						>
							{tab.icon}
							{tab.label}
							{tab.badge !== undefined && tab.badge > 0 && (
								<span className="ml-0.5 text-[10px] font-bold bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5">
									{tab.badge}
								</span>
							)}
						</button>
					))}
				</div>

				<div className="flex-1 overflow-y-auto">
					{activeTab === "description" && (
						<div className="p-5 space-y-5">
							{isLoadingDetail ? (
								<LoadingSpinner />
							) : detail ? (
								<>
									<div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 rounded-xl p-5 border border-gray-100 whitespace-pre-wrap leading-relaxed text-sm">
										{detail.description}
									</div>
									{detail.constraints && (
										<div>
											<p className="text-xs font-bold text-gray-500 uppercase mb-2">
												Ràng buộc
											</p>
											<pre className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-sm font-mono whitespace-pre-wrap">
												{detail.constraints}
											</pre>
										</div>
									)}
								</>
							) : (
								<EmptyState message="Không thể tải nội dung đề bài." />
							)}
						</div>
					)}

					{activeTab === "testcases" && (
						<div className="p-5 space-y-4">
							<div className="flex items-center justify-between">
								<p className="text-sm font-bold text-gray-800">
									Tất cả test cases
								</p>
							</div>
							{isLoadingTC ? (
								<LoadingSpinner />
							) : !allTestCases || allTestCases.length === 0 ? (
								<EmptyState message="Chưa có test case nào." />
							) : (
								allTestCases.map((tc, idx) => (
									<TestCaseCard
										key={tc.id}
										index={idx}
										input={tc.input}
										expectedOutput={tc.expectedOutput}
										isSample={tc.isSample}
										orderIndex={tc.orderIndex}
									/>
								))
							)}
						</div>
					)}

					{activeTab === "templates" && (
						<div className="p-5 space-y-4">
							<div className="flex items-center gap-2 flex-wrap">
								{Object.values(Language).map((lang) => (
									<button
										key={lang}
										onClick={() => setSelectedLang(lang)}
										className={cn(
											"px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all",
											selectedLang === lang
												? "bg-blue-600 text-white border-blue-600"
												: "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600",
										)}
									>
										{LANG_LABELS[lang]}
									</button>
								))}
							</div>
							{isLoadingTemplates ? (
								<LoadingSpinner />
							) : activeTemplate ? (
								<div className="rounded-xl border border-gray-200 overflow-hidden">
									<div className="flex items-center justify-between px-4 py-2 bg-gray-800">
										<span className="text-xs font-bold text-gray-300 uppercase">
											{LANG_LABELS[selectedLang]} — Template Code
										</span>
										<Code2 className="w-4 h-4 text-gray-400" />
									</div>
									<pre className="bg-gray-900 text-green-300 p-5 text-xs font-mono whitespace-pre overflow-x-auto max-h-80">
										{activeTemplate.templateCode}
									</pre>
									{activeTemplate.driverCode && (
										<>
											<div className="px-4 py-2 bg-gray-700 border-t border-gray-600">
												<span className="text-xs font-bold text-gray-400 uppercase">
													Driver Code
												</span>
											</div>
											<pre className="bg-gray-900 text-blue-300 p-5 text-xs font-mono whitespace-pre overflow-x-auto max-h-60">
												{activeTemplate.driverCode}
											</pre>
										</>
									)}
								</div>
							) : (
								<EmptyState
									message={`Chưa có code template cho ${LANG_LABELS[selectedLang]}.`}
								/>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

const TestCaseCard: React.FC<{
	index: number;
	input: string;
	expectedOutput: string;
	isSample: boolean;
	orderIndex: number;
}> = ({ index, input, expectedOutput, isSample }) => {
	const [expanded, setExpanded] = useState(isSample);

	return (
		<div className="rounded-xl border border-gray-200 overflow-hidden">
			<button
				onClick={() => setExpanded((v) => !v)}
				className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-200"
			>
				<div className="flex items-center gap-2">
					<span className="text-xs font-bold text-gray-700">
						Test Case #{index + 1}
					</span>
					{isSample ? (
						<Badge
							variant="outline"
							className="text-[10px] font-bold text-green-700 border-green-200 bg-green-50 px-1.5 py-0"
						>
							<CheckSquare className="w-2.5 h-2.5 mr-0.5" />
							Mẫu
						</Badge>
					) : (
						<Badge
							variant="outline"
							className="text-[10px] text-gray-500 border-gray-200 px-1.5 py-0"
						>
							Ẩn
						</Badge>
					)}
				</div>
				{expanded ? (
					<ChevronUp className="w-3.5 h-3.5 text-gray-400" />
				) : (
					<ChevronDown className="w-3.5 h-3.5 text-gray-400" />
				)}
			</button>
			{expanded && (
				<div className="grid grid-cols-2 divide-x divide-gray-200">
					<div className="p-3.5">
						<p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">
							Input
						</p>
						<pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap break-all">
							{input}
						</pre>
					</div>
					<div className="p-3.5">
						<p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">
							Expected Output
						</p>
						<pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap break-all">
							{expectedOutput}
						</pre>
					</div>
				</div>
			)}
		</div>
	);
};

const LoadingSpinner: React.FC = () => (
	<div className="flex items-center justify-center py-12">
		<Loader2 className="w-8 h-8 animate-spin text-blue-600" />
	</div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
	<div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
		<p className="text-sm text-gray-400">{message}</p>
	</div>
);

export default ProblemDetailDrawer;
