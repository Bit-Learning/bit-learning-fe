import { useAppDispatch } from "@/shared/redux/store";
import { useNavigate } from "@tanstack/react-router";
import Loader from "@workspace/ui/components/loader/TerminalLoader";
import { BookOpen, ChevronRight, Star } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useRef } from "react";
import {
	useAllCourses,
	useCourseActions,
	useCourseState,
	usePrefetchCourse,
} from "../queries/useCourse";
import { setPageSizeAction } from "../store/course.store";
import type { CoursePreview } from "../types/course.type";

const GRADES = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const LEVEL_CONFIG: Record<string, { label: string; className: string }> = {
	BEGINNING: {
		label: "Cơ bản",
		className:
			"bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
	},
	INTERMEDIATE: {
		label: "Trung bình",
		className:
			"bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
	},
	ADVANCED: {
		label: "Nâng cao",
		className:
			"bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
	},
};

const CourseCard: React.FC<{
	course: CoursePreview;
	onClick: () => void;
	onMouseEnter: () => void;
}> = ({ course, onClick, onMouseEnter }) => {
	const level = LEVEL_CONFIG[course.level] ?? {
		label: course.level,
		className: "bg-slate-100 text-slate-600",
	};

	return (
		<div
			className="group shrink-0 w-64 cursor-pointer"
			onClick={onClick}
			onMouseEnter={onMouseEnter}
		>
			{/* Thumbnail */}
			<div className="relative w-full h-36 border-2 overflow-hidden mb-3">
				<img
					src={course.thumbnailUrl}
					alt={course.title}
					className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
				{/* <span
					className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${level.className}`}
				>
					{level.label}
				</span> */}
			</div>

			{/* Info */}
			<h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2 mb-1.5">
				{course.title}
			</h3>

			<p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 truncate">
				{course.instructorName}
			</p>

			<div className="flex items-center justify-between">
				<span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
					<Star className="w-3 h-3 fill-amber-400 text-amber-400" />
					{(course.ratingStar || 5).toFixed(1)}
					<span className="text-slate-400 dark:text-slate-500">
						({course.ratingCount || 0})
					</span>
				</span>

				<span
					className={
						course.price === 0
							? "text-xs font-semibold text-emerald-600 dark:text-emerald-400"
							: "text-xs font-semibold text-gray-800 dark:text-gray-200"
					}
				>
					{course.price === 0
						? "Miễn phí"
						: `${course.price.toLocaleString("vi-VN")}đ`}
				</span>
			</div>
		</div>
	);
};

const GradeRow: React.FC<{
	grade: number;
	courses: CoursePreview[];
	onCourseClick: (id: number) => void;
	onCourseHover: (id: number) => void;
}> = ({ grade, courses, onCourseClick, onCourseHover }) => {
	const scrollRef = useRef<HTMLDivElement>(null);

	if (courses.length === 0) return null;

	const scroll = (dir: "left" | "right") => {
		if (!scrollRef.current) return;
		scrollRef.current.scrollBy({
			left: dir === "right" ? 300 : -300,
			behavior: "smooth",
		});
	};

	return (
		<div className="mb-10">
			{/* Row header */}
			<div className="flex items-center gap-3 mb-4">
				{/* <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white text-sm font-bold flex-shrink-0">
					{grade}
				</div> */}
				<h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
					Lớp {grade}
				</h2>
				<span className="text-xs text-slate-400 dark:text-slate-500 ml-1">
					Có {courses.length} khóa học
				</span>
				<div className="flex-1 h-px bg-slate-100 dark:bg-slate-800 ml-2" />
				<div className="flex gap-1">
					<button
						onClick={() => scroll("left")}
						className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
					>
						<ChevronRight className="w-4 h-4 rotate-180" />
					</button>
					<button
						onClick={() => scroll("right")}
						className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
					>
						<ChevronRight className="w-4 h-4" />
					</button>
				</div>
			</div>

			{/* Horizontal scroll */}
			<div
				ref={scrollRef}
				className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide"
				style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
			>
				{courses.map((course) => (
					<CourseCard
						key={course.id}
						course={course}
						onClick={() => onCourseClick(course.id)}
						onMouseEnter={() => onCourseHover(course.id)}
					/>
				))}
			</div>
		</div>
	);
};

const AllCoursesContent: React.FC = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const { prefetchCourseDetail } = usePrefetchCourse();
	const { selectedLevel, sortBy } = useCourseState();
	const { selectLevel, setSortBy, resetFilters } = useCourseActions();

	useEffect(() => {
		dispatch(setPageSizeAction(100)); // load more since we're grouping by grade
	}, [dispatch]);

	const { data, isLoading, error } = useAllCourses();

	const coursesByGrade = useMemo(() => {
		const allCourses: CoursePreview[] = Array.isArray(data?.data)
			? data.data
			: [];

		let filtered = allCourses.filter((course) => {
			if (selectedLevel !== null && course.level !== selectedLevel)
				return false;
			return true;
		});

		if (sortBy === "price_asc") {
			filtered = [...filtered].sort((a, b) => a.price - b.price);
		} else if (sortBy === "price_desc") {
			filtered = [...filtered].sort((a, b) => b.price - a.price);
		}

		const map: Record<number, CoursePreview[]> = {};
		for (const grade of GRADES) map[grade] = [];
		for (const course of filtered) {
			(map[course.grade] ??= []).push(course);
		}
		return map;
	}, [data?.data, selectedLevel, sortBy]);

	const totalVisible = useMemo(
		() => Object.values(coursesByGrade).reduce((s, arr) => s + arr.length, 0),
		[coursesByGrade],
	);

	const handleCourseClick = (id: number) => {
		navigate({ to: "/courses/$id", params: { id: String(id) } });
	};

	if (isLoading) return <Loader />;

	if (error) {
		return (
			<div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
				<p className="text-red-500">{(error as Error).message}</p>
			</div>
		);
	}

	const totalElements = data?.page?.totalElements || 0;
	const hasActiveFilter = selectedLevel !== null || sortBy !== "default";

	return (
		<div className="min-h-screen bg-white transition-colors duration-300">
			{/* Dot grid background */}
			<div
				className="fixed inset-0 -z-10 dark:hidden"
				style={{
					backgroundImage:
						"radial-gradient(rgb(203 213 225) 1px, transparent 1px)",
					backgroundSize: "32px 32px",
				}}
			/>
			<div
				className="fixed inset-0 -z-10 hidden dark:block"
				style={{
					backgroundImage:
						"radial-gradient(rgb(30 41 59) 1px, transparent 1px)",
					backgroundSize: "32px 32px",
				}}
			/>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* ── Hero ── */}
				<section className="relative overflow-hidden mb-10 h-60 md:h-64 flex items-end">
					<img
						src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1920&q=80"
						alt="hero"
						className="absolute inset-0 w-full h-full object-cover"
					/>
					<div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/50 to-transparent" />
					<div className="relative z-10 px-8 pb-8">
						<h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
							Thúc đẩy sự nghiệp của bạn{" "}
							{/* <span className="text-blue-400">Lớp 3 – Lớp 12</span> */}
						</h1>
						<p className="text-sm text-slate-300 mt-1.5 max-w-lg">
							Chương trình chuẩn BGD&ĐT, cập nhật xu hướng công nghệ mới nhất.
						</p>
					</div>
				</section>

				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					{/* ── Filter bar ── */}
					<div className="flex flex-wrap items-center gap-3 mb-8 py-3 border-y border-slate-200 dark:border-slate-800">
						<span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
							Lọc
						</span>

						{/* Level filter pills */}
						{[
							{ value: null, label: "Tất cả" },
							{ value: "BEGINNING", label: "Cơ bản" },
							{ value: "INTERMEDIATE", label: "Trung bình" },
							{ value: "ADVANCED", label: "Nâng cao" },
						].map((opt) => (
							<button
								key={String(opt.value)}
								onClick={() => selectLevel(opt.value as any)}
								className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
									selectedLevel === opt.value
										? "bg-blue-600 text-white border-blue-600"
										: "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-slate-900"
								}`}
							>
								{opt.label}
							</button>
						))}

						<div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

						<span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
							Sắp xếp
						</span>

						<select
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value as any)}
							className="text-xs px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
						>
							<option value="default">Mặc định</option>
							<option value="price_asc">Giá tăng dần</option>
							<option value="price_desc">Giá giảm dần</option>
						</select>

						{hasActiveFilter && (
							<button
								onClick={resetFilters}
								className="text-xs px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-400 transition-all bg-white dark:bg-slate-900"
							>
								✕ Xóa bộ lọc
							</button>
						)}

						<span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
							{totalVisible} / {totalElements} khóa học
						</span>
					</div>

					{/* ── Grade rows ── */}
					{totalVisible > 0 ? (
						<div>
							{GRADES.map((grade) => (
								<GradeRow
									key={grade}
									grade={grade}
									courses={coursesByGrade[grade] || []}
									onCourseClick={handleCourseClick}
									onCourseHover={prefetchCourseDetail}
								/>
							))}
						</div>
					) : (
						<div className="py-24 text-center">
							<BookOpen className="mx-auto mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" />
							<h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
								Không có khóa học nào
							</h3>
							<p className="text-sm text-slate-400">Thử thay đổi bộ lọc</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default AllCoursesContent;
