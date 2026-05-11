import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import ContestInfoPage from "@/feature/contest/pages/ContestInfoPage";
import store from "@/shared/redux/store";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/contests/$id/info")({
  beforeLoad: () => {
    const currentUser = selectAuthStateInfo(store.getState());

    if (!currentUser.isAuthenticated) {
      throw redirect({ to: "/signin-role" });
    }

    if (currentUser.userInfo?.role == "MENTOR") {
      throw redirect({ to: "/" });
    }
  },
  component: ContestInfoPage,
});
