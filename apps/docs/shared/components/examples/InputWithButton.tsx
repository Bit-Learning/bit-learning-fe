import { Button } from '@workspace/ui/components/Button'
import { Input } from '@workspace/ui/components/Textfield'

export function InputWithButton() {
    return (
        <div className="flex w-full items-center gap-2">
            <Input placeholder="Email" />
            <Button>Subscribe</Button>
        </div>
    )
}
