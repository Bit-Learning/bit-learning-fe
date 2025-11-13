import CreateQuestion from '@/feature/matrix/page/CreateQuestion'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/questions/create')({
    component: () => (
        <ProtectedRoute>
            <CreateQuestion />
        </ProtectedRoute>
    ),
})
