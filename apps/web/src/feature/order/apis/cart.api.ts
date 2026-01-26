import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import { CoursePreview } from "@/feature/course/types/course.type";

export const cartApi = {
  addToCart(courseId: number): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.post("/carts/add-new-item", null, {
      params: { courseId },
    });
  },

  removeFromCart(courseId: number): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.delete("/carts/remove-item", {
      params: { courseId },
    });
  },

  getMyCart(): Promise<AxiosResponse<ApiResponse<CoursePreview[]>>> {
    return api.get("/carts/my-cart");
  },
};
