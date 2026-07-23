import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	useCreateCurriculum,
	useUpdateCurriculum,
} from "../queries/useCurriculum";
import type { TCurriculumResponse } from "../types/curriculum.type";

const formSchema = z.object({
	name: z.string().min(1, "Vui lòng nhập tên"),
	code: z.string().min(1, "Vui lòng nhập mã"),
	description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
	open: boolean;
	onClose: () => void;
	data?: TCurriculumResponse | null;
}

const CurriculumFormModal: React.FC<Props> = ({ open, onClose, data }) => {
	const isEdit = !!data;

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: { name: "", code: "", description: "" },
	});

	const { mutate: create, isPending: creating } = useCreateCurriculum();
	const { mutate: update, isPending: updating } = useUpdateCurriculum();
	const isPending = creating || updating;

	useEffect(() => {
		if (open) {
			form.reset({
				name: data?.name || "",
				code: data?.code || "",
				description: data?.description || "",
			});
		}
	}, [open, data, form]);

	const onSubmit = (values: FormValues) => {
		if (isEdit && data) {
			update({ id: data.id, data: values }, { onSuccess: onClose });
		} else {
			create(values, { onSuccess: onClose });
		}
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{isEdit ? "Sửa" : "Tạo"} chương trình học</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Tên</FormLabel>
									<FormControl>
										<Input placeholder="Nhập tên..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="code"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Mã code</FormLabel>
									<FormControl>
										<Input placeholder="Nhập mã..." {...field} />
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
										<Textarea placeholder="Nhập mô tả..." rows={3} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={onClose}>
								Hủy
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
								{isEdit ? "Cập nhật" : "Tạo"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default CurriculumFormModal;
