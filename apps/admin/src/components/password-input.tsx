import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/shared/lib/utils";

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const PasswordInput = React.forwardRef<
	HTMLInputElement,
	PasswordInputProps
>(({ className, ...props }, ref) => {
	const [show, setShow] = React.useState(false);

	return (
		<div className="relative">
			<input
				ref={ref}
				type={show ? "text" : "password"}
				className={cn(
					"flex h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-11 text-[15px] shadow-none outline-none transition-all",
					"placeholder:text-slate-400",
					"focus-visible:ring-4 focus-visible:ring-blue-500/10",
					"dark:border-slate-800 dark:bg-slate-900",
					className,
				)}
				{...props}
			/>
			<button
				type="button"
				onClick={() => setShow((prev) => !prev)}
				className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
			>
				{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
			</button>
		</div>
	);
});

PasswordInput.displayName = "PasswordInput";
