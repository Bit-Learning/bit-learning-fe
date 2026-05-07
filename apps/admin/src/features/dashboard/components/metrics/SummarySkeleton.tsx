import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SummarySkeleton() {
	return (
		<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
			{["requests", "cpu", "memory", "threads"].map((key) => (
				<Card key={key}>
					<CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
						<div>
							<Skeleton className="h-4 w-24" />
							<Skeleton className="mt-2 h-3 w-32" />
						</div>
						<Skeleton className="h-10 w-10 rounded-2xl" />
					</CardHeader>
					<CardContent className="pt-0">
						<Skeleton className="mb-3 h-8 w-28" />
						<Skeleton className="h-3 w-36" />
					</CardContent>
				</Card>
			))}
		</div>
	);
}
