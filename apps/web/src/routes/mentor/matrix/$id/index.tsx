import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import MatrixDetailPage from "@/feature/matrix/page/MatrixDetailPage";
import store from "@/shared/redux/store";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/matrix/$id/")({
  beforeLoad: () => {
    const currentUser = selectAuthStateInfo(store.getState());
    const role = currentUser?.userInfo?.role;

    if (role === "STUDENT") {
      throw redirect({ to: "/" });
    }
  },
  component: MatrixDetailPage,
});
