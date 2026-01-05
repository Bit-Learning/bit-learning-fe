import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import type { SyllabusDetailRequest } from "@workspace/lib/api/sdk/syllabus.type";
import { Button } from "@workspace/ui/components/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/Card";
import { Input } from "@workspace/ui/components/Input";
import { Label } from "@workspace/ui/components/label";
import { toast } from "@workspace/ui/components/Sonner";
import { Textarea } from "@workspace/ui/components/Textarea";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/shared/lib/apiClient";
import { SyllabusDetailTable } from "../components/SyllabusDetailTable";

export default function CreateSyllabus() {
	const navigate = useNavigate();
	const params = useParams({ strict: false });
	const syllabusId = (params as any).id
		? Number((params as any).id)
		: undefined;
	const queryClient = useQueryClient();

	// Step control: 1 = Basic Info, 2 = Version Configuration
	const [step, setStep] = useState(1);
	const [createdSyllabusId, setCreatedSyllabusId] = useState<
		number | undefined
	>(syllabusId);

	// Step 1: Syllabus Basic Info
	const [syllabusName, setSyllabusName] = useState("");
	const [syllabusCode, setSyllabusCode] = useState("");
	const [subjectId, setSubjectId] = useState<number | undefined>();
	const [description, setDescription] = useState("");

	// Step 2: Version Info
	const [versionName, setVersionName] = useState("Version 1.0");
	const [versionNotes, setVersionNotes] = useState("Initial version");
	const [syllabusDetails, setSyllabusDetails] = useState<
		SyllabusDetailRequest[]
	>([]);

	// Load subjects for dropdown
	const { data: subjects } = useQuery(apiClient.subject.getAllSubjects());

	// Load chapters when subject is selected
	const { data: chapters } = useQuery({
		...apiClient.chapter.getChaptersBySubject(subjectId!),
		enabled: !!subjectId,
	});

	// Load lessons from all chapters
	const { data: allLessons } = useQuery({
		queryKey: ["lessons", "all", subjectId],
		queryFn: async () => {
			if (!chapters) return [];
			const lessonPromises = chapters.map(async (chapter) => {
				const queryOpts = apiClient.lesson.getLessonsByChapter(chapter.id);
				return await queryOpts.queryFn?.({
					queryKey: queryOpts.queryKey,
				} as any);
			});
			const lessonArrays = await Promise.all(lessonPromises);
			return lessonArrays
				.flat()
				.filter(
					(lesson): lesson is NonNullable<typeof lesson> => lesson != null,
				);
		},
		enabled: !!chapters && chapters.length > 0,
	});

	// Load syllabus data if editing
	const { data: syllabusData } = useQuery({
		...apiClient.syllabus.getSyllabusById(syllabusId!),
		enabled: !!syllabusId,
	});

	// Populate form when editing
	useEffect(() => {
		if (syllabusData) {
			setSyllabusName(syllabusData.name);
			setSyllabusCode(syllabusData.code);
			setSubjectId(syllabusData.subject.id);
			setDescription(syllabusData.description || "");
			setCreatedSyllabusId(syllabusData.id);
		}
	}, [syllabusData]);

	// Step 1: Create Syllabus
	const createSyllabusMutation = useMutation({
		...apiClient.syllabus.createSyllabus(),
		onSuccess: (data) => {
			setCreatedSyllabusId(data.id);
			setStep(2);
		},
		onError: (error: any) => {
			toast.error({
				title: "Lỗi khi tạo giáo trình",
				description: error.message,
			});
		},
	});

	// Step 2: Create Version
	const createVersionMutation = useMutation({
		...apiClient.syllabus.createVersion(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["syllabuses"] });
			toast.success({ title: "Giáo trình đã được tạo thành công!" });
			navigate({ to: "/syllabuses" });
		},
		onError: (error: any) => {
			toast.error({ title: "Lỗi khi tạo version", description: error.message });
		},
	});

	const updateSyllabusMutation = useMutation({
		...apiClient.syllabus.updateSyllabus(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["syllabuses"] });
			toast.success({ title: "Giáo trình đã được cập nhật!" });
			navigate({ to: "/syllabuses" });
		},
	});

	// Handle Step 1 Submit
	const handleStep1Submit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!subjectId) {
			toast.warning({ title: "Vui lòng chọn môn học" });
			return;
		}

		const syllabusRequest = {
			name: syllabusName,
			code: syllabusCode,
			description,
			subjectId,
		};

		if (syllabusId) {
			// Update existing syllabus
			updateSyllabusMutation.mutate({ id: syllabusId, data: syllabusRequest });
		} else {
			// Create new syllabus
			createSyllabusMutation.mutate(syllabusRequest);
		}
	};

	// Handle Step 2 Submit
	const handleStep2Submit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!createdSyllabusId) {
			toast.error({ title: "Lỗi: Không tìm thấy giáo trình" });
			return;
		}

		if (syllabusDetails.length === 0) {
			toast.warning({
				title: "Vui lòng thêm ít nhất một bài học vào giáo trình",
			});
			return;
		}

		createVersionMutation.mutate({
			syllabusId: createdSyllabusId,
			name: versionName,
			notes: versionNotes,
			syllabusDetails,
		});
	};

	const isLoading =
		createSyllabusMutation.isPending ||
		createVersionMutation.isPending ||
		updateSyllabusMutation.isPending;

	return (
		<div className="container mx-auto max-w-6xl px-4 py-8">
			{/* Header */}
			<div className="mb-8">
				<Button
					variant="ghost"
					onClick={() => navigate({ to: "/syllabuses" })}
					className="mb-4 gap-2"
				>
					<ArrowLeft className="h-4 w-4" />
					Quay lại danh sách
				</Button>
				<h1 className="mb-2 text-4xl font-bold">
					{syllabusId
						? "Chỉnh sửa giáo trình"
						: `Tạo giáo trình mới - Bước ${step}/2`}
				</h1>
				<p className="text-muted-foreground">
					{step === 1
						? "Bước 1: Thiết lập thông tin cơ bản cho giáo trình"
						: "Bước 2: Cấu hình chi tiết từng bài học"}
				</p>
			</div>

			{/* Progress indicator */}
			{!syllabusId && (
				<div className="mb-8 flex items-center justify-center gap-4">
					<div
						className={`flex items-center gap-2 ${step === 1 ? "font-bold text-blue-600" : "text-gray-400"}`}
					>
						<div
							className={`flex h-8 w-8 items-center justify-center rounded-full ${step === 1 ? "bg-blue-600 text-white" : "bg-gray-300"}`}
						>
							1
						</div>
						<span>Thông tin cơ bản</span>
					</div>
					<div className="h-px w-20 bg-gray-300" />
					<div
						className={`flex items-center gap-2 ${step === 2 ? "font-bold text-blue-600" : "text-gray-400"}`}
					>
						<div
							className={`flex h-8 w-8 items-center justify-center rounded-full ${step === 2 ? "bg-blue-600 text-white" : "bg-gray-300"}`}
						>
							2
						</div>
						<span>Cấu hình bài học</span>
					</div>
				</div>
			)}

			{/* Step 1: Basic Information */}
			{step === 1 && (
				<form onSubmit={handleStep1Submit}>
					<Card className="mb-6">
						<CardHeader>
							<CardTitle>Thông tin cơ bản</CardTitle>
							<CardDescription>
								Nhập thông tin chung về giáo trình
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="syllabusName">
										Tên giáo trình <span className="text-red-500">*</span>
									</Label>
									<Input
										id="syllabusName"
										placeholder="VD: Giáo trình Toán học lớp 10 - HK1"
										value={syllabusName}
										onChange={(e) => setSyllabusName(e.target.value)}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="syllabusCode">
										Mã giáo trình <span className="text-red-500">*</span>
									</Label>
									<Input
										id="syllabusCode"
										placeholder="VD: GT-TOAN-10-HK1"
										value={syllabusCode}
										onChange={(e) => setSyllabusCode(e.target.value)}
										required
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 gap-4">
								<div className="space-y-2">
									<Label htmlFor="subjectId">
										Môn học <span className="text-red-500">*</span>
									</Label>
									<select
										id="subjectId"
										className="w-full rounded-md border px-3 py-2"
										value={subjectId || ""}
										onChange={(e) =>
											setSubjectId(
												e.target.value ? Number(e.target.value) : undefined,
											)
										}
										required
									>
										<option value="">-- Chọn môn học --</option>
										{subjects?.map((subject) => (
											<option key={subject.id} value={subject.id}>
												{subject.name} ({subject.code})
											</option>
										))}
									</select>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="description">Mô tả</Label>
								<Textarea
									id="description"
									placeholder="Mô tả về giáo trình này..."
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									rows={3}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Actions */}
					<div className="flex justify-end gap-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => navigate({ to: "/syllabuses" })}
						>
							Hủy
						</Button>
						<Button type="submit" className="gap-2" isDisabled={isLoading}>
							<ArrowRight className="h-4 w-4" />
							{isLoading ? "Đang xử lý..." : "Tiếp theo"}
						</Button>
					</div>
				</form>
			)}

			{/* Step 2: Version Configuration */}
			{step === 2 && (
				<form onSubmit={handleStep2Submit}>
					{/* Version Info */}
					<Card className="mb-6">
						<CardHeader>
							<CardTitle>Thông tin version</CardTitle>
							<CardDescription>
								Đặt tên và mô tả cho version giáo trình này
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="versionName">
										Tên version <span className="text-red-500">*</span>
									</Label>
									<Input
										id="versionName"
										placeholder="VD: Version 1.0, Giáo trình HK1"
										value={versionName}
										onChange={(e) => setVersionName(e.target.value)}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="versionNotes">Ghi chú</Label>
									<Input
										id="versionNotes"
										placeholder="VD: Initial version"
										value={versionNotes}
										onChange={(e) => setVersionNotes(e.target.value)}
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Syllabus Detail Configuration */}
					<Card className="mb-6">
						<CardHeader>
							<CardTitle>Cấu hình chi tiết bài học</CardTitle>
							<CardDescription>
								Chọn các bài học và cấu hình thời lượng, mục tiêu, tài liệu cho
								từng bài
							</CardDescription>
						</CardHeader>
						<CardContent>
							<SyllabusDetailTable
								lessons={allLessons || []}
								value={syllabusDetails}
								onChange={setSyllabusDetails}
							/>
						</CardContent>
					</Card>

					{/* Actions */}
					<div className="flex justify-between gap-4">
						<Button type="button" variant="outline" onClick={() => setStep(1)}>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Quay lại
						</Button>
						<Button type="submit" className="gap-2" isDisabled={isLoading}>
							<Save className="h-4 w-4" />
							{isLoading ? "Đang lưu..." : "Hoàn thành"}
						</Button>
					</div>
				</form>
			)}
		</div>
	);
}
