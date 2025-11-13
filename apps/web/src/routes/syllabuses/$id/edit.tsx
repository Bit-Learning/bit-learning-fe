import EditSyllabus from '@/feature/syllabus/page/EditSyllabus'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/syllabuses/$id/edit')({
    component: EditSyllabus,
})
