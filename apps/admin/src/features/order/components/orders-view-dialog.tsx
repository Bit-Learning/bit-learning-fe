import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { orderStatusColors } from "../data/data";
import { useOrdersContext } from "./orders-provider";

export function OrdersViewDialog() {
	const { activeOrder, isViewDialogOpen, setIsViewDialogOpen } =
		useOrdersContext();

	if (!activeOrder) return null;

	const badgeColor = orderStatusColors.get(activeOrder.status);

	return (
		<Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Order Details</DialogTitle>
					<DialogDescription>
						Viewing details for Order #{activeOrder.id}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Order Summary */}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-muted-foreground text-sm font-medium">
								Order ID
							</p>
							<p className="text-lg font-semibold">#{activeOrder.id}</p>
						</div>
						<div>
							<p className="text-muted-foreground text-sm font-medium">
								Status
							</p>
							<Badge variant="outline" className={badgeColor}>
								{activeOrder.status}
							</Badge>
						</div>
						<div>
							<p className="text-muted-foreground text-sm font-medium">
								User ID
							</p>
							<p className="font-medium">{activeOrder.userId}</p>
						</div>
						<div>
							<p className="text-muted-foreground text-sm font-medium">
								Total Amount
							</p>
							<p className="text-lg font-bold text-blue-600">
								{activeOrder.totalAmount.toLocaleString("vi-VN")} ₫
							</p>
						</div>
						<div>
							<p className="text-muted-foreground text-sm font-medium">
								Created At
							</p>
							<p className="text-sm">
								{new Date(activeOrder.createdAt).toLocaleString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})}
							</p>
						</div>
						<div>
							<p className="text-muted-foreground text-sm font-medium">
								Updated At
							</p>
							<p className="text-sm">
								{new Date(activeOrder.updatedAt).toLocaleString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})}
							</p>
						</div>
					</div>

					<Separator />

					{/* Order Details */}
					<div>
						<h4 className="mb-3 font-semibold">Order Items</h4>
						<div className="space-y-2">
							{activeOrder.orderDetails.map((detail) => (
								<div
									key={detail.id}
									className="flex items-center justify-between rounded-lg border p-3"
								>
									<div className="flex-1">
										<p className="font-medium">{detail.productName}</p>
										<p className="text-muted-foreground text-sm">
											Product ID: {detail.productId}
										</p>
										<p className="text-muted-foreground text-sm">
											Quantity: {detail.quantity} × Unit Price:{" "}
											{detail.unitPrice.toLocaleString("vi-VN")} ₫
										</p>
									</div>
									<div className="text-right">
										<p className="font-semibold">
											{detail.amount.toLocaleString("vi-VN")} ₫
										</p>
									</div>
								</div>
							))}
						</div>
					</div>

					<Separator />

					{/* Total */}
					<div className="flex items-center justify-between">
						<p className="text-lg font-semibold">Total Amount</p>
						<p className="text-2xl font-bold text-blue-600">
							{activeOrder.totalAmount.toLocaleString("vi-VN")} ₫
						</p>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
