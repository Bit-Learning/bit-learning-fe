import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { GenerateExamPage } from "@/feature/exam/pages/GenerateExam";
import store from "@/shared/redux/store";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/matrix/$id/generate")({
	beforeLoad: () => {
		const currentUser = selectAuthStateInfo(store.getState());
		const role = currentUser?.userInfo?.role;

		if (role === "STUDENT") {
			throw redirect({ to: "/" });
		}
	},
	validateSearch: (search) => ({
		versionId: Number(search.versionId),
	}),
	component: GenerateExamPage,
});
