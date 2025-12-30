import MySyllabuses from '@/feature/syllabus/page/MySyllabuses'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/syllabuses/my')({
    component: () => (
        <ProtectedRoute>
            <MySyllabuses />
        </ProtectedRoute>
    ),
})
