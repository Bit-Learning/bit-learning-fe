'use client'

import React from 'react'
import {
    Input as AriaInput,
    InputProps as AriaInputProps,
    TextArea as AriaTextArea,
    TextAreaProps as AriaTextAreaProps,
    TextField as AriaTextField,
    TextFieldProps as AriaTextFieldProps,
    composeRenderProps,
} from 'react-aria-components'

import { FieldGroup } from '@workspace/ui/components/Field'
import { cn } from '@workspace/ui/lib/utils'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { Button } from './Button'

const Input = ({ className, ...props }: AriaInputProps) => {
    return (
        <AriaInput
            autoComplete="off"
            className={composeRenderProps(className, className =>
                cn(
                    'bg-background-secondary ring-offset-background placeholder:text-muted-foreground flex h-8 w-full rounded-sm px-3 py-1.5 shadow-sm file:border-0 file:bg-transparent file:text-sm file:font-medium md:text-sm',
                    'ring-input ring ring-inset',
                    /* Focus Within */
                    'data-[focused]:ring-primary aria-invalid:ring-destructive transition-all data-[focused]:ring-2',
                    /* Disabled */
                    'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-80',
                    /* Resets */
                    'focus-visible:outline-none',
                    className,
                ),
            )}
            {...props}
        />
    )
}

interface PasswordInputProps extends AriaTextFieldProps {
    placeholder?: string
}

const PasswordInput = ({ className, ...props }: PasswordInputProps) => {
    const [isVisible, setIsVisible] = React.useState(false)

    return (
        <AriaTextField {...props} isInvalid={(props as any)['aria-invalid']}>
            <FieldGroup className={cn('py-0 pr-1 pl-3', className)}>
                <AriaInput
                    type={isVisible ? 'text' : 'password'}
                    className="h-full flex-1 focus-visible:outline-none"
                />
                <Button variant="ghost" size="iconSm" onClick={() => setIsVisible(!isVisible)}>
                    {isVisible ? <EyeIcon /> : <EyeOffIcon />}
                </Button>
            </FieldGroup>
        </AriaTextField>
    )
}

const TextArea = ({ className, ...props }: AriaTextAreaProps) => {
    return (
        <AriaTextArea
            className={composeRenderProps(className, className =>
                cn(
                    'bg-background-secondary ring-offset-background placeholder:text-muted-foreground flex min-h-[80px] w-full rounded-sm px-3 py-2 shadow-sm md:text-sm',
                    'ring-input ring ring-inset',
                    /* Focus Within */
                    'data-[focused]:ring-primary aria-invalid:ring-destructive transition-all data-[focused]:ring-2',
                    /* Disabled */
                    'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-80',
                    /* Resets */
                    'focus-visible:outline-none',
                    className,
                ),
            )}
            {...props}
        />
    )
}

export { Input, PasswordInput, TextArea }
