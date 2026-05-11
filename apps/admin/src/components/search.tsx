import { SearchIcon } from "lucide-react";
import { useSearch } from "@/shared/context/search-provider";
import { cn } from "@/shared/lib/utils";

type SearchProps = {
	className?: string;
	placeholder?: string;
};

export function Search({
	className,
	placeholder = "Tìm kiếm...",
}: SearchProps) {
	const { setOpen } = useSearch();

	return (
		<button
			type="button"
			onClick={() => setOpen(true)}
			className={cn(
				"group relative flex w-full items-center rounded-2xl border border-slate-200 bg-white/90 px-4 transition-all dark:border-slate-800 dark:bg-slate-900/80",
				"h-11 md:h-12", // 🔥 size lớn hơn
				"hover:border-sky-300 hover:bg-white",
				"focus:border-sky-400 focus:ring-4 focus:ring-sky-100",
				"dark:hover:border-sky-700 dark:hover:bg-slate-900",
				"dark:focus:border-sky-600 dark:focus:ring-sky-950",
				className,
			)}
		>
			{/* icon */}
			<SearchIcon className="mr-3 size-4 text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300" />

			{/* placeholder */}
			<span className="text-sm text-slate-500 dark:text-slate-400 md:text-base">
				{placeholder}
			</span>

			{/* shortcut */}
			<kbd className="ml-auto hidden items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500 sm:flex">
				<span>⌘</span>K
			</kbd>
		</button>
	);
}
