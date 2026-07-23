import { useState } from "react";
import PageMeta from "@/shared/components/seo/page-meta";
import MyQuestionsContent from "../components/MyQuestionContent";
import MentorLayout from "@/layouts/mentor-layout";
import { MentorHeader } from "@/shared/components/mentor/mentor-header";
import QuestionApprovalTableView from "../components/QuestionApprovalView";
import { FileText, ClipboardCheck } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

type TabKey = "my-questions" | "approval";

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
	{
		key: "my-questions",
		label: "Câu hỏi của tôi",
		icon: <FileText className="h-4 w-4" />,
	},
	{
		key: "approval",
		label: "Yêu cầu duyệt câu hỏi",
		icon: <ClipboardCheck className="h-4 w-4" />,
	},
];

const MyQuestionsPage: React.FC = () => {
	const [activeTab, setActiveTab] = useState<TabKey>("my-questions");

	return (
		<>
			<PageMeta
				title="Câu hỏi của tôi - Bit Learning"
				description="Quản lý danh sách câu hỏi và yêu cầu phê duyệt"
			/>
			<MentorLayout>
				<div className="min-h-screen bg-gray-50 dark:bg-slate-950">
					<MentorHeader />

					<div className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8">
						<div className="flex gap-1">
							{tabs.map((tab) => (
								<button
									key={tab.key}
									onClick={() => setActiveTab(tab.key)}
									className={cn(
										"flex items-center gap-2 px-5 py-3 text-md font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap",
										activeTab === tab.key
											? "border-blue-600 text-blue-600 dark:text-blue-400"
											: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200",
									)}
								>
									{tab.icon}
									{tab.label}
								</button>
							))}
						</div>
					</div>

					{activeTab === "my-questions" ? (
						<MyQuestionsContent />
					) : (
						<QuestionApprovalTableView />
					)}
				</div>
			</MentorLayout>
		</>
	);
};

export default MyQuestionsPage;
