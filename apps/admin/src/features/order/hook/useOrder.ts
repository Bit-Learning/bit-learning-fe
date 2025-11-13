import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/shared/api/api'
import type { Order, OrderRequest } from '../type/order.type'

export const ORDER_QUERY_KEYS = {
  all: ['orders'] as const,
  lists: () => [...ORDER_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) =>
    [...ORDER_QUERY_KEYS.lists(), { filters }] as const,
  detail: (id: number) => [...ORDER_QUERY_KEYS.all, 'detail', id] as const,
}

// Admin: Fetch all orders
export const useFetchAllOrders = () => {
  return useQuery<Order[]>({
    queryKey: ORDER_QUERY_KEYS.lists(),
    queryFn: fetchAllOrders,
  })
}

export const fetchAllOrders = async (): Promise<Order[]> => {
  const response = await api.get('/orders')
  return response.data.data || []
}

// Fetch orders by user ID (for admin viewing specific user orders)
export const useFetchOrdersByUserId = (userId: number) => {
  return useQuery<Order[]>({
    queryKey: ORDER_QUERY_KEYS.list(`userId=${userId}`),
    queryFn: () => fetchOrdersByUserId(userId),
    enabled: !!userId,
  })
}

export const fetchOrdersByUserId = async (userId: number): Promise<Order[]> => {
  const response = await api.get(`/api/orders/users/${userId}`)
  return response.data.data || []
}

// Fetch single order details
export const useFetchOrderById = (orderId: number) => {
  return useQuery<Order>({
    queryKey: ORDER_QUERY_KEYS.detail(orderId),
    queryFn: () => fetchOrderById(orderId),
    enabled: !!orderId,
  })
}

export const fetchOrderById = async (orderId: number): Promise<Order> => {
  const response = await api.get(`/api/orders/${orderId}`)
  return response.data.data
}

// Create order
export const useCreateOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ORDER_QUERY_KEYS.lists(),
      })
    },
  })
}

export const createOrder = async (payload: OrderRequest): Promise<Order> => {
  const response = await api.post<Order>('/api/orders', payload)
  return response.data
}

// Update order status (admin only)
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ORDER_QUERY_KEYS.lists(),
      })
    },
  })
}

export const updateOrderStatus = async (
  orderId: number,
  status: string
): Promise<Order> => {
  const response = await api.patch(`/api/orders/${orderId}/status`, { status })
  return response.data
}

// Delete order (admin only)
export const useDeleteOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ORDER_QUERY_KEYS.lists(),
      })
    },
  })
}

export const deleteOrder = async (orderId: number): Promise<void> => {
  await api.delete(`/api/orders/${orderId}`)
}
