import { Button } from "@workspace/ui/components/Button";
import { AlertTriangle, X } from "lucide-react";

export type DeleteItemType = "course" | "lecture" | "section";

interface DeleteConfirmModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	itemType: DeleteItemType;
	itemName?: string;
	isLoading?: boolean;
}

const itemTypeLabels: Record<
	DeleteItemType,
	{ title: string; description: string }
> = {
	course: {
		title: "Xóa khóa học",
		description:
			"Tất cả chương và bài học trong khóa học này cũng sẽ bị xóa vĩnh viễn.",
	},
	section: {
		title: "Xóa chương",
		description: "Tất cả bài học trong chương này cũng sẽ bị xóa vĩnh viễn.",
	},
	lecture: {
		title: "Xóa bài học",
		description: "Bài học này sẽ bị xóa vĩnh viễn khỏi khóa học.",
	},
};

export const DeleteConfirmModal = ({
	isOpen,
	onClose,
	onConfirm,
	itemType,
	itemName,
	isLoading = false,
}: DeleteConfirmModalProps) => {
	if (!isOpen) return null;

	const { title, description } = itemTypeLabels[itemType];

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div
				className="fixed inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			/>
			<div className="animate-in fade-in zoom-in-95 relative z-10 w-full max-w-md duration-200">
				<div className="rounded-xl bg-white shadow-2xl">
					<div className="bg-linear-to-r relative overflow-hidden rounded-t-xl from-red-500 to-red-600 px-6 py-8">
						<div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
						<div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-white/10" />
						<button
							onClick={onClose}
							className="absolute right-4 top-4 rounded-full p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
						>
							<X className="h-5 w-5" />
						</button>
						<div className="flex flex-col items-center text-center">
							<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30">
								<AlertTriangle className="h-8 w-8 text-white" />
							</div>
							<h2 className="text-xl font-bold text-white">{title}</h2>
						</div>
					</div>

					<div className="px-6 py-6">
						<div className="mb-6 text-center">
							{itemName && (
								<p className="mb-2 text-lg font-semibold text-gray-900">
									"{itemName}"
								</p>
							)}
							<p className="text-gray-600">{description}</p>
							<p className="mt-3 text-sm font-medium text-red-600">
								Hành động này không thể hoàn tác!
							</p>
						</div>

						<div className="flex gap-3">
							<Button
								variant="outline"
								className="flex-1"
								onClick={onClose}
								isDisabled={isLoading}
							>
								Hủy bỏ
							</Button>
							<Button
								className="bg-linear-to-r! from-red-500! to-red-600! flex-1 text-white hover:from-red-600 hover:to-red-700"
								onClick={onConfirm}
								isDisabled={isLoading}
							>
								{isLoading ? (
									<span className="flex items-center gap-2">
										<span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
										Đang xóa...
									</span>
								) : (
									"Xác nhận xóa"
								)}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
