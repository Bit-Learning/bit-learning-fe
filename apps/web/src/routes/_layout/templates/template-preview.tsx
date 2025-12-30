import TemplatePreviewPage from '@/feature/templates/pages/TemplatePreviewPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/templates/template-preview')({
    component: TemplatePreviewPage,
})
