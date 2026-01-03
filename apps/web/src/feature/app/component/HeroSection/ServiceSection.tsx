import { Code, Users } from "lucide-react";

export const ServiceSections = () => {
	return (
		<div className="grid md:grid-cols-2">
			<div className="relative flex items-center justify-end overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 px-10 py-16">
				<div className="z-10 max-w-3xl text-end text-white">
					<div className="mb-6 flex justify-end">
						<Code className="h-12 w-12 text-white/90" />
					</div>
					<h2 className="mb-6 text-2xl font-bold tracking-tight">
						KHÓA HỌC ONLINE
					</h2>
					<p className="mb-8 text-lg leading-relaxed opacity-95">
						Học lập trình trực tuyến với video bài giảng chất lượng cao, học mọi
						lúc mọi nơi với chứng chỉ được công nhận và hỗ trợ 24/7
					</p>
					<button
						className="rounded-lg border-2 border-white px-8 py-3 font-semibold text-white transition-colors hover:bg-white hover:text-blue-700"
						onClick={() => (window.location.href = "/courses")}
					>
						XEM KHÓA HỌC ONLINE
					</button>
				</div>
				<div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10" />
			</div>

			<div className="relative flex items-center justify-start overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 px-10 py-16">
				<div className="z-10 max-w-3xl text-start text-white">
					<div className="mb-6 flex justify-start">
						<Users className="h-12 w-12 text-white/90" />
					</div>
					<h2 className="mb-6 text-2xl font-bold tracking-tight">
						KHÓA HỌC OFFLINE
					</h2>
					<p className="mb-8 text-lg leading-relaxed opacity-95">
						Tham gia lớp học offline với giảng viên trực tiếp, thực hành nhóm và
						được hỗ trợ trực tiếp trong quá trình học tập
					</p>
					<button
						className="rounded-lg border-2 border-white px-8 py-3 font-semibold text-white transition-colors hover:bg-white hover:text-orange-700"
						onClick={() => (window.location.href = "/offline-course")}
					>
						ĐĂNG KÝ KHÓA HỌC OFFLINE
					</button>
				</div>
				<div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10" />
			</div>
		</div>
	);
};
