import { useNavigate } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent } from "@workspace/ui/components/Card";
import Loader from "@workspace/ui/components/loader/TerminalLoader";
import {
	BookOpen,
	Play,
	Star,
	Sparkles,
	CheckCircle,
	Clock,
	Filter,
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo } from "react";
import {
	useAllCourses,
	useCourseActions,
	useCourseState,
	usePrefetchCourse,
} from "../queries/useCourse";
import type { CoursePreview } from "../types/course.type";
import { useAppDispatch } from "@/shared/redux/store";
import { setPageSizeAction } from "../store/course.store";
import BitCoinIcon from "@/shared/components/BitCoinIcon";

const AllCoursesContent: React.FC = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const { prefetchCourseDetail } = usePrefetchCourse();
	const { pagination, selectedGrade, selectedLevel, sortBy } = useCourseState();
	const { changePage, selectGrade, selectLevel, setSortBy, resetFilters } =
		useCourseActions();

	useEffect(() => {
		dispatch(setPageSizeAction(12));
	}, [dispatch]);

	const { data, isLoading, error, isFetching } = useAllCourses();

	const getCourseLevelLabel = (level: string): string => {
		const levelMap: Record<string, string> = {
			BEGINNING: "Cơ bản",
			INTERMEDIATE: "Trung bình",
			ADVANCED: "Nâng cao",
		};
		return levelMap[level] || level;
	};

	const getCourseLevelBadgeClass = (level: string): string => {
		const levelColorMap: Record<string, string> = {
			BEGINNING: "bg-green-600",
			INTERMEDIATE: "bg-orange-600",
			ADVANCED: "bg-purple-600",
		};
		return levelColorMap[level] || "bg-slate-600";
	};

	const filteredCourses = useMemo(() => {
		const allCourses: CoursePreview[] = Array.isArray(data?.data)
			? data.data
			: [];

		let filtered = allCourses.filter((course) => {
			if (selectedGrade !== null && course.grade !== selectedGrade) {
				return false;
			}

			if (selectedLevel !== null && course.level !== selectedLevel) {
				return false;
			}

			return true;
		});

		if (sortBy === "price_asc") {
			filtered = [...filtered].sort((a, b) => a.price - b.price);
		} else if (sortBy === "price_desc") {
			filtered = [...filtered].sort((a, b) => b.price - a.price);
		}

		return filtered;
	}, [data?.data, selectedGrade, selectedLevel, sortBy]);

	const handleMouseEnter = (courseId: number) => {
		prefetchCourseDetail(courseId);
	};

	const handlePageChange = (newPage: number) => {
		changePage(newPage);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	if (isLoading) {
		return <Loader />;
	}

	if (error) {
		return (
			<div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-slate-900">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="py-12 text-center">
						<p className="mb-4 text-red-600">Lỗi: {(error as Error).message}</p>
					</div>
				</div>
			</div>
		);
	}

	const totalElements = data?.page?.totalElements || 0;
	const totalPages = data?.page?.totalPages || 0;
	const courses = filteredCourses;

	return (
		<div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-slate-900">
			<div
				className="fixed inset-0 -z-10"
				style={{
					backgroundImage:
						"radial-gradient(rgb(226 232 240) 1px, transparent 1px)",
					backgroundSize: "40px 40px",
				}}
			/>
			<div
				className="fixed inset-0 -z-10 dark:block hidden"
				style={{
					backgroundImage:
						"radial-gradient(rgb(30 41 59) 1px, transparent 1px)",
					backgroundSize: "40px 40px",
				}}
			/>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<section
					className="relative pt-28 pl-28 h-125 md:h-150 overflow-hidden rounded-2xl shadow-sm"
					style={{
						backgroundImage:
							"url('https://images.unsplash.com/photo-1652170226044-711dff674316?auto=format&fit=crop&w=1920&q=80')",
						backgroundSize: "cover",
						backgroundPosition: "center",
					}}
				>
					{/* 👇 layout flex */}
					<div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
						{/* LEFT - TEXT */}
						<div className="max-w-2xl">
							<div className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-bold mb-4">
								<Sparkles className="w-4 h-4" />
								<span>Học tập không giới hạn</span>
							</div>

							<h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-5 leading-tight">
								Khóa học Tin học <br className="hidden md:block" />
								từ <span className="text-blue-600">Lớp 3</span> đến{" "}
								<span className="text-blue-600">Lớp 12</span>
							</h1>

							<p className="text-md text-slate-700 dark:text-slate-200">
								Chương trình học tin học toàn diện, cập nhật theo xu hướng công
								nghệ mới nhất dành cho học sinh từ Tiểu học đến THPT.
							</p>
						</div>

						{/* RIGHT - ROBOT */}
						{/* <div className="flex justify-center md:justify-end">
      <img
        src="robot.png"
        alt="Robot"
        className="w-64 md:w-80 lg:w-105 object-contain drop-shadow-xl"
      />
    </div> */}
					</div>
				</section>

				<section className="mt-8 mb-8 bg-white dark:bg-slate-800 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 rounded-2xl shadow-sm">
					<div className="flex flex-wrap items-center justify-between gap-4">
						<div className="flex flex-wrap items-center gap-4">
							<div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
								<Filter className="w-5 h-5" />
								<span className="text-slate-800 dark:text-slate-400 text-md font-bold">
									Lọc:
								</span>
							</div>

							<select
								value={selectedGrade ?? "all"}
								onChange={(e) =>
									selectGrade(
										e.target.value === "all" ? null : Number(e.target.value),
									)
								}
								className="pr-10 pl-2 py-2 rounded-lg border border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
							>
								<option value="all">Tất cả lớp</option>
								<option value="3">Lớp 3</option>
								<option value="4">Lớp 4</option>
								<option value="5">Lớp 5</option>
								<option value="6">Lớp 6</option>
								<option value="7">Lớp 7</option>
								<option value="8">Lớp 8</option>
								<option value="9">Lớp 9</option>
								<option value="10">Lớp 10</option>
								<option value="11">Lớp 11</option>
								<option value="12">Lớp 12</option>
							</select>

							<select
								value={selectedLevel ?? "all"}
								onChange={(e) =>
									selectLevel(
										e.target.value === "all" ? null : (e.target.value as any),
									)
								}
								className="pr-10 pl-2 py-2 rounded-lg border border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
							>
								<option value="all">Tất cả cấp độ</option>
								<option value="BEGINNING">Cơ bản</option>
								<option value="INTERMEDIATE">Trung bình</option>
								<option value="ADVANCED">Nâng cao</option>
							</select>

							<div className="flex items-center gap-2">
								<span className="text-slate-800 dark:text-slate-400 text-md font-bold">
									Sắp xếp:
								</span>
								<select
									value={sortBy}
									onChange={(e) => setSortBy(e.target.value as any)}
									className="pr-10 pl-2 py-2 rounded-lg border border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
								>
									<option value="default">Mặc định</option>
									<option value="price_asc">Giá tăng dần</option>
									<option value="price_desc">Giá giảm dần</option>
								</select>
							</div>

							{(selectedGrade !== null ||
								selectedLevel !== null ||
								sortBy !== "default") && (
								<button
									onClick={resetFilters}
									className="cursor-pointer px-6 py-2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all font-medium"
								>
									Xóa bộ lọc
								</button>
							)}
						</div>

						{courses.length > 0 && (
							<div>
								<p className="text-slate-700 dark:text-slate-300 text-md font-medium">
									Hiển thị{" "}
									<span className="font-bold text-blue-600">
										{courses.length}
									</span>{" "}
									trên tổng{" "}
									<span className="font-bold text-blue-600">
										{totalElements}
									</span>{" "}
									khóa học
								</p>
							</div>
						)}
					</div>
				</section>

				{isFetching && (
					<div className="mb-4 text-center">
						<span className="text-blue-700 dark:text-blue-400">
							Đang cập nhật...
						</span>
					</div>
				)}

				{courses.length > 0 ? (
					<>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-10 mb-8">
							{courses.map((course: CoursePreview) => (
								<Card
									key={course.id}
									className="group cursor-pointer overflow-hidden p-4 transition-all duration-300 hover:shadow-xl border-2 border-gray-200 dark:border-slate-700"
									onMouseEnter={() => handleMouseEnter(course.id)}
									onClick={() =>
										navigate({
											to: "/courses/$id",
											params: { id: String(course.id) },
										})
									}
								>
									<div className="relative h-48 aspect-video overflow-hidden rounded-xl">
										<img
											src={course.thumbnailUrl}
											alt={course.title}
											className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-120"
										/>

										<div className="absolute left-3 top-3">
											<Badge className="bg-blue-700 text-sm text-white">
												Lớp {course.grade}
											</Badge>
										</div>

										<div className="absolute right-3 top-3">
											<Badge
												className={`${getCourseLevelBadgeClass(course.level)} text-sm text-white`}
											>
												{getCourseLevelLabel(course.level)}
											</Badge>
										</div>

										<div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
											<div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90">
												<Play className="ml-1 h-5 w-5 text-gray-800" />
											</div>
										</div>
									</div>

									<CardContent className="p-0">
										<div className="space-y-3">
											<h3 className="text-xl line-clamp-2 h-15 font-bold text-slate-900 dark:text-white transition-colors group-hover:text-blue-700">
												{course.title}
											</h3>

											<div className="flex items-end justify-between gap-2 text-sm">
												<div className="flex items-center gap-2">
													<div className="flex">
														{[...Array(5)].map((_, i) => (
															<Star
																key={i}
																className={`h-5 w-5 ${
																	i < Math.floor(course.ratingStar || 5)
																		? "fill-yellow-400 text-yellow-400"
																		: "fill-gray-200 text-gray-200"
																}`}
															/>
														))}
													</div>
													<span className="text-md text-gray-600 dark:text-gray-400">
														({course.ratingCount || 0})
													</span>
												</div>

												<div className="flex flex-col items-end gap-0.5">
													{course.price > 0 && (
														<span className="flex items-center gap-1 text-sm font-semibold text-amber-600">
															~ {course.price.toLocaleString("vi-VN")}{" "}
															<BitCoinIcon size={18} />
														</span>
													)}
													<span className="text-2xl font-bold text-blue-700 dark:text-blue-400">
														{course.price === 0
															? "Miễn phí"
															: `${course.price.toLocaleString()}đ`}
													</span>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>

						{totalPages > 1 && (
							<div className="mt-8 flex items-center justify-center gap-2">
								<Button
									variant="outline"
									isDisabled={pagination.page === 0}
									onPress={() => handlePageChange(pagination.page - 1)}
									className="rounded-lg px-4 py-2"
								>
									Trang trước
								</Button>

								<span className="px-4 text-sm text-slate-600 dark:text-slate-400">
									Trang {pagination.page + 1} / {totalPages}
								</span>

								<Button
									variant="outline"
									isDisabled={pagination.page >= totalPages - 1}
									onPress={() => handlePageChange(pagination.page + 1)}
									className="rounded-lg px-4 py-2"
								>
									Trang sau
								</Button>
							</div>
						)}
					</>
				) : (
					<div className="py-12 text-center">
						<BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
						<h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
							Chưa có khóa học nào
						</h3>
						<p className="text-slate-600 dark:text-slate-400">
							Hiện tại chưa có khóa học nào trong hệ thống
						</p>
					</div>
				)}

				<section className="mt-16">
					<div className="bg-linear-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-950 text-white p-8 lg:p-10 rounded-3xl shadow-xl relative overflow-hidden">
						<div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />
						<div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl" />

						<div className="relative text-center mb-10">
							<h2 className="text-2xl md:text-3xl font-extrabold mb-2">
								Tại sao chọn Bit Learning?
							</h2>
							<p className="text-slate-400 text-base">
								Cam kết mang lại giá trị học thuật cao nhất cho học viên
							</p>
						</div>

						<div className="grid md:grid-cols-3 gap-8 text-center relative">
							<div className="space-y-4 group">
								<div className="mx-auto w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center ring-1 ring-blue-500/30 group-hover:bg-blue-500 group-hover:scale-110 transition-all duration-300">
									<CheckCircle className="w-8 h-8 text-blue-400 group-hover:text-white" />
								</div>
								<h3 className="text-lg font-bold">Chương trình chuẩn</h3>
								<p className="text-slate-400 text-sm leading-relaxed">
									Nội dung theo chương trình BGD&ĐT, phù hợp từng cấp học và
									luôn cập nhật xu hướng công nghệ.
								</p>
							</div>

							<div className="space-y-4 group">
								<div className="mx-auto w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center ring-1 ring-blue-500/30 group-hover:bg-blue-500 group-hover:scale-110 transition-all duration-300">
									<Star className="w-8 h-8 text-blue-400 group-hover:text-white" />
								</div>
								<h3 className="text-lg font-bold">Giảng viên chất lượng</h3>
								<p className="text-slate-400 text-sm leading-relaxed">
									Đội ngũ giáo viên giàu kinh nghiệm, tận tâm với học sinh và có
									phương pháp dạy hiện đại.
								</p>
							</div>

							<div className="space-y-4 group">
								<div className="mx-auto w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center ring-1 ring-orange-500/30 group-hover:bg-orange-500 group-hover:scale-110 transition-all duration-300">
									<Clock className="w-8 h-8 text-orange-400 group-hover:text-white" />
								</div>
								<h3 className="text-lg font-bold">Học mọi lúc mọi nơi</h3>
								<p className="text-slate-400 text-sm leading-relaxed">
									Video bài giảng chất lượng cao, hệ thống bài tập thực hành
									phong phú, học tập linh hoạt.
								</p>
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
};

export default AllCoursesContent;
