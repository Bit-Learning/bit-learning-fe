import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import { CartInfo } from "../types/cart.type";

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

  getMyCart(): Promise<AxiosResponse<ApiResponse<CartInfo>>> {
    return api.get("/carts/my-cart");
  },
};
