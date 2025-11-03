import ImportQuestionBank from '@/feature/matrix/page/ImportQuestionBank'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/matrices/import')({
    component: () => (
        <ProtectedRoute>
            <ImportQuestionBank />
        </ProtectedRoute>
    ),
})
