import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ThemeConfigDto } from "../types/mindmap.type";

interface Props {
	open: boolean;
	data?: ThemeConfigDto;
	onClose: () => void;
}

const ThemeDetailModal = ({ open, data, onClose }: Props) => {
	if (!data) return null;

	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
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

					{data.colors && data.colors.length > 0 && (
						<div>
							<p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
								Colors
							</p>
							<div className="flex flex-wrap gap-2">
								{data.colors.map((c) => (
									<div
										key={c}
										className="flex items-center gap-1.5 rounded-full border px-2.5 py-1"
									>
										<span
											className="h-4 w-4 rounded-full shadow-sm"
											style={{ background: c }}
										/>
										<span className="font-mono text-xs">{c}</span>
									</div>
								))}
							</div>
						</div>
					)}

					{data.background && (
						<div>
							<p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
								Background
							</p>
							<div className="flex items-center gap-2">
								<span
									className="h-6 w-6 rounded border shadow-sm"
									style={{ background: data.background }}
								/>
								<span className="font-mono text-sm">{data.background}</span>
							</div>
						</div>
					)}

					{data.nodeStyles && Object.keys(data.nodeStyles).length > 0 && (
						<div>
							<p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide">
								Node Styles
							</p>
							<pre className="bg-muted overflow-x-auto rounded-lg p-3 font-mono text-xs">
								{JSON.stringify(data.nodeStyles, null, 2)}
							</pre>
						</div>
					)}

					{data.edgeStyle && Object.keys(data.edgeStyle).length > 0 && (
						<div>
							<p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide">
								Edge Style
							</p>
							<pre className="bg-muted overflow-x-auto rounded-lg p-3 font-mono text-xs">
								{JSON.stringify(data.edgeStyle, null, 2)}
							</pre>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ThemeDetailModal;
