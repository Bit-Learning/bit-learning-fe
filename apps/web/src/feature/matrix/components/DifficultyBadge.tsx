import { Badge } from '@workspace/ui/components/Badge'
import { getDifficultyBadgeColor, getDifficultyLabel } from '../utils/matrix.utils'

interface DifficultyBadgeProps {
    level: string
    className?: string
}

export function DifficultyBadge({ level, className }: DifficultyBadgeProps) {
    return <Badge className={`${getDifficultyBadgeColor(level)} ${className || ''}`}>{getDifficultyLabel(level)}</Badge>
}
