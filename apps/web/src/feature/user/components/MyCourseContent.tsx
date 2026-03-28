import {
	useCourseActions,
	useCourseState,
	useMyCourses,
} from "@/feature/course/queries/useCourse";
import { MyCourse } from "@/feature/course/types/course.type";
import { useNavigate } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { BookOpen, Star, Loader2 } from "lucide-react";
import type React from "react";
import { useEffect } from "react";
import { useAppDispatch } from "@/shared/redux/store";
import { setPageSizeAction } from "@/feature/course/store/course.store";
import { Pagination } from "@/shared/components/Pagination";
import Loader from "@workspace/ui/components/loader/TerminalLoader";

const MyCoursesContent: React.FC = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const { pagination } = useCourseState();
	const { changePage } = useCourseActions();
	const { data, isLoading, error } = useMyCourses();

	useEffect(() => {
		dispatch(setPageSizeAction(4));
	}, [dispatch]);

	const getCourseLevelLabel = (level: string): string => {
		const levelMap: Record<string, string> = {
			BEGINNING: "Cơ bản",
			INTERMEDIATE: "Trung bình",
			ADVANCED: "Nâng cao",
		};
		return levelMap[level] || level;
	};

	const getProgressColor = (progress: number) => {
		if (progress < 30) return "bg-orange-500";
		if (progress < 70) return "bg-blue-500";
		return "bg-green-500";
	};

	const getProgressText = (progress: number) => {
		if (progress === 0) return "Chưa bắt đầu";
		if (progress === 100) return "Hoàn thành";
		return `${Math.round(progress)}% hoàn thành`;
	};

	const handleContinueLearning = (courseId: number) => {
		navigate({
			to: "/courses/$id",
			params: { id: String(courseId) },
		});
	};

	if (isLoading) {
		return <Loader />;
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-slate-900">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="py-12 text-center">
						<p className="mb-4 text-red-600">Lỗi: {(error as Error).message}</p>
					</div>
				</div>
			</div>
		);
	}

	const courses: MyCourse[] = Array.isArray(data?.data) ? data.data : [];
	const totalPages = data?.page?.totalPages || 0;

	if (courses.length === 0) {
		return (
			<div className="mx-auto grow space-y-8 border-gray-200">
				<div className="flex min-h-96 flex-col items-center justify-center rounded-2xl bg-white dark:bg-slate-800 p-12 shadow-sm">
					<img
						src="/sad-face-2691.svg"
						alt="Không có khóa học nào"
						className="mb-6 h-24 w-24 text-gray-300"
					/>
					<h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
						Chưa có khóa học nào
					</h3>
					<p className="mb-6 text-center text-gray-600 dark:text-gray-400">
						Bạn chưa đăng ký khóa học nào. Hãy khám phá và bắt đầu học tập ngay!
					</p>
					<Button
						size="xl"
						onClick={() => navigate({ to: "/courses" })}
						className="bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
					>
						Khám phá khóa học
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-slate-900">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
						Khóa học của tôi
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Theo dõi tiến độ và tiếp tục hành trình học tập của bạn
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
					{courses.map((course: MyCourse) => (
						<Card
							key={course.id}
							className="group cursor-pointer p-0 overflow-hidden hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-800 border"
							onClick={() => handleContinueLearning(course.id)}
						>
							<div className="relative h-64 overflow-hidden bg-gray-100">
								<img
									src={course.thumbnailUrl}
									alt={course.title}
									className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
								/>

								<div className="absolute left-4 top-4">
									<Badge className="bg-white text-gray-900 text-xs font-bold px-3 py-1 border-0">
										{getCourseLevelLabel(course.level).toUpperCase()}
									</Badge>
								</div>

								<div className="absolute right-4 top-4">
									<Badge className="bg-blue-600 text-white text-xs font-bold px-3 py-1 border-0">
										LỚP {course.grade}
									</Badge>
								</div>
							</div>

							<CardContent className="p-6">
								<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 min-h-12">
									{course.title}
								</h3>

								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center gap-2 ">
										<div className="flex">
											{[...Array(5)].map((_, i) => (
												<Star
													key={i}
													className={`h-4 w-4 ${
														i < Math.floor(course.ratingStar || 5)
															? "fill-yellow-400 text-yellow-400"
															: "fill-gray-200 text-gray-200"
													}`}
												/>
											))}
										</div>
										<span className="text-sm text-gray-600 dark:text-gray-400">
											({course.ratingCount || 0})
										</span>
									</div>
									<span className="text-lg font-bold text-blue-600">
										{course.price === 0
											? "Miễn phí"
											: `${course.price.toLocaleString()}đ`}
									</span>
								</div>

								<div className="space-y-2">
									<div className="h-2 w-full rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
										<div
											className={`h-full transition-all duration-500 ${getProgressColor(course.progressPercentage)}`}
											style={{ width: `${course.progressPercentage}%` }}
										/>
									</div>

									<div className="flex items-center justify-between">
										<span
											className={`text-xs font-bold ${
												course.progressPercentage < 30
													? "text-orange-600"
													: course.progressPercentage < 70
														? "text-blue-600"
														: "text-green-600"
											}`}
										>
											{getProgressText(course.progressPercentage)}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{totalPages > 1 && (
					<Pagination
						currentPage={pagination.page}
						totalPages={totalPages}
						onPageChange={changePage}
					/>
				)}
			</div>
		</div>
	);
};

export default MyCoursesContent;
