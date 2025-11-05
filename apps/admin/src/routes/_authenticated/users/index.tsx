import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Users } from '@/features/users'
import { roles } from '@/features/users/data/data'

const usersSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  // Facet filters
  activated: z
    .array(z.union([z.literal('true'), z.literal('false')]))
    .optional()
    .catch([]),
  role: z
    .array(z.enum(roles.map((r) => r.value as (typeof roles)[number]['value'])))
    .optional()
    .catch([]),
  // Per-column text filter (example for email)
  email: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/users/')({
  validateSearch: usersSearchSchema,
  component: Users,
})
