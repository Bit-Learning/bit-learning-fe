import { Loader2 } from "lucide-react";
import { useChaptersBySubject } from "../queries/useChapter";
import { useCurriculumsList } from "../queries/useCurriculum";
import { useSubjectsList } from "../queries/useSubject";

type Props = {
	chapterId: number | null;
	curriculumId: number | null;
	disabled?: boolean;
	error?: string;
	onChapterChange: (chapterId: number | null) => void;
	onChapterLabelChange?: (chapterLabel: string | null) => void;
	onCurriculumChange: (curriculumId: number | null) => void;
	onSubjectChange: (subjectId: number | null) => void;
	subjectId: number | null;
};

const toNullableNumber = (value: string) => {
	if (!value) return null;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
};

export function CurriculumChapterPicker({
	chapterId,
	curriculumId,
	disabled = false,
	error,
	onChapterChange,
	onChapterLabelChange,
	onCurriculumChange,
	onSubjectChange,
	subjectId,
}: Props) {
	const { data: curriculums = [], isLoading: isCurriculumsLoading } =
		useCurriculumsList();
	const { data: subjects = [], isLoading: isSubjectsLoading } =
		useSubjectsList();
	const { data: chapters, isLoading: isChaptersLoading } = useChaptersBySubject(
		subjectId ?? undefined,
	);

	const subjectOptions = subjects.filter(
		(subject) => subject.curriculum?.id === curriculumId,
	);
	const chapterOptions = chapters ?? [];

	const handleCurriculumChange = (value: string) => {
		const nextCurriculumId = toNullableNumber(value);
		onCurriculumChange(nextCurriculumId);
		onSubjectChange(null);
		onChapterChange(null);
		onChapterLabelChange?.(null);
	};

	const handleSubjectChange = (value: string) => {
		const nextSubjectId = toNullableNumber(value);
		onSubjectChange(nextSubjectId);
		onChapterChange(null);
		onChapterLabelChange?.(null);
	};

	const handleChapterChange = (value: string) => {
		const nextChapterId = toNullableNumber(value);
		const selectedChapter =
			chapterOptions.find((chapter) => chapter.id === nextChapterId) ?? null;
		onChapterChange(nextChapterId);
		onChapterLabelChange?.(
			selectedChapter
				? `Chương ${selectedChapter.chapterNo}: ${selectedChapter.name}`
				: null,
		);
	};

	const selectClassName =
		"w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

	return (
		<div className="space-y-3">
			<div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
				<div>
					<select
						id="curriculum-picker"
						className={selectClassName}
						value={curriculumId ?? ""}
						onChange={(event) => handleCurriculumChange(event.target.value)}
						disabled={disabled || isCurriculumsLoading}
					>
						<option value="">Chọn chương trình</option>
						{curriculums.map((curriculum) => (
							<option key={curriculum.id} value={curriculum.id}>
								{curriculum.name} ({curriculum.code})
							</option>
						))}
					</select>
				</div>

				<div>
					<select
						id="subject-picker"
						className={selectClassName}
						value={subjectId ?? ""}
						onChange={(event) => handleSubjectChange(event.target.value)}
						disabled={
							disabled ||
							isSubjectsLoading ||
							!curriculumId ||
							subjectOptions.length === 0
						}
					>
						<option value="">Chọn môn học</option>
						{subjectOptions.map((subject) => (
							<option key={subject.id} value={subject.id}>
								{subject.name}
							</option>
						))}
					</select>
				</div>

				<div className="relative">
					<select
						id="chapter-picker"
						className={selectClassName}
						value={chapterId ?? ""}
						onChange={(event) => handleChapterChange(event.target.value)}
						disabled={disabled || !subjectId || isChaptersLoading}
					>
						<option value="">Chọn chương học</option>
						{chapterOptions.map((chapter) => (
							<option key={chapter.id} value={chapter.id}>
								{`Chương ${chapter.chapterNo}: ${chapter.name}`}
							</option>
						))}
					</select>
					{isChaptersLoading && (
						<Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
					)}
				</div>
			</div>

			{error && <p className="text-sm text-red-600">{error}</p>}
		</div>
	);
}
