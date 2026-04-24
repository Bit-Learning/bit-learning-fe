import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { UserGameHistoryPage } from "@/features/users/pages/UserGameHistoryPage";

const userGameHistorySearchSchema = z.object({
	page: z.coerce.number().optional().catch(1),
	pageSize: z.coerce.number().optional().catch(10),
});

export const Route = createFileRoute(
	"/_authenticated/users/$userId/game-history",
)({
	validateSearch: userGameHistorySearchSchema,
	component: UserGameHistoryPage,
});
