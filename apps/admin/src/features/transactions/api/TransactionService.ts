import type { AxiosResponse } from 'axios'
import api from '@/shared/api/api'
import type { PagedTransactions, Transaction } from '../types/transaction.types'

interface GetPagedTransactionsParams {
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

export function GetAllTransactions(): Promise<
  AxiosResponse<{ code: number; message: string; data: Transaction[] }>
> {
  return api.get('/payment/all')
}

export function GetPagedTransactions(
  params: GetPagedTransactionsParams = {}
): Promise<AxiosResponse<PagedTransactions>> {
  const { page = 0, size = 20, sortBy = 'id', sortDirection = 'desc' } = params

  const queryParams = new URLSearchParams()
  queryParams.append('page', page.toString())
  queryParams.append('size', size.toString())
  queryParams.append('sortBy', sortBy)
  queryParams.append('sortDirection', sortDirection)

  return api.get(`/payment/all-paged?${queryParams.toString()}`)
}
