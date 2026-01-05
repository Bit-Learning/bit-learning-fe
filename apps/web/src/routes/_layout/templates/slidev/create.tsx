import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/Card";
import { PresentationForm } from "@/feature/templates/components/PresentationForm";
import { usePresentations } from "@/feature/templates/hooks/usePresentations";
import type { SlidevPresentation } from "@/feature/templates/types";

export const Route = createFileRoute("/_layout/templates/slidev/create")({
	component: CreatePresentationPage,
});

function CreatePresentationPage() {
	const navigate = useNavigate();
	const { createPresentation } = usePresentations();

	const handleSubmit = (data: Partial<SlidevPresentation>) => {
		createPresentation({
			title: data.title || "",
			description: data.description || "",
			fileName: data.fileName || "",
			theme: data.theme || "default",
			thumbnail: data.thumbnail,
			tags: data.tags,
		});
		navigate({ to: "/templates/slidev" });
	};

	const handleCancel = () => {
		navigate({ to: "/templates/slidev" });
	};

	return (
		<div className="container mx-auto max-w-3xl py-8">
			<Card>
				<CardHeader>
					<CardTitle>Create New Presentation</CardTitle>
				</CardHeader>
				<CardContent>
					<PresentationForm onSubmit={handleSubmit} onCancel={handleCancel} />
				</CardContent>
			</Card>
		</div>
	);
}
