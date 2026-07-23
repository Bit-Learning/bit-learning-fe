import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import ImportQuestionPage from "@/feature/question/pages/ImportQuestion";
import store from "@/shared/redux/store";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/question/import")({
	beforeLoad: () => {
		const currentUser = selectAuthStateInfo(store.getState());
		const role = currentUser?.userInfo?.role;

		if (role === "STUDENT") {
			throw redirect({ to: "/" });
		}
	},
	component: ImportQuestionPage,
});
