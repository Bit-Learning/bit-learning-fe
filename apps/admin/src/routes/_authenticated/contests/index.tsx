import ContestListPage from "@/features/contests/pages/ContestList";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

const contestsSearchSchema = z.object({
	page: z.number().optional().catch(1),
	pageSize: z.number().optional().catch(10),
	title: z.string().optional().catch(""),
	status: z
		.array(z.enum(["UPCOMING", "RUNNING", "ENDED"]))
		.optional()
		.catch([]),
});

export const Route = createFileRoute("/_authenticated/contests/")({
	validateSearch: contestsSearchSchema,
	component: ContestListPage,
});
