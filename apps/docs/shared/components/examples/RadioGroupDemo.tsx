'use client'

import { Label } from '@workspace/ui/components/Field'
import { Radio, RadioGroup } from '@workspace/ui/components/RadioGroup'

export function RadioGroupDemo() {
    return (
        <RadioGroup>
            <Label>Color</Label>
            <Radio value="red">Red</Radio>
            <Radio value="green">Green</Radio>
            <Radio value="blue">Blue</Radio>
        </RadioGroup>
    )
}
