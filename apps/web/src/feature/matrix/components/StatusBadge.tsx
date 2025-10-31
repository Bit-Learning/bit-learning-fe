import { Badge } from '@workspace/ui/components/Badge'

interface StatusBadgeProps {
    isActive: boolean
    className?: string
}

export function StatusBadge({ isActive, className }: StatusBadgeProps) {
    return isActive ? (
        <Badge className={`bg-green-500 ${className || ''}`}>Đang hoạt động</Badge>
    ) : (
        <Badge className={`bg-gray-500 ${className || ''}`}>Không hoạt động</Badge>
    )
}
