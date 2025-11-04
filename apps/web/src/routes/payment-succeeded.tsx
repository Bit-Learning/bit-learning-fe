import PaymentSucceeded from '@/feature/payment/page/PaymentSucceeded'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/payment-succeeded')({
    component: PaymentSucceeded,
})
