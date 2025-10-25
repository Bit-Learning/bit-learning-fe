import { PROJECT_NAME } from '@/shared/consts/common'
import { cn } from '@workspace/ui/lib/utils'
import Link from 'next/link'

export function Logo({ className, withName = true }: { className?: string; withName?: boolean }) {
    return (
        <Link href="/" className={cn('flex w-fit flex-shrink-0 items-center gap-2', className)}>
            <img src="/logo.png" alt="Logo" className="h-6 w-6" />
            {withName && <span className="text-lg font-semibold">{PROJECT_NAME}</span>}
        </Link>
    )
}
