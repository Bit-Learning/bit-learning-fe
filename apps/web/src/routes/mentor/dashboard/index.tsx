import { createFileRoute, redirect } from "@tanstack/react-router";
import DashboardPage from "@/feature/mentor-dashboard/page";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import store from "@/shared/redux/store";

export const Route = createFileRoute("/mentor/dashboard/")({
	beforeLoad: () => {
		const currentUser = selectAuthStateInfo(store.getState());
		const role = currentUser?.userInfo?.role;

		if (role === "STUDENT") {
			throw redirect({ to: "/" });
		}
	},
	component: DashboardPage,
});
