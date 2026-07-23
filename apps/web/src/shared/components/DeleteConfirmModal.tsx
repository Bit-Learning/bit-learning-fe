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
} from "@workspace/ui/components/alert-dialog";

interface Props {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title?: string;
	description?: string;
	itemName?: string;
	isPending?: boolean;
}

const DeleteConfirmModal: React.FC<Props> = ({
	open,
	onClose,
	onConfirm,
	title = "Xác nhận xóa",
	description,
	itemName,
	isPending = false,
}) => {
	const defaultDescription = itemName
		? `Bạn có chắc chắn muốn xóa "${itemName}"? Hành động này không thể hoàn tác.`
		: "Bạn có chắc chắn muốn xóa? Hành động này không thể hoàn tác.";

	return (
		<AlertDialog open={open} onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>
						{description || defaultDescription}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						disabled={isPending}
						className="bg-destructive text-white hover:bg-destructive/90"
					>
						{isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
						Xóa
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default DeleteConfirmModal;
