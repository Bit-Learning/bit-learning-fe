import SyllabusList from '@/feature/syllabus/page/SyllabusList'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/syllabuses/')({
    component: () => (
        <ProtectedRoute>
            <SyllabusList />
        </ProtectedRoute>
    ),
})
