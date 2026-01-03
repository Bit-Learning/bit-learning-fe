import { createFileRoute } from "@tanstack/react-router";
import TemplateDetailPreviewPage from "@/feature/templates/pages/TemplateDetailPreviewPage";

export const Route = createFileRoute("/_layout/templates/$id")({
	component: TemplateDetailPreviewPage,
});

// function TemplateDetailPreviewPage() {
//     const { id } = Route.useParams()

//     const { data: template, isLoading } = useQuery({
//         queryKey: ['template', id],
//         queryFn: async () => {
//             const res = await axios.get(`http://localhost:8080/api/templates/${id}`)
//             return res.data
//         },
//     })

//     if (isLoading) return <p>Loading template...</p>
//     console.log('Template:', template)
//     console.log('Iframe src:', `http://localhost:8080${template.filePath}`)

//     return (
//         <PresentationLayout>
//             <h1 className="mb-4 text-2xl font-semibold">{template.displayName}</h1>
//             <p className="mb-4 text-gray-600">{template.description}</p>

//             {/* Preview mode using iframe */}
//             <iframe
//                 src={`http://localhost:8000/templates/${template.filePath}`}
//                 width="100%"
//                 height="600"
//                 className="rounded-lg border shadow"
//             />

//             {/* Preview mode using iframe */}
//             <iframe
//                 src={`http://localhost:8080/reveal/templates/${template.filePath}`}
//                 width="100%"
//                 height="600"
//                 className="rounded-lg border shadow"
//             />
//         </PresentationLayout>
//     )
// }
