import { useNavigate } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/Badge";
import { SYLLABUS_ITEMS } from "../data/syllabus-data";

interface Props {
	title?: string;
	description?: string;
	badgeText?: string;
	viewMoreLink?: string;
}

export default function SyllabusGrid({
	title = "Giáo Án",
	description,
	badgeText = "Giới thiệu",
	viewMoreLink,
}: Props) {
	const _navigate = useNavigate();

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
			<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{SYLLABUS_ITEMS.map((p) => (
					<div
						key={p.name}
						className="group flex cursor-pointer flex-col items-center text-left"
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
							<h3 className="text-md font-semibold text-[#F08701]">
								{p.syllabusType}
							</h3>
							<h1 className="mt-3 mb-1 text-xl font-semibold text-[#0C1D37]">
								{p.name}
							</h1>
							<p className="text-sm text-gray-500">{p.description}</p>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
