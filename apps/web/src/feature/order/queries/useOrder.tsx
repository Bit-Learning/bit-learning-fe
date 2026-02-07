import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@workspace/ui/components/Sonner";
import { orderApi } from "../apis/order.api";
import { OrderCreateRequest } from "../types/order.type";

export const useMyOrders = (params?: {
	page?: number;
	size?: number;
	sort?: string;
	direction?: "ASC" | "DESC";
}) => {
	return useQuery({
		queryKey: ["orders", "me", params],
		queryFn: async () => {
			const response = await orderApi.getMyOrders(params);
			return response.data.data;
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
			const response = await orderApi.getOrdersByUserIdWithPagination(
				userId,
				params,
			);
			return response.data.data;
		},
		enabled: !!userId,
	});
};

export const useCreateOrder = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (request: OrderCreateRequest) => {
			const response = await orderApi.createOrder(request);
			return response.data.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["cart"] });
			queryClient.invalidateQueries({ queryKey: ["orders"] });

			if (data) {
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
		mutationFn: orderApi.cancelOrder,
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
