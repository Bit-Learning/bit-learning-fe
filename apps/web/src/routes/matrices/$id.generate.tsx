import GenerateExam from '@/feature/matrix/page/GenerateExam'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/matrices/$id/generate')({
    component: () => (
        <ProtectedRoute>
            <GenerateExam />
        </ProtectedRoute>
    ),
})
