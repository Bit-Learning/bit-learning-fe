import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EditIcon, TrashIcon } from "lucide-react";

interface TemplateCardProps {
  id: number;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  isActive: boolean;
  colors?: string[];
  metaChips?: string[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export function TemplateCard({
  id,
  name,
  description,
  thumbnailUrl,
  isActive,
  colors,
  metaChips,
  onEdit,
  onDelete,
}: TemplateCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-md p-0">
      <div className="bg-muted relative h-36 w-full overflow-hidden">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {colors && colors.length > 0 ? (
              <div className="flex gap-2">
                {colors.slice(0, 4).map((c) => (
                  <span key={c} className="h-8 w-8 rounded-full shadow-sm" style={{ background: c }} />
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground text-sm">No thumbnail</span>
            )}
          </div>
        )}

        <Badge variant={isActive ? "default" : "secondary"} className="absolute top-2 right-2 text-xs">
          {isActive ? "Active" : "Inactive"}
        </Badge>

        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <Button size="sm" variant="secondary" onClick={() => onEdit(id)}>
            <EditIcon className="mr-1 h-3.5 w-3.5" />
            Sửa
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(id)}>
            <TrashIcon className="mr-1 h-3.5 w-3.5" />
            Xóa
          </Button>
        </div>
      </div>

      <CardContent className="p-3">
        <p className="truncate text-sm font-semibold">{name}</p>
        {description && <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">{description}</p>}
        {metaChips && metaChips.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {metaChips.map((chip) => (
              <Badge key={chip} variant="outline" className="text-xs">
                {chip}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
