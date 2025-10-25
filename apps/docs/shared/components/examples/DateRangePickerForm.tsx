'use client'

import { toast } from '@workspace/ui/components/Sonner'
import { useForm } from 'react-hook-form'

import { Button } from '@workspace/ui/components/Button'
import { BsDateRangePicker, BsDateRangePickerValue } from '@workspace/ui/components/DatePicker'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@workspace/ui/components/Form'

interface FormValues {
    dateRange?: BsDateRangePickerValue
}

export function DateRangePickerForm() {
    const form = useForm<FormValues>()

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
                    name="dateRange"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date Range</FormLabel>
                            <FormControl>
                                <BsDateRangePicker {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant="outline">
                        Canel
                    </Button>
                    <Button type="submit">Submit</Button>
                </div>
            </form>
        </Form>
    )
}
