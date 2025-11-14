import CreateSyllabus from '@/feature/syllabus/page/CreateSyllabus'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/syllabuses/create')({
    component: () => (
        <ProtectedRoute>
            <CreateSyllabus />
        </ProtectedRoute>
    ),
})
