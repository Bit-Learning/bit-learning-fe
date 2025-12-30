import NewsDetailPage from '@/feature/post/page/NewsDetail'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/news/$id')({
    component: NewsDetailPage,
})
