import NewsPage from '@/feature/post/page/News'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/news/')({
    component: NewsPage,
})
