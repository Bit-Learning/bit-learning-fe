import MentorLayout from "@/layouts/mentor-layout";
import PageMeta from "@/shared/components/seo/page-meta";
import { useTranslation } from "react-i18next";
import MindMapView from "../components/MindMapView";

export default function MindMapPage() {
    const { t } = useTranslation();

    return (
        <>
            <PageMeta title={t("mindmap.pageTitle")} description={t("mindmap.pageDescription")} />
            <MentorLayout>
                <MindMapView />
            </MentorLayout>
        </>
    );
}
