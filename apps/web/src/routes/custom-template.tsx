import CreateTemplatePage from '@/feature/templates/pages/CreateTemplatePage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/custom-template')({
    component: CreateTemplatePage,
})
