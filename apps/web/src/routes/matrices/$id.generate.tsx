import GenerateExam from '@/feature/matrix/page/GenerateExam'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/matrices/$id/generate')({
    component: GenerateExam,
})
