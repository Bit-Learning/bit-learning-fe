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
import {
	DndContext,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import {
	SortableContext,
	arrayMove,
	rectSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BookOpen, GripVertical, Loader2, Plus, X } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import {
	useCreateCurriculumLink,
	useCurriculumLinks,
	useDeleteCurriculumLink,
	useReorderCurriculumLinks,
} from "../queries/useCurriculumLink";
import type { CurriculumLinkResponse } from "../api/curriculum-link.api";

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

// ── Sortable chip ────────────────────────────────────────────────────────────
function SortableLinkChip({
	link,
	onDelete,
	isDeleting,
}: {
	link: CurriculumLinkResponse;
	onDelete: (id: number) => void;
	isDeleting: boolean;
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: link.linkId });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
		zIndex: isDragging ? 50 : undefined,
	};

	const label = [
		link.curriculumName,
		`Lớp ${link.classLevel}`,
		link.subjectName,
		link.chapterName,
	]
		.filter(Boolean)
		.join(" · ");

	return (
		<div ref={setNodeRef} style={style}>
			<Badge
				variant="secondary"
				className="flex items-center gap-1 py-1 pl-1 pr-1 text-sm select-none"
			>
				{/* drag handle */}
				<button
					type="button"
					{...attributes}
					{...listeners}
					className="cursor-grab rounded p-0.5 text-muted-foreground hover:text-foreground active:cursor-grabbing"
					aria-label="Kéo để sắp xếp"
				>
					<GripVertical className="h-3.5 w-3.5" />
				</button>
				<span className="mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/20 text-xs font-bold">
					{link.displayOrder}
				</span>
				<span>{label}</span>
				<button
					type="button"
					onClick={() => onDelete(link.linkId)}
					disabled={isDeleting}
					className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 disabled:opacity-50"
					aria-label={`Xóa liên kết ${label}`}
				>
					{isDeleting ? (
						<Loader2 className="h-3 w-3 animate-spin" />
					) : (
						<X className="h-3 w-3" />
					)}
				</button>
			</Badge>
		</div>
	);
}

// ── Main component ───────────────────────────────────────────────────────────
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

	// local optimistic order — mirrors server order, updated on drag
	const [localLinks, setLocalLinks] = useState<CurriculumLinkResponse[] | null>(
		null,
	);

	const { data: curriculums = [], isLoading: isLoadingCurriculums } =
		useCurriculumsList();
	const { data: allSubjects = [], isLoading: isLoadingSubjects } =
		useSubjectsList();
	const { data: chapters = [], isLoading: isLoadingChapters } =
		useChaptersBySubject(selectedSubjectId ?? undefined);
	const { data: serverLinks = [], isLoading: isLoadingLinks } =
		useCurriculumLinks(gameId);
	const createLink = useCreateCurriculumLink(gameId);
	const deleteLink = useDeleteCurriculumLink(gameId);
	const reorderLinks = useReorderCurriculumLinks(gameId);

	// use local order while dragging / saving, fall back to server data
	const links =
		localLinks ??
		[...serverLinks].sort((a, b) => a.displayOrder - b.displayOrder);

	// sync local state when server data changes (e.g. after add/delete)
	// reset local override whenever server data refreshes (unless we're mid-drag)
	// we do this lazily: if localLinks is set and matches server length, clear it
	if (localLinks !== null && localLinks.length !== serverLinks.length) {
		setLocalLinks(null);
	}

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
	);

	const availableGrades = useMemo(() => {
		if (!selectedCurriculumId) return [];
		const grades = new Set<number>();
		for (const subject of allSubjects) {
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

	const filteredSubjects = useMemo(() => {
		if (!selectedCurriculumId || !selectedGrade) return [];
		return allSubjects.filter(
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
			setSelectedCurriculumId(null);
			setSelectedGrade(null);
			setSelectedSubjectId(null);
			setSelectedChapterId(null);
			setDisplayOrder(0);
			setLocalLinks(null);
		} catch (error: unknown) {
			setAddError(getErrorMessage(error, "Không thể thêm liên kết"));
		}
	};

	const handleDeleteLink = async (linkId: number) => {
		setDeleteError(null);
		try {
			await deleteLink.mutateAsync(linkId);
			setLocalLinks(null);
		} catch (error: unknown) {
			setDeleteError(getErrorMessage(error, "Không thể xóa liên kết"));
		}
	};

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const oldIndex = links.findIndex((l) => l.linkId === active.id);
		const newIndex = links.findIndex((l) => l.linkId === over.id);
		if (oldIndex === -1 || newIndex === -1) return;

		const reordered = arrayMove(links, oldIndex, newIndex).map((link, idx) => ({
			...link,
			displayOrder: idx,
		}));

		// optimistic update
		setLocalLinks(reordered);

		try {
			await reorderLinks.mutateAsync(
				reordered.map((l) => ({
					linkId: l.linkId,
					displayOrder: l.displayOrder,
				})),
			);
		} catch {
			// revert on error
			setLocalLinks(null);
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
				<div className="grid gap-3 sm:grid-cols-2">
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
								{curriculums.map((c) => (
									<SelectItem key={c.id} value={String(c.id)}>
										{c.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

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

					<div className="space-y-2">
						<Label>Chương</Label>
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

				{/* Existing links — drag-and-drop */}
				{isLoadingLinks ? (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" />
						Đang tải danh sách liên kết...
					</div>
				) : links.length > 0 ? (
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label>Liên kết hiện có</Label>
							<span className="text-xs text-muted-foreground">
								Kéo <GripVertical className="inline h-3 w-3" /> để thay đổi thứ
								tự
							</span>
						</div>
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragEnd={handleDragEnd}
						>
							<SortableContext
								items={links.map((l) => l.linkId)}
								strategy={rectSortingStrategy}
							>
								<div className="flex flex-wrap gap-2">
									{links.map((link) => (
										<SortableLinkChip
											key={link.linkId}
											link={link}
											onDelete={handleDeleteLink}
											isDeleting={deleteLink.isPending}
										/>
									))}
								</div>
							</SortableContext>
						</DndContext>
						{reorderLinks.isPending && (
							<p className="flex items-center gap-1.5 text-xs text-muted-foreground">
								<Loader2 className="h-3 w-3 animate-spin" />
								Đang lưu thứ tự...
							</p>
						)}
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
