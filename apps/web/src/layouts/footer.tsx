import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { SiFacebook } from "react-icons/si";
import { FaLinkedin, FaInstagramSquare, FaTwitter } from "react-icons/fa";

const Footer: React.FC = () => {
	return (
		<footer className="bg-linear-to-br from-slate-50 to-slate-100 text-slate-800 border-t border-slate-200">
			<div className="container mx-auto px-4 py-16">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
					<div className="space-y-4">
						<div className="flex items-center space-x-2">
							<img
								src="/Logo.png"
								alt="Bit Learning"
								className="h-10 w-36 object-contain"
							/>
						</div>
						<p className="leading-relaxed text-slate-600">
							Nền tảng học tin học dành cho học sinh từ Tiểu học đến THPT.
							Chương trình chuẩn BGD&ĐT, lộ trình rõ ràng và hỗ trợ học viên
							24/7.
						</p>
						<div className="flex space-x-4">
							<a
								href="#"
								className="text-slate-500 transition-colors hover:text-blue-600"
							>
								<SiFacebook className="h-5 w-5" />
							</a>
							<a
								href="#"
								className="text-slate-500 transition-colors hover:text-blue-600"
							>
								<FaTwitter className="h-5 w-5" />
							</a>
							<a
								href="#"
								className="text-slate-500 transition-colors hover:text-pink-500"
							>
								<FaInstagramSquare className="h-5 w-5" />
							</a>
							<a
								href="#"
								className="text-slate-500 transition-colors hover:text-blue-700"
							>
								<FaLinkedin className="h-5 w-5" />
							</a>
						</div>
					</div>

					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-slate-900">Khóa học</h3>
						<ul className="space-y-2">
							<li>
								<Link
									to="/courses"
									search={{ minGrade: 3, maxGrade: 5 }}
									className="text-slate-600 transition-colors hover:text-blue-600"
								>
									Tiểu học (Lớp 3–5)
								</Link>
							</li>
							<li>
								<Link
									to="/courses"
									search={{ minGrade: 6, maxGrade: 9 }}
									className="text-slate-600 transition-colors hover:text-blue-600"
								>
									Trung học cơ sở (Lớp 6–9)
								</Link>
							</li>
							<li>
								<Link
									to="/courses"
									search={{ minGrade: 10, maxGrade: 12 }}
									className="text-slate-600 transition-colors hover:text-blue-600"
								>
									Trung học phổ thông (Lớp 10–12)
								</Link>
							</li>
							<li>
								<a
									href="https://bit-learning.lch.id.vn/open-mobile"
									className="text-slate-600 transition-colors hover:text-blue-600"
								>
									Mở app Mobile
								</a>
							</li>
						</ul>
					</div>

					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-slate-900">Dịch vụ</h3>
						<ul className="space-y-2">
							<li>
								<Link
									to="/exams"
									className="text-slate-600 transition-colors hover:text-blue-600"
								>
									Ma trận đề thi
								</Link>
							</li>
							<li>
								<Link
									to="/chat-ai"
									className="text-slate-600 transition-colors hover:text-blue-600"
								>
									Trợ lý AI
								</Link>
							</li>
							<li>
								<Link
									to="/forum"
									className="text-slate-600 transition-colors hover:text-blue-600"
								>
									Diễn đàn học tập
								</Link>
							</li>
							<li>
								<Link
									to="/games"
									className="text-slate-600 transition-colors hover:text-blue-600"
								>
									Trò chơi nhỏ
								</Link>
							</li>
							<li>
								<Link
									to="/contests"
									className="text-slate-600 transition-colors hover:text-blue-600"
								>
									Luyện code trực tuyến
								</Link>
							</li>
						</ul>
					</div>

					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-slate-900">Liên hệ</h3>
						<div className="space-y-3">
							<div className="flex items-center space-x-3">
								<Phone className="h-5 w-5 text-blue-400" />
								<span className="text-slate-700">0123.456.789</span>
							</div>
							<div className="flex items-center space-x-3">
								<Mail className="h-5 w-5 text-blue-400" />
								<span className="text-slate-700">bitlearning@gmail.com</span>
							</div>
							<div className="flex items-start space-x-3">
								<MapPin className="mt-1 h-5 w-5 text-blue-400" />
								<span className="text-slate-700">
									7 Đ. D1, Long Thạnh Mỹ, Thủ Đức, Hồ Chí Minh 700000
								</span>
							</div>
						</div>
					</div>
				</div>

				<div className="mt-12 border-t border-slate-200 pt-8">
					<div className="flex flex-col items-center justify-between md:flex-row">
						<p className="text-sm text-slate-500">
							{new Date().getFullYear()} ©Bit Learning. Tất cả quyền được bảo
							lưu
						</p>
						<div className="mt-4 flex space-x-6 md:mt-0">
							<Link
								to="/privacy"
								className="text-sm text-slate-500 transition-colors hover:text-blue-600"
							>
								Chính sách bảo mật
							</Link>
							<Link
								to="/terms"
								className="text-sm text-slate-500 transition-colors hover:text-blue-600"
							>
								Điều khoản sử dụng
							</Link>
							<Link
								to="/about"
								className="text-sm text-slate-500 transition-colors hover:text-blue-600"
							>
								Về chúng tôi
							</Link>
							<a
								href="https://bit-learning-kuma.lch.id.vn/status/page"
								className="flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-blue-600"
								target="_blank"
								rel="noopener noreferrer"
							>
								<span className="relative flex h-2 w-2">
									<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
									<span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
								</span>
								Trạng thái hệ thống
							</a>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
