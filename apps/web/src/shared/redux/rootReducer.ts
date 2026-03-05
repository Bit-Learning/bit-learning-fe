import type { AnyAction, Reducer } from "@reduxjs/toolkit";
import { combineReducers } from "@reduxjs/toolkit";
import course from "@/feature/course/store/course.store";
import learning from "@/feature/lecture/store/learning.store";
import lecture from "@/feature/lecture/store/lecture.store";
import section from "@/feature/lecture/store/section.store";
import mlecture from "@/feature/mentor-course/stores/mlecture.store";
import app from "../../feature/app/stores";
import auth from "../../feature/auth/store";
import cart from "@/feature/order/stores/cart.store";
import forum from "@/feature/forum/stores/forum.store";
import contest from "@/feature/contest/stores/contest.store";

const combineReducer = combineReducers({
  app: app,
  auth: auth,
  course: course,
  section: section,
  lecture: lecture,
  mlecture: mlecture,
  learning: learning,
  cart: cart,
  forum: forum,
  contest: contest,
});

export type RootState = ReturnType<typeof combineReducer>;

const rootReducer: Reducer<RootState, AnyAction> = (state, action) => {
  if (action.type === "logOut") {
    return combineReducer({} as RootState, action);
  }
  return combineReducer(state, action);
};

export default rootReducer;
