import { useState } from "react";
import PageMeta from "@/shared/components/seo/page-meta";
import MentorProblemListContent from "../components/MentorProblemListContent";
import MentorLayout from "@/layouts/mentor-layout";
import { MentorHeader } from "@/shared/components/mentor/mentor-header";
import { Code2, ClipboardCheck } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import ProblemApprovalTableView from "../components/ProblemApprovalTableView";

type TabKey = "my-problems" | "approval";

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  {
    key: "my-problems",
    label: "Bài tập của tôi",
    icon: <Code2 className="h-4 w-4" />,
  },
  {
    key: "approval",
    label: "Yêu cầu duyệt bài tập",
    icon: <ClipboardCheck className="h-4 w-4" />,
  },
];

export const MentorProblemListPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("my-problems");

  return (
    <>
      <PageMeta title="Quản lý Problem - Mentor" description="Quản lý bài tập coding" />
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

          {activeTab === "my-problems" ? <MentorProblemListContent /> : <ProblemApprovalTableView />}
        </div>
      </MentorLayout>
    </>
  );
};
