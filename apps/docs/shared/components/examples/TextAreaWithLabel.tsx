'use client'

import { Label } from '@workspace/ui/components/Field'
import { TextArea } from '@workspace/ui/components/Textfield'

export function TextAreaWithLabel() {
    return (
        <div className="w-full">
            <Label htmlFor="message">Message</Label>
            <TextArea id="message" placeholder="Message" />
        </div>
    )
}
