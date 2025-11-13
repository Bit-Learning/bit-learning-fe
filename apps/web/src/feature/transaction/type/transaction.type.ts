export type TransactionType = 'PURCHASE' | 'DEPOSIT' | 'AI_REQUEST'

export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED'

export type Transaction = {
    id: number
    walletId: number
    orderId: number | null
    amount: number
    type: TransactionType
    status: TransactionStatus
    createdAt: string
}
