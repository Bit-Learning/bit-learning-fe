import HomePage from '@/feature/app/page/Home'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/')({
    component: HomePage,
})
