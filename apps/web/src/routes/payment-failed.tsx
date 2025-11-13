import PaymentFailed from '@/feature/payment/page/PaymentFailed'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/payment-failed')({
    component: PaymentFailed,
})
