import { getSkeletonKeys } from "../../utils/forum.utils";
import { SkeletonBlock } from "./SkeletonBlock";

export function SidebarListSkeleton() {
	return (
		<section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
			<div className="mb-4 flex items-center gap-2">
				<SkeletonBlock className="h-4 w-4 rounded-full" />
				<SkeletonBlock className="h-4 w-32" />
			</div>
			<div className="space-y-4">
				{getSkeletonKeys("sidebar-skeleton", 4).map((key) => (
					<div key={key} className="flex items-start gap-3">
						<SkeletonBlock className="h-16 w-16 rounded-2xl" />
						<div className="flex-1 space-y-2">
							<SkeletonBlock className="h-4 w-full" />
							<SkeletonBlock className="h-4 w-5/6" />
							<SkeletonBlock className="h-3 w-2/3" />
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
