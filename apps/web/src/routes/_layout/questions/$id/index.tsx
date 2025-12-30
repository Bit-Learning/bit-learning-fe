import QuestionDetail from '@/feature/matrix/page/QuestionDetail'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/questions/$id/')({
    component: () => (
        <ProtectedRoute>
            <QuestionDetail />
        </ProtectedRoute>
    ),
})
