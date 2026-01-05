import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/Card";
import { Calendar, Copy, Edit, Tag, Trash2 } from "lucide-react";
import type { SlidevPresentation } from "../types";

interface PresentationCardProps {
	presentation: SlidevPresentation;
	onClick: () => void;
	onEdit?: (presentation: SlidevPresentation) => void;
	onDelete?: (presentation: SlidevPresentation) => void;
	onDuplicate?: (presentation: SlidevPresentation) => void;
}

export const PresentationCard = ({
	presentation,
	onClick,
	onEdit,
	onDelete,
	onDuplicate,
}: PresentationCardProps) => {
	const handleEdit = (e: React.MouseEvent) => {
		e.stopPropagation();
		onEdit?.(presentation);
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		onDelete?.(presentation);
	};

	const handleDuplicate = (e: React.MouseEvent) => {
		e.stopPropagation();
		onDuplicate?.(presentation);
	};

	return (
		<Card
			className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
			onClick={onClick}
		>
			{/* Thumbnail */}
			{presentation.thumbnail && (
				<div className="relative h-48 w-full overflow-hidden bg-gray-100">
					<img
						src={presentation.thumbnail}
						alt={presentation.title}
						className="h-full w-full object-cover transition-transform group-hover:scale-105"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
					<div className="absolute right-2 bottom-2 left-2">
						<h3 className="text-lg font-semibold text-white">
							{presentation.title}
						</h3>
					</div>

					{/* Quick Actions on Hover */}
					<div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
						{onEdit && (
							<Button
								variant="secondary"
								size="sm"
								className="h-8 w-8 p-0"
								onClick={handleEdit}
							>
								<Edit className="h-4 w-4" />
							</Button>
						)}
						{onDuplicate && (
							<Button
								variant="secondary"
								size="sm"
								className="h-8 w-8 p-0"
								onClick={handleDuplicate}
							>
								<Copy className="h-4 w-4" />
							</Button>
						)}
						{onDelete && (
							<Button
								variant="destructive"
								size="sm"
								className="h-8 w-8 p-0"
								onClick={handleDelete}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						)}
					</div>
				</div>
			)}

			<CardHeader className="space-y-2 pb-3">
				{!presentation.thumbnail && <CardTitle>{presentation.title}</CardTitle>}
				<CardDescription className="line-clamp-2">
					{presentation.description}
				</CardDescription>
			</CardHeader>

			<CardContent className="space-y-3">
				{/* Tags */}
				{presentation.tags && presentation.tags.length > 0 && (
					<div className="flex flex-wrap gap-1">
						{presentation.tags.map((tag) => (
							<Badge key={tag} variant="secondary" className="text-xs">
								<Tag className="mr-1 h-3 w-3" />
								{tag}
							</Badge>
						))}
					</div>
				)}

				{/* Metadata */}
				<div className="text-muted-foreground flex items-center gap-4 text-xs">
					<div className="flex items-center gap-1">
						<Calendar className="h-3 w-3" />
						<span>
							{new Date(presentation.updatedAt).toLocaleDateString("vi-VN")}
						</span>
					</div>
					<Badge variant="outline" className="text-xs">
						{presentation.theme}
					</Badge>
				</div>
			</CardContent>
		</Card>
	);
};
