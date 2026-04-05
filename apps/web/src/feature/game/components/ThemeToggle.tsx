import { useTheme } from "../contexts/ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
	const { theme, toggleTheme } = useTheme();

	return (
		<button
			onClick={toggleTheme}
			className={`flex items-center justify-center size-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary transition-all duration-200 cursor-pointer ${className}`}
			aria-label="Toggle theme"
		>
			{theme === "light" ? (
				<span className="material-symbols-outlined text-slate-600">
					dark_mode
				</span>
			) : (
				<span className="material-symbols-outlined text-yellow-400">
					light_mode
				</span>
			)}
		</button>
	);
}
