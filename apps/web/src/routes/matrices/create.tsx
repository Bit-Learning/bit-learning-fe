import CreateMatrix from '@/feature/matrix/page/CreateMatrix'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/matrices/create')({
    component: CreateMatrix,
})
