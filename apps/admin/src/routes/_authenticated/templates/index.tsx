import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { TemplatesPage } from "@/features/templates/pages/TemplatesPage";

const templatesSearchSchema = z.object({
	page: z.number().optional().catch(1),
	pageSize: z.number().optional().catch(10),
	// Per-column text filter for slide templates
	name: z.string().optional().catch(""),
});

export const Route = createFileRoute("/_authenticated/templates/")({
	validateSearch: templatesSearchSchema,
	component: TemplatesPage,
});
