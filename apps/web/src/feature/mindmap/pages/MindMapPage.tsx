import MentorLayout from "@/layouts/mentor-layout";
import PageMeta from "@/shared/components/seo/page-meta";
import MindMapView from "../components/MindMapView";
import { MentorHeader } from "@/shared/components/mentor/mentor-header";

export default function MindMapPage() {
  return (
    <>
      <PageMeta title="Tạo Mind Map - Mentor" description="Tạo sơ đồ tư duy bằng AI" />
      <MentorLayout>
        <MentorHeader />
        <MindMapView />
      </MentorLayout>
    </>
  );
}
