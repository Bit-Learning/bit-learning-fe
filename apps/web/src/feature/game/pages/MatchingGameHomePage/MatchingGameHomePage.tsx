import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SymbolAnimationMode } from "../../data";
import { SymbolBackground } from "../../components/SymbolBackground";
import { BrandLogo } from "../../components/BrandLogo";
import { ThemeToggle } from "../../components/ThemeToggle";
import "../../styles/index.css";
import { cn } from "@workspace/ui/lib/utils";
import BlueButton from "@/shared/components/button/BlueButton";

export default function MatchingGameHomePage() {
	const navigate = useNavigate();
	const [symbolAnimation, setSymbolAnimation] = useState<SymbolAnimationMode>(
		() => {
			if (typeof window === "undefined") return SymbolAnimationMode.On;
			const stored = window.localStorage.getItem(
				"symbolAnimation",
			) as SymbolAnimationMode | null;
			return stored === SymbolAnimationMode.Off
				? SymbolAnimationMode.Off
				: SymbolAnimationMode.On;
		},
	);

	useEffect(() => {
		if (typeof window === "undefined") return;
		window.localStorage.setItem("symbolAnimation", symbolAnimation);
	}, [symbolAnimation]);

	const isAnimationOn = symbolAnimation === SymbolAnimationMode.On;

	return (
		<body className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-x-hidden min-h-screen">
			<title>Trang chủ</title>
			{/* Background Pattern Overlay */}
			<SymbolBackground animationMode={symbolAnimation} size="lg" />

			<div className="relative flex min-h-screen flex-col z-10">
				{/* Header */}
				<header className="flex items-center justify-between px-6 py-4 md:px-12 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-50">
					<Link to="/" className="flex items-center relative z-50">
						<img
							src="/Logo.png"
							alt="Bit Learning"
							className={cn("object-contain transition-all duration-300 h-10")}
						/>
					</Link>

					<div className="flex items-center gap-4">
						<nav className="hidden md:flex gap-8 mr-4">
							<a
								className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors font-medium"
								href="/"
							>
								Trang chủ
							</a>
							<a
								className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors font-medium"
								href="/about"
							>
								Giới thiệu
							</a>
						</nav>
						<button
							onClick={() =>
								setSymbolAnimation((prev) =>
									prev === SymbolAnimationMode.On
										? SymbolAnimationMode.Off
										: SymbolAnimationMode.On,
								)
							}
							className="hidden md:inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200"
						>
							<span className="material-symbols-outlined text-sm">
								{isAnimationOn ? "motion_mode" : "motion_photos_off"}
							</span>
							{isAnimationOn ? "Hiệu ứng nền: Bật" : "Hiệu ứng nền: Tắt"}
						</button>
						<ThemeToggle />
					</div>
				</header>

				{/* Hero Section */}
				<main className="flex-grow flex items-center justify-center px-6 py-12">
					<div className="max-w-[800px] w-full flex flex-col items-center text-center gap-12">
						<div className="flex flex-col gap-6">
							<div className="inline-flex self-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wide uppercase">
								Chào mừng bạn đến với học viện số
							</div>
							<h1 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white">
								Khám phá thế giới <br />
								<span className="text-primary">Tin học thật vui!</span>
							</h1>
							<p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-[600px] mx-auto leading-relaxed">
								Nền tảng học tập lập trình và kỹ năng số dành riêng cho học
								sinh. Học vui vẻ, sáng tạo không giới hạn.
							</p>
						</div>

						{/* CTA */}
						<div className="flex flex-col items-center gap-6 w-full">
							<Link to="/matching/loading">
								<BlueButton text="Bắt đầu ngay" />
							</Link>
							<div className="flex flex-wrap justify-center gap-6 text-slate-500 dark:text-slate-500 font-medium">
								{["Miễn phí 100%", "Dễ hiểu", "Sáng tạo"].map((item) => (
									<div key={item} className="flex items-center gap-2">
										<span className="material-symbols-outlined text-primary text-xl">
											check_circle
										</span>
										<span>{item}</span>
									</div>
								))}
							</div>
						</div>

						{/* Visual Code Editor Mock */}
						<div className="relative w-full max-w-2xl mt-8">
							<div className="aspect-video bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden relative">
								<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
								<div className="flex items-center justify-start gap-1.5 p-3 border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/50">
									<div className="size-3 rounded-full bg-red-400/80" />
									<div className="size-3 rounded-full bg-yellow-400/80" />
									<div className="size-3 rounded-full bg-green-400/80" />
									<div className="ml-4 h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded-full" />
								</div>
								<div className="p-6 text-left font-mono text-sm md:text-base space-y-2 opacity-70">
									<div className="flex gap-4">
										<span className="text-primary/50">1</span>{" "}
										<span className="text-primary">function</span>{" "}
										<span className="text-amber-500">startLearning</span>(){" "}
										{"{"}
									</div>
									<div className="flex gap-4">
										<span className="text-primary/50">2</span>{" "}
										<span className="pl-6 text-slate-400">console</span>.
										<span className="text-blue-500">log</span>(
										<span className="text-emerald-500">
											"Học lập trình thật vui!"
										</span>
										);
									</div>
									<div className="flex gap-4">
										<span className="text-primary/50">3</span>{" "}
										<span className="pl-6 text-primary">return</span>{" "}
										<span className="text-amber-500">true</span>;
									</div>
									<div className="flex gap-4">
										<span className="text-primary/50">4</span> {"}"}
									</div>
									<div className="h-4" />
									<div className="flex gap-4">
										<span className="text-primary/50">5</span>{" "}
										<span className="text-amber-500">startLearning</span>();
									</div>
								</div>
							</div>
							<div className="absolute -z-10 -top-10 -right-10 size-48 bg-primary/20 blur-3xl rounded-full" />
							<div className="absolute -z-10 -bottom-10 -left-10 size-48 bg-blue-400/10 blur-3xl rounded-full" />
						</div>
					</div>
				</main>

				{/* Footer */}
				<footer className="mt-auto py-10 px-6 border-t border-slate-200/50 dark:border-slate-800/50 text-center">
					<div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 mb-6">
						<a
							className="text-slate-500 hover:text-primary transition-colors"
							href="/terms"
						>
							Điều khoản dịch vụ
						</a>
						<a
							className="text-slate-500 hover:text-primary transition-colors"
							href="/privacy"
						>
							Chính sách bảo mật
						</a>
						<a
							className="text-slate-500 hover:text-primary transition-colors"
							href="/about"
						>
							Liên hệ
						</a>
					</div>
					<p className="text-slate-400 text-sm">© 2026 Bit Learning System</p>
				</footer>
			</div>
		</body>
	);
}
