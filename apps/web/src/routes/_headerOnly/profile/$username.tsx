import { createFileRoute } from "@tanstack/react-router";
import { UserProfilePage } from "@/feature/user/page/UserProfilePage";
import { GeneralError } from "@/feature/errors/general-error";

export const Route = createFileRoute("/_headerOnly/profile/$username")({
	component: function ViewUserProfileRoute() {
		const { username } = Route.useParams();
		return <UserProfilePage viewUsername={username} />;
	},
	errorComponent: () => <GeneralError />,
});
