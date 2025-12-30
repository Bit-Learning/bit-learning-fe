import CreateMatrix from '@/feature/matrix/page/CreateMatrix'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/matrices/$id/edit')({
    component: () => (
        <ProtectedRoute>
            <CreateMatrix />
        </ProtectedRoute>
    ),
})
