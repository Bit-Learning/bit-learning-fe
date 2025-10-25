import { Button } from '@workspace/ui/components/Button'
import { Label } from '@workspace/ui/components/Field'
import { LoadingOverlay } from '@workspace/ui/components/LoadingOverlay'
import { Input } from '@workspace/ui/components/Textfield'

export function LoadingOverlayDemo() {
    return (
        <LoadingOverlay isLoading={true}>
            <div className="w-full max-w-[350px] space-y-4">
                <div className="space-y-2">
                    <div>
                        <Label>Email</Label>
                        <Input placeholder="Enter your email" />
                    </div>
                    <div>
                        <Label>Password</Label>
                        <Input placeholder="Enter your password" />
                    </div>
                </div>
                <Button className="w-full">Login</Button>
            </div>
        </LoadingOverlay>
    )
}
