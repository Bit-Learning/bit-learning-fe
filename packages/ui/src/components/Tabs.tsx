'use client'

import {
    Tab as AriaTab,
    TabList as AriaTabList,
    TabListProps as AriaTabListProps,
    TabPanel as AriaTabPanel,
    TabPanelProps as AriaTabPanelProps,
    TabProps as AriaTabProps,
    Tabs as AriaTabs,
    TabsProps as AriaTabsProps,
    composeRenderProps,
} from 'react-aria-components'

import { cn } from '@workspace/ui/lib/utils'

function Tabs({ className, ...props }: AriaTabsProps) {
    return (
        <AriaTabs
            className={composeRenderProps(className, className =>
                cn(
                    'group flex flex-col gap-2',
                    /* Orientation */
                    'data-[orientation=vertical]:flex-row',
                    className,
                ),
            )}
            {...props}
        />
    )
}

const TabList = <T extends object>({ className, ...props }: AriaTabListProps<T>) => (
    <AriaTabList
        className={composeRenderProps(className, className =>
            cn(
                'bg-muted text-muted-foreground inline-flex h-10 items-center justify-center rounded-md p-1',
                /* Orientation */
                'data-[orientation=vertical]:h-auto data-[orientation=vertical]:flex-col',
                className,
            ),
        )}
        {...props}
    />
)

const Tab = ({ className, ...props }: AriaTabProps) => (
    <AriaTab
        className={composeRenderProps(className, className =>
            cn(
                'ring-offset-background inline-flex cursor-pointer justify-center rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all outline-none',
                /* Focus Visible */
                'data-[focus-visible]:ring-ring data-[focus-visible]:ring-2 data-[focus-visible]:ring-offset-2',
                /* Disabled */
                'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                /* Selected */
                'data-[selected]:bg-background data-[selected]:text-foreground data-[selected]:shadow-sm',
                /* Orientation */
                'group-data-[orientation=vertical]:w-full',
                className,
            ),
        )}
        {...props}
    />
)

const TabPanel = ({ className, ...props }: AriaTabPanelProps) => (
    <AriaTabPanel
        className={composeRenderProps(className, className =>
            cn(
                'ring-offset-background mt-2',
                /* Focus Visible */
                'data-[focus-visible]:ring-ring data-[focus-visible]:ring-2 data-[focus-visible]:ring-offset-2 data-[focus-visible]:outline-none',
                className,
            ),
        )}
        {...props}
    />
)

export { Tab, TabList, TabPanel, Tabs }
