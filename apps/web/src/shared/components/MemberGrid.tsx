import { useNavigate } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import { Link } from "lucide-react";
import { MEMBER_ITEMS } from "../data/member-data";

interface Props {
	title?: string;
	description?: string;
	badgeText?: string;
	viewMoreLink?: string;
}

export default function MemberGrid({
	title = "NHỮNG CHUYÊN GIA INNEDU",
	description,
	badgeText = "Giới thiệu",
	viewMoreLink,
}: Props) {
	const navigate = useNavigate();

	return (
		<section className="container mx-auto px-6 py-12">
			{/* Header */}
			<div className="mb-8 flex flex-col items-center space-y-2">
				<Badge
					variant="outline"
					className="border-[#F08701] font-semibold tracking-wide text-[#F08701] uppercase"
				>
					{badgeText}
				</Badge>
				<h2 className="text-center text-3xl font-extrabold tracking-tight text-[#0C1D37] uppercase">
					{title}
				</h2>
			</div>

			{/* Grid */}
			<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
				{MEMBER_ITEMS.map((p) => (
					<div
						key={p.name}
						className="group flex cursor-pointer flex-col items-center text-center"
					>
						<div className="relative w-full overflow-hidden rounded-2xl">
							<img
								src={p.img}
								alt={p.name}
								className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105"
							/>
							{/* Optional overlay (if you want subtle effect) */}
							<div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
						</div>

						<div className="mt-4">
							<h3 className="text-lg font-semibold text-[#0C1D37]">{p.name}</h3>
							<p className="text-sm text-gray-500">{p.role}</p>
						</div>
					</div>
				))}
			</div>

			{/* View More Button */}
			{viewMoreLink && (
				<div className="mt-10 flex justify-center">
					<Button
						size="lg"
						onClick={() => navigate({ to: viewMoreLink })}
						className="rounded-full bg-[#F08701] px-8 py-5 font-medium text-white shadow-sm transition-colors hover:bg-[#d87500]"
					>
						<Link size={16} className="mr-2" /> Xem thêm
					</Button>
				</div>
			)}
		</section>
	);
}
