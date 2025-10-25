'use client'
import { Button } from '@workspace/ui/components/Button'
import { cn } from '@workspace/ui/lib/utils'
import { ChevronDown, ChevronUp } from 'lucide-react'
import React from 'react'

interface ComponentPreviewCollapsibleProps {
    html: string
}

export function ComponentPreviewCollapsible({ html }: ComponentPreviewCollapsibleProps) {
    const [previewHeight, setPreviewHeight] = React.useState(0)
    const previewRef = React.useRef<HTMLDivElement>(null)
    const [isOpen, setIsOpen] = React.useState(false)

    const showCollapseButton = previewHeight > 200

    React.useEffect(() => {
        if (previewRef.current) {
            const preTag = previewRef.current.querySelector('pre')
            if (preTag) {
                setPreviewHeight(preTag.clientHeight)
            }
        }
    }, [])

    return (
        <div>
            <div
                ref={previewRef}
                dangerouslySetInnerHTML={{ __html: html }}
                className={cn('relative [&>pre]:my-0 [&>pre]:rounded-none [&>pre]:pb-8', !isOpen && 'max-h-[200px]')}
            />
            {showCollapseButton && (
                <div className="from-background-secondary pointer-events-none absolute right-0 bottom-0 left-0 flex h-16 items-center justify-center bg-gradient-to-t to-transparent">
                    <Button variant="outline" onClick={() => setIsOpen(!isOpen)} className="pointer-events-auto">
                        {isOpen ? (
                            <>
                                <ChevronUp />
                                Collapse code
                            </>
                        ) : (
                            <>
                                <ChevronDown />
                                Expand code
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    )
}
