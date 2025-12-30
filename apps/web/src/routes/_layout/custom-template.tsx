import CreateTemplatePage from '@/feature/templates/pages/CreateTemplatePage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/custom-template')({
    component: CreateTemplatePage,
})
