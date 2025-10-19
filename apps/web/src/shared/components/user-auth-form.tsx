'use client'

import { useAuth } from '@/shared/context/AuthContext'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/Button'
import { Input } from '@workspace/ui/components/Input'
import { Spinner } from '@workspace/ui/components/Spinner'
import { Icons } from '@workspace/ui/components/icons'
import { Field, FieldGroup, FieldLabel, FieldSeparator } from '@workspace/ui/components/update/field'
import { cn } from '@workspace/ui/lib/utils'
import { Eye, EyeOff } from 'lucide-react'
import * as React from 'react'

export function UserAuthForm({ className, ...props }: React.ComponentProps<'div'>) {
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [username, setUsername] = React.useState<string>('')
    const [password, setPassword] = React.useState<string>('')
    const [error, setError] = React.useState<string>('')
    const [showPassword, setShowPassword] = React.useState<boolean>(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            await login(username, password)
            // Redirect to user profile or home page after successful login
            navigate({ to: '/user-profile' })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
            console.error('Login error:', err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={cn('grid gap-6', className)} {...props}>
            <form onSubmit={onSubmit}>
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="username">Username</FieldLabel>
                        <Input
                            id="username"
                            placeholder="Enter your username"
                            type="text"
                            autoCapitalize="none"
                            autoComplete="username"
                            autoCorrect="off"
                            disabled={isLoading}
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <div className="relative">
                            <Input
                                id="password"
                                placeholder="Enter your password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                disabled={isLoading}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                                disabled={isLoading}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </Field>
                    {error && <div className="text-sm text-red-500">{error}</div>}
                    <Field>
                        <Button isDisabled={isLoading} type="submit">
                            {isLoading && <Spinner />}
                            Sign In
                        </Button>
                    </Field>
                </FieldGroup>
            </form>
            <FieldSeparator>Or continue with</FieldSeparator>
            <div className="flex items-center justify-between gap-2">
                <Button variant="outline" type="button" isDisabled={isLoading}>
                    {isLoading ? <Spinner /> : <Icons.google className="mr-2 h-4 w-4" />} Google
                </Button>
                <Button variant="outline" type="button" isDisabled={isLoading}>
                    {isLoading ? <Spinner /> : <Icons.apple className="mr-2 h-4 w-4" />} Apple
                </Button>
                <Button variant="outline" type="button" isDisabled={isLoading}>
                    {isLoading ? <Spinner /> : <Icons.gitHub className="mr-2 h-4 w-4" />} GitHub
                </Button>
            </div>
        </div>
    )
}
