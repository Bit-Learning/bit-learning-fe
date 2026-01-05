import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/Card";
import { Separator } from "@workspace/ui/components/Separator";
import { Spinner } from "@workspace/ui/components/Spinner";
import axios from "axios";
import PresentationLayout from "../layout";
import type { Template } from "../types";

const TemplatePreviewPage = () => {
	const {
		data: templates = [],
		isLoading,
		isError,
	} = useQuery<Template[]>({
		queryKey: ["templates"],
		queryFn: async () => {
			const res = await axios.get<Template[]>(
				"http://localhost:8080/api/templates",
			);
			return res.data;
		},
	});

	if (isLoading) {
		return (
			<div className="flex h-[60vh] items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (isError) {
		return (
			<PresentationLayout>
				<div className="py-10 text-center text-red-500">
					<p>Failed to load templates. Please try again later.</p>
				</div>
			</PresentationLayout>
		);
	}

	return (
		<PresentationLayout>
			<h1 className="mt-4 mb-2 text-center text-2xl font-semibold">
				All Templates
			</h1>
			<h2 className="mb-4 text-center text-lg font-light">
				{templates.length} template{templates.length !== 1 ? "s" : ""}
			</h2>

			<Separator className="my-4" />

			{/* --- Create Custom Template Card --- */}
			<h3 className="mt-6 mb-2 text-left text-xl font-semibold">
				Custom AI Templates
			</h3>
			<Link to="/custom-template">
				<Card className="flex cursor-pointer flex-col items-center justify-center p-8 text-center transition-shadow hover:shadow-md">
					<CardHeader className="space-y-2 p-0">
						<CardTitle className="text-lg font-semibold">
							Create Custom Template
						</CardTitle>
						<CardDescription className="text-muted-foreground">
							Create your first custom template
						</CardDescription>
					</CardHeader>
				</Card>
			</Link>

			{/* --- Inbuilt Templates --- */}
			<h3 className="mt-6 mb-2 text-left text-xl font-semibold">
				Inbuilt Templates
			</h3>
			<div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				{templates.map((t) => (
					<Card
						key={t.id}
						className="cursor-pointer p-4 transition-shadow hover:shadow-md"
						onClick={() => {
							window.location.href = `/templates/${t.id}`;
						}}
					>
						<CardHeader className="p-0">
							<CardTitle className="text-base font-medium text-blue-600 hover:underline">
								{t.displayName}
							</CardTitle>
						</CardHeader>
					</Card>
				))}
			</div>
		</PresentationLayout>
	);
};

export default TemplatePreviewPage;
