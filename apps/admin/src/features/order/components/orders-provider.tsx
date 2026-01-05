import { createContext, type ReactNode, useContext, useState } from "react";
import type { Order } from "../data/schema";

type OrdersContextType = {
	activeOrder: Order | null;
	setActiveOrder: (order: Order | null) => void;
	isViewDialogOpen: boolean;
	setIsViewDialogOpen: (open: boolean) => void;
	isDeleteDialogOpen: boolean;
	setIsDeleteDialogOpen: (open: boolean) => void;
};

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
	const [activeOrder, setActiveOrder] = useState<Order | null>(null);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	return (
		<OrdersContext.Provider
			value={{
				activeOrder,
				setActiveOrder,
				isViewDialogOpen,
				setIsViewDialogOpen,
				isDeleteDialogOpen,
				setIsDeleteDialogOpen,
			}}
		>
			{children}
		</OrdersContext.Provider>
	);
}

export function useOrdersContext() {
	const context = useContext(OrdersContext);
	if (context === undefined) {
		throw new Error("useOrdersContext must be used within an OrdersProvider");
	}
	return context;
}
