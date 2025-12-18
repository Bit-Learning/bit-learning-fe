import GitHubCallbackPage from '@/feature/auth/page/GitHubCallBackPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/github/callback')({
    component: GitHubCallbackPage,
})
