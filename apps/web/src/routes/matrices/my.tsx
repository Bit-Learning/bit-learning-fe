import MyMatrices from '@/feature/matrix/page/MyMatrices'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/matrices/my')({
    component: () => (
        <ProtectedRoute>
            <MyMatrices />
        </ProtectedRoute>
    ),
})
