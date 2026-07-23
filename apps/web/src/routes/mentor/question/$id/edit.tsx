import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import EditQuestionPage from "@/feature/question/pages/EditQuestion";
import store from "@/shared/redux/store";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/question/$id/edit")({
	beforeLoad: () => {
		const currentUser = selectAuthStateInfo(store.getState());
		const role = currentUser?.userInfo?.role;

		if (role === "STUDENT") {
			throw redirect({ to: "/" });
		}
	},
	component: EditQuestionPage,
});
