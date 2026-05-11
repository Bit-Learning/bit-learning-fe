import { Skeleton } from "@workspace/ui/components/Skeleton";

const GAME_ROW_SKELETON_IDS = ["hero", "arcade", "focus", "speed"] as const;

export function CategoryRowSkeleton({
	descriptionWidth,
}: {
	descriptionWidth: string;
}) {
	return (
		<section className="space-y-5">
			<div className="px-8">
				<div className="flex items-start justify-between gap-4">
					<div className="space-y-3">
						<div className="flex items-center gap-3">
							<Skeleton className="h-3 w-3 rounded-full bg-white/25" />
							<Skeleton className="h-7 w-40 bg-white/15" />
						</div>
						<Skeleton className={`h-4 bg-white/10 ${descriptionWidth}`} />
					</div>
					<Skeleton className="hidden h-5 w-20 bg-white/10 md:block" />
				</div>
			</div>
			<div className="flex gap-3 overflow-hidden px-8">
				{GAME_ROW_SKELETON_IDS.map((cardId) => (
					<div key={cardId} className="w-64 flex-none space-y-3">
						<Skeleton className="aspect-video w-full rounded-md bg-white/10" />
						<div className="space-y-2">
							<Skeleton className="h-4 w-5/6 bg-white/10" />
							<Skeleton className="h-3 w-2/3 bg-white/10" />
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
