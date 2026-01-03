import { Button } from "@workspace/ui/components/Button";
import { Card } from "@workspace/ui/components/Card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/Form";
import { Input } from "@workspace/ui/components/Input";
import { Textarea } from "@workspace/ui/components/Textarea";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useUpdateSection } from "../queries/useSection";
import type {
	SectionDetail,
	UpdateSectionRequest,
} from "../types/msection.api";

interface EditSectionModalProps {
	section: SectionDetail;
	onClose: () => void;
	onSuccess?: () => void;
}

interface SectionFormData {
	title: string;
	description: string;
	isPublished: boolean;
}

export const EditSectionModal = ({
	section,
	onClose,
	onSuccess,
}: EditSectionModalProps) => {
	const updateSectionMutation = useUpdateSection();

	const form = useForm<SectionFormData>({
		defaultValues: {
			title: section.title,
			description: section.description || "",
			isPublished: section.isPublished,
		},
	});

	useEffect(() => {
		form.reset({
			title: section.title,
			description: section.description || "",
			isPublished: section.isPublished,
		});
	}, [section, form]);

	const handleSubmit = async (data: SectionFormData) => {
		try {
			const updateData: UpdateSectionRequest = {
				title: data.title,
				description: data.description || undefined,
				isPublished: data.isPublished,
				orderIndex: section.orderIndex,
			};
			await updateSectionMutation.mutateAsync({
				id: section.id,
				data: updateData,
			});
			onSuccess?.();
			onClose();
		} catch (error) {
			console.error("Failed to update section:", error);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<Card className="w-full max-w-lg">
				<div className="flex items-center justify-between border-b p-4">
					<h2 className="text-xl font-bold">Chỉnh sửa chương</h2>
					<Button variant="outline" size="sm" onClick={onClose}>
						<X className="h-4 w-4" />
					</Button>
				</div>

				<div className="p-6">
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(handleSubmit)}
							className="space-y-4"
						>
							<FormField
								control={form.control}
								name="title"
								rules={{
									required: "Tên chương là bắt buộc",
									maxLength: { value: 100, message: "Tối đa 100 ký tự" },
								}}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tên chương *</FormLabel>
										<FormControl>
											<Input
												placeholder="VD: Chương 1: Giới thiệu"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Mô tả</FormLabel>
										<FormControl>
											<Textarea
												rows={3}
												placeholder="Mô tả chương (tùy chọn)"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="isPublished"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<label className="flex cursor-pointer items-start gap-3">
												<input
													type="checkbox"
													checked={field.value}
													onChange={field.onChange}
													className="mt-1 h-4 w-4 rounded border-gray-300"
												/>

												<div>
													<span className="font-medium">Công khai chương</span>
													<p className="text-sm text-gray-500">
														Học viên có thể xem chương này khi được công khai
													</p>
												</div>
											</label>
										</FormControl>
									</FormItem>
								)}
							/>

							<div className="flex justify-end gap-3 border-t pt-4">
								<Button type="button" variant="outline" onClick={onClose}>
									Hủy
								</Button>
								<Button
									type="submit"
									isDisabled={updateSectionMutation.isPending}
								>
									{updateSectionMutation.isPending
										? "Đang lưu..."
										: "Lưu thay đổi"}
								</Button>
							</div>
						</form>
					</Form>
				</div>
			</Card>
		</div>
	);
};
