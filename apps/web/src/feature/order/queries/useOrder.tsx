import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/components/Sonner";
import { orderApi } from "../apis/order.api";
import { OrderCreateRequest, PaymentMethod } from "../types/order.type";
import { useNavigate } from "@tanstack/react-router";

export const useMyOrders = (params?: { page?: number; size?: number; sort?: string; direction?: "ASC" | "DESC" }) => {
  return useQuery({
    queryKey: ["orders", "me", params],
    queryFn: async () => {
      const response = await orderApi.getMyOrders(params);
      return response.data;
    },
  });
};

export const useOrdersByUserId = (
  userId: number,
  params?: {
    page?: number;
    size?: number;
    sort?: string;
    direction?: "ASC" | "DESC";
  },
) => {
  return useQuery({
    queryKey: ["orders", "user", userId, params],
    queryFn: async () => {
      const response = await orderApi.getOrdersByUserIdWithPagination(userId, params);
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (request: OrderCreateRequest) => {
      const response = await orderApi.createOrder(request);
      return { data: response.data.data, paymentMethod: request.paymentMethod };
    },
    onSuccess: ({ data, paymentMethod }) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      if (paymentMethod === PaymentMethod.WALLET) {
        navigate({ to: "/payment-result", search: { status: "success" } });
      } else if (data) {
        window.location.href = data;
      } else {
        toast.success({ title: "Đặt hàng thành công" });
      }
    },
    onError: (error: Error) => {
      toast.error({
        title: "Không thể tạo đơn hàng",
        description: error.message,
      });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: number) => orderApi.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success({ title: "Đã hủy đơn hàng" });
    },
    onError: (error: Error) => {
      toast.error({
        title: "Không thể hủy đơn hàng",
        description: error.message,
      });
    },
  });
};
