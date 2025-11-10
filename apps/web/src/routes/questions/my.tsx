import MyQuestions from '@/feature/matrix/page/MyQuestions'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/questions/my')({
    component: () => (
        <ProtectedRoute>
            <MyQuestions />
        </ProtectedRoute>
    ),
})
