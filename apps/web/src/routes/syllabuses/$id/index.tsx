import SyllabusDetail from '@/feature/syllabus/page/SyllabusDetail'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/syllabuses/$id/')({
    component: SyllabusDetail,
})
