import { Skeleton } from "@workspace/ui/components/Skeleton";
import styles from "./HomePage.module.css";

export function GameHeroSkeleton() {
	return (
		<section className={styles.hero}>
			<div className="absolute inset-0 bg-[#1a0f12]" />
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(236,19,55,0.12),_transparent_40%),radial-gradient(circle_at_left,_rgba(59,130,246,0.08),_transparent_35%)]" />
			<div className={styles.heroContent}>
				<div className={styles.heroInner}>
					<div className="flex items-center gap-3">
						<Skeleton className="h-6 w-28 rounded-full bg-white/12" />
						<Skeleton className="h-5 w-32 rounded-full bg-white/10" />
					</div>
					<div className="space-y-3">
						<Skeleton className="h-16 w-64 bg-white/12 sm:w-80" />
						<Skeleton className="h-16 w-52 bg-white/10 sm:w-72" />
						<Skeleton className="h-16 w-40 bg-white/10 sm:w-56" />
					</div>
					<div className="space-y-3">
						<Skeleton className="h-5 w-full max-w-xl bg-white/10" />
						<Skeleton className="h-5 w-full max-w-lg bg-white/10" />
						<Skeleton className="h-5 w-3/4 max-w-md bg-white/10" />
					</div>
					<div className="flex flex-wrap gap-4 pt-4">
						<Skeleton className="h-12 w-40 rounded-lg bg-white/12" />
						<Skeleton className="h-12 w-36 rounded-lg bg-white/10" />
					</div>
				</div>
			</div>
		</section>
	);
}
