import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/Card";
import { presentations } from "@/feature/templates/data/template-data";
import PresentationLayout from "@/feature/templates/layout";

const TemplateDashboardPage = () => {
	return (
		<PresentationLayout>
			<h2 className="mt-4 mb-4 text-2xl font-semibold tracking-tight">
				Slide Presentations
			</h2>

			<div className="grid justify-center gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{presentations.map((item) => (
					<Card
						key={item.id}
						className="flex cursor-pointer flex-col items-center justify-center p-6 text-center transition-shadow hover:shadow-md"
					>
						{item.icon && (
							<div className="bg-muted mb-4 flex h-12 w-12 items-center justify-center rounded-full">
								{item.icon}
							</div>
						)}
						<CardHeader className="mb-2 p-0">
							<CardTitle className="text-center text-base font-semibold">
								{item.title}
							</CardTitle>
						</CardHeader>
						<CardContent className="p-0">
							<CardDescription className="text-muted-foreground text-sm">
								{item.description}
							</CardDescription>
						</CardContent>
					</Card>
				))}
			</div>
		</PresentationLayout>
	);
};

export default TemplateDashboardPage;
