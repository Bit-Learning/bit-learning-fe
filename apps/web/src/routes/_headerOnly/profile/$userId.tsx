import { createFileRoute } from "@tanstack/react-router";
import { UserProfilePage } from "@/feature/user/page/UserProfilePage";
import { GeneralError } from "@/feature/errors/general-error";

export const Route = createFileRoute("/_headerOnly/profile/$userId")({
	component: function ViewUserProfileRoute() {
		const { userId } = Route.useParams();
		const idNum = Number(userId);

		if (Number.isNaN(idNum)) {
			return <GeneralError />;
		}

		return <UserProfilePage viewUserId={idNum} />;
	},
	errorComponent: () => <GeneralError />,
});
