import CreateMatrix from '@/feature/matrix/page/CreateMatrix'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/matrices/create')({
    component: () => (
        <ProtectedRoute>
            <CreateMatrix />
        </ProtectedRoute>
    ),
})
