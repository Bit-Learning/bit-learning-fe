import NewsDetailPage from '@/feature/post/page/NewsDetail'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/news/$id')({
    component: NewsDetailPage,
})
