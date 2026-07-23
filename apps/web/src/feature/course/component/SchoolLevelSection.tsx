import { ChevronLeft, ChevronRight } from "lucide-react";
import type React from "react";
import { useRef } from "react";
import type { CoursePreview } from "../types/course.type";
import { CourseCard } from "./CourseCard";

export const SchoolLevelSection: React.FC<{
	label: string;
	courses: CoursePreview[];
	onCourseClick: (id: number) => void;
	onCourseHover: (id: number) => void;
}> = ({ label, courses, onCourseClick, onCourseHover }) => {
	const scrollRef = useRef<HTMLDivElement>(null);

	if (courses.length === 0) return null;

	const scroll = (dir: "left" | "right") => {
		if (!scrollRef.current) return;
		const width = scrollRef.current.clientWidth;
		scrollRef.current.scrollBy({
			left: dir === "right" ? width : -width,
			behavior: "smooth",
		});
	};

	return (
		<div className="mb-10">
			<div className="flex items-center gap-3 mb-4">
				<h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
					{label}
				</h2>
				<span className="text-sm text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
					{courses.length} khóa học
				</span>
				<div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
				<div className="flex gap-1">
					<button
						onClick={() => scroll("left")}
						className="cursor-pointer w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
					>
						<ChevronLeft className="w-6 h-6" />
					</button>
					<button
						onClick={() => scroll("right")}
						className="cursor-pointer w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
					>
						<ChevronRight className="w-6 h-6" />
					</button>
				</div>
			</div>
			<div
				ref={scrollRef}
				className="grid grid-flow-col auto-cols-[48%] sm:auto-cols-[31%] xl:auto-cols-[23%] gap-4 overflow-x-auto pb-2 scrollbar-hide"
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
