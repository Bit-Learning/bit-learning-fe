'use client'

import { Button } from '@workspace/ui/components/Button'
import { Popover, PopoverDialog, PopoverTrigger } from '@workspace/ui/components/Popover'
import { cn } from '@workspace/ui/lib/utils'
import { BookIcon, ChevronDown, Layers2Icon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export enum ModuleValue {
    Overview = 'guide',
    UI = 'ui',
}

interface Module {
    value: ModuleValue
    label: string
    icon: React.ReactNode
    description: string
    className?: string
}

const modules: Module[] = [
    {
        value: ModuleValue.Overview,
        label: 'Guide',
        icon: <BookIcon className="size-4!" />,
        description: 'Overview and guide',
        className: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
    {
        value: ModuleValue.UI,
        label: 'Components',
        icon: <Layers2Icon className="size-4!" />,
        description: 'Re-usable components',
        className: 'text-green-500 bg-green-500/10 border-green-500/20',
    },
]

export function ModulePicker() {
    const selectedModule = useModulePicker()

    return (
        <div className="relative z-[2] px-6 pt-6 pb-2">
            <PopoverTrigger>
                <Button variant="unstyled" className="flex w-full items-center gap-2 p-0 text-start transition-colors">
                    <ModuleItem module={selectedModule} />
                    <ChevronDown className="ml-auto h-4 w-4 text-neutral-500" />
                </Button>
                <Popover offset={8} className="rounded-[12px]">
                    <PopoverDialog className="w-(--trigger-width) p-1">
                        {({ close }) => (
                            <div className="flex flex-col gap-1">
                                {modules.map(item => {
                                    const isSelected = item.value === selectedModule.value

                                    return (
                                        <Link
                                            onClick={close}
                                            key={item.value}
                                            href={`/docs/${item.value}`}
                                            className={cn(
                                                'flex w-full items-center gap-2 rounded-md p-1 text-start hover:bg-neutral-400/5',
                                                isSelected && 'bg-neutral-400/10!',
                                            )}
                                        >
                                            <ModuleItem module={item} />
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </PopoverDialog>
                </Popover>
            </PopoverTrigger>
        </div>
    )
}

function ModuleItem({ module }: { module: Module }) {
    return (
        <>
            <div className={cn('grid h-9 w-9 place-items-center rounded-sm bg-neutral-400/10', module.className)}>
                {module.icon}
            </div>
            <div>
                <p className="text-sm font-semibold">{module.label}</p>
                <p className="text-muted-foreground text-xs whitespace-nowrap">{module.description}</p>
            </div>
        </>
    )
}

export function useModulePicker() {
    const pathname = usePathname()
    const selectedModule = modules.find(item => pathname.startsWith(`/docs/${item.value}`)) || modules[0]

    return selectedModule
}
