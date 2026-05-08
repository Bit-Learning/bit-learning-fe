import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { GenerateExamFromQuestionsPage } from "@/feature/exam/pages/GenerateExamFromQuestions";
import store from "@/shared/redux/store";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/exam/generate-from-questions")({
  beforeLoad: () => {
    const currentUser = selectAuthStateInfo(store.getState());
    const role = currentUser?.userInfo?.role;

    if (role === "STUDENT") {
      throw redirect({ to: "/" });
    }
  },
  component: GenerateExamFromQuestionsPage,
});
