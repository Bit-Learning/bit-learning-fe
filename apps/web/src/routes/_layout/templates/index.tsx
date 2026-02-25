import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import SpinnerLoader from "@workspace/ui/components/loader/SpinnerLoader";
import axios from "axios";
import { NotFoundErrorPage } from "@/feature/app/pages/NotFound";
import { PresentationHeader } from "@/feature/templates/components/PresentationHeader";

export const Route = createFileRoute("/_layout/templates/")({
  component: TemplatesPage,
});

function TemplatesPage() {
  const {
    data: templates,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:8080/api/templates");
      return res.data;
    },
  });

  if (isLoading) return <SpinnerLoader />;
  if (error) return <NotFoundErrorPage />;

  return (
    <div className="">
      <PresentationHeader />
      <h1 className="mb-4 text-2xl font-semibold">Templates</h1>
      <ul className="grid gap-3">
        {templates?.map((t: any) => (
          <li key={t.id} className="rounded-md border p-3 hover:bg-gray-50">
            <a href={`/templates/${t.id}`} className="text-blue-600 hover:underline">
              {t.displayName}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
