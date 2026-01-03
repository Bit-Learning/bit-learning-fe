import { Link } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/Badge";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { BookOpen, ChevronLeft, Play, Star } from "lucide-react";
import type React from "react";
import { useCourseActions } from "../queries/useCourse";

const gradeGroups = [
	{
		name: "Tiểu học",
		grades: [1, 2, 3, 4, 5],
		color: "blue",
	},
	{
		name: "THCS",
		grades: [6, 7, 8, 9],
		color: "green",
	},
	{
		name: "THPT",
		grades: [10, 11, 12],
		color: "orange",
	},
];

const AllCoursesContent: React.FC = () => {
	const { selectGrade } = useCourseActions();

	return (
		<div className="bg-linear-to-br min-h-screen from-gray-50 to-blue-50">
			<div className="container mx-auto max-w-7xl px-4 py-8">
				<div className="mb-8">
					<Link
						to="/"
						className="text-md mb-4 inline-flex items-center text-gray-600 transition-colors hover:text-blue-700"
					>
						<ChevronLeft className="mr-2 h-5 w-5" />
						Trang chủ
					</Link>

					<div className="text-center">
						<div className="mb-4 flex items-center justify-center space-x-2">
							<img
								src="./Logo.png"
								alt="Bithub Logo"
								className="h-10 w-36 object-contain"
							/>
						</div>
						<h1 className="mb-4 text-4xl font-bold text-gray-900">
							Khóa học Tin học từ Lớp 1 đến Lớp 12
						</h1>
						<p className="mx-auto max-w-3xl text-xl text-gray-600">
							Chương trình học tin học toàn diện cho học sinh từ Tiểu học đến
							THPT
						</p>
					</div>
				</div>

				<div className="space-y-8">
					{gradeGroups.map((group) => (
						<div
							key={group.name}
							className="rounded-2xl bg-white p-6 shadow-lg"
						>
							<h2 className="mb-4 text-2xl font-bold text-gray-900">
								{group.name}
							</h2>

							<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
								{group.grades.map((grade) => (
									<Link
										key={grade}
										to="/courses/grade/$grade"
										params={{ grade: String(grade) }}
										onClick={() => selectGrade(grade)}
									>
										<Card className="group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
											<CardContent className="p-6 text-center">
												<div
													className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-${group.color}-100`}
												>
													<BookOpen
														className={`h-8 w-8 text-${group.color}-700`}
													/>
												</div>
												<h3 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-blue-700">
													Lớp {grade}
												</h3>
												<p className="text-sm text-gray-600">
													Khóa học tin học lớp {grade}
												</p>
												<div className="mt-3">
													<Badge variant="secondary" className="text-xs">
														Xem khóa học
													</Badge>
												</div>
											</CardContent>
										</Card>
									</Link>
								))}
							</div>
						</div>
					))}
				</div>

				<div className="mt-12 rounded-2xl bg-white p-8 shadow-lg">
					<h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
						Tại sao chọn Bithub Learning?
					</h2>

					<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
						<div className="text-center">
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
								<BookOpen className="h-8 w-8 text-blue-700" />
							</div>
							<h3 className="mb-2 font-semibold text-gray-900">
								Chương trình chuẩn
							</h3>
							<p className="text-sm text-gray-600">
								Nội dung theo chương trình BGD&ĐT, phù hợp từng cấp học
							</p>
						</div>

						<div className="text-center">
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
								<Star className="h-8 w-8 text-green-700" />
							</div>
							<h3 className="mb-2 font-semibold text-gray-900">
								Giảng viên chất lượng
							</h3>
							<p className="text-sm text-gray-600">
								Đội ngũ giáo viên giàu kinh nghiệm, tận tâm với học sinh
							</p>
						</div>

						<div className="text-center">
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
								<Play className="h-8 w-8 text-orange-700" />
							</div>
							<h3 className="mb-2 font-semibold text-gray-900">
								Học mọi lúc mọi nơi
							</h3>
							<p className="text-sm text-gray-600">
								Video bài giảng chất lượng cao, học tập linh hoạt
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AllCoursesContent;
