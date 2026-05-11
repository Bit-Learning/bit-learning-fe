// @ts-ignore
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EditIcon, EyeIcon, TrashIcon } from "lucide-react";

interface TemplateCardProps {
	id: number;
	name: string;
	description?: string;
	thumbnailUrl?: string;
	isActive: boolean;
	colors?: string[];
	metaChips?: string[];
	onView: (id: number) => void;
	onEdit: (id: number) => void;
	onDelete: (id: number) => void;
}

export const TemplateCard = ({
	id,
	name,
	description,
	thumbnailUrl,
	isActive,
	colors,
	metaChips,
	onView,
	onEdit,
	onDelete,
}: TemplateCardProps) => {
	return (
		<Card className="group relative overflow-hidden transition-shadow p-0 hover:shadow-md">
			<div className="bg-muted relative h-36 w-full overflow-hidden">
				{thumbnailUrl ? (
					<img
						src={thumbnailUrl}
						alt={name}
						className="h-full w-full object-cover"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center">
						{colors && colors.length > 0 ? (
							<div className="flex gap-2">
								{colors.slice(0, 4).map((c) => (
									<span
										key={c}
										className="h-8 w-8 rounded-full shadow-sm"
										style={{ background: c }}
									/>
								))}
							</div>
						) : (
							<span className="text-muted-foreground text-sm">
								No thumbnail
							</span>
						)}
					</div>
				)}

				{/* <Badge variant={isActive ? "default" : "secondary"} className="absolute top-2 right-2 text-xs">
          {isActive ? "Hoạt động" : "Không hoạt động"}
        </Badge> */}
			</div>

			<CardContent className="px-3">
				<p className="truncate text-md font-semibold">{name}</p>
				{description && (
					<p className="text-muted-foreground mt-0.5 line-clamp-2 text-sm">
						{description}
					</p>
				)}
				{metaChips && metaChips.length > 0 && (
					<div className="mt-2 flex flex-wrap gap-1">
						{metaChips.map((chip) => (
							<Badge key={chip} variant="outline" className="text-xs">
								{chip}
							</Badge>
						))}
					</div>
				)}
			</CardContent>

			<div className="px-3 mb-2 flex justify-center gap-1.5 transition-opacity group-hover:opacity-100">
				<Button size="sm" variant="ghost" onClick={() => onView(id)}>
					<EyeIcon className="mr-1 h-3.5 w-3.5" />
					Xem
				</Button>
				<Button size="sm" variant="ghost" onClick={() => onEdit(id)}>
					<EditIcon className="mr-1 h-3.5 w-3.5" />
					Sửa
				</Button>
				<Button
					size="sm"
					variant="ghost"
					className="text-destructive hover:text-destructive"
					onClick={() => onDelete(id)}
				>
					<TrashIcon className="mr-1 h-3.5 w-3.5" />
					Xóa
				</Button>
			</div>
		</Card>
	);
};
