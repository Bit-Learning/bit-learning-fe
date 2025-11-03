import MatrixList from '@/feature/matrix/page/MatrixList'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/matrices/')({
    component: () => (
        <ProtectedRoute>
            <MatrixList />
        </ProtectedRoute>
    ),
})
