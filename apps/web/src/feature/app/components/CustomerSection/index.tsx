import {
	Award,
	BookOpen,
	ChevronRight,
	GraduationCap,
	Users,
} from "lucide-react";

const partners = [
	{
		title: "FPT Software",
		link: "#",
		thumbnail:
			"https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
		category: "Công ty Công nghệ",
		description: "Đối tác tuyển dụng và đào tạo nhân sự IT",
	},
	{
		title: "Viettel",
		link: "#",
		thumbnail:
			"https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
		category: "Tập đoàn Viễn thông",
		description: "Hợp tác đào tạo và phát triển nguồn nhân lực",
	},
];

const CustomerSection: React.FC = () => {
	return (
		<section className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
			<div className="container mx-auto max-w-7xl px-4">
				<div className="mb-16 text-center">
					<h2 className="mb-4 text-4xl font-bold text-gray-900">
						Đối tác & Học viên tin tưởng
					</h2>
					<p className="mx-auto max-w-3xl text-xl text-gray-600">
						Chúng tôi tự hào được hợp tác với những đối tác hàng đầu và đào tạo
						hàng nghìn học viên thành công trong lĩnh vực lập trình và công nghệ
					</p>
				</div>

				<div className="flex flex-col items-center gap-12 lg:flex-row">
					{/* Partner Cards */}
					<div className="w-full lg:w-2/3">
						<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
							{partners.map((partner) => (
								<div
									key={partner.title}
									className="bithub-card group flex h-64 flex-col items-center justify-center p-8 text-center transition-all duration-300 hover:scale-105"
								>
									<div className="mb-6 justify-items-center">
										<img
											src={partner.thumbnail}
											alt={partner.title}
											className="mb-4 h-20 w-20 rounded-lg object-contain transition-opacity group-hover:opacity-80"
											loading="lazy"
										/>
										<h3 className="mb-2 text-2xl font-bold text-gray-800 transition-colors group-hover:text-blue-700">
											{partner.title}
										</h3>
										<div className="mb-3 text-sm font-semibold text-orange-600">
											{partner.category}
										</div>
									</div>

									<p className="mb-6 text-sm leading-relaxed text-gray-600">
										{partner.description}
									</p>

									<a
										href={partner.link}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center text-sm font-semibold text-blue-700 transition-colors hover:text-orange-600"
									>
										Xem chi tiết <ChevronRight className="ml-1 h-4 w-4" />
									</a>
								</div>
							))}
						</div>
					</div>

					{/* Why Choose Us */}
					<div className="w-full lg:w-1/3">
						<div className="rounded-xl bg-white p-8 shadow-lg">
							<h3 className="mb-6 flex items-center text-2xl font-bold text-gray-900">
								<span className="mr-3 h-8 border-l-4 border-blue-700" />
								Tại sao chọn Bit Learning?
							</h3>
							<p className="mb-6 text-base leading-relaxed text-gray-700">
								Với hơn 5 năm kinh nghiệm trong lĩnh vực đào tạo lập trình, Bit
								Learning đã trở thành trung tâm đào tạo uy tín và đối tác tin
								cậy của nhiều doanh nghiệp. Chúng tôi cam kết mang đến những
								khóa học chất lượng cao nhất.
							</p>

							<div className="space-y-4">
								<div className="flex items-center gap-3">
									<Users className="h-5 w-5 text-blue-600" />
									<span className="text-gray-700">
										5,000+ học viên đã tốt nghiệp
									</span>
								</div>
								<div className="flex items-center gap-3">
									<GraduationCap className="h-5 w-5 text-green-600" />
									<span className="text-gray-700">
										Chứng chỉ được công nhận
									</span>
								</div>
								<div className="flex items-center gap-3">
									<BookOpen className="h-5 w-5 text-orange-600" />
									<span className="text-gray-700">
										Khóa học online & offline linh hoạt
									</span>
								</div>
								<div className="flex items-center gap-3">
									<Award className="h-5 w-5 text-purple-600" />
									<span className="text-gray-700">Hỗ trợ học viên 24/7</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default CustomerSection;
