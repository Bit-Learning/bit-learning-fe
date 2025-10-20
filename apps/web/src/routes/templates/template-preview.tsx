import TemplatePreviewPage from '@/feature/templates/pages/TemplatePreviewPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/templates/template-preview')({
    component: TemplatePreviewPage,
})
