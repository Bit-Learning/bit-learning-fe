'use client'

import { createColumnHelper } from '@tanstack/react-table'
import { Button } from '@workspace/ui/components/Button'
import { DataTable } from '@workspace/ui/components/DataTable'
import React from 'react'

interface User {
    id: string
    name: string
    email: string
    department: string
    role: string
}

const columnHelper = createColumnHelper<User>()

const data: User[] = [
    {
        id: '1',
        name: 'Alice Johnson',
        email: 'alice@company.com',
        department: 'Engineering',
        role: 'Senior Developer',
    },
    {
        id: '2',
        name: 'Bob Smith',
        email: 'bob@company.com',
        department: 'Marketing',
        role: 'Marketing Manager',
    },
    {
        id: '3',
        name: 'Carol Davis',
        email: 'carol@company.com',
        department: 'Engineering',
        role: 'Product Manager',
    },
    {
        id: '4',
        name: 'David Wilson',
        email: 'david@company.com',
        department: 'Sales',
        role: 'Sales Representative',
    },
    {
        id: '5',
        name: 'Eva Brown',
        email: 'eva@company.com',
        department: 'HR',
        role: 'HR Specialist',
    },
]

const columns = [
    columnHelper.accessor('name', {
        header: 'Name',
    }),
    columnHelper.accessor('email', {
        header: 'Email',
    }),
    columnHelper.accessor('department', {
        header: 'Department',
    }),
]

export function DataTableRowSelection() {
    const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})

    const selectedCount = Object.keys(rowSelection).length

    const handleBulkAction = (action: string) => {
        alert(`${action} ${selectedCount} selected users`)
    }

    return (
        <div className="w-full space-y-3">
            <div className="flex h-8 items-center justify-between">
                <span className="text-muted-foreground text-sm">
                    {selectedCount} of {data.length} selected
                </span>

                {selectedCount > 0 && (
                    <div className="flex gap-2">
                        <Button variant="destructive" onClick={() => handleBulkAction('Delete')}>
                            Delete Selected
                        </Button>
                        <Button variant="outline" onClick={() => handleBulkAction('Export')}>
                            Export Selected
                        </Button>
                    </div>
                )}
            </div>

            <DataTable
                columns={columns}
                data={data}
                enableRowSelection
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
            />
        </div>
    )
}
