import MatrixList from '@/feature/matrix/page/MatrixList'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/matrices/')({
    component: MatrixList,
})
