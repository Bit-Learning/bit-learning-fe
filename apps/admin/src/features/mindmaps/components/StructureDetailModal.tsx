import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { StructureConfigDto } from "../types/mindmap.type";

interface Props {
	open: boolean;
	data?: StructureConfigDto;
	onClose: () => void;
}

const StructureDetailModal = ({ open, data, onClose }: Props) => {
	if (!data) return null;

	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						{data.name}
						<Badge
							variant={data.isActive ? "default" : "secondary"}
							className="text-xs"
						>
							{data.isActive ? "Active" : "Inactive"}
						</Badge>
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					{data.thumbnailUrl && (
						<img
							src={data.thumbnailUrl}
							alt={data.name}
							className="h-40 w-full rounded-lg object-cover"
						/>
					)}

					{data.description && (
						<div>
							<p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide">
								Mô tả
							</p>
							<p className="text-sm">{data.description}</p>
						</div>
					)}

					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide">
								ELK Algorithm
							</p>
							<Badge variant="outline" className="font-mono text-xs">
								{data.elkAlgorithm}
							</Badge>
						</div>
						{data.edgeType && (
							<div>
								<p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide">
									Edge Type
								</p>
								<Badge variant="outline" className="font-mono text-xs">
									{data.edgeType}
								</Badge>
							</div>
						)}
					</div>

					{data.elkOptions && Object.keys(data.elkOptions).length > 0 && (
						<div>
							<p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide">
								ELK Options
							</p>
							<pre className="bg-muted rounded-lg p-3 font-mono text-xs overflow-x-auto">
								{JSON.stringify(data.elkOptions, null, 2)}
							</pre>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default StructureDetailModal;
