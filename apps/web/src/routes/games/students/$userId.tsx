import { createFileRoute, useRouter } from "@tanstack/react-router";
import { GeneralError } from "@/feature/errors/general-error";
import StudentProfileView from "@/feature/game/components/StudentProfile";

export const Route = createFileRoute("/games/students/$userId")({
	component: function StudentProfileRoute() {
		const { userId } = Route.useParams();
		const router = useRouter();
		const idNum = Number(userId);

		if (Number.isNaN(idNum)) {
			return <GeneralError />;
		}

		return (
			<StudentProfileView userId={idNum} onBack={() => router.history.back()} />
		);
	},
	// Fallback for unexpected errors
	errorComponent: () => <GeneralError />,
});
