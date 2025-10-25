'use client'

import { Label } from '@workspace/ui/components/Field'
import { Input } from '@workspace/ui/components/Textfield'

export function InputWithLabel() {
    return (
        <div className="w-full">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Password" />
        </div>
    )
}
