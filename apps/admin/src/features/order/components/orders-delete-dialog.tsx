import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteOrder } from '../hook/useOrder'
import { useOrdersContext } from './orders-provider'

export function OrdersDeleteDialog() {
  const { activeOrder, isDeleteDialogOpen, setIsDeleteDialogOpen } =
    useOrdersContext()
  const { mutate: deleteOrder, isPending } = useDeleteOrder()

  const handleDelete = () => {
    if (!activeOrder) return

    deleteOrder(activeOrder.id, {
      onSuccess: () => {
        toast.success('Order deleted successfully')
        setIsDeleteDialogOpen(false)
      },
      onError: (error) => {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || 'Failed to delete order'
        toast.error(errorMessage)
      },
    })
  }

  return (
    <ConfirmDialog
      open={isDeleteDialogOpen}
      onOpenChange={setIsDeleteDialogOpen}
      title='Delete Order'
      desc={
        <>
          Are you sure you want to delete{' '}
          <strong>Order #{activeOrder?.id}</strong>? This action cannot be
          undone.
        </>
      }
      confirmText='Delete'
      handleConfirm={handleDelete}
      isLoading={isPending}
      destructive
    />
  )
}
