import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { MentorProblemDetailPage } from "@/feature/code-practice/pages/MentorProblemDetail";
import store from "@/shared/redux/store";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/problem/$id/")({
	beforeLoad: () => {
		const currentUser = selectAuthStateInfo(store.getState());
		const role = currentUser?.userInfo?.role;

		if (role === "STUDENT") {
			throw redirect({ to: "/" });
		}
	},
	component: MentorProblemDetailPage,
});
