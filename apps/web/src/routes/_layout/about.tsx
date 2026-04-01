import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	Rocket,
	ArrowRight,
	CheckCircle,
	Lightbulb,
	Brain,
	Brush,
	Bot,
	PlayCircle,
	Code,
	Gamepad2,
	Trophy,
	Users,
	Sparkles,
} from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Card } from "@workspace/ui/components/Card";
import NumberTicker from "@workspace/ui/components/custom/ticker";

export const Route = createFileRoute("/_layout/about")({
	component: AboutUsPage,
});

const features = [
	{
		icon: Bot,
		title: "Trợ lý ảo AI",
		description:
			"Hỗ trợ giải đáp thắc mắc và gợi ý sửa lỗi code 24/7, cá nhân hóa theo trình độ của từng em.",
	},
	{
		icon: PlayCircle,
		title: "Khóa học Video",
		description:
			"Bài giảng được thiết kế bài bản, hình ảnh sinh động giúp học sinh dễ dàng tiếp thu kiến thức phức tạp.",
	},
	{
		icon: Code,
		title: "IDE Tương tác",
		description:
			"Môi trường lập trình trực tuyến mạnh mẽ, không cần cài đặt, hỗ trợ nhiều ngôn ngữ từ Scratch đến Python.",
	},
	{
		icon: Gamepad2,
		title: "Game hóa học tập",
		description:
			"Học thông qua các thử thách thú vị, tích điểm đổi quà và leo bảng xếp hạng cùng bạn bè.",
	},
	{
		icon: Trophy,
		title: "Cuộc thi lập trình",
		description:
			"Tổ chức các kỳ thi Code Contest thường xuyên để các em rèn luyện bản lĩnh và giao lưu quốc tế.",
	},
	{
		icon: Users,
		title: "Cộng đồng sôi động",
		description:
			"Nơi học sinh chia sẻ dự án, đặt câu hỏi và cùng nhau phát triển các ý tưởng công nghệ mới.",
	},
];

const missionValues = [
	{
		icon: Lightbulb,
		title: "Tư duy logic",
		description: "Phát triển khả năng giải quyết vấn đề một cách hệ thống.",
	},
	{
		icon: Brain,
		title: "Làm chủ AI",
		description: "Hiểu và ứng dụng trí tuệ nhân tạo vào thực tiễn cuộc sống.",
	},
	{
		icon: Brush,
		title: "Sáng tạo không giới hạn",
		description: "Tự tin xây dựng các dự án công nghệ của riêng mình.",
	},
];

const impactPoints = [
	{
		icon: Users,
		title: "Hơn 500 Mentor chuyên nghiệp",
		description:
			"Đội ngũ chuyên gia từ các tập đoàn công nghệ hàng đầu luôn sẵn sàng hỗ trợ.",
	},
	{
		icon: Sparkles,
		title: "Cá nhân hóa lộ trình 100%",
		description:
			"Mỗi học sinh có một tốc độ học riêng được AI phân tích và điều chỉnh hàng ngày.",
	},
];

function AboutUsPage() {
	const navigate = useNavigate();

	return (
		<main>
			<section className="relative overflow-hidden py-16 lg:py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
						<div className="flex flex-col gap-8">
							<div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
								<Rocket className="h-4 w-4" />
								Dẫn đầu công nghệ AI cho trẻ em
							</div>

							<h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white lg:text-6xl">
								Biến trí tò mò thành{" "}
								<span className="text-primary">sự tự tin</span>
							</h1>

							<p className="max-w-xl text-lg text-slate-600 dark:text-slate-400">
								Bit Learning là nền tảng học lập trình tích hợp AI dành riêng
								cho học sinh từ lớp 3 đến lớp 12. Chúng tôi giúp trẻ khai phá
								tiềm năng công nghệ thông qua lộ trình học thông minh.
							</p>

							<div className="flex flex-wrap gap-4">
								<Button
									onClick={() => navigate({ to: "/courses" })}
									size="xl"
									className="flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-bold text-white shadow-xl shadow-primary/30 transition-all hover:bg-primary/90"
								>
									Bắt đầu học ngay
									<ArrowRight className="h-5 w-5" />
								</Button>
							</div>
						</div>

						<div className="relative">
							<div
								className="aspect-video overflow-hidden rounded-3xl bg-slate-200 shadow-2xl dark:bg-slate-800 lg:aspect-square"
								style={{
									backgroundImage:
										"url('https://lh3.googleusercontent.com/aida-public/AB6AXuAMyns7gACaDv_dvTPvdJtfdRK0Of32XR8ZBYIt0_VlP3LVzkXRbIljeLrMw3nD809bj9_rWBBg7PW5NsbCWn3fgFyVHyD7xMNVK2--vQ6Idmai7WSNg_1NU9nVQC4DlIzkVqsY-z2fvvoSycTG9lLzxETy9LUNxsLdqy5K9KMksO8vTxeOdm1YukaOiRgr5p4uDJ1IT-v3scAc49-wLTXLC6jolopxocvH2SSnotTy97MsN6SjVSU2KoTTDtgVmIWPfmgEtQA-BRRj')",
									backgroundSize: "cover",
									backgroundPosition: "center",
								}}
							/>

							<div className="w-1/2 h-1/4 absolute -bottom-6 -left-6 flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900">
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
									<CheckCircle className="h-6 w-6" />
								</div>
								<div>
									<NumberTicker
										value={10000}
										duration={2500}
										className="text-4xl font-bold"
										prefix="+"
										decimalPlaces={0}
									/>

									<p className="text-xs font-bold uppercase tracking-wider text-slate-500">
										Học sinh tin dùng
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="bg-primary/5 py-20 dark:bg-primary/10">
				<div className="mx-auto max-w-4xl px-4 text-center">
					<h2 className="mb-6 text-3xl font-bold text-slate-900 dark:text-white lg:text-4xl">
						Sứ mệnh của chúng tôi
					</h2>
					<p className="text-xl italic leading-relaxed text-slate-600 dark:text-slate-300">
						"Chúng tôi giúp học sinh không chỉ dừng lại ở việc{" "}
						<span className="font-bold text-primary">'học mã lệnh'</span> mà
						tiến xa hơn tới việc{" "}
						<span className="font-bold text-primary">
							'sáng tạo cùng mã lệnh'
						</span>
						."
					</p>

					<div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
						{missionValues.map((value, index) => {
							const Icon = value.icon;
							return (
								<div key={index} className="flex flex-col items-center">
									<Icon className="mb-4 h-10 w-10 text-primary" />
									<h3 className="mb-2 font-bold">{value.title}</h3>
									<p className="text-sm text-slate-500">{value.description}</p>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			<section className="py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mb-16 text-center">
						<h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">
							Tính năng cốt lõi
						</h2>
						<p className="mx-auto max-w-2xl text-slate-500">
							Hệ sinh thái học tập hiện đại, kết hợp công nghệ AI và phương pháp
							sư phạm tiên tiến.
						</p>
					</div>

					<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
						{features.map((feature, index) => {
							const Icon = feature.icon;
							return (
								<Card
									key={index}
									className="group rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:border-primary dark:border-slate-800 dark:bg-slate-900"
								>
									<div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
										<Icon className="h-7 w-7" />
									</div>
									<h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
									<p className="leading-relaxed text-slate-500">
										{feature.description}
									</p>
								</Card>
							);
						})}
					</div>
				</div>
			</section>

			<section className="bg-slate-900 py-20 text-white">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
						<div className="relative">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-4">
									<div
										className="h-48 overflow-hidden rounded-2xl bg-slate-800"
										style={{
											backgroundImage:
												"url('https://lh3.googleusercontent.com/aida-public/AB6AXuBGqbDdxYdxxBDRRV2DP9t0h6a86VWPUUJHF0aGMPaXE-Ee3BbOxtJuSTlSMiKLv_nU8GhdgYHxohlMWLW80zhTM2Cpo60qDB-JbJnVDwCTPfShIh5VVPlvpLy22GH9caRmaUIeHZv4ZjauN0ZAAmNMgB-iGS1dFX4W7xs3t2ONBYJY9BO01U2AIl7TJe1Ulb8HM8_uOcIvPaRisrAS5MC5Yj6VOIYwwJnJlqT0XZ7BYcf8-flWcJspV3472AISI5G_E2PsefN0KF5N')",
											backgroundSize: "cover",
										}}
									/>
									<div
										className="h-64 overflow-hidden rounded-2xl bg-slate-800"
										style={{
											backgroundImage:
												"url('https://lh3.googleusercontent.com/aida-public/AB6AXuCQqzvt97d79KTonYlulfcZ8AFfWIzPQ3MV7W_lRx1R4uS8-39ciB5j_skemu5f_KIYE8ba1HLDahxLh2wH1OpAKUvKIThQJBq2rgMBfT73dVt-rRqOMAisvAw8cjZ2_D1L9tB-4nWHKvaCh6LjEJnZA8wuQFb2XRlorCwp8Zy9J6zTNpL_O3J3RsVqX_fFsWbenso8d4nP4g5dpv9xLdwh0yKLgLDAIvosAQPzfU_RrimcO3WoAf-eCrtLL8XMVarSvwPZCOWrIarm')",
											backgroundSize: "cover",
										}}
									/>
								</div>
								<div className="space-y-4 pt-8">
									<div
										className="h-64 overflow-hidden rounded-2xl bg-slate-800"
										style={{
											backgroundImage:
												"url('https://lh3.googleusercontent.com/aida-public/AB6AXuADhZ2J8YwGXgrcqhgNPmLzRejCZI-g6_yEzWhUwK3MJZO4ZzxcJcZ4LFD0DgN__itlm0j2nA3TJce4sdaDkPSprNHi2j5IHhX9gjN6ulrzSiZUfdI7CokmJmHZubuvCuUGumDc4jD0lrSHC67xBwA2MFZ0zC_x1IbVvGUUd9rGeOu5RrkSzVqk2lqFw9hB-fjEy-mP4LguhTCW5QUzo4r1DPqNh4Scm48nQetWamsyq-IDxj3elFkeX5ZbZueMl4InxpalGaoS3RFZ')",
											backgroundSize: "cover",
										}}
									/>
									<div
										className="h-48 overflow-hidden rounded-2xl bg-slate-800"
										style={{
											backgroundImage:
												"url('https://lh3.googleusercontent.com/aida-public/AB6AXuDDgGoHH-4k21aXzZsl226yf6DdSlt1k9nkTB1i7XpzHgVsdAgG-8L6zx5yPCXUzkmHe5U8ToG8BB34MmyVzefjmK7WE-PNsVkP57Qb6H1JBaLf1eR1IFs8TI_FLIcjViApnIuKhknJN-T4NM0i6yZ8ffBPCA6gCnY3l0PWeqGS54GQGx9YUpaiSxIxrxkaDFiCjmxffN7AXWCGhqtWxcpL78B3wWA07k74IubCSOFSwZ4U_ccPwC96if-BeEurvtYJd2DZRqVWCpwG')",
											backgroundSize: "cover",
										}}
									/>
								</div>
							</div>
						</div>

						<div>
							<h2 className="mb-6 text-3xl font-bold">
								Tác động của chúng tôi
							</h2>
							<p className="mb-8 text-lg leading-relaxed text-slate-400">
								Tại BitLearning, chúng tôi tin rằng sự kết hợp giữa{" "}
								<b>Trí tuệ Nhân tạo</b> và <b>Sự đồng hành của Cố vấn</b> là
								chìa khóa để khai mở tiềm năng. Hệ thống AI đóng vai trò như một
								người bạn học cùng, trong khi các Mentor giàu kinh nghiệm dẫn
								dắt các em vượt qua những giới hạn bản thân.
							</p>

							<div className="space-y-6">
								{impactPoints.map((point, index) => {
									const Icon = point.icon;
									return (
										<div key={index} className="flex items-start gap-4">
											<div className="mt-1 rounded-lg bg-primary/20 p-2 text-primary">
												<Icon className="h-6 w-6" />
											</div>
											<div>
												<h4 className="text-lg font-bold">{point.title}</h4>
												<p className="text-slate-400">{point.description}</p>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="py-24">
				<div className="mx-auto max-w-5xl px-4">
					<div className="relative overflow-hidden rounded-[2.5rem] bg-primary p-8 text-center text-white md:p-16">
						<div className="absolute -mr-16 -mt-16 right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
						<div className="absolute -mb-16 -ml-16 bottom-0 left-0 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

						<div className="relative z-10 flex flex-col items-center gap-8">
							<h2 className="text-3xl font-black leading-tight md:text-5xl">
								Sẵn sàng cho hành trình kiến tạo tương lai?
							</h2>
							<p className="max-w-2xl text-lg text-white/90 md:text-xl">
								Tham gia cùng hàng ngàn học sinh khác và bắt đầu xây dựng ứng
								dụng đầu tiên của bạn ngay hôm nay.
							</p>

							<div className="flex flex-wrap justify-center gap-4">
								<Button
									size="xl"
									className="rounded-2xl bg-white px-10 py-4 text-lg font-black text-primary shadow-xl transition-all hover:scale-105 active:scale-95"
								>
									Đăng ký học miễn phí
								</Button>
								<Button
									size="xl"
									variant="outline"
									className="rounded-2xl border-2 border-white/50 bg-primary/20 px-10 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10"
								>
									Xem các khóa học
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
