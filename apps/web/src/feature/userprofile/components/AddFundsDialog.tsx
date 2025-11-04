import * as React from 'react'

import { Button } from '@workspace/ui/components/Button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
} from '@workspace/ui/components/update/dialog'

interface AddFundsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm?: (amount: number) => void
}

export const AddFundsDialog = ({ open, onOpenChange, onConfirm }: AddFundsDialogProps) => {
    const [amount, setAmount] = React.useState<string>('')
    const MIN_AMOUNT = 10000

    React.useEffect(() => {
        if (open) setAmount('')
    }, [open])

    const parsed = parseFloat(amount)
    const isNumber = !Number.isNaN(parsed)
    const valid = isNumber && parsed >= MIN_AMOUNT

    const handleConfirm = () => {
        if (!valid) return
        onConfirm?.(parsed)
        onOpenChange(false)
    }

    return (
        <Dialog modal open={open} onOpenChange={onOpenChange}>
            <DialogOverlay />
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add funds to wallet</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    <DialogDescription>Enter the amount you want to add to your wallet.</DialogDescription>

                    <div>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="focus:ring-primary w-full rounded-md border bg-transparent px-3 py-2 outline-none focus:ring-2"
                            placeholder="Amount (e.g. 100.00)"
                        />
                    </div>
                    {/* validation message */}
                    {amount !== '' && (!isNumber || parsed < MIN_AMOUNT) && (
                        <p className="text-sm text-red-600">Amount must be greater than or equal 10.000</p>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} isDisabled={!valid}>
                        Add funds
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default AddFundsDialog
