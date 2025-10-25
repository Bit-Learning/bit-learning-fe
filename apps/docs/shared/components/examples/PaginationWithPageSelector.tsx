'use client'

import { Pagination, PaginationPageSizeSelector } from '@workspace/ui/components/Pagination'

export function PaginationWithPageSelector() {
    return (
        <div className="flex w-full items-center justify-between gap-2 rounded-lg border p-4">
            <PaginationPageSizeSelector />
            <Pagination pageCount={10} />
        </div>
    )
}
