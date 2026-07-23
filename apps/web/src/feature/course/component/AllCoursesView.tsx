import Loader from "@workspace/ui/components/loader/TerminalLoader";
import { BookOpen } from "lucide-react";
import type React from "react";
import { useMemo } from "react";
import { useSearchCourses } from "../queries/useCourse";
import type { CoursePreview, SearchCourseRequest } from "../types/course.type";
import { SchoolLevelSection } from "./SchoolLevelSection";

export const SCHOOL_LEVELS = [
	{ label: "Tiểu học", minGrade: 3, maxGrade: 5 },
	{ label: "Trung học cơ sở", minGrade: 6, maxGrade: 9 },
	{ label: "Trung học phổ thông", minGrade: 10, maxGrade: 12 },
] as const;

export type SchoolLevelKey = (typeof SCHOOL_LEVELS)[number]["label"] | null;

export const AllCoursesView: React.FC<{
	searchRequest: SearchCourseRequest;
	sortBy: string;
	onCourseClick: (id: number) => void;
	onCourseHover: (id: number) => void;
}> = ({ searchRequest, sortBy, onCourseClick, onCourseHover }) => {
	const { data, isLoading, error } = useSearchCourses(searchRequest);

	const coursesBySchoolLevel = useMemo(() => {
		let list: CoursePreview[] = data?.data ?? [];
		if (sortBy === "price_asc")
			list = [...list].sort((a, b) => a.price - b.price);
		else if (sortBy === "price_desc")
			list = [...list].sort((a, b) => b.price - a.price);

		return SCHOOL_LEVELS.map((sl) => ({
			...sl,
			courses: list.filter(
				(c) => c.grade >= sl.minGrade && c.grade <= sl.maxGrade,
			),
		}));
	}, [data?.data, sortBy]);

	const totalVisible = useMemo(
		() => coursesBySchoolLevel.reduce((s, sl) => s + sl.courses.length, 0),
		[coursesBySchoolLevel],
	);

	if (isLoading) return <Loader />;
	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-red-500">{(error as Error).message}</p>
			</div>
		);
	}

	const totalElements = data?.page?.totalElements ?? 0;

	return (
		<>
			<span className="ml-auto text-md text-slate-400 dark:text-slate-500 block text-right mb-6">
				{totalVisible} / {totalElements} khóa học
			</span>

			{totalVisible > 0 ? (
				<div>
					{coursesBySchoolLevel.map((sl) => (
						<SchoolLevelSection
							key={sl.label}
							label={sl.label}
							courses={sl.courses}
							onCourseClick={onCourseClick}
							onCourseHover={onCourseHover}
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
		</>
	);
};
