import MentorLayout from "@/layouts/mentor-layout";
import PageMeta from "@/shared/components/seo/page-meta";
import { SlideManagementView } from "../components/SlideManagementView";

export default function SlideManagementPage() {
	return (
		<>
			<PageMeta
				title="Quản lý Slide bài giảng - Mentor"
				description="Tạo và quản lý slide bài giảng với AI"
			/>
			<MentorLayout>
				<div className="min-h-screen bg-white dark:bg-slate-950">
					<SlideManagementView />
				</div>
			</MentorLayout>
		</>
	);
}
