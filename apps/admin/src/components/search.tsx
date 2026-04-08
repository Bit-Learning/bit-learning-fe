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
				"group relative w-full flex items-center rounded-2xl border border-slate-200 bg-slate-50/80 px-4 transition-all",
				"h-11 md:h-12", // 🔥 size lớn hơn
				"hover:bg-white hover:border-sky-300",
				"focus:ring-4 focus:ring-sky-100 focus:border-sky-400",
				className,
			)}
		>
			{/* icon */}
			<SearchIcon className="mr-3 size-4 text-slate-400 group-hover:text-slate-600" />

			{/* placeholder */}
			<span className="text-sm md:text-base text-slate-500">{placeholder}</span>

			{/* shortcut */}
			<kbd className="ml-auto hidden items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-400 sm:flex">
				<span>⌘</span>K
			</kbd>
		</button>
	);
}
