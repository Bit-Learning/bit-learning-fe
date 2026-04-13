import { SkeletonBlock } from "./SkeletonBlock";

export function CategoryCardSkeleton() {
	return (
		<div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
			<SkeletonBlock className="mb-4 h-10 w-10 rounded-2xl" />
			<SkeletonBlock className="h-6 w-32" />
			<SkeletonBlock className="mt-2 h-4 w-28" />
		</div>
	);
}
