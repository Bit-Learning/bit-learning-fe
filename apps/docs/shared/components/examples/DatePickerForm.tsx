'use client'

import { toast } from '@workspace/ui/components/Sonner'
import { useForm } from 'react-hook-form'

import { Button } from '@workspace/ui/components/Button'
import { BsDatePicker } from '@workspace/ui/components/DatePicker'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@workspace/ui/components/Form'

interface FormValues {
    startDate: string
}

export function DatePickerForm() {
    const form = useForm<FormValues>({
        defaultValues: {
            startDate: '',
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
                    name="startDate"
                    rules={{
                        required: 'Start date is required',
                    }}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                                <BsDatePicker {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant="outline">
                        Cancel
                    </Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Form>
    )
}
