import EditQuestion from '@/feature/matrix/page/EditQuestion'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/questions/$id/edit')({
    component: () => (
        <ProtectedRoute>
            <EditQuestion />
        </ProtectedRoute>
    ),
})
