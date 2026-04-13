import { QuestionApprovalList } from "@/features/questions/pages/QuestionApprovalList";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

const questionsSearchSchema = z.object({
	page: z.number().optional().catch(1),
	pageSize: z.number().optional().catch(10),
	tab: z.enum(["pending", "bank"]).optional().catch("pending"),
	keyword: z.string().optional().catch(""),
});

export const Route = createFileRoute("/_authenticated/questions/")({
	validateSearch: questionsSearchSchema,
	component: QuestionApprovalList,
});
