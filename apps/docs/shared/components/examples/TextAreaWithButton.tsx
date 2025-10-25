import { Button } from '@workspace/ui/components/Button'
import { TextArea } from '@workspace/ui/components/Textfield'

export function TextAreaWithButton() {
    return (
        <div className="grid w-full gap-2">
            <TextArea placeholder="Type your message here..." />
            <Button>Send Message</Button>
        </div>
    )
}
