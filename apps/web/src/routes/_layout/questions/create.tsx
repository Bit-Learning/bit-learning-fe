import CreateQuestion from '@/feature/matrix/page/CreateQuestion'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/questions/create')({
    component: () => (
        <ProtectedRoute>
            <CreateQuestion />
        </ProtectedRoute>
    ),
})
