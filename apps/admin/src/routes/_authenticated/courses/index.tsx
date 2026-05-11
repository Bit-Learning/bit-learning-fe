import { CourseListPage } from "@/features/courses/pages/CourseListPage";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

const coursesSearchSchema = z.object({
	page: z.number().optional().catch(1),
	pageSize: z.number().optional().catch(10),
	// Per-column text filter for course title
	title: z.string().optional().catch(""),
	// Facet filter for course status
	status: z
		.array(z.enum(["PENDING", "PUBLISHED", "REJECTED"]))
		.optional()
		.catch([]),
	// Filter by course grade (class)
	grade: z.array(z.coerce.number()).optional().catch([]),
	// Filter by course level (difficulty)
	level: z
		.array(z.enum(["BEGINNING", "INTERMEDIATE", "ADVANCED"]))
		.optional()
		.catch([]),
});

export const Route = createFileRoute("/_authenticated/courses/")({
	validateSearch: coursesSearchSchema,
	component: CourseListPage,
});
