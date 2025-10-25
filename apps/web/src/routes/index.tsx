import HomePage from '@/feature/app/page/Home'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
    component: HomePage,
})
