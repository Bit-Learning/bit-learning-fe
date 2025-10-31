import ImportQuestionBank from '@/feature/matrix/page/ImportQuestionBank'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/matrices/import')({
    component: ImportQuestionBank,
})
