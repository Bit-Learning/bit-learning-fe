import AboutUsPage from '@/feature/app/page/Aboutus'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
    component: AboutUsPage,
})
