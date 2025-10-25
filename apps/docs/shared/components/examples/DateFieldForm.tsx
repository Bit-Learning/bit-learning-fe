'use client'

import { toast } from '@workspace/ui/components/Sonner'
import { useForm } from 'react-hook-form'

import { Button } from '@workspace/ui/components/Button'
import { BsDateField } from '@workspace/ui/components/Datefield'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@workspace/ui/components/Form'

interface FormValues {
    eventDate: string
}

export function DateFieldForm() {
    const form = useForm<FormValues>({
        defaultValues: {
            eventDate: '',
        },
    })

    function onSubmit(data: FormValues) {
        toast.neutral({
            title: 'You submitted the following values',
            description: (
                <pre>
                    <code>{JSON.stringify(data, null, 2)}</code>
                </pre>
            ),
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
                <FormField
                    control={form.control}
                    name="eventDate"
                    rules={{
                        required: 'Event date is required',
                    }}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Event Date</FormLabel>
                            <FormControl>
                                <BsDateField {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    )
}
