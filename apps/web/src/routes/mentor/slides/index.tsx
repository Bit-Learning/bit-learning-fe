import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import SlideManagementPage from "@/feature/slides/pages/SlideManagementPage";
import store from "@/shared/redux/store";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/slides/")({
	beforeLoad: () => {
		const currentUser = selectAuthStateInfo(store.getState());
		const role = currentUser?.userInfo?.role;

		if (role === "STUDENT") {
			throw redirect({ to: "/" });
		}
	},
	component: SlideManagementPage,
});
