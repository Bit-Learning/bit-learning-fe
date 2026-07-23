import React, { useState, useRef, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface CategoryInputProps {
	value: string[];
	onChange: (categories: string[]) => void;
	placeholder?: string;
}

export const CategoryInput: React.FC<CategoryInputProps> = ({
	value = [],
	onChange,
	placeholder = "Nhập danh mục...",
}) => {
	const [input, setInput] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const add = () => {
		const trimmed = input.trim();
		if (trimmed && !value.includes(trimmed)) {
			onChange([...value, trimmed]);
		}
		setInput("");
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			add();
		} else if (e.key === "Backspace" && input === "" && value.length > 0) {
			onChange(value.slice(0, -1));
		}
	};

	const remove = (cat: string) => {
		onChange(value.filter((c) => c !== cat));
	};

	return (
		<div
			className={cn(
				"min-h-10 w-full cursor-text rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm",
				"flex flex-wrap items-center gap-1.5 focus-within:ring-1 focus-within:ring-ring focus-within:border-ring",
			)}
			onClick={() => inputRef.current?.focus()}
		>
			{value.map((cat) => (
				<span
					key={cat}
					className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
				>
					{cat}
					<button
						type="button"
						onClick={() => remove(cat)}
						className="hover:text-red-500 transition-colors"
					>
						<X className="h-3 w-3" />
					</button>
				</span>
			))}
			<input
				ref={inputRef}
				value={input}
				onChange={(e) => setInput(e.target.value)}
				onKeyDown={handleKeyDown}
				onBlur={add}
				placeholder={value.length === 0 ? placeholder : ""}
				className="flex-1 min-w-30 bg-transparent outline-none placeholder:text-muted-foreground"
			/>
		</div>
	);
};
