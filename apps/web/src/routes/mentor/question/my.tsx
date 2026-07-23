import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import MyQuestionsPage from "@/feature/question/pages/MyQuestions";
import store from "@/shared/redux/store";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/question/my")({
	beforeLoad: () => {
		const currentUser = selectAuthStateInfo(store.getState());
		const role = currentUser?.userInfo?.role;

		if (role === "STUDENT") {
			throw redirect({ to: "/" });
		}
	},
	component: MyQuestionsPage,
});
