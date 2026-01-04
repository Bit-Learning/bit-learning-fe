import { useNavigate } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/Card";
import { Link } from "lucide-react";

const mockProducts = [
	{
		id: 1,
		name: "Minimal Chair",
		desc: "Elegant and comfy",
		price: "$89",
		img: "https://picsum.photos/300/200",
	},
	{
		id: 2,
		name: "Modern Lamp",
		desc: "Brighten your room",
		price: "$49",
		img: "https://picsum.photos/301/200",
	},
	{
		id: 3,
		name: "Cozy Sofa",
		desc: "Perfect for relaxation",
		price: "$299",
		img: "https://picsum.photos/302/200",
	},
	{
		id: 4,
		name: "Wooden Table",
		desc: "Classic and durable",
		price: "$199",
		img: "https://picsum.photos/303/200",
	},
];

interface Props {
	title?: string;
	badgeText?: string;
	viewMoreLink?: string;
}

export default function ProductGrid({
	title = "Featured Products",
	badgeText = "Text",
	viewMoreLink,
}: Props) {
	const navigate = useNavigate();

	return (
		<section className="container mx-auto px-6 py-12">
			<div className="mb-8 flex flex-col items-center space-y-4">
				<Badge variant="default">{badgeText}</Badge>
				<h2 className="text-center text-3xl font-semibold">{title}</h2>
			</div>
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
				{mockProducts.map((p) => (
					<Card
						key={p.id}
						className="overflow-hidden transition-shadow hover:shadow-md"
					>
						<img
							src={p.img}
							alt={p.name}
							className="h-48 w-full object-cover"
						/>
						<CardHeader>
							<CardTitle>{p.name}</CardTitle>
							<CardDescription>{p.desc}</CardDescription>
						</CardHeader>
						<CardContent className="flex items-center justify-between">
							<span className="font-semibold">{p.price}</span>
							<Button size="sm">Buy</Button>
						</CardContent>
					</Card>
				))}
			</div>
			{viewMoreLink && (
				<div className="mt-12 mb-8 flex flex-col items-center space-y-4">
					<Button
						size="lg"
						variant="default"
						onClick={() => navigate({ to: viewMoreLink })}
					>
						<Link size={16} /> Xem thêm
					</Button>
				</div>
			)}
		</section>
	);
}
