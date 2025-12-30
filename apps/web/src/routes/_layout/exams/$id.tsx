import ExamDetail from '@/feature/matrix/page/ExamDetail'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/exams/$id')({
    component: () => (
        <ProtectedRoute>
            <ExamDetail />
        </ProtectedRoute>
    ),
})
