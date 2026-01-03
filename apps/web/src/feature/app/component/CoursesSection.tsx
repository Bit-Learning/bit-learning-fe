import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { Award, BookOpen, Clock, Star, Users } from "lucide-react";

interface Course {
	id: number;
	title: string;
	description: string;
	instructor: string;
	duration: string;
	students: number;
	rating: number;
	price: string;
	originalPrice: string;
	image: string;
	category: string;
	level: string;
	features: string[];
}

const courses: Course[] = [
	{
		id: 1,
		title: "Lập trình Web Fullstack với React & Node.js",
		description:
			"Khóa học toàn diện về phát triển web từ frontend đến backend, giúp bạn trở thành fullstack developer chuyên nghiệp.",
		instructor: "Nguyễn Ngọc Lâm",
		duration: "12 tuần",
		students: 1250,
		rating: 4.8,
		price: "200.000đ",
		originalPrice: "1.000.000đ",
		image:
			"https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
		category: "Web Development",
		level: "Trung cấp",
		features: ["React.js", "Node.js", "MongoDB", "REST API", "Deployment"],
	},
	{
		id: 2,
		title: "Lập trình Mobile với React Native",
		description:
			"Học phát triển ứng dụng di động cross-platform với React Native, tạo app cho cả iOS và Android.",
		instructor: "Nguyễn Ngọc Lâm",
		duration: "10 tuần",
		students: 890,
		rating: 4.9,
		price: "2.200.000đ",
		originalPrice: "3.500.000đ",
		image:
			"https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
		category: "Mobile Development",
		level: "Trung cấp",
		features: ["React Native", "JavaScript", "Redux", "Navigation", "APIs"],
	},
	{
		id: 3,
		title: "Python cho Data Science & AI",
		description:
			"Khóa học Python chuyên sâu cho khoa học dữ liệu, machine learning và trí tuệ nhân tạo.",
		instructor: "Nguyễn Ngọc Lâm",
		duration: "14 tuần",
		students: 1560,
		rating: 4.7,
		price: "3.000.000đ",
		originalPrice: "4.500.000đ",
		image:
			"https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
		category: "Data Science",
		level: "Nâng cao",
		features: ["Python", "Pandas", "NumPy", "Scikit-learn", "TensorFlow"],
	},
	{
		id: 4,
		title: "DevOps & Cloud Computing",
		description:
			"Học về DevOps, Docker, Kubernetes và triển khai ứng dụng trên cloud platforms.",
		instructor: "Nguyễn Ngọc Lâm",
		duration: "12 tuần",
		students: 650,
		rating: 4.6,
		price: "2.800.000đ",
		originalPrice: "4.200.000đ",
		image:
			"https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
		category: "DevOps",
		level: "Nâng cao",
		features: ["Docker", "Kubernetes", "AWS", "CI/CD", "Monitoring"],
	},
];

const CoursesSection: React.FC = () => {
	return (
		<section className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
			<div className="container mx-auto max-w-7xl px-4">
				{/* Header */}
				<div className="mb-16 text-center">
					<div className="mb-4 flex justify-center">
						<div className="rounded-full bg-gradient-to-r from-blue-700 to-orange-600 p-3">
							<BookOpen className="h-8 w-8 text-white" />
						</div>
					</div>
					<h2 className="mb-4 text-4xl font-bold text-gray-900">
						Khóa học Lập trình Online
					</h2>
					<p className="mx-auto max-w-3xl text-xl text-gray-600">
						Học lập trình từ cơ bản đến nâng cao với các khóa học chất lượng
						cao, được thiết kế bởi chuyên gia lập trình hàng đầu tại
						BithubLearning
					</p>
				</div>

				{/* Course Categories */}
				<div className="mb-12 flex flex-wrap justify-center gap-4">
					{[
						"Tất cả",
						"Web Development",
						"Mobile Development",
						"Data Science",
						"DevOps",
					].map((category) => (
						<button
							key={category}
							className={`rounded-full px-6 py-3 font-semibold transition-all duration-300 ${
								category === "Tất cả"
									? "bg-blue-700 text-white"
									: "border border-gray-200 bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700"
							}`}
						>
							{category}
						</button>
					))}
				</div>

				{/* Courses Grid */}
				<div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
					{courses.map((course) => (
						<Link
							key={course.id}
							to="/courses/$id"
							params={{ id: course.id.toString() }}
						>
							<div
								key={course.id}
								className="bithub-card group overflow-hidden"
							>
								{/* Course Image */}
								<div className="relative h-48 overflow-hidden">
									<img
										src={course.image}
										alt={course.title}
										className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
									<div className="absolute top-4 left-4">
										<span className="rounded-full bg-orange-600 px-3 py-1 text-sm font-semibold text-white">
											{course.category}
										</span>
									</div>
									<div className="absolute top-4 right-4">
										<span className="rounded-full bg-blue-700 px-3 py-1 text-sm font-semibold text-white">
											{course.level}
										</span>
									</div>
								</div>

								{/* Course Content */}
								<div className="p-6">
									<h3 className="mb-3 text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-700">
										{course.title}
									</h3>
									<p className="mb-4 line-clamp-2 text-gray-600">
										{course.description}
									</p>

									{/* Instructor */}
									<div className="mb-4 flex items-center gap-2">
										<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-700 to-orange-600 text-sm font-bold text-white">
											NL
										</div>
										<span className="text-sm text-gray-700">
											{course.instructor}
										</span>
									</div>

									{/* Course Stats */}
									<div className="mb-4 flex items-center gap-4 text-sm text-gray-600">
										<div className="flex items-center gap-1">
											<Clock className="h-4 w-4" />
											<span>{course.duration}</span>
										</div>
										<div className="flex items-center gap-1">
											<Users className="h-4 w-4" />
											<span>{course.students.toLocaleString()}</span>
										</div>
										<div className="flex items-center gap-1">
											<Star className="h-4 w-4 fill-current text-yellow-500" />
											<span>{course.rating}</span>
										</div>
									</div>

									{/* Course Features */}
									<div className="mb-6 flex flex-wrap gap-2">
										{course.features.slice(0, 3).map((feature) => (
											<span
												key={feature}
												className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
											>
												{feature}
											</span>
										))}
										{course.features.length > 3 && (
											<span className="rounded bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600">
												+{course.features.length - 3} more
											</span>
										)}
									</div>

									{/* Price and CTA */}
									<div className="flex items-center justify-between">
										{/* <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-700">{course.price}</span>
                    <span className="text-gray-500 line-through">{course.originalPrice}</span>
                  </div> */}
									</div>
								</div>
							</div>
						</Link>
					))}
				</div>

				{/* Call to Action */}
				<div className="text-center">
					<div className="rounded-2xl bg-gradient-to-r from-blue-700 to-orange-600 p-8 text-white">
						<div className="mb-4 flex justify-center">
							<Award className="h-12 w-12 text-white" />
						</div>
						<h3 className="mb-4 text-2xl font-bold">
							Bắt đầu hành trình học tập ngay hôm nay!
						</h3>
						<p className="mb-6 text-lg opacity-90">
							Tham gia cộng đồng hơn 5,000+ học viên đã thành công với các khóa
							học của Bithub Learning
						</p>
						<div className="flex flex-col justify-center gap-4 sm:flex-row">
							<Link to="/courses">
								<Button className="rounded-lg bg-white px-8 py-3 font-semibold text-blue-700 transition-colors hover:bg-gray-100">
									Xem tất cả khóa học
								</Button>
							</Link>
							<Link to="/offline-course">
								<Button className="rounded-lg bg-orange-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-orange-700">
									Đăng ký khóa học Offline
								</Button>
							</Link>
							<Button className="rounded-lg border-2 border-white px-8 py-3 font-semibold text-white transition-colors hover:bg-white hover:text-blue-700">
								Tư vấn miễn phí
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default CoursesSection;
