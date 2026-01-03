export type Order = {
	id: number;
	userId: number;
	totalAmount: number;
	status: "PENDING" | "COMPLETED" | "FAILED";
	createdAt: string;
	updatedAt: string;
	orderDetails: OrderDetail[];
};

export type OrderDetail = {
	id: number;
	productId: number;
	productName: string;
	quantity: number;
	unitPrice: number;
	amount: number;
};

export type OrderRequest = {
	orderDetails: OrderDetailRequest[];
};

export type OrderDetailRequest = {
	productId: number;
	quantity: number;
};
