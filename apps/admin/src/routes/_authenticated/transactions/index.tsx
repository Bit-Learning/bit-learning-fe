import { createFileRoute } from '@tanstack/react-router'
import { TransactionManagement } from '@/features/transactions/pages/TransactionManagement'

export const Route = createFileRoute('/_authenticated/transactions/')({
  component: TransactionManagement,
})
