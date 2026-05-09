import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import MindMapPage from "@/feature/mindmap/pages/MindMapPage";
import store from "@/shared/redux/store";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/mindmap/")({
  beforeLoad: () => {
    const currentUser = selectAuthStateInfo(store.getState());
    const role = currentUser?.userInfo?.role;

    if (role === "STUDENT") {
      throw redirect({ to: "/" });
    }
  },
  component: MindMapPage,
});
