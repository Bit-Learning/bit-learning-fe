import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/components/Sonner";
import { useDispatch, useSelector } from "react-redux";
import { cartApi } from "../apis/cart.api";
import {
  setCartItemCountAction,
  incrementCartItemCountAction,
  decrementCartItemCountAction,
} from "../stores/cart.store";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";

export const useCart = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(selectAuthStateInfo);

  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await cartApi.getMyCart();
      const data = response.data.data;

      dispatch(setCartItemCountAction(data?.length || 0));

      return data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: cartApi.addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });

      dispatch(incrementCartItemCountAction());

      toast.success({ title: "Đã thêm vào giỏ hàng" });
    },
    onError: (error: any) => {
      toast.error({ title: "Không thể thêm vào giỏ hàng", description: error?.response?.data?.message });
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: cartApi.removeFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });

      dispatch(decrementCartItemCountAction());

      toast.success({ title: "Đã xóa khỏi giỏ hàng" });
    },
    onError: (error: any) => {
      toast.error({ title: "Không thể xóa khỏi giỏ hàng", description: error?.response?.data?.message });
    },
  });
};
