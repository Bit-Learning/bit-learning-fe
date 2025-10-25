'use client'

import { DashboardTableOfContents } from '@/shared/components/Toc'
import { TableOfContents } from '@/shared/lib/toc'
import { ScrollArea } from '@workspace/ui/components/ScrollArea'

export function DocContent({ children, toc }: { children: React.ReactNode; toc: TableOfContents }) {
    return (
        <div className="relative">
            <div className="min-h-full p-6">{children}</div>
            <div className="fixed top-0 right-0 w-[260px] translate-x-[100%]">
                <div className="fixed top-0 grid grid-rows-[auto_1fr] pt-10 pr-10">
                    <ScrollArea className="-ml-px">
                        <DashboardTableOfContents toc={toc} />
                        <div className="h-10"></div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    )
}
