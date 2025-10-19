'use client'

import * as React from 'react'

import { cn } from '@workspace/ui/lib/utils'

import { Spinner } from '@workspace/ui/components/Spinner'
import { Icons } from '@workspace/ui/components/icons'
import { Button } from '@workspace/ui/components/Button'
import { Input } from '@workspace/ui/components/Input'
import { Field, FieldGroup, FieldLabel, FieldSeparator } from '@workspace/ui/components/field'

export function UserAuthForm({ className, ...props }: React.ComponentProps<'div'>) {
    const [isLoading, setIsLoading] = React.useState<boolean>(false)

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)

        setTimeout(() => {
            setIsLoading(false)
        }, 3000)
    }

    return (
        <div className={cn('grid gap-6', className)} {...props}>
            <form onSubmit={onSubmit}>
                <FieldGroup>
                    <Field>
                        <FieldLabel className="sr-only" htmlFor="email">
                            Email
                        </FieldLabel>
                        <Input
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isLoading}
                        />
                    </Field>
                    <Field>
                        <Button isDisabled={isLoading}>
                            {isLoading && <Spinner />}
                            Sign In with Email
                        </Button>
                    </Field>
                </FieldGroup>
            </form>
            <FieldSeparator>Or continue with</FieldSeparator>
            <Button variant="outline" type="button" isDisabled={isLoading}>
                {isLoading ? <Spinner /> : <Icons.gitHub className="mr-2 h-4 w-4" />} GitHub
            </Button>
        </div>
    )
}
