export function SkeletonBlock({ className }: { className: string }) {
	return (
		<div className={`animate-pulse rounded-3xl bg-slate-200/80 ${className}`} />
	);
}
