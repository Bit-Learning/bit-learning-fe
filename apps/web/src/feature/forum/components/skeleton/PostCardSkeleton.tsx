import { getSkeletonKeys } from "../../utils/forum.utils";
import { SkeletonBlock } from "./SkeletonBlock";

export function PostCardSkeleton() {
	return (
		<article className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
			<SkeletonBlock className="aspect-[16/9] w-full rounded-none" />
			<div className="space-y-4 p-5">
				<div className="space-y-3">
					<SkeletonBlock className="h-6 w-4/5" />
					<SkeletonBlock className="h-6 w-3/5" />
					<SkeletonBlock className="h-4 w-full" />
					<SkeletonBlock className="h-4 w-5/6" />
				</div>
				<div className="flex gap-2">
					{getSkeletonKeys("post-tag-skeleton", 3).map((key) => (
						<SkeletonBlock key={key} className="h-7 w-20 rounded-full" />
					))}
				</div>
				<div className="flex items-center gap-3 border-t border-slate-200 pt-4">
					<SkeletonBlock className="h-10 w-10 rounded-full" />
					<div className="flex-1 space-y-2">
						<SkeletonBlock className="h-4 w-32" />
						<SkeletonBlock className="h-3 w-40" />
					</div>
				</div>
			</div>
		</article>
	);
}
