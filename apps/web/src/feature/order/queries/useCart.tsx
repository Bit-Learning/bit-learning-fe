import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@workspace/ui/components/Sonner";
import { cartApi } from "../apis/cart.api";

export const useCart = () => {
  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await cartApi.getMyCart();
      return response.data.data;
    },
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartApi.addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success({ title: "Đã thêm vào giỏ hàng" });
    },
    onError: (error: Error) => {
      toast.error({ title: "Không thể thêm vào giỏ hàng", description: error.message });
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartApi.removeFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success({ title: "Đã xóa khỏi giỏ hàng" });
    },
    onError: (error: Error) => {
      toast.error({ title: "Không thể xóa khỏi giỏ hàng", description: error.message });
    },
  });
};
