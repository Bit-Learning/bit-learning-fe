import { Button } from "@workspace/ui/components/Button";
import { AlertTriangle } from "lucide-react";

export function InlineStateCard({
	title,
	description,
	actionLabel,
	onAction,
}: {
	title: string;
	description: string;
	actionLabel?: string;
	onAction?: () => void;
}) {
	return (
		<div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-10 text-center">
			<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
				<AlertTriangle className="h-5 w-5" />
			</div>
			<h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
			<p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
				{description}
			</p>
			{actionLabel && onAction ? (
				<div className="mt-5">
					<Button type="button" onClick={onAction} className="rounded-full">
						{actionLabel}
					</Button>
				</div>
			) : null}
		</div>
	);
}
