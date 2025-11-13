import { useQuery } from '@tanstack/react-query'
import {
  GetAllTransactions,
  GetPagedTransactions,
} from '../api/TransactionService'
import type { Transaction } from '../types/transaction.types'

export const TRANSACTION_QUERY_KEYS = {
  all: ['transactions'] as const,
  lists: () => [...TRANSACTION_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) =>
    [...TRANSACTION_QUERY_KEYS.lists(), { filters }] as const,
  paged: (params: {
    page: number
    size: number
    sortBy: string
    sortDirection: string
  }) => [...TRANSACTION_QUERY_KEYS.all, 'paged', params] as const,
}

export const useAllTransactions = () => {
  return useQuery<Transaction[]>({
    queryKey: TRANSACTION_QUERY_KEYS.all,
    queryFn: async () => {
      const response = await GetAllTransactions()
      return response.data.data || []
    },
  })
}

export const usePagedTransactions = (params: {
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}) => {
  return useQuery({
    queryKey: TRANSACTION_QUERY_KEYS.paged({
      page: params.page ?? 0,
      size: params.size ?? 20,
      sortBy: params.sortBy ?? 'id',
      sortDirection: params.sortDirection ?? 'desc',
    }),
    queryFn: async () => {
      const response = await GetPagedTransactions(params)
      return response.data.data
    },
  })
}
