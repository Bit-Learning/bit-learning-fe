import type React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import type { TagResponse } from "../types/tag.type";
import { useCreateTag, useUpdateTag } from "../queries/useTag";

const tagSchema = z.object({
	name: z.string().min(1, "Tên tag là bắt buộc").max(50, "Tối đa 50 ký tự"),
});
type TagFormValues = z.infer<typeof tagSchema>;

interface TagFormModalProps {
	open: boolean;
	onClose: () => void;
	tag?: TagResponse;
}

const TagFormModal: React.FC<TagFormModalProps> = ({ open, onClose, tag }) => {
	const isEdit = !!tag;

	const { mutate: createTag, isPending: isCreating } = useCreateTag();
	const { mutate: updateTag, isPending: isUpdating } = useUpdateTag();
	const isPending = isCreating || isUpdating;

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<TagFormValues>({
		resolver: zodResolver(tagSchema),
		defaultValues: { name: tag?.name ?? "" },
	});

	useEffect(() => {
		if (open) reset({ name: tag?.name ?? "" });
	}, [open, tag, reset]);

	const onSubmit = (data: TagFormValues) => {
		if (isEdit) {
			updateTag(
				{ tagId: tag.id, data: { name: data.name.trim() } },
				{ onSuccess: onClose },
			);
		} else {
			createTag({ name: data.name.trim() }, { onSuccess: onClose });
		}
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{isEdit ? "Chỉnh sửa tag" : "Tạo tag mới"}</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-1.5">
						<Label htmlFor="name">Tên tag *</Label>
						<Input
							id="name"
							{...register("name")}
							placeholder="VD: dynamic-programming"
							className={errors.name ? "border-red-500" : ""}
							autoFocus
						/>
						{errors.name && (
							<p className="text-xs text-red-500">{errors.name.message}</p>
						)}
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isPending}
						>
							Hủy
						</Button>
						<Button
							type="submit"
							disabled={isPending}
							className="bg-primary text-primary-foreground hover:bg-primary/90"
						>
							{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{isEdit ? "Lưu thay đổi" : "Tạo tag"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default TagFormModal;
