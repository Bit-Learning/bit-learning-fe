import { Link } from "@tanstack/react-router";
import {
	Facebook,
	Instagram,
	Linkedin,
	Mail,
	MapPin,
	Phone,
	Twitter,
} from "lucide-react";

const Footer: React.FC = () => {
	return (
		<footer className="bg-linear-to-br from-gray-800 to-gray-900 text-white">
			<div className="container mx-auto px-4 py-16">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
					{/* Company Info */}
					<div className="space-y-4">
						<div className="flex items-center space-x-2">
							<img
								src="/Logo.png"
								alt="BithubLearning"
								className="h-10 w-36 object-contain"
							/>
						</div>
						<p className="leading-relaxed text-gray-300">
							Trung tâm đào tạo lập trình hàng đầu Việt Nam với hơn 5 năm kinh
							nghiệm. Chúng tôi cam kết mang đến những khóa học chất lượng cao
							và hỗ trợ học viên 24/7.
						</p>
						<div className="flex space-x-4">
							<a
								href="#"
								className="text-gray-400 transition-colors hover:text-blue-400"
							>
								<Facebook className="h-5 w-5" />
							</a>
							<a
								href="#"
								className="text-gray-400 transition-colors hover:text-blue-400"
							>
								<Twitter className="h-5 w-5" />
							</a>
							<a
								href="#"
								className="text-gray-400 transition-colors hover:text-pink-400"
							>
								<Instagram className="h-5 w-5" />
							</a>
							<a
								href="#"
								className="text-gray-400 transition-colors hover:text-blue-600"
							>
								<Linkedin className="h-5 w-5" />
							</a>
						</div>
					</div>

					{/* Services */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-white">Khóa học</h3>
						<ul className="space-y-2">
							<li>
								<Link
									to="/courses/web-development"
									className="text-gray-300 transition-colors hover:text-blue-400"
								>
									Lập trình Web
								</Link>
							</li>
							<li>
								<Link
									to="/courses/mobile-development"
									className="text-gray-300 transition-colors hover:text-blue-400"
								>
									Lập trình Mobile
								</Link>
							</li>
							<li>
								<Link
									to="/courses/backend-development"
									className="text-gray-300 transition-colors hover:text-blue-400"
								>
									Lập trình Backend
								</Link>
							</li>
							<li>
								<Link
									to="/courses/data-science"
									className="text-gray-300 transition-colors hover:text-blue-400"
								>
									Data Science & AI
								</Link>
							</li>
							<li>
								<Link
									to="/offline-course"
									className="text-gray-300 transition-colors hover:text-blue-400"
								>
									Khóa học Offline
								</Link>
							</li>
						</ul>
					</div>

					{/* Services */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-white">Dịch vụ</h3>
						<ul className="space-y-2">
							<li>
								<Link
									to="/consultation"
									className="text-gray-300 transition-colors hover:text-blue-400"
								>
									Tư vấn khóa học
								</Link>
							</li>
							<li>
								<Link
									to="/corporate-training"
									className="text-gray-300 transition-colors hover:text-blue-400"
								>
									Đào tạo doanh nghiệp
								</Link>
							</li>
							<li>
								<Link
									to="/mentorship"
									className="text-gray-300 transition-colors hover:text-blue-400"
								>
									Mentorship 1-1
								</Link>
							</li>
							<li>
								<Link
									to="/web-design"
									className="text-gray-300 transition-colors hover:text-blue-400"
								>
									Thiết kế website
								</Link>
							</li>
						</ul>
					</div>

					{/* Contact */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-white">Liên hệ</h3>
						<div className="space-y-3">
							<div className="flex items-center space-x-3">
								<Phone className="h-5 w-5 text-blue-400" />
								<span className="text-gray-300">0767.666.299</span>
							</div>
							<div className="flex items-center space-x-3">
								<Mail className="h-5 w-5 text-blue-400" />
								<span className="text-gray-300">bithubvn@gmail.com</span>
							</div>
							<div className="flex items-start space-x-3">
								<MapPin className="mt-1 h-5 w-5 text-blue-400" />
								<span className="text-gray-300">
									929 Âu Cơ, Phường Tân Sơn Nhì, Hồ Chí Minh
								</span>
							</div>
						</div>
					</div>
				</div>

				<div className="mt-12 border-t border-gray-700 pt-8">
					<div className="flex flex-col items-center justify-between md:flex-row">
						<p className="text-sm text-gray-400">
							{new Date().getFullYear()} ©Bithub Learning. Tất cả quyền được bảo
							lưu
						</p>
						<div className="mt-4 flex space-x-6 md:mt-0">
							<Link
								to="/privacy"
								className="text-sm text-gray-400 transition-colors hover:text-blue-400"
							>
								Chính sách bảo mật
							</Link>
							<Link
								to="/terms"
								className="text-sm text-gray-400 transition-colors hover:text-blue-400"
							>
								Điều khoản sử dụng
							</Link>
							<Link
								to="/contact"
								className="text-sm text-gray-400 transition-colors hover:text-blue-400"
							>
								Liên hệ
							</Link>
							<Link
								to="/about"
								className="text-sm text-gray-400 transition-colors hover:text-blue-400"
							>
								Về chúng tôi
							</Link>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
