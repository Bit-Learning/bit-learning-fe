import { useNavigate, useRouter } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { cn } from "@workspace/ui/lib/utils";

type GeneralErrorProps = React.HTMLAttributes<HTMLDivElement> & {
	minimal?: boolean;
};

export function GeneralError({
	className,
	minimal = false,
}: GeneralErrorProps) {
	const navigate = useNavigate();
	const { history } = useRouter();
	return (
		<div className={cn("h-svh w-full", className)}>
			<div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
				{!minimal && (
					<h1 className="text-[7rem] font-bold leading-tight">500</h1>
				)}
				<span className="font-medium">Oops! Có lỗi xảy ra {`:')`}</span>
				<p className="text-muted-foreground text-center">
					Chúng tôi xin lỗi vì sự bất tiện này. <br /> Vui lòng thử lại sau.
				</p>
				{!minimal && (
					<div className="mt-6 flex gap-4">
						<Button variant="outline" onClick={() => history.go(-1)}>
							Quay lại trang trước
						</Button>
						<Button onClick={() => navigate({ to: "/" })}>Back to Home</Button>
					</div>
				)}
			</div>
		</div>
	);
}
