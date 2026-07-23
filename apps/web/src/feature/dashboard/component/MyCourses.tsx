import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
	BookOpen,
	CheckCircle,
	ChevronRight,
	Clock,
	Loader2,
} from "lucide-react";
import { useMyCourses } from "../../course/queries/useCourse";
import type { MyCourse } from "../../course/types/course.type";

const LEVEL_LABEL: Record<string, string> = {
	BEGINNING: "Cơ bản",
	INTERMEDIATE: "Trung bình",
	ADVANCED: "Nâng cao",
};

type FilterType = "all" | "inProgress" | "completed";

const CourseCard: React.FC<{ course: MyCourse }> = ({ course }) => {
	const isCompleted = course.progressPercentage >= 100;

	return (
		<Link
			to="/courses/$id"
			params={{ id: String(course.id) }}
			className="group flex gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-blue-200 hover:shadow-md"
		>
			<div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg">
				<img
					src={course.thumbnailUrl}
					alt={course.title}
					className="h-full w-full object-cover transition-transform group-hover:scale-105"
				/>
				{isCompleted && (
					<div className="absolute inset-0 flex items-center justify-center bg-green-500/80">
						<CheckCircle className="h-8 w-8 text-white" />
					</div>
				)}
			</div>

			<div className="flex flex-1 flex-col justify-between">
				<div>
					<div className="flex items-start justify-between gap-2">
						<h3 className="line-clamp-1 font-medium text-gray-900 group-hover:text-blue-600">
							{course.title}
						</h3>
						<ChevronRight className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-hover:translate-x-1" />
					</div>
				</div>

				<div className="mt-2">
					<div className="mb-1.5 flex items-center justify-between text-xs">
						<span className="text-gray-500">
							Lớp {course.grade} • {LEVEL_LABEL[course.level] ?? course.level}
						</span>
						<span
							className={`font-medium ${isCompleted ? "text-green-600" : "text-blue-600"}`}
						>
							{Math.round(course.progressPercentage)}%
						</span>
					</div>
					<div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
						<div
							className={`h-full rounded-full transition-all ${isCompleted ? "bg-green-500" : "bg-blue-600"}`}
							style={{ width: `${course.progressPercentage}%` }}
						/>
					</div>
				</div>
			</div>
		</Link>
	);
};

const MyCourses: React.FC = () => {
	const [filter, setFilter] = useState<FilterType>("all");
	const { data, isLoading } = useMyCourses();

	const courses: MyCourse[] = Array.isArray(data?.data) ? data.data : [];

	const filteredCourses = courses.filter((c) => {
		if (filter === "completed") return c.progressPercentage >= 100;
		if (filter === "inProgress") return c.progressPercentage < 100;
		return true;
	});

	const completedCount = courses.filter(
		(c) => c.progressPercentage >= 100,
	).length;
	const inProgressCount = courses.filter(
		(c) => c.progressPercentage < 100,
	).length;

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6">
			<div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-2">
					<BookOpen className="h-5 w-5 text-blue-600" />
					<h2 className="text-lg font-semibold text-gray-900">
						Khóa học của tôi
					</h2>
					{!isLoading && (
						<span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
							{courses.length}
						</span>
					)}
				</div>

				<div className="flex gap-2">
					{(
						[
							{
								key: "all",
								label: `Tất cả (${courses.length})`,
								active: "bg-blue-100 text-blue-700",
							},
							{
								key: "inProgress",
								label: `Đang học (${inProgressCount})`,
								active: "bg-blue-100 text-blue-700",
							},
							{
								key: "completed",
								label: `Hoàn thành (${completedCount})`,
								active: "bg-green-100 text-green-700",
							},
						] as const
					).map((btn) => (
						<button
							key={btn.key}
							onClick={() => setFilter(btn.key)}
							className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
								filter === btn.key
									? btn.active
									: "text-gray-600 hover:bg-gray-100"
							}`}
						>
							{btn.label}
						</button>
					))}
				</div>
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-blue-600" />
				</div>
			) : filteredCourses.length > 0 ? (
				<div className="grid gap-4 md:grid-cols-2">
					{filteredCourses.map((course) => (
						<CourseCard key={course.id} course={course} />
					))}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center py-12 text-center">
					<BookOpen className="mb-3 h-12 w-12 text-gray-300" />
					<p className="font-medium text-gray-900">Không có khóa học nào</p>
					<p className="mt-1 text-sm text-gray-500">
						{filter === "completed"
							? "Bạn chưa hoàn thành khóa học nào"
							: filter === "inProgress"
								? "Bạn không có khóa học đang học"
								: "Bạn chưa đăng ký khóa học nào"}
					</p>
					{filter === "all" && (
						<Link
							to="/courses"
							className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
						>
							Khám phá khóa học →
						</Link>
					)}
				</div>
			)}
		</div>
	);
};

export default MyCourses;
