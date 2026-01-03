import { Button } from "@workspace/ui/components/Button";
import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
	message: string;
	onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
	return (
		<div className="flex flex-col items-center justify-center py-12">
			<AlertCircle className="mb-4 h-12 w-12 text-red-500" />
			<h3 className="mb-2 text-lg font-semibold">Có lỗi xảy ra</h3>
			<p className="text-muted-foreground mb-4">{message}</p>
			{onRetry && (
				<Button onClick={onRetry} variant="outline">
					Thử lại
				</Button>
			)}
		</div>
	);
}
