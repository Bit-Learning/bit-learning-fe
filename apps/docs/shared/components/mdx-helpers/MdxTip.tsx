import { InfoIcon } from 'lucide-react'

interface MdxTipProps {
    children: React.ReactNode
    title: string
}

export function MdxTip({ children, title = 'Note' }: MdxTipProps) {
    return (
        <div className="mt-4 p-5 pt-0 lg:px-10 lg:pt-0">
            <div className="border-primary-foreground bg-primary/5 rounded-xl border p-5">
                <div className="flex items-center gap-2">
                    <InfoIcon className="text-primary-foreground size-4" />
                    <span className="text-primary-foreground font-medium">{title}</span>
                </div>
                <div className="mt-2">{children}</div>
            </div>
        </div>
    )
}
