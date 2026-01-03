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
import {
	BookOpen,
	DollarSign,
	FileText,
	Globe,
	GraduationCap,
	Image,
	Save,
	Target,
	Users,
	X,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
	type CourseDetail,
	CourseLevel,
	Language,
	type UpdateCourseRequest,
} from "@/feature/course/types/course.type";
import { useUpdateCourse, useUpdateThumbnail } from "../queries/useCourse";

interface EditCourseModalProps {
	course: CourseDetail;
	onClose: () => void;
	onSuccess?: () => void;
}

const LEVELS = [
	{ value: CourseLevel.BEGINNER, label: "Cơ bản" },
	{ value: CourseLevel.INTERMEDIATE, label: "Trung cấp" },
	{ value: CourseLevel.ADVANCED, label: "Nâng cao" },
];

const LANGUAGES = [
	{ value: Language.VIETNAMESE, label: "🇻🇳 Tiếng Việt" },
	{ value: Language.ENGLISH, label: "🇺🇸 Tiếng Anh" },
];

const GRADES = Array.from({ length: 12 }, (_, i) => ({
	value: i + 1,
	label: `Lớp ${i + 1}`,
}));

export const EditCourseModal = ({
	course,
	onClose,
	onSuccess,
}: EditCourseModalProps) => {
	const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
	const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
		course.thumbnailUrl || null,
	);
	const [activeTab, setActiveTab] = useState<"basic" | "detail" | "thumbnail">(
		"basic",
	);

	const updateCourseMutation = useUpdateCourse();
	const updateThumbnailMutation = useUpdateThumbnail();

	const form = useForm<UpdateCourseRequest>({
		defaultValues: {
			title: course.title,
			subtitle: course.subtitle,
			description: course.description,
			price: course.price,
			language: course.language,
			outcome: course.outcome,
			requirement: course.requirement,
			audience: course.audience,
			level: course.level,
			grade: course.grade,
		},
	});

	const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setThumbnailFile(file);
			const reader = new FileReader();
			reader.onloadend = () => setThumbnailPreview(reader.result as string);
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async (data: UpdateCourseRequest) => {
		try {
			const updateData: UpdateCourseRequest = {
				title: data.title,
				subtitle: data.subtitle,
				description: data.description,
				price: data.price,
				language: data.language,
				outcome: data.outcome,
				requirement: data.requirement,
				audience: data.audience,
				level: data.level,
				grade: data.grade,
			};

			await updateCourseMutation.mutateAsync({
				id: course.id,
				data: updateData,
			});

			if (thumbnailFile) {
				await updateThumbnailMutation.mutateAsync({
					id: course.id,
					thumbnail: thumbnailFile,
				});
			}

			onSuccess?.();
			onClose();
		} catch (error) {
			console.error("Failed to update course:", error);
		}
	};

	const isLoading =
		updateCourseMutation.isPending || updateThumbnailMutation.isPending;

	const tabs = [
		{ id: "basic", label: "Thông tin cơ bản", icon: BookOpen },
		{ id: "detail", label: "Chi tiết khóa học", icon: FileText },
		{ id: "thumbnail", label: "Ảnh bìa", icon: Image },
	] as const;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<Card className="max-h-[95vh] w-full max-w-4xl overflow-hidden">
				<div className="bg-linear-to-r flex items-center justify-between border-b from-blue-600 to-indigo-600 p-4 text-white">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
							<GraduationCap className="h-5 w-5" />
						</div>
						<div>
							<h2 className="text-xl font-bold">Chỉnh sửa khóa học</h2>
							<p className="text-sm text-blue-100">
								Cập nhật thông tin khóa học của bạn
							</p>
						</div>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClose}
						className="text-white hover:bg-white/20"
					>
						<X className="h-5 w-5" />
					</Button>
				</div>

				<div className="flex border-b bg-gray-50">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							type="button"
							onClick={() => setActiveTab(tab.id)}
							className={`flex flex-1 cursor-pointer items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
								activeTab === tab.id
									? "border-b-2 border-blue-600 bg-white text-blue-600"
									: "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
							}`}
						>
							<tab.icon className="h-4 w-4" />
							{tab.label}
						</button>
					))}
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)}>
						<div className="max-h-[calc(95vh-220px)] overflow-y-auto p-6">
							{activeTab === "basic" && (
								<div className="space-y-5">
									<FormField
										control={form.control}
										name="title"
										rules={{ required: "Tên khóa học là bắt buộc" }}
										render={({ field }) => (
											<FormItem>
												<FormLabel className="flex items-center gap-2">
													<BookOpen className="h-4 w-4 text-blue-600" />
													Tên khóa học *
												</FormLabel>
												<FormControl>
													<Input
														placeholder="VD: Toán học lớp 10 - Từ cơ bản đến nâng cao"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="subtitle"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Tiêu đề phụ</FormLabel>
												<FormControl>
													<Input
														placeholder="Mô tả ngắn gọn về khóa học"
														{...field}
													/>
												</FormControl>
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="description"
										rules={{ required: "Mô tả là bắt buộc" }}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Mô tả khóa học *</FormLabel>
												<FormControl>
													<Textarea
														rows={4}
														placeholder="Mô tả chi tiết về nội dung khóa học..."
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className="grid grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="price"
											rules={{
												required: "Giá là bắt buộc",
												min: { value: 0, message: "Giá không được âm" },
											}}
											render={({ field }) => (
												<FormItem>
													<FormLabel className="flex items-center gap-2">
														<DollarSign className="h-4 w-4 text-green-600" />
														Giá (VNĐ) *
													</FormLabel>
													<FormControl>
														<Input
															type="number"
															min="0"
															placeholder="0 = Miễn phí"
															{...field}
															onChange={(e) =>
																field.onChange(Number(e.target.value))
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="language"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="flex items-center gap-2">
														<Globe className="h-4 w-4 text-indigo-600" />
														Ngôn ngữ
													</FormLabel>
													<FormControl>
														<select
															{...field}
															className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
														>
															{LANGUAGES.map((lang) => (
																<option key={lang.value} value={lang.value}>
																	{lang.label}
																</option>
															))}
														</select>
													</FormControl>
												</FormItem>
											)}
										/>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="level"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="flex items-center gap-2">
														<Target className="h-4 w-4 text-orange-600" />
														Cấp độ
													</FormLabel>
													<FormControl>
														<select
															{...field}
															className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
														>
															{LEVELS.map((level) => (
																<option key={level.value} value={level.value}>
																	{level.label}
																</option>
															))}
														</select>
													</FormControl>
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="grade"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="flex items-center gap-2">
														<GraduationCap className="h-4 w-4 text-purple-600" />
														Khối lớp
													</FormLabel>
													<FormControl>
														<select
															value={field.value}
															onChange={(e) =>
																field.onChange(Number(e.target.value))
															}
															className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
														>
															{GRADES.map((grade) => (
																<option key={grade.value} value={grade.value}>
																	{grade.label}
																</option>
															))}
														</select>
													</FormControl>
												</FormItem>
											)}
										/>
									</div>
								</div>
							)}

							{activeTab === "detail" && (
								<div className="space-y-5">
									<FormField
										control={form.control}
										name="outcome"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="flex items-center gap-2">
													<Target className="h-4 w-4 text-green-600" />
													Kết quả đạt được
												</FormLabel>
												<FormControl>
													<Textarea
														rows={3}
														placeholder="Học viên sẽ đạt được gì sau khóa học?"
														{...field}
													/>
												</FormControl>
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="requirement"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="flex items-center gap-2">
													<FileText className="h-4 w-4 text-yellow-600" />
													Yêu cầu
												</FormLabel>
												<FormControl>
													<Textarea
														rows={3}
														placeholder="Học viên cần chuẩn bị gì trước khi học?"
														{...field}
													/>
												</FormControl>
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="audience"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="flex items-center gap-2">
													<Users className="h-4 w-4 text-blue-600" />
													Đối tượng
												</FormLabel>
												<FormControl>
													<Textarea
														rows={3}
														placeholder="Khóa học này phù hợp với ai?"
														{...field}
													/>
												</FormControl>
											</FormItem>
										)}
									/>
								</div>
							)}

							{activeTab === "thumbnail" && (
								<div className="space-y-5">
									<div className="text-center">
										<div className="mx-auto mb-4 aspect-video w-full max-w-md overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
											{thumbnailPreview ? (
												<img
													src={thumbnailPreview}
													alt="Thumbnail"
													className="h-full w-full object-cover"
												/>
											) : (
												<div className="flex h-full flex-col items-center justify-center text-gray-400">
													<Image className="mb-2 h-12 w-12" />
													<p>Chưa có ảnh bìa</p>
												</div>
											)}
										</div>
										<Input
											type="file"
											accept="image/*"
											onChange={handleThumbnailChange}
											className="mx-auto max-w-xs"
										/>
										<p className="mt-2 text-sm text-gray-500">
											Khuyến nghị: 1280x720px, tối đa 2MB
										</p>
									</div>
								</div>
							)}
						</div>

						<div className="flex items-center justify-between border-t bg-gray-50 p-4">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								className="gap-2"
							>
								<X className="h-4 w-4" />
								Hủy
							</Button>
							<Button
								type="submit"
								isDisabled={isLoading}
								className="bg-linear-to-r gap-2 from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
							>
								<Save className="h-4 w-4" />
								{isLoading ? "Đang lưu..." : "Lưu thay đổi"}
							</Button>
						</div>
					</form>
				</Form>
			</Card>
		</div>
	);
};
