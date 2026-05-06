import { RagUploadPage } from "@/features/rag-upload/pages/RagUploadPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/rag-upload/")({
	component: RagUploadPage,
});
