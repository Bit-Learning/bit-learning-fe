import { BrandLogo } from "@/feature/game/components/BrandLogo";
import { SymbolBackground } from "@/feature/game/components/SymbolBackground";
import { ThemeToggle } from "@/feature/game/components/ThemeToggle";
import { SymbolAnimationMode } from "@/feature/game/data";
import Loader from "@/shared/components/loader/LoadingHamster";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import { useEffect, useState } from "react";

export function LoadingPage() {
	const navigate = useNavigate();
	const [progress, setProgress] = useState(0);
	const [symbolAnimation] = useState<SymbolAnimationMode>(() => {
		if (typeof window === "undefined") return SymbolAnimationMode.On;
		const stored = window.localStorage.getItem(
			"symbolAnimation",
		) as SymbolAnimationMode | null;
		return stored === SymbolAnimationMode.Off
			? SymbolAnimationMode.Off
			: SymbolAnimationMode.On;
	});

	const isAnimationOn = symbolAnimation === SymbolAnimationMode.On;

	useEffect(() => {
		const interval = setInterval(() => {
			setProgress((prev) => {
				if (prev >= 100) {
					clearInterval(interval);
					navigate({ to: "/matching/path" });
					return 100;
				}
				return prev + 2;
			});
		}, 60);
		return () => clearInterval(interval);
	}, [navigate]);

	return (
		<div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300 min-h-screen overflow-hidden">
			{/* Programming-style background overlay (like home page) */}
			<SymbolBackground animationMode={symbolAnimation} size="md" />

			<div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden z-10">
				{/* Header */}
				<header className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-6 md:px-12">
					<img
						src="/Logo.png"
						alt="Bit Learning"
						className={cn("object-contain transition-all duration-300 h-10")}
					/>

					<ThemeToggle />
				</header>

				{/* Loading Content */}
				<main className="flex w-full max-w-md flex-col items-center px-6 text-center">
					{/* Pulse Icon */}
					<Loader />

					{/* Progress Bar */}
					<div className="w-full mt-10">
						<div className="mb-3 flex items-end justify-between">
							<span className="text-sm font-semibold text-primary">
								Sẵn sàng khám phá
							</span>
							<span className="text-sm font-bold text-slate-900 dark:text-white">
								{progress}%
							</span>
						</div>
						<div className="h-4 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
							<div
								className="h-full rounded-full bg-primary shadow-[0_0_15px_rgba(43,140,238,0.5)] transition-all duration-300"
								style={{ width: `${progress}%` }}
							/>
						</div>
					</div>

					{/* Tip */}
					<div className="mt-12 flex items-start gap-3 rounded-xl bg-primary/5 p-4 text-left border border-primary/10">
						<span className="material-symbols-outlined text-primary mt-0.5">
							lightbulb
						</span>
						<div>
							<p className="text-xs font-bold uppercase tracking-wider text-primary">
								Bạn có biết?
							</p>
							<p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
								Chuột máy tính giúp chúng ta điều khiển mọi thứ trên màn hình
								một cách dễ dàng nhất!
							</p>
						</div>
					</div>
				</main>

				{/* Decorative blobs */}
				<div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl"></div>
				<div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl"></div>
			</div>
		</div>
	);
}
