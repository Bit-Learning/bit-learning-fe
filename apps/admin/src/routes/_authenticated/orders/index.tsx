import { createFileRoute } from '@tanstack/react-router'
import { Orders } from '@/features/order'

export const Route = createFileRoute('/_authenticated/orders/')({
  component: Orders,
})
