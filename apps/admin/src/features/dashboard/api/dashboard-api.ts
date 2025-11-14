import api from '@/shared/api/api'
import type {
  OrderDashboardStats,
  UserDashboardStats,
  PaymentDashboardStats,
} from '../types/dashboard.types'

/**
 * API response wrapper
 */
interface ApiResponse<T> {
  status: number
  message: string
  data: T
}

/**
 * Get order dashboard statistics
 * @returns Order statistics including total orders, revenue, and status breakdown
 */
export async function getOrderStats() {
  const response = await api.get<ApiResponse<OrderDashboardStats>>(
    '/orders/dashboard/stats'
  )
  return response.data.data
}

/**
 * Get user dashboard statistics
 * @returns User statistics including total users, new users, and active users
 */
export async function getUserStats() {
  const response = await api.get<ApiResponse<UserDashboardStats>>(
    '/users/dashboard/stats'
  )
  return response.data.data
}

/**
 * Get payment dashboard statistics
 * @returns Payment statistics including total transactions, revenue, and status breakdown
 */
export async function getPaymentStats() {
  const response = await api.get<ApiResponse<PaymentDashboardStats>>(
    '/payment/dashboard/stats'
  )
  return response.data.data
}

/**
 * Get all dashboard statistics at once
 * @returns Combined statistics from all services
 */
export async function getAllDashboardStats() {
  const [orders, users, payments] = await Promise.all([
    getOrderStats(),
    getUserStats(),
    getPaymentStats(),
  ])

  return { orders, users, payments }
}
