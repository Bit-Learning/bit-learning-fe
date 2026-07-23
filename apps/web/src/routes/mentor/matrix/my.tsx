import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import MyMatricesPage from "@/feature/matrix/page/MyMatrices";
import store from "@/shared/redux/store";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/matrix/my")({
	beforeLoad: () => {
		const currentUser = selectAuthStateInfo(store.getState());
		const role = currentUser?.userInfo?.role;

		if (role === "STUDENT") {
			throw redirect({ to: "/" });
		}
	},
	component: MyMatricesPage,
});
