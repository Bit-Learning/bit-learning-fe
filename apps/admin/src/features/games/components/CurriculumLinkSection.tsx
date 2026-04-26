import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useChaptersBySubject } from "@/features/curriculum/queries/useChapter";
import { useCurriculumsList } from "@/features/curriculum/queries/useCurriculum";
import { useSubjectsList } from "@/features/curriculum/queries/useSubject";
import { BookOpen, Loader2, Plus, X } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import {
	useCreateCurriculumLink,
	useCurriculumLinks,
	useDeleteCurriculumLink,
} from "../queries/useCurriculumLink";

interface CurriculumLinkSectionProps {
	gameId: number;
	gameType: string;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
	if (
		typeof error === "object" &&
		error !== null &&
		"response" in error &&
		typeof (error as any).response === "object" &&
		(error as any).response !== null &&
		"data" in (error as any).response &&
		typeof (error as any).response.data === "object" &&
		(error as any).response.data !== null &&
		"message" in (error as any).response.data &&
		typeof (error as any).response.data.message === "string"
	) {
		return (error as any).response.data.message;
	}
	if (error instanceof Error && error.message) {
		return error.message;
	}
	return fallback;
};

export const CurriculumLinkSection: React.FC<CurriculumLinkSectionProps> = ({
	gameId,
	gameType,
}) => {
	const [selectedCurriculumId, setSelectedCurriculumId] = useState<
		number | null
	>(null);
	const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
	const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
		null,
	);
	const [selectedChapterId, setSelectedChapterId] = useState<number | null>(
		null,
	);
	const [displayOrder, setDisplayOrder] = useState<number>(0);
	const [addError, setAddError] = useState<string | null>(null);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	const { data: curriculums = [], isLoading: isLoadingCurriculums } =
		useCurriculumsList();
	const { data: allSubjects = [], isLoading: isLoadingSubjects } =
		useSubjectsList();
	const { data: chapters = [], isLoading: isLoadingChapters } =
		useChaptersBySubject(selectedSubjectId ?? undefined);
	const { data: links = [], isLoading: isLoadingLinks } =
		useCurriculumLinks(gameId);
	const createLink = useCreateCurriculumLink(gameId);
	const deleteLink = useDeleteCurriculumLink(gameId);

	// Grades available for the selected curriculum (3-12 that have subjects)
	const availableGrades = useMemo(() => {
		if (!selectedCurriculumId) return [];
		const grades = new Set<number>();
		for (const subject of allSubjects ?? []) {
			if (
				subject.curriculum?.id === selectedCurriculumId &&
				subject.classLevel >= 3 &&
				subject.classLevel <= 12
			) {
				grades.add(subject.classLevel);
			}
		}
		return Array.from(grades).sort((a, b) => a - b);
	}, [selectedCurriculumId, allSubjects]);

	// Subjects filtered by selected curriculum + grade
	const filteredSubjects = useMemo(() => {
		if (!selectedCurriculumId || !selectedGrade) return [];
		return (allSubjects ?? []).filter(
			(s) =>
				s.curriculum?.id === selectedCurriculumId &&
				s.classLevel === selectedGrade,
		);
	}, [selectedCurriculumId, selectedGrade, allSubjects]);

	const handleCurriculumChange = (value: string) => {
		setSelectedCurriculumId(Number(value));
		setSelectedGrade(null);
		setSelectedSubjectId(null);
		setSelectedChapterId(null);
	};

	const handleGradeChange = (value: string) => {
		setSelectedGrade(Number(value));
		setSelectedSubjectId(null);
		setSelectedChapterId(null);
	};

	const handleSubjectChange = (value: string) => {
		setSelectedSubjectId(Number(value));
		setSelectedChapterId(null);
	};

	const handleChapterChange = (value: string) => {
		setSelectedChapterId(value === "__none__" ? null : Number(value));
	};

	const handleAddLink = async () => {
		if (!selectedSubjectId) return;
		setAddError(null);
		try {
			await createLink.mutateAsync({
				subjectId: selectedSubjectId,
				chapterId: selectedChapterId ?? null,
				displayOrder,
			});
			// Reset form after success
			setSelectedCurriculumId(null);
			setSelectedGrade(null);
			setSelectedSubjectId(null);
			setSelectedChapterId(null);
			setDisplayOrder(0);
		} catch (error: unknown) {
			setAddError(getErrorMessage(error, "Không thể thêm liên kết"));
		}
	};

	const handleDeleteLink = async (linkId: number) => {
		setDeleteError(null);
		try {
			await deleteLink.mutateAsync(linkId);
		} catch (error: unknown) {
			setDeleteError(getErrorMessage(error, "Không thể xóa liên kết"));
		}
	};

	if (gameType === "MATCHING") return null;

	return (
		<Card>
			<CardHeader className="border-b">
				<div className="flex items-center gap-2">
					<BookOpen className="h-5 w-5 text-muted-foreground" />
					<div>
						<CardTitle>Liên kết chương trình học</CardTitle>
						<CardDescription>
							Liên kết game này với môn học, lớp và chương trong chương trình
							học.
						</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-6 pt-6">
				{/* Cascading dropdowns */}
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					{/* Curriculum dropdown */}
					<div className="space-y-2">
						<Label>Bộ sách</Label>
						<Select
							value={
								selectedCurriculumId !== null
									? String(selectedCurriculumId)
									: ""
							}
							onValueChange={handleCurriculumChange}
							disabled={isLoadingCurriculums}
						>
							<SelectTrigger>
								<SelectValue placeholder="Chọn bộ sách" />
							</SelectTrigger>
							<SelectContent>
								{(curriculums ?? []).map((c) => (
									<SelectItem key={c.id} value={String(c.id)}>
										{c.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Grade dropdown */}
					<div className="space-y-2">
						<Label>Lớp</Label>
						<Select
							value={selectedGrade !== null ? String(selectedGrade) : ""}
							onValueChange={handleGradeChange}
							disabled={!selectedCurriculumId || isLoadingSubjects}
						>
							<SelectTrigger>
								<SelectValue placeholder="Chọn lớp" />
							</SelectTrigger>
							<SelectContent>
								{availableGrades.map((grade) => (
									<SelectItem key={grade} value={String(grade)}>
										Lớp {grade}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Subject dropdown */}
					<div className="space-y-2">
						<Label>Môn học</Label>
						<Select
							value={
								selectedSubjectId !== null ? String(selectedSubjectId) : ""
							}
							onValueChange={handleSubjectChange}
							disabled={!selectedGrade || isLoadingSubjects}
						>
							<SelectTrigger>
								<SelectValue placeholder="Chọn môn học" />
							</SelectTrigger>
							<SelectContent>
								{filteredSubjects.map((s) => (
									<SelectItem key={s.id} value={String(s.id)}>
										{s.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Chapter dropdown (optional) */}
					<div className="space-y-2">
						<Label>Chương (tùy chọn)</Label>
						<Select
							value={
								selectedChapterId !== null
									? String(selectedChapterId)
									: "__none__"
							}
							onValueChange={handleChapterChange}
							disabled={!selectedSubjectId || isLoadingChapters}
						>
							<SelectTrigger>
								<SelectValue placeholder="Không chọn chương" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="__none__">Không chọn chương</SelectItem>
								{(chapters ?? []).map((ch) => (
									<SelectItem key={ch.id} value={String(ch.id)}>
										Chương {ch.chapterNo}: {ch.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Display order + Add button */}
				<div className="flex flex-wrap items-end gap-3">
					<div className="space-y-2">
						<Label htmlFor="displayOrder">Thứ tự hiển thị</Label>
						<Input
							id="displayOrder"
							type="number"
							min={0}
							value={displayOrder}
							onChange={(e) => setDisplayOrder(Number(e.target.value))}
							className="w-32"
						/>
					</div>
					<Button
						onClick={handleAddLink}
						disabled={!selectedSubjectId || createLink.isPending}
					>
						{createLink.isPending ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<Plus className="mr-2 h-4 w-4" />
						)}
						Thêm liên kết
					</Button>
				</div>

				{addError ? (
					<p className="text-sm text-destructive">{addError}</p>
				) : null}

				{/* Existing links as chips */}
				{isLoadingLinks ? (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" />
						Đang tải danh sách liên kết...
					</div>
				) : links.length > 0 ? (
					<div className="space-y-2">
						<Label>Liên kết hiện có</Label>
						<div className="flex flex-wrap gap-2">
							{links.map((link) => {
								const label = [
									link.curriculumName,
									`Lớp ${link.classLevel}`,
									link.subjectName,
									link.chapterName,
								]
									.filter(Boolean)
									.join(" · ");
								return (
									<Badge
										key={link.linkId}
										variant="secondary"
										className="flex items-center gap-1 py-1 pl-3 pr-1 text-sm"
									>
										<span>{label}</span>
										<button
											type="button"
											onClick={() => handleDeleteLink(link.linkId)}
											disabled={deleteLink.isPending}
											className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 disabled:opacity-50"
											aria-label={`Xóa liên kết ${label}`}
										>
											{deleteLink.isPending ? (
												<Loader2 className="h-3 w-3 animate-spin" />
											) : (
												<X className="h-3 w-3" />
											)}
										</button>
									</Badge>
								);
							})}
						</div>
					</div>
				) : (
					<p className="text-sm text-muted-foreground">
						Chưa có liên kết chương trình học nào.
					</p>
				)}

				{deleteError ? (
					<p className="text-sm text-destructive">{deleteError}</p>
				) : null}
			</CardContent>
		</Card>
	);
};
