import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Header } from "@/layout/header";
import { KidsBlocklyListPage } from "@/features/kids-blockly/components/KidsBlocklyListPage";

const kidsBlocklySearchSchema = z.object({
	page: z.number().optional().catch(1),
	pageSize: z.number().optional().catch(10),
	isPublished: z
		.array(z.union([z.literal("true"), z.literal("false")]))
		.optional()
		.catch([]),
});

export const Route = createFileRoute("/_authenticated/apps/kids-blockly/")({
	validateSearch: kidsBlocklySearchSchema,
	component: KidsBlocklyRoute,
});

function KidsBlocklyRoute() {
	return (
		<>
			<Header />
			<div className="flex flex-1 flex-col gap-2 p-6 sm:gap-6">
				<KidsBlocklyListPage />
			</div>
		</>
	);
}
