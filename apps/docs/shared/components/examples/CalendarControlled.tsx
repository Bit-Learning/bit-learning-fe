'use client'

import { BsCalendar } from '@workspace/ui/components/Calendar'
import { useState } from 'react'

export function CalendarControlled() {
    const [value, setValue] = useState<string>()

    return (
        <div className="flex flex-col gap-2">
            <BsCalendar value={value} onChange={setValue} />
            <pre className="bg-background-secondary rounded-md border p-2 font-mono text-xs">
                {value ? JSON.stringify(value) : 'No value'}
            </pre>
        </div>
    )
}
