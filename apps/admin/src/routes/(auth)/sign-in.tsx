import { z } from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { getAccessToken } from '@/lib/cookies'
import { SignIn } from '@/features/auth/sign-in'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/sign-in')({
  beforeLoad: async () => {
    const accessToken = getAccessToken()

    // If already logged in, redirect to dashboard
    if (accessToken) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: SignIn,
  validateSearch: searchSchema,
})
