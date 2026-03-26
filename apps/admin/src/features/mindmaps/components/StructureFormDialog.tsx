import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { MindMapStructureRequest, StructureConfigDto } from "../types/mindmap.type";
import { ThumbnailUpload } from "./ThumbnailUpload";

interface StructureFormDialogProps {
  open: boolean;
  editTarget?: StructureConfigDto;
  isPending?: boolean;
  onSubmit: (data: MindMapStructureRequest, thumbnail: File | null) => void;
  onClose: () => void;
}

const EMPTY: MindMapStructureRequest = {
  name: "",
  description: "",
  elk_algorithm: "",
  elk_options: {},
  edge_type: "smoothstep",
  is_active: true,
};

export function StructureFormDialog({ open, editTarget, isPending, onSubmit, onClose }: StructureFormDialogProps) {
  const [form, setForm] = useState<MindMapStructureRequest>(EMPTY);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [elkOptionsRaw, setElkOptionsRaw] = useState("{}");
  const [elkOptionsError, setElkOptionsError] = useState<string>();

  useEffect(() => {
    if (editTarget) {
      setForm({
        name: editTarget.name,
        description: editTarget.description ?? "",
        thumbnail_url: editTarget.thumbnailUrl,
        elk_algorithm: editTarget.elkAlgorithm,
        elk_options: editTarget.elkOptions ?? {},
        edge_type: editTarget.edgeType ?? "smoothstep",
        is_active: editTarget.isActive,
      });
      setElkOptionsRaw(JSON.stringify(editTarget.elkOptions ?? {}, null, 2));
    } else {
      setForm(EMPTY);
      setElkOptionsRaw("{}");
    }
    setThumbnail(null);
    setElkOptionsError(undefined);
  }, [editTarget, open]);

  const handleElkOptionsChange = (raw: string) => {
    setElkOptionsRaw(raw);
    try {
      const parsed = JSON.parse(raw);
      setForm((f) => ({ ...f, elk_options: parsed }));
      setElkOptionsError(undefined);
    } catch {
      setElkOptionsError("JSON không hợp lệ");
    }
  };

  const handleSubmit = () => {
    if (elkOptionsError) return;
    onSubmit(form, thumbnail);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editTarget ? "Cập nhật Structure" : "Tạo Structure mới"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <Label>Thumbnail</Label>
            <ThumbnailUpload value={thumbnail} previewUrl={editTarget?.thumbnailUrl} onChange={setThumbnail} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="s-name">
              Tên <span className="text-destructive">*</span>
            </Label>
            <Input
              id="s-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="vd: Layered Right, Tree Down, Radial..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="s-desc">Mô tả</Label>
            <Textarea
              id="s-desc"
              rows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="vd: Layout ngang từ trái sang phải, phù hợp mindmap dạng cây phân cấp"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="s-algo">
              ELK Algorithm <span className="text-destructive">*</span>
            </Label>
            <Input
              id="s-algo"
              value={form.elk_algorithm}
              onChange={(e) => setForm((f) => ({ ...f, elk_algorithm: e.target.value }))}
              placeholder="vd: layered, radial, mrtree, force, stress"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="s-opts">ELK Options (JSON)</Label>
            <Textarea
              id="s-opts"
              rows={5}
              className="font-mono text-xs"
              value={elkOptionsRaw}
              onChange={(e) => handleElkOptionsChange(e.target.value)}
              placeholder={`vd:\n{\n  "elk.direction": "RIGHT",\n  "elk.layered.spacing.nodeNodeBetweenLayers": "80",\n  "elk.spacing.nodeNode": "40"\n}`}
            />
            {elkOptionsError && <p className="text-destructive text-xs">{elkOptionsError}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="s-edge">Edge Type</Label>
            <Input
              id="s-edge"
              value={form.edge_type}
              onChange={(e) => setForm((f) => ({ ...f, edge_type: e.target.value }))}
              placeholder="vd: smoothstep, bezier, straight"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="s-active">Active</Label>
            <Switch
              id="s-active"
              checked={form.is_active ?? true}
              onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !form.name || !form.elk_algorithm || !!elkOptionsError}>
            {isPending ? "Đang lưu..." : editTarget ? "Cập nhật" : "Tạo mới"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
