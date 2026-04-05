import TermsOfService from "@/feature/app/pages/TermsOfService";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/terms")({
	component: TermsOfService,
});
