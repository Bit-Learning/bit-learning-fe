import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, LayoutGrid, Loader2, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useSubjectsWithChapters } from "@/features/curriculum/queries/useSubject";
import { useMatchingGameMappings } from "../queries/useAdminMatchingGame";
import type { CurriculumMappingDto } from "../api/admin-matching-game.api";

const STATUS_LABEL: Record<string, string> = {
	PUBLISHED: "Đã xuất bản",
	DRAFT: "Nháp",
	ARCHIVED: "Lưu trữ",
};

const STATUS_VARIANT: Record<
	string,
	"default" | "secondary" | "destructive" | "outline"
> = {
	PUBLISHED: "default",
	DRAFT: "secondary",
	ARCHIVED: "destructive",
};

export function CurriculumGamesPage() {
	const { data: allSubjects = [], isLoading: isLoadingSubjects } =
		useSubjectsWithChapters();
	const { data: mappings = [], isLoading: isLoadingMappings } =
		useMatchingGameMappings();

	// Derive unique curriculums
	const curriculums = useMemo(() => {
		const map = new Map<number, { id: number; name: string; code: string }>();
		for (const s of allSubjects) {
			if (s.curriculum) map.set(s.curriculum.id, s.curriculum);
		}
		return Array.from(map.values()).sort((a, b) =>
			a.name.localeCompare(b.name),
		);
	}, [allSubjects]);

	const [selectedCurriculumId, setSelectedCurriculumId] = useState<
		number | null
	>(null);
	const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

	// Subjects filtered by curriculum
	const filteredSubjects = useMemo(
		() =>
			selectedCurriculumId
				? allSubjects
						.filter((s) => s.curriculum?.id === selectedCurriculumId)
						.sort((a, b) => a.classLevel - b.classLevel)
				: allSubjects.slice().sort((a, b) => a.classLevel - b.classLevel),
		[allSubjects, selectedCurriculumId],
	);

	// Grades available for selected curriculum
	const availableGrades = useMemo(
		() =>
			[...new Set(filteredSubjects.map((s) => s.classLevel))].sort(
				(a, b) => a - b,
			),
		[filteredSubjects],
	);

	// Final subjects after grade filter
	const displaySubjects = useMemo(
		() =>
			selectedGrade
				? filteredSubjects.filter((s) => s.classLevel === selectedGrade)
				: filteredSubjects,
		[filteredSubjects, selectedGrade],
	);

	// Build a lookup: grade+topicCode → mapping
	const mappingLookup = useMemo(() => {
		const map = new Map<string, CurriculumMappingDto>();
		for (const m of mappings) {
			map.set(`${m.grade}-${m.topicCode}`, m);
		}
		return map;
	}, [mappings]);

	const isLoading = isLoadingSubjects || isLoadingMappings;

	if (isLoading) {
		return (
			<div className="flex items-center gap-2 p-6 text-muted-foreground">
				<Loader2 className="h-4 w-4 animate-spin" />
				Đang tải dữ liệu...
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Filters */}
			<div className="flex flex-wrap items-center gap-3">
				<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
					<BookOpen className="h-4 w-4" />
					Lọc theo:
				</div>
				<Select
					value={selectedCurriculumId ? String(selectedCurriculumId) : "all"}
					onValueChange={(v) => {
						setSelectedCurriculumId(v === "all" ? null : Number(v));
						setSelectedGrade(null);
					}}
				>
					<SelectTrigger className="w-56">
						<SelectValue placeholder="Tất cả bộ sách" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Tất cả bộ sách</SelectItem>
						{curriculums.map((c) => (
							<SelectItem key={c.id} value={String(c.id)}>
								{c.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select
					value={selectedGrade ? String(selectedGrade) : "all"}
					onValueChange={(v) =>
						setSelectedGrade(v === "all" ? null : Number(v))
					}
				>
					<SelectTrigger className="w-32">
						<SelectValue placeholder="Tất cả lớp" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Tất cả lớp</SelectItem>
						{availableGrades.map((g) => (
							<SelectItem key={g} value={String(g)}>
								Lớp {g}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{(selectedCurriculumId || selectedGrade) && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => {
							setSelectedCurriculumId(null);
							setSelectedGrade(null);
						}}
					>
						Xóa bộ lọc
					</Button>
				)}
			</div>

			{/* Subject cards */}
			<div className="space-y-6">
				{displaySubjects.map((subject) => {
					const chapters = (subject.chapters ?? [])
						.slice()
						.sort((a, b) => a.chapterNo - b.chapterNo);

					return (
						<Card key={subject.id} className="overflow-hidden">
							<CardHeader className="border-b bg-muted/30 py-4">
								<div className="flex items-center justify-between gap-3">
									<div className="flex items-center gap-3">
										<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
											{subject.classLevel}
										</div>
										<div>
											<CardTitle className="text-base">
												{subject.name}
											</CardTitle>
											<p className="text-xs text-muted-foreground">
												{subject.curriculum?.name} · {chapters.length} chương
											</p>
										</div>
									</div>
								</div>
							</CardHeader>
							<CardContent className="p-0">
								<div className="divide-y">
									{chapters.map((chapter) => {
										const mapping = mappingLookup.get(
											`${subject.classLevel}-${extractTopicCode(chapter.name)}`,
										);
										return (
											<div
												key={chapter.id}
												className="flex items-center justify-between gap-4 px-5 py-3"
											>
												<div className="min-w-0 flex-1">
													<p className="truncate text-sm font-medium">
														{chapter.name}
													</p>
													{mapping && (
														<p className="text-xs text-muted-foreground">
															Game #{mapping.gameId} · {mapping.gameTitle}
														</p>
													)}
												</div>
												<div className="flex shrink-0 items-center gap-2">
													{mapping ? (
														<>
															<Badge
																variant={
																	STATUS_VARIANT[mapping.status ?? ""] ??
																	"outline"
																}
															>
																{STATUS_LABEL[mapping.status ?? ""] ??
																	"Không rõ"}
															</Badge>
															<Button asChild size="sm" variant="outline">
																<Link
																	to="/apps/games/matching"
																	search={{
																		gameId: mapping.gameId,
																		grade: mapping.grade,
																		topic: mapping.topicCode,
																	}}
																>
																	<LayoutGrid className="mr-1.5 h-3.5 w-3.5" />
																	Chỉnh sửa
																</Link>
															</Button>
														</>
													) : (
														<Button asChild size="sm" variant="ghost">
															<Link to="/apps/games/matching/new">
																<PlusCircle className="mr-1.5 h-3.5 w-3.5" />
																Tạo game
															</Link>
														</Button>
													)}
												</div>
											</div>
										);
									})}
								</div>
							</CardContent>
						</Card>
					);
				})}

				{displaySubjects.length === 0 && (
					<div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
						Không có môn học nào phù hợp với bộ lọc.
					</div>
				)}
			</div>
		</div>
	);
}

// Helper: extract topic code from chapter name "Chủ đề A: ..." → "A"
function extractTopicCode(name: string): string {
	const match = name.match(/[Cc]hủ\s+đề\s+([A-Z0-9]+)\s*[:\-]/);
	if (match?.[1]) return match[1].toUpperCase();
	const fallback = name.match(/\b([A-F])\b/);
	return fallback?.[1] ?? "";
}
