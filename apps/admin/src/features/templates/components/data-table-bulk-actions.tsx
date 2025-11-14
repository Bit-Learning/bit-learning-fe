import { type Table } from '@tanstack/react-table'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { type Template } from '../data/schema'
import { deleteTemplates } from '../api/templates-api'

interface DataTableBulkActionsProps {
  table: Table<Template>
}

export function DataTableBulkActions({ table }: DataTableBulkActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const queryClient = useQueryClient()
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length

  const deleteMutation = useMutation({
    mutationFn: deleteTemplates,
    onSuccess: () => {
      toast.success(`Đã xóa ${selectedCount} mẫu thành công`)
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      table.resetRowSelection()
      setShowDeleteDialog(false)
    },
    onError: () => {
      toast.error('Không thể xóa các mẫu đã chọn')
    },
  })

  const handleDelete = () => {
    const ids = selectedRows.map((row) => row.original.id)
    deleteMutation.mutate(ids)
  }

  if (selectedCount === 0) {
    return null
  }

  return (
    <>
      <div className='fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-md border bg-background p-3 shadow-lg'>
        <div className='text-sm text-muted-foreground'>
          Đã chọn <span className='font-semibold text-foreground'>{selectedCount}</span> mẫu
        </div>
        <div className='h-4 w-px bg-border' />
        <div className='flex items-center gap-2'>
          <Button
            variant='destructive'
            size='sm'
            onClick={() => setShowDeleteDialog(true)}
            className='h-8'
          >
            <Trash2 className='mr-2 h-4 w-4' />
            Xóa
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.resetRowSelection()}
            className='h-8'
          >
            <X className='mr-2 h-4 w-4' />
            Hủy
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. {selectedCount} mẫu đã chọn sẽ bị xóa
              vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
