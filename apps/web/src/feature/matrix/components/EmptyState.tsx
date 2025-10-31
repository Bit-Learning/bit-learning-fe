import { Button } from '@workspace/ui/components/Button'
import { FileSpreadsheet } from 'lucide-react'

interface EmptyStateProps {
    title: string
    description: string
    actionLabel?: string
    onAction?: () => void
    icon?: React.ReactNode
}

export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
    return (
        <div className="py-12 text-center">
            {icon || <FileSpreadsheet className="text-muted-foreground mx-auto mb-4 h-16 w-16" />}
            <h3 className="mb-2 text-xl font-semibold">{title}</h3>
            <p className="text-muted-foreground mb-4">{description}</p>
            {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
        </div>
    )
}
