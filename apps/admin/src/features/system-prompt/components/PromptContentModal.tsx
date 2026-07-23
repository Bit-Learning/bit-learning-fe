import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { SystemPromptResponse } from "../types/prompt.type";

interface PromptContentModalProps {
	open: boolean;
	data?: SystemPromptResponse;
	onClose: () => void;
}

export const PromptContentModal = ({
	open,
	data,
	onClose,
}: PromptContentModalProps) => {
	if (!data) return null;

	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 flex-wrap">
						{data.name}
						<Badge variant="secondary" className="font-mono text-xs">
							{data.prompt_key}
						</Badge>
						<Badge
							variant={data.is_active ? "default" : "secondary"}
							className="text-xs"
						>
							{data.is_active ? "Active" : "Inactive"}
						</Badge>
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					{data.description && (
						<p className="text-sm text-muted-foreground">{data.description}</p>
					)}

					<div>
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
							Content ({data.content.length} ký tự)
						</p>
						<pre className="bg-muted rounded-lg p-4 text-xs font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed">
							{data.content}
						</pre>
					</div>

					<div className="flex gap-6 text-xs text-muted-foreground border-t pt-3">
						<span>
							Tạo: {new Date(data.created_at).toLocaleString("vi-VN")}
						</span>
						<span>
							Cập nhật: {new Date(data.updated_at).toLocaleString("vi-VN")}
						</span>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
