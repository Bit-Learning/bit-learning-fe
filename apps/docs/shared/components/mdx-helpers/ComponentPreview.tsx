import { CopyToClipboard } from '@/shared/components/CopyToClipboard'
import { readExampleFile } from '@/shared/lib/composition'
import { highlightCode } from '@/shared/lib/highlight-code'
import { ScrollArea } from '@workspace/ui/components/ScrollArea'
import { cn } from '@workspace/ui/lib/utils'
import dynamic from 'next/dynamic'
import { ComponentPreviewCollapsible } from './ComponentPreviewCollapsible'

export type ComponentPreviewProps = {
    name: string
    className?: string
}

export async function ComponentPreview({ name, className }: ComponentPreviewProps) {
    // get code string from component
    const code = await readExampleFile(name)
    const out = await highlightCode(code)

    return (
        <div className="mt-4 w-full border-b p-5! pt-0! lg:p-10! lg:pt-0!">
            <div className="bg-background space-y-1.5 rounded-xl border p-1.5">
                <div className={cn('not-prose flex min-h-[100px] items-center justify-center p-5', className)}>
                    <Preview name={name} />
                </div>

                <div className="relative overflow-hidden rounded-md border">
                    <CopyToClipboard text={code} className="absolute top-2 right-2 z-[1]" />
                    <div className="">
                        <ScrollArea className="grid" showVerticalScrollbar={false}>
                            <ComponentPreviewCollapsible html={out} />
                        </ScrollArea>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function Preview({ name }: { name: string }) {
    const Component = dynamic(() =>
        import(`../examples/${name}`).then(res => {
            const comp = res[name]

            if (!comp) {
                throw new Error(`Component "${name}" not found in module`)
            }

            return comp
        }),
    )

    return <Component />
}
