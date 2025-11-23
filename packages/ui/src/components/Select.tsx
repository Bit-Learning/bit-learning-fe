'use client'

import { Badge } from '@workspace/ui/components/Badge'
import { Button } from '@workspace/ui/components/Button'
import { Popover } from '@workspace/ui/components/Popover'
import { BsSearchField } from '@workspace/ui/components/Searchfield'
import { cn } from '@workspace/ui/lib/utils'
import { CheckIcon, ChevronDownIcon, XIcon } from 'lucide-react'
import React from 'react'
import type { ListBoxItemProps } from 'react-aria-components'
import {
    Autocomplete,
    ListBox,
    ListBoxItem,
    Select,
    SelectProps,
    SelectStateContext,
    SelectValue,
    useFilter,
} from 'react-aria-components'

interface BsSelectOption {
    id: string | number
    name: string
}

interface BsSelectProps<T extends BsSelectOption, M extends 'single' | 'multiple'>
    extends Omit<SelectProps<T, M>, 'children'> {
    /**
     * The array of options to display in the select dropdown.
     */
    options?: Iterable<T>

    /**
     * If true, enables a search field for filtering options.
     */
    isSearchable?: boolean

    /**
     * Custom render function for the selected value display.
     */
    renderValue?: (value: T) => React.ReactNode

    /**
     * Custom render function for each option in the dropdown.
     */
    renderOption?: (item: T) => React.ReactNode

    /**
     * The maximum number of badges to display. To show all badges, set to Infinity.
     */
    maxVisibleBadges?: number

    /**
     * If true, the clear button will be shown.
     */
    isClearable?: boolean

    /**
     * The class name of the select.
     */
    className?: string

    /**
     * The class name of the popover.
     */
    popoverClassName?: string
}

export function BsSelect<T extends BsSelectOption, M extends 'single' | 'multiple' = 'single'>({
    options,
    renderOption,
    renderValue,
    isClearable,
    maxVisibleBadges = 2,
    placeholder = 'Select',
    isSearchable = false,
    popoverClassName,
    className,
    ...props
}: BsSelectProps<T, M>) {
    const [isOpen, setIsOpen] = React.useState(false)
    const selectionMode = props.selectionMode ?? 'single'

    return (
        <Select<T, M>
            isOpen={isOpen}
            onOpenChange={isOpen => {
                if (!isOpen) {
                    setIsOpen(false)
                }
            }}
            aria-label="Select"
            className={cn('group relative w-full', className)}
            {...props}
        >
            <Button
                variant="outline"
                className={cn(
                    'h-auto min-h-8 w-full justify-between py-[5px] pr-2 text-start font-normal',
                    'group-data-[invalid]:border-destructive group-data-[disabled]:opacity-80',
                    'hover:bg-background-secondary',
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                <SelectValue<T> className="truncate">
                    {({ isPlaceholder, selectedItems }) => {
                        if (isPlaceholder) {
                            // If placeholder is not set, return an empty div
                            if (!placeholder) {
                                return (
                                    <div className="opacity-0" aria-hidden="true">
                                        &nbsp;
                                    </div>
                                )
                            }

                            return <div className="text-muted-foreground">{placeholder}</div>
                        }

                        if (selectionMode === 'single') {
                            const selectedItem = selectedItems[0]

                            if (!selectedItem) return null

                            return renderValue ? renderValue(selectedItem) : selectedItem?.name
                        }

                        if (selectionMode === 'multiple') {
                            return (
                                <div className="flex flex-1 flex-wrap gap-1">
                                    {selectedItems?.slice(0, maxVisibleBadges).map(item => {
                                        if (!item) return null

                                        return (
                                            <Badge
                                                key={item.id}
                                                variant="secondary"
                                                className="grid grid-cols-[1fr_16px] pr-0.5"
                                            >
                                                <div className="truncate">
                                                    {renderValue ? renderValue(item) : item.name}
                                                </div>
                                                <BadgeClearButton data={item} />
                                            </Badge>
                                        )
                                    })}

                                    {/* Remaining badges count */}
                                    {!!selectedItems?.length && selectedItems.length > maxVisibleBadges && (
                                        <Badge variant="secondary">
                                            <span>{`+${selectedItems?.length - maxVisibleBadges}`}</span>
                                        </Badge>
                                    )}
                                </div>
                            )
                        }
                    }}
                </SelectValue>
                <ChevronDownIcon className="text-muted-foreground h-4 w-4" />
            </Button>
            {isClearable && <SelectClearButton />}
            <Popover className={cn('flex !max-h-[350px] w-(--trigger-width) flex-col gap-1 p-1.5', popoverClassName)}>
                <ItemsWrapper isSearchable={isSearchable}>
                    <ListBox items={options} className="flex-1 scroll-pb-1 overflow-auto outline-hidden">
                        {item => <BsSelectItem renderOption={renderOption}>{item.name}</BsSelectItem>}
                    </ListBox>
                </ItemsWrapper>
            </Popover>
        </Select>
    )
}

interface ItemsWrapperProps {
    children: React.ReactNode
    isSearchable: boolean
}

function ItemsWrapper({ children, isSearchable }: ItemsWrapperProps) {
    const { contains } = useFilter({ sensitivity: 'base' })

    return isSearchable ? (
        <Autocomplete filter={contains}>
            <BsSearchField autoFocus className="border ring-0!" /> {children}
        </Autocomplete>
    ) : (
        children
    )
}

function BsSelectItem<T extends BsSelectOption>(
    props: ListBoxItemProps & {
        children: string
        renderOption?: (item: T) => React.ReactNode
    },
) {
    return (
        <ListBoxItem
            {...props}
            textValue={props.children}
            className={cn(
                'text-popover-foreground group flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 outline-hidden select-none',
                'data-focused:bg-primary! data-focused:text-white! data-[focus-visible]:bg-neutral-500/15',
            )}
        >
            {({ isSelected }) => (
                <>
                    <div className="group-selected:font-medium flex-1 overflow-hidden text-sm font-normal">
                        <div className="truncate">
                            {props.renderOption ? props.renderOption(props.value as T) : props.children}
                        </div>
                    </div>
                    <div className="text-primary-foreground flex w-5 items-center justify-center group-data-focused:text-white">
                        {isSelected && <CheckIcon size={16} />}
                    </div>
                </>
            )}
        </ListBoxItem>
    )
}

function SelectClearButton() {
    const state = React.useContext(SelectStateContext)
    const value = state?.value as string | Array<number | string>

    if (!value || value.length === 0) return null

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={e => {
                e.stopPropagation()
                state?.setValue(null)
            }}
            className={cn(
                'bg-background-secondary text-muted-foreground hover:bg-background-tertiary z-10 flex size-6! items-center justify-center rounded',
                'absolute top-1/2 right-1 -translate-y-1/2',
                'opacity-0 transition-opacity group-hover:opacity-100',
            )}
        >
            <XIcon className="size-4" />
        </div>
    )
}

function BadgeClearButton({ data }: { data: BsSelectOption }) {
    const state = React.useContext(SelectStateContext)
    const value = state?.value as string | Array<number | string>

    if (!Array.isArray(value)) return null

    return (
        <div
            role="button"
            tabIndex={0}
            className="z-10 flex size-4! items-center justify-center rounded bg-transparent hover:bg-neutral-400/15"
            onClick={e => {
                e.stopPropagation()
                const newKeys = value.filter(v => v !== data.id)
                state?.setValue(newKeys)
            }}
        >
            <XIcon className="size-2.5!" />
        </div>
    )
}
