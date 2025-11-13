import MyExams from '@/feature/matrix/page/MyExams'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/exams/my-exams')({
    component: MyExams,
})
