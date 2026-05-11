import { useTheme } from "@/shared/components/ThemeProvider";
import { Moon, Sun } from "lucide-react";

/**
 * Cycles: light → dark → light
 * Shows Sun when dark (click to go light), Moon when light (click to go dark).
 */
export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	const isDark =
		theme === "dark" ||
		(theme === "system" &&
			window.matchMedia("(prefers-color-scheme: dark)").matches);

	return (
		<button
			aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
			onClick={() => setTheme(isDark ? "light" : "dark")}
			className="relative rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group cursor-pointer"
		>
			{/* Sun — visible in dark mode */}
			<Sun
				className="h-[1.4rem] w-[1.4rem] text-gray-600 dark:text-gray-300
				group-hover:text-primary dark:group-hover:text-blue-400 transition-colors
				scale-0 dark:scale-100 absolute inset-2"
			/>
			{/* Moon — visible in light mode */}
			<Moon
				className="h-[1.4rem] w-[1.4rem] text-gray-600 dark:text-gray-300
				group-hover:text-primary dark:group-hover:text-blue-400 transition-colors
				scale-100 dark:scale-0"
			/>
		</button>
	);
}
