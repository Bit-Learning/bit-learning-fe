import { createFileRoute } from "@tanstack/react-router";
import InstructorsPage from "@/feature/user/components/InstructorsPage";
import { GeneralError } from "@/feature/errors/general-error";

export const Route = createFileRoute("/_layout/instructors")({
	component: InstructorsPage,
	errorComponent: () => <GeneralError />,
});
