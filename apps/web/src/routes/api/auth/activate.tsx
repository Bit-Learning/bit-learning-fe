import ActivatePage from '@/feature/auth/page/ActivatePage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/auth/activate')({
    component: ActivatePage,
})
