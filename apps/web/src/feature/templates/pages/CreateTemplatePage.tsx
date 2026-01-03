import { Button } from "@workspace/ui/components/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/Card";
import { FileText, Pencil, RefreshCw, Save, UploadCloud } from "lucide-react";
import PresentationLayout from "@/feature/templates/layout";

const CreateTemplatePage = () => {
	return (
		<PresentationLayout>
			<div className="mt-10 mb-10 text-center">
				<h1 className="text-3xl font-semibold tracking-tight text-[#1a1a1a]">
					Custom Template Processor
				</h1>
				<p className="text-muted-foreground mt-2">
					Upload your PPTX file to extract slides and convert them into a
					reusable AI presentation template.
				</p>
				<p className="mt-1 text-sm font-medium text-amber-600">
					⚠️ AI template generation can take around 5 minutes per slide.
				</p>
			</div>

			{/* Upload Section */}
			<Card className="mx-auto max-w-3xl">
				<CardHeader>
					<CardTitle>Upload PPTX File</CardTitle>
					<CardDescription>
						Select a PowerPoint file (.pptx) to process. Maximum file size:{" "}
						<b>100MB</b>
					</CardDescription>
				</CardHeader>

				<CardContent>
					<div className="border-muted-foreground/25 hover:border-primary/40 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition">
						<UploadCloud className="text-muted-foreground mb-4 h-10 w-10" />
						<p className="text-muted-foreground mb-2 text-sm">
							Click to upload a PPTX file
						</p>
						<p className="text-muted-foreground text-xs">
							Drag and drop your file here or click to browse
						</p>

						<Button className="mt-5 px-6" variant="default">
							Select a PPTX file
						</Button>
					</div>
				</CardContent>

				{/* Credits Section */}
				<div className="rounded-b-xl border-t bg-amber-50 px-6 py-5">
					<h3 className="mb-3 font-semibold text-amber-900">Credits & Costs</h3>
					<ul className="space-y-2 text-sm text-amber-800">
						<li className="flex items-center justify-between">
							<span className="flex items-center gap-2">
								<FileText size={16} /> Extract and prepare slide for editing
							</span>
							<span className="font-medium">5 credits per slide</span>
						</li>
						<li className="flex items-center justify-between">
							<span className="flex items-center gap-2">
								<Pencil size={16} /> Edit slide{" "}
								<span className="text-muted-foreground">(optional)</span>
							</span>
							<span className="font-medium">2.5 credits per edit</span>
						</li>
						<li className="flex items-center justify-between">
							<span className="flex items-center gap-2">
								<RefreshCw size={16} /> Rebuild slide{" "}
								<span className="text-muted-foreground">(optional)</span>
							</span>
							<span className="font-medium">5 credits each reconstruct</span>
						</li>
						<li className="flex items-center justify-between">
							<span className="flex items-center gap-2">
								<Save size={16} /> Save slide to template
							</span>
							<span className="font-medium">3 credits per slide</span>
						</li>
					</ul>
				</div>
			</Card>
		</PresentationLayout>
	);
};

export default CreateTemplatePage;
