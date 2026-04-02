import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  isPending?: boolean;
  confirmLabel?: string;
}

const DeleteConfirmModal: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  title = "Xác nhận ẩn",
  description,
  itemName,
  isPending = false,
  confirmLabel = "Ẩn",
}) => {
  const defaultDescription = itemName
    ? `Bạn có chắc chắn muốn ẩn "${itemName}"? Bạn có thể hiện lại bất cứ lúc nào.`
    : "Bạn có chắc chắn muốn ẩn? Bạn có thể hiện lại bất cứ lúc nào.";

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description || defaultDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmModal;
