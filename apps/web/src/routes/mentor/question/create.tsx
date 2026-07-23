import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import CreateQuestionPage from "@/feature/question/pages/CreateQuestion";
import store from "@/shared/redux/store";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/question/create")({
	beforeLoad: () => {
		const currentUser = selectAuthStateInfo(store.getState());
		const role = currentUser?.userInfo?.role;

		if (role === "STUDENT") {
			throw redirect({ to: "/" });
		}
	},
	component: CreateQuestionPage,
});
