import { ThemeToggle } from "@/feature/game/components/ThemeToggle";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/matching/dashboard")({
	component: DashboardPage,
});

export default function DashboardPage() {
	const navigate = useNavigate();

	return (
		<div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300 min-h-screen">
			<div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
				{/* Header */}
				<header className="flex items-center justify-between border-b border-primary/10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-4 lg:px-20 sticky top-0 z-50">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
							<span className="material-symbols-outlined text-2xl">
								computer
							</span>
						</div>
						<h2 className="text-xl font-bold tracking-tight text-primary">
							Tin Học Vui
						</h2>
					</div>
					<div className="flex items-center gap-4">
						<ThemeToggle />
						<div className="h-10 w-10 rounded-full bg-primary/20 border-2 border-primary/30 overflow-hidden">
							<div className="h-full w-full bg-primary/30 flex items-center justify-center">
								<span className="material-symbols-outlined text-primary text-xl">
									person
								</span>
							</div>
						</div>
					</div>
				</header>

				{/* Content */}
				<main className="flex flex-1 items-center justify-center p-4 lg:p-10 confetti-bg">
					<div className="w-full max-w-2xl">
						<div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-xl shadow-primary/5 p-8 lg:p-12 text-center border border-primary/10">
							{/* Decorative */}
							<div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/5"></div>
							<div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-primary/5"></div>

							{/* Header */}
							<div className="mb-8">
								<div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500 mb-6">
									<span className="material-symbols-outlined text-6xl">
										emoji_events
									</span>
								</div>
								<h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3">
									Chúc mừng bạn đã hoàn thành!
								</h1>
								<p className="text-lg text-slate-500 dark:text-slate-400">
									Bạn đã xuất sắc vượt qua thử thách nối cặp.
								</p>
							</div>

							{/* Stats */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
								<div className="flex flex-col items-center justify-center rounded-xl bg-primary/5 p-6 border border-primary/10">
									<span className="material-symbols-outlined text-primary mb-2 text-3xl">
										task_alt
									</span>
									<p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
										Số câu đúng
									</p>
									<p className="text-4xl font-bold text-primary">4/4</p>
								</div>
								<div className="flex flex-col items-center justify-center rounded-xl bg-primary/5 p-6 border border-primary/10">
									<span className="material-symbols-outlined text-primary mb-2 text-3xl">
										timer
									</span>
									<p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
										Thời gian
									</p>
									<p className="text-4xl font-bold text-primary">01:30</p>
								</div>
							</div>

							{/* Feedback */}
							<div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 mb-10 border border-green-100 dark:border-green-900/30">
								<p className="text-green-700 dark:text-green-400 font-medium text-lg">
									"Bạn làm rất tốt, hãy tiếp tục phát huy nhé! 🌟"
								</p>
							</div>

							{/* Actions */}
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<button
									onClick={() => navigate({ to: "/matching/game" })}
									className="flex items-center justify-center gap-2 rounded-xl border-2 border-primary px-8 py-4 text-primary font-bold text-lg hover:bg-primary/5 transition-all active:scale-95 sm:min-w-[180px]"
								>
									<span className="material-symbols-outlined">replay</span>
									Làm lại
								</button>
								<button
									onClick={() => navigate({ to: "/matching/path" })}
									className="flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-white font-bold text-lg hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 sm:min-w-[180px]"
								>
									<span className="material-symbols-outlined">menu_book</span>
									Quay về bài học
								</button>
							</div>
						</div>

						<div className="mt-8 text-center text-slate-400 dark:text-slate-500 text-sm">
							<p>Học tập thật vui cùng Tin Học Vui © 2024</p>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
