import { useSelector } from "react-redux";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import MentorLayout from "@/layouts/mentor-layout";
import PageMeta from "@/shared/components/seo/page-meta";
import { SlideManagementView } from "../components/SlideManagementView";

export default function SlideManagementPage() {
  const { userInfo } = useSelector(selectAuthStateInfo);

  return (
    <>
      <PageMeta title="Quản lý Slide bài giảng - Mentor" description="Tạo và quản lý slide bài giảng với AI" />
      <MentorLayout>
        <SlideManagementView instructorId={userInfo?.id || 0} />
      </MentorLayout>
    </>
  );
}
