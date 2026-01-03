import { useQuery } from "@tanstack/react-query";
import api from "@/shared/api/api";
import type { Transaction } from "../type/transaction.type";

export const TRANSACTION_QUERY_KEYS = {
	all: ["transactions"] as const,
	lists: () => [...TRANSACTION_QUERY_KEYS.all, "list"] as const,
	list: (filters: string) =>
		[...TRANSACTION_QUERY_KEYS.lists(), { filters }] as const,
};

export const useFetchTransactionsByWalletId = (walletId: number) => {
	return useQuery<Transaction[]>({
		queryKey: TRANSACTION_QUERY_KEYS.list(`walletId=${walletId}`),
		queryFn: () => fetchTransactionsByWalletId(walletId),
		enabled: !!walletId,
	});
};

export const fetchTransactionsByWalletId = async (
	walletId: number,
): Promise<Transaction[]> => {
	const response = await api.get("/payment/transactions", {
		params: { walletId },
	});
	return response.data.data || [];
};
