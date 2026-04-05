import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
	theme: "light",
	toggleTheme: () => {},
});

export function useTheme() {
	return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setTheme] = useState<Theme>("light");

	useEffect(() => {
		const saved = localStorage.getItem("theme") as Theme | null;
		if (saved) {
			setTheme(saved);
			document.documentElement.classList.toggle("dark", saved === "dark");
		}
	}, []);

	const toggleTheme = () => {
		const next = theme === "light" ? "dark" : "light";
		setTheme(next);
		localStorage.setItem("theme", next);
		document.documentElement.classList.toggle("dark", next === "dark");
	};

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}
