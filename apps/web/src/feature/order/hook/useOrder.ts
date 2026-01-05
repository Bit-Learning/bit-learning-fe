import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/shared/api/api";
import type { Order, OrderRequest } from "../type/order.type";

export const ORDER_QUERY_KEYS = {
	all: ["orders"] as const,
	lists: () => [...ORDER_QUERY_KEYS.all, "list"] as const,
	list: (filters: string) =>
		[...ORDER_QUERY_KEYS.lists(), { filters }] as const,
};

export const useFetchOrdersByUserId = (userId: number) => {
	return useQuery<Order[]>({
		queryKey: ORDER_QUERY_KEYS.list(`userId=${userId}`),
		queryFn: () => fetchOrdersByUserId(userId),
	});
};

export const fetchOrdersByUserId = async (userId: number): Promise<Order[]> => {
	const response = await api.get(`/orders/users/${userId}`);
	return response.data.data || [];
};

export const useCreateOrder = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createOrder,
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: ORDER_QUERY_KEYS.list(`userId=${data.userId}`),
			});
		},
	});
};

export const createOrder = async (payload: OrderRequest): Promise<Order> => {
	const response = await api.post<Order>("/orders", payload);
	console.log(response);
	return response.data;
};
