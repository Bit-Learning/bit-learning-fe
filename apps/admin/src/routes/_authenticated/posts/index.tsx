import { PostListPage } from "@/features/posts/pages/PostListPage";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const postsSearchSchema = z.object({
	status: z.string().optional(),
	featured: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/posts/")({
	validateSearch: postsSearchSchema,
	component: PostListPage,
});
