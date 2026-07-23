import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { MyExamsPage } from "@/feature/exam/pages/MyExam";
import store from "@/shared/redux/store";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/exam/my")({
	beforeLoad: () => {
		const currentUser = selectAuthStateInfo(store.getState());
		const role = currentUser?.userInfo?.role;

		if (role === "STUDENT") {
			throw redirect({ to: "/" });
		}
	},
	component: MyExamsPage,
});
