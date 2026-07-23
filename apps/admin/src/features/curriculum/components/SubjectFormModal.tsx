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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCreateSubject, useUpdateSubject } from "../queries/useSubject";
import type { TSubjectResponse } from "../types/subject.type";

const formSchema = z.object({
	name: z.string().min(1, "Vui lòng nhập tên"),
	code: z.string().min(1, "Vui lòng nhập mã"),
	description: z.string().optional(),
	classLevel: z.number().min(1).max(12),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
	open: boolean;
	onClose: () => void;
	data?: TSubjectResponse | null;
	curriculumId: number;
}

const SubjectFormModal: React.FC<Props> = ({
	open,
	onClose,
	data,
	curriculumId,
}) => {
	const isEdit = !!data;

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: { name: "", code: "", description: "", classLevel: 1 },
	});

	const { mutate: create, isPending: creating } = useCreateSubject();
	const { mutate: update, isPending: updating } = useUpdateSubject();
	const isPending = creating || updating;

	useEffect(() => {
		if (open) {
			form.reset({
				name: data?.name || "",
				code: data?.code || "",
				description: data?.description || "",
				classLevel: data?.classLevel || 1,
			});
		}
	}, [open, data, form]);

	const onSubmit = (values: FormValues) => {
		const payload = {
			...values,
			curriculumId: data?.curriculum?.id || curriculumId,
		};
		if (isEdit && data) {
			update({ id: data.id, data: payload }, { onSuccess: onClose });
		} else {
			create(payload, { onSuccess: onClose });
		}
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{isEdit ? "Sửa" : "Tạo"} môn học</DialogTitle>
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
							name="classLevel"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Lớp</FormLabel>
									<Select
										value={field.value.toString()}
										onValueChange={(v) => field.onChange(parseInt(v))}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((l) => (
												<SelectItem key={l} value={l.toString()}>
													Lớp {l}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
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

export default SubjectFormModal;
