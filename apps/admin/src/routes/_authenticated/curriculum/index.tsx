import CurriculumListPage from "@/features/curriculum/pages/CurriculumListPage";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

const curriculumSearchSchema = z.object({
	page: z.number().optional().catch(1),
	pageSize: z.number().optional().catch(10),
	name: z.string().optional().catch(""),
});

export const Route = createFileRoute("/_authenticated/curriculum/")({
	validateSearch: curriculumSearchSchema,
	component: CurriculumListPage,
});
