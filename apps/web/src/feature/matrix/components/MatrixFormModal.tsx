import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X } from "lucide-react";
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
import { useCreateMatrix, useUpdateMatrix } from "../queries/useMatrix";
import { useSubjectsList } from "../queries/useSubject";
import type { TMatrixResponse } from "../types/matrix.type";

const formSchema = z.object({
	name: z.string().min(1, "Vui lòng nhập tên"),
	code: z.string().min(1, "Vui lòng nhập mã"),
	description: z.string().optional(),
	duration: z.number().min(1, "Thời gian phải lớn hơn 0"),
	totalScore: z.number().min(0, "Tổng điểm phải >= 0"),
	subjectId: z.number().min(1, "Vui lòng chọn môn học"),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
	isOpen: boolean;
	onClose: () => void;
	data?: TMatrixResponse | null;
}

const MatrixFormModal: React.FC<Props> = ({ isOpen, onClose, data }) => {
	const isEdit = !!data;
	const { data: subjects } = useSubjectsList();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			code: "",
			description: "",
			duration: 30,
			totalScore: 10,
			subjectId: 0,
		},
	});

	const { mutate: create, isPending: creating } = useCreateMatrix();
	const { mutate: update, isPending: updating } = useUpdateMatrix();
	const isPending = creating || updating;

	useEffect(() => {
		if (isOpen) {
			form.reset({
				name: data?.name || "",
				code: data?.code || "",
				description: data?.description || "",
				duration: data?.duration || 30,
				totalScore: data?.totalScore || 10,
				subjectId: data?.subject?.id || 0,
			});
		}
	}, [isOpen, data, form]);

	const onSubmit = (values: FormValues) => {
		if (isEdit && data) {
			update({ id: data.id, data: values }, { onSuccess: onClose });
		} else {
			create(values, { onSuccess: onClose });
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<Card className="w-full max-w-2xl p-8 rounded-xl shadow-xl">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-xl font-bold text-slate-800 dark:text-white">
						{isEdit ? "Chỉnh sửa" : "Tạo"} ma trận đề thi
					</h2>
					<Button variant="ghost" size="sm" onPress={onClose}>
						<X className="h-5 w-5" />
					</Button>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
						<div className="grid grid-cols-2 gap-5">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-semibold">
											Tên ma trận <span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<Input
												className="h-11 text-sm"
												placeholder="VD: Ma trận Tin học lớp 10"
												{...field}
											/>
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
										<FormLabel className="text-sm font-semibold">
											Mã ma trận <span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<Input
												className="h-11 text-sm"
												placeholder="VD: MT-TIN-10"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="subjectId"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-sm font-semibold">
										Môn học <span className="text-destructive">*</span>
									</FormLabel>
									<FormControl>
										<select
											className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-blue-500"
											value={field.value || ""}
											onChange={(e) =>
												field.onChange(parseInt(e.target.value) || 0)
											}
										>
											<option value="">-- Chọn môn học --</option>
											{subjects?.map((s: any) => (
												<option key={s.id} value={s.id}>
													{s.name} ({s.code})
												</option>
											))}
										</select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-5">
							<FormField
								control={form.control}
								name="duration"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-semibold">
											Thời gian (phút)
										</FormLabel>
										<FormControl>
											<Input
												type="number"
												className="h-11 text-sm"
												min={1}
												{...field}
												onChange={(e) =>
													field.onChange(parseInt(e.target.value) || 0)
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="totalScore"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-semibold">
											Tổng điểm
										</FormLabel>
										<FormControl>
											<Input
												type="number"
												className="h-11 text-sm"
												min={0}
												step={0.5}
												{...field}
												onChange={(e) =>
													field.onChange(parseFloat(e.target.value) || 0)
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-sm font-semibold">Mô tả</FormLabel>
									<FormControl>
										<Textarea
											className="min-h-20 text-sm"
											placeholder="Mô tả về ma trận..."
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end gap-3 pt-4">
							<Button
								type="button"
								variant="outline"
								size="lg"
								onPress={onClose}
							>
								Hủy
							</Button>
							<Button type="submit" size="lg" isDisabled={isPending}>
								{isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
								{isEdit ? "Cập nhật" : "Tạo ma trận"}
							</Button>
						</div>
					</form>
				</Form>
			</Card>
		</div>
	);
};

export default MatrixFormModal;
