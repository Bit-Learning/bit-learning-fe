import { createFileRoute } from '@tanstack/react-router'
import { TemplateManagement } from '@/features/templates/pages/TemplateManagement'

export const Route = createFileRoute('/_authenticated/templates/')({
  component: TemplateManagement,
})
