import { OrdersDeleteDialog } from "./orders-delete-dialog";
import { OrdersViewDialog } from "./orders-view-dialog";

export function OrdersDialogs() {
	return (
		<>
			<OrdersViewDialog />
			<OrdersDeleteDialog />
		</>
	);
}
