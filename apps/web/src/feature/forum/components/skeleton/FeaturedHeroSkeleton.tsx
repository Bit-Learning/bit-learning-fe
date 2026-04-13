import { getSkeletonKeys } from "../../utils/forum.utils";
import { SkeletonBlock } from "./SkeletonBlock";

export function FeaturedHeroSkeleton() {
	return (
		<section className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)]">
			<div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
				<SkeletonBlock className="h-72 w-full rounded-none sm:h-96" />
				<div className="space-y-5 p-6 sm:p-8">
					<div className="flex gap-3">
						<SkeletonBlock className="h-8 w-28 rounded-full" />
						<SkeletonBlock className="h-8 w-16 rounded-full" />
					</div>
					<div className="space-y-3">
						<SkeletonBlock className="h-8 w-5/6" />
						<SkeletonBlock className="h-8 w-3/5" />
						<SkeletonBlock className="h-4 w-full" />
						<SkeletonBlock className="h-4 w-11/12" />
					</div>
					<div className="flex items-center gap-3 border-t border-slate-200 pt-4">
						<SkeletonBlock className="h-12 w-12 rounded-full" />
						<div className="flex-1 space-y-2">
							<SkeletonBlock className="h-4 w-36" />
							<SkeletonBlock className="h-3 w-48" />
						</div>
					</div>
				</div>
			</div>
			<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
				{getSkeletonKeys("featured-side-skeleton", 3).map((key) => (
					<div
						key={key}
						className="grid grid-cols-[112px_minmax(0,1fr)] gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm"
					>
						<SkeletonBlock className="h-28 w-full rounded-2xl" />
						<div className="space-y-3">
							<SkeletonBlock className="h-4 w-20" />
							<SkeletonBlock className="h-5 w-full" />
							<SkeletonBlock className="h-5 w-4/5" />
							<SkeletonBlock className="h-4 w-full" />
							<SkeletonBlock className="h-4 w-2/3" />
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
