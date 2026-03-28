import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SystemPromptPatchRequest, SystemPromptRequest, SystemPromptResponse } from "../types/prompt.type";

interface PromptFormDialogProps {
  open: boolean;
  editTarget?: SystemPromptResponse;
  isPending?: boolean;
  onSubmit: (data: SystemPromptRequest | SystemPromptPatchRequest) => void;
  onClose: () => void;
}

const EMPTY: SystemPromptRequest = {
  prompt_key: "",
  name: "",
  content: "",
  description: "",
  is_active: true,
};

export const PromptFormDialog = ({ open, editTarget, isPending, onSubmit, onClose }: PromptFormDialogProps) => {
  const [form, setForm] = useState<SystemPromptRequest>(EMPTY);

  useEffect(() => {
    if (editTarget) {
      setForm({
        prompt_key: editTarget.prompt_key,
        name: editTarget.name,
        content: editTarget.content,
        description: editTarget.description ?? "",
        is_active: editTarget.is_active,
      });
    } else {
      setForm(EMPTY);
    }
  }, [editTarget, open]);

  const isEdit = !!editTarget;

  const handleSubmit = () => {
    if (isEdit) {
      const patch: SystemPromptPatchRequest = {
        name: form.name,
        content: form.content,
        description: form.description,
        is_active: form.is_active,
      };
      onSubmit(patch);
    } else {
      onSubmit(form);
    }
  };

  const isDisabled = !form.name || !form.content || (!isEdit && !form.prompt_key);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Cập nhật System Prompt" : "Tạo System Prompt mới"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="p-key">Prompt Key{!isEdit && <span className="text-destructive ml-1">*</span>}</Label>
            {isEdit ? (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono text-xs px-3 py-1.5">
                  {editTarget?.prompt_key}
                </Badge>
                <span className="text-xs text-muted-foreground">Không thể thay đổi</span>
              </div>
            ) : (
              <>
                <Input
                  id="p-key"
                  value={form.prompt_key}
                  onChange={(e) => setForm((f) => ({ ...f, prompt_key: e.target.value.toUpperCase() }))}
                  placeholder="vd: CHAT_SYSTEM, MINDMAP_GENERATION"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Chỉ dùng chữ hoa và dấu gạch dưới. Không thể thay đổi sau khi tạo.
                </p>
              </>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-name">
              Tên <span className="text-destructive">*</span>
            </Label>
            <Input
              id="p-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="vd: System Context, Slide System Prompt"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-desc">Mô tả</Label>
            <Input
              id="p-desc"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="vd: Prompt dùng cho chat AI trong hệ thống"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="p-content">
                Content <span className="text-destructive">*</span>
              </Label>
              <span className="text-xs text-muted-foreground">{form.content.length} ký tự</span>
            </div>
            <Textarea
              id="p-content"
              rows={14}
              className="font-mono text-xs resize-y"
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="Nhập nội dung system prompt..."
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="p-active">Active</Label>
            <Switch
              id="p-active"
              checked={form.is_active ?? true}
              onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || isDisabled}>
            {isPending ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
