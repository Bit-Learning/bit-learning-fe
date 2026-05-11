import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { TransactionsPage } from "@/features/transactions/pages/TransactionsPage";
import {
	transactionStatuses,
	transactionTypes,
} from "@/features/transactions/types/transaction.type";

const transactionsSearchSchema = z.object({
	page: z.coerce.number().optional().catch(1),
	pageSize: z.coerce.number().optional().catch(10),
	userId: z.coerce.number().optional().catch(undefined),
	type: z.array(z.enum(transactionTypes)).optional().catch([]),
	status: z.array(z.enum(transactionStatuses)).optional().catch([]),
	code: z.string().optional().catch(""),
	fromDate: z.string().optional().catch(""),
	toDate: z.string().optional().catch(""),
});

export const Route = createFileRoute("/_authenticated/transactions/")({
	validateSearch: transactionsSearchSchema,
	component: TransactionsPage,
});
