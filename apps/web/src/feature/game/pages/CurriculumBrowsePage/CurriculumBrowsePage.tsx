import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSelector } from "react-redux";
import { useSubjectsList } from "@/feature/matrix/queries/useSubject";
import matchingGameService, {
	type CurriculumMapping,
} from "@/feature/game/services/matchingGameService";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/feature/game/components/Navbar/Navbar";
import Footer from "@/feature/game/components/Footer";
import PageMeta from "@/shared/components/seo/page-meta";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import styles from "./CurriculumBrowsePage.module.css";

// Extract topic code from chapter name "Chủ đề A: ..." → "A"
function extractTopicCode(name: string): string {
	const match = name.match(/[Cc]hủ\s+đề\s+([A-Z0-9]+)\s*[:\-]/);
	if (match?.[1]) return match[1].toUpperCase();
	const fallback = name.match(/\b([A-F])\b/);
	return fallback?.[1] ?? "";
}

const STATUS_CONFIG: Record<
	string,
	{ label: string; color: string; dot: string }
> = {
	PUBLISHED: {
		label: "Đã xuất bản",
		color: "rgba(34,197,94,0.15)",
		dot: "#22c55e",
	},
	DRAFT: {
		label: "Bản nháp",
		color: "rgba(251,191,36,0.15)",
		dot: "#fbbf24",
	},
	ARCHIVED: {
		label: "Lưu trữ",
		color: "rgba(148,163,184,0.12)",
		dot: "#94a3b8",
	},
};

type GradeLevel = "all" | "primary" | "secondary" | "high";

const GRADE_LEVEL_CONFIG: Record<
	GradeLevel,
	{ label: string; grades: number[] }
> = {
	all: { label: "Tất cả", grades: [] },
	primary: { label: "Tiểu học (3-5)", grades: [3, 4, 5] },
	secondary: { label: "THCS (6-9)", grades: [6, 7, 8, 9] },
	high: { label: "THPT (10-12)", grades: [10, 11, 12] },
};

type MappingWithStatus = CurriculumMapping & { status?: string };

function ChapterRow({
	chapter,
	grade,
	mappingLookup,
}: {
	chapter: { id: number; name: string; chapterNo: number };
	grade: number;
	mappingLookup: Map<string, CurriculumMapping>;
}) {
	const topicCode = extractTopicCode(chapter.name);
	const mapping = mappingLookup.get(`${grade}-${topicCode}`) as
		| MappingWithStatus
		| undefined;
	const statusCfg = mapping
		? (STATUS_CONFIG[mapping.status ?? "PUBLISHED"] ?? STATUS_CONFIG.PUBLISHED)
		: null;

	return (
		<div className={styles.chapterRow}>
			<div className={styles.chapterInfo}>
				<span className={styles.chapterNo}>{chapter.chapterNo}</span>
				<span className={styles.chapterName}>{chapter.name}</span>
			</div>
			<div className={styles.chapterAction}>
				{mapping ? (
					<>
						{statusCfg && (
							<span
								className={styles.statusBadge}
								style={{ background: statusCfg.color }}
							>
								<span
									className={styles.statusDot}
									style={{ background: statusCfg.dot }}
								/>
								{statusCfg.label}
							</span>
						)}
						<Link
							to="/matching/detail"
							search={{
								gameId: mapping.gameId,
								grade: mapping.grade,
								topic: mapping.topicCode,
							}}
							className={styles.playBtn}
						>
							<span className="material-icons" style={{ fontSize: 16 }}>
								play_arrow
							</span>
							Chơi
						</Link>
					</>
				) : (
					<span className={styles.noGame}>Chưa có game</span>
				)}
			</div>
		</div>
	);
}

function SubjectCard({
	subject,
	mappingLookup,
	highlight,
}: {
	subject: {
		id: number;
		name: string;
		classLevel: number;
		curriculum?: { id: number; name: string; code: string };
		chapters?: { id: number; name: string; chapterNo: number }[];
	};
	mappingLookup: Map<string, CurriculumMapping>;
	highlight?: boolean;
}) {
	const chapters = (subject.chapters ?? [])
		.slice()
		.sort((a, b) => a.chapterNo - b.chapterNo);

	const gameCount = chapters.filter((c) =>
		mappingLookup.has(`${subject.classLevel}-${extractTopicCode(c.name)}`),
	).length;

	return (
		<div className={`${styles.card} ${highlight ? styles.cardHighlight : ""}`}>
			<div className={styles.cardHeader}>
				<div
					className={`${styles.gradeChip} ${highlight ? styles.gradeChipHighlight : ""}`}
				>
					Lớp {subject.classLevel}
				</div>
				<div className={styles.cardMeta}>
					<span className={styles.cardTitle}>{subject.name}</span>
					<span className={styles.cardSub}>
						{subject.curriculum?.name} ·{" "}
						{gameCount > 0
							? `${gameCount}/${chapters.length} game`
							: "Chưa có game"}
					</span>
				</div>
				{highlight && (
					<span className={styles.recommendedBadge}>
						<span className="material-icons" style={{ fontSize: 13 }}>
							auto_awesome
						</span>
						Dành cho bạn
					</span>
				)}
			</div>
			<div className={styles.chapterList}>
				{chapters.length === 0 ? (
					<div className={styles.noChapters}>Chưa có chương nào.</div>
				) : (
					chapters.map((chapter) => (
						<ChapterRow
							key={chapter.id}
							chapter={chapter}
							grade={subject.classLevel}
							mappingLookup={mappingLookup}
						/>
					))
				)}
			</div>
		</div>
	);
}

export default function CurriculumBrowsePage() {
	const { userInfo } = useSelector(selectAuthStateInfo);
	const userGrade = userInfo?.grade ?? null;

	const { data: allSubjects = [], isLoading: isLoadingSubjects } =
		useSubjectsList();

	const { data: mappings = [], isLoading: isLoadingMappings } = useQuery({
		queryKey: ["matching", "curriculum-mappings"],
		queryFn: () => matchingGameService.getCurriculumMappings(),
		staleTime: 5 * 60 * 1000,
	});

	const [selectedCurriculumId, setSelectedCurriculumId] = useState<
		number | null
	>(null);
	const [selectedGradeLevel, setSelectedGradeLevel] =
		useState<GradeLevel>("all");
	const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

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

	// Subjects for user's grade (featured)
	const featuredSubjects = useMemo(() => {
		if (!userGrade) return [];
		return allSubjects
			.filter((s) => s.classLevel === userGrade)
			.sort((a, b) =>
				(a.curriculum?.name ?? "").localeCompare(b.curriculum?.name ?? ""),
			);
	}, [allSubjects, userGrade]);

	// Subjects filtered by curriculum + grade level
	const filteredSubjects = useMemo(() => {
		let base = selectedCurriculumId
			? allSubjects.filter((s) => s.curriculum?.id === selectedCurriculumId)
			: allSubjects;
		const levelGrades = GRADE_LEVEL_CONFIG[selectedGradeLevel].grades;
		if (levelGrades.length > 0) {
			base = base.filter((s) => levelGrades.includes(s.classLevel));
		}
		return base.slice().sort((a, b) => a.classLevel - b.classLevel);
	}, [allSubjects, selectedCurriculumId, selectedGradeLevel]);

	// Available grades for current filter
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

	// Mapping lookup: "grade-topicCode" → CurriculumMapping
	const mappingLookup = useMemo(() => {
		const map = new Map<string, CurriculumMapping>();
		for (const m of mappings) {
			map.set(`${m.grade}-${m.topicCode}`, m);
		}
		return map;
	}, [mappings]);

	const isLoading = isLoadingSubjects || isLoadingMappings;

	const totalGames = mappings.length;
	const publishedGames = (mappings as MappingWithStatus[]).filter(
		(m) => m.status === "PUBLISHED",
	).length;

	return (
		<div className={styles.shell}>
			<PageMeta
				title="Game theo chương trình học - Bit Learning"
				description="Khám phá trò chơi ghép cặp theo bộ sách và lớp học trong chương trình Tin học."
			/>
			<link
				href="https://fonts.googleapis.com/icon?family=Material+Icons"
				rel="stylesheet"
			/>
			<Navbar />

			{/* Hero */}
			<section className={styles.hero}>
				<div className={styles.heroGlow} />
				<div className={styles.heroContent}>
					<span className={styles.heroBadge}>
						<span className="material-icons" style={{ fontSize: 14 }}>
							school
						</span>
						Chương trình học
					</span>
					<h1 className={styles.heroTitle}>
						Game theo <span className={styles.accent}>bộ sách</span>
					</h1>
					<p className={styles.heroDesc}>
						{userGrade
							? `Chào ${userInfo?.firstName ?? "bạn"}! Dưới đây là game dành riêng cho Lớp ${userGrade} của bạn.`
							: "Chọn bộ sách và lớp học để tìm trò chơi ghép cặp phù hợp với chương trình Tin học."}
					</p>
					<div className={styles.heroStats}>
						<div className={styles.statPill}>
							<span className={styles.statNum}>{totalGames}</span>
							<span className={styles.statLabel}>trò chơi</span>
						</div>
						<div className={styles.statPill}>
							<span className={styles.statNum}>{publishedGames}</span>
							<span className={styles.statLabel}>đã xuất bản</span>
						</div>
						<div className={styles.statPill}>
							<span className={styles.statNum}>{curriculums.length}</span>
							<span className={styles.statLabel}>bộ sách</span>
						</div>
					</div>
				</div>
			</section>

			<main className={styles.main}>
				{/* Featured: games for user's grade */}
				{!isLoading && userGrade && featuredSubjects.length > 0 && (
					<section className={styles.featuredSection}>
						<div className={styles.featuredHeader}>
							<div className={styles.featuredTitleRow}>
								<span className={styles.featuredIcon}>
									<span className="material-icons">auto_awesome</span>
								</span>
								<div>
									<p className={styles.kicker}>Dành riêng cho bạn</p>
									<h2 className={styles.featuredTitle}>Game Lớp {userGrade}</h2>
								</div>
							</div>
							<button
								type="button"
								className={styles.filterGradeBtn}
								onClick={() => setSelectedGrade(userGrade)}
							>
								Xem tất cả lớp {userGrade}
								<span className="material-icons" style={{ fontSize: 16 }}>
									arrow_forward
								</span>
							</button>
						</div>
						<div className={styles.featuredGrid}>
							{featuredSubjects.map((subject) => (
								<SubjectCard
									key={subject.id}
									subject={subject}
									mappingLookup={mappingLookup}
									highlight
								/>
							))}
						</div>
					</section>
				)}

				{/* Divider */}
				{!isLoading && userGrade && featuredSubjects.length > 0 && (
					<div className={styles.divider}>
						<span>Tất cả chương trình học</span>
					</div>
				)}

				{/* Filters */}
				<div className={styles.filterBar}>
					{/* Grade level */}
					<div className={styles.filterGroup}>
						<span className={styles.filterGroupLabel}>Khối lớp</span>
						<div className={styles.tabs}>
							{(
								Object.entries(GRADE_LEVEL_CONFIG) as [
									GradeLevel,
									{ label: string },
								][]
							).map(([key, { label }]) => (
								<button
									key={key}
									type="button"
									className={`${styles.tab} ${selectedGradeLevel === key ? styles.tabActive : ""}`}
									onClick={() => {
										setSelectedGradeLevel(key);
										setSelectedGrade(null);
									}}
								>
									{label}
								</button>
							))}
						</div>
					</div>

					{/* Curriculum */}
					<div className={styles.filterGroup}>
						<span className={styles.filterGroupLabel}>Bộ sách</span>
						<div className={styles.tabs}>
							<button
								type="button"
								className={`${styles.tab} ${!selectedCurriculumId ? styles.tabActive : ""}`}
								onClick={() => {
									setSelectedCurriculumId(null);
									setSelectedGrade(null);
								}}
							>
								Tất cả
							</button>
							{curriculums.map((c) => (
								<button
									key={c.id}
									type="button"
									className={`${styles.tab} ${selectedCurriculumId === c.id ? styles.tabActive : ""}`}
									onClick={() => {
										setSelectedCurriculumId(c.id);
										setSelectedGrade(null);
									}}
								>
									{c.name}
								</button>
							))}
						</div>
					</div>

					{/* Grade pills */}
					{availableGrades.length > 0 && (
						<div className={styles.gradePills}>
							<span className={styles.gradeLabel}>Lớp:</span>
							<button
								type="button"
								className={`${styles.gradePill} ${!selectedGrade ? styles.gradePillActive : ""}`}
								onClick={() => setSelectedGrade(null)}
							>
								Tất cả
							</button>
							{availableGrades.map((g) => (
								<button
									key={g}
									type="button"
									className={`${styles.gradePill} ${selectedGrade === g ? styles.gradePillActive : ""}`}
									onClick={() => setSelectedGrade(g)}
								>
									{g}
								</button>
							))}
						</div>
					)}
				</div>

				{/* Content */}
				{isLoading ? (
					<div className={styles.loadingGrid}>
						{Array.from({ length: 4 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
							<div key={i} className={styles.skeletonCard}>
								<div className={styles.skeletonHeader} />
								{Array.from({ length: 5 }).map((__, j) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
									<div key={j} className={styles.skeletonRow} />
								))}
							</div>
						))}
					</div>
				) : displaySubjects.length === 0 ? (
					<div className={styles.empty}>
						<span
							className="material-icons"
							style={{ fontSize: 48, opacity: 0.3 }}
						>
							search_off
						</span>
						<p>Không có môn học nào phù hợp.</p>
					</div>
				) : (
					<div className={styles.grid}>
						{displaySubjects.map((subject) => (
							<SubjectCard
								key={subject.id}
								subject={subject}
								mappingLookup={mappingLookup}
							/>
						))}
					</div>
				)}
			</main>

			<Footer />
		</div>
	);
}
