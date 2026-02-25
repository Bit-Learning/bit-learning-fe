interface BrandLogoProps {
	icon?: string;
	className?: string;
}

export function BrandLogo({
	icon = "terminal",
	className = "",
}: BrandLogoProps) {
	return (
		<div className={`flex items-center gap-2 ${className}`}>
			<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/20">
				<span className="material-symbols-outlined text-2xl leading-none">
					{icon}
				</span>
			</div>
			<h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
				Tin Học <span className="text-primary">Vui</span>
			</h1>
		</div>
	);
}
