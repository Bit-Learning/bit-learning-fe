'use client'

import { BsRangeCalendar, BsRangeCalendarValue } from '@workspace/ui/components/Calendar'
import { useState } from 'react'

export function RangeCalendarControlled() {
    const [value, setValue] = useState<BsRangeCalendarValue>()

    return (
        <div className="flex flex-col gap-2">
            <BsRangeCalendar value={value} onChange={setValue} />
            <pre className="bg-background-secondary rounded-md border p-2 font-mono text-xs">
                {value ? JSON.stringify(value, null, 2) : 'No value'}
            </pre>
        </div>
    )
}
