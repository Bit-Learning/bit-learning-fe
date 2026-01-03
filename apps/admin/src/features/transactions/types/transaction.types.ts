export type TransactionType = "PURCHASE" | "DEPOSIT" | "AI_REQUEST";

export type TransactionStatus = "COMPLETED" | "PENDING" | "FAILED";

export interface Transaction {
	id: number;
	walletId: number;
	orderId: number | null;
	amount: number;
	type: TransactionType;
	status: TransactionStatus;
	createdAt: string;
}

export interface PagedTransactions {
	code: number;
	message: string;
	data: {
		content: Transaction[];
		pageable: {
			pageNumber: number;
			pageSize: number;
			sort: {
				empty: boolean;
				sorted: boolean;
				unsorted: boolean;
			};
			offset: number;
			paged: boolean;
			unpaged: boolean;
		};
		totalPages: number;
		totalElements: number;
		last: boolean;
		size: number;
		number: number;
		sort: {
			empty: boolean;
			sorted: boolean;
			unsorted: boolean;
		};
		numberOfElements: number;
		first: boolean;
		empty: boolean;
	};
}
