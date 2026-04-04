import { useState } from "react";
import { PlusCircle, Trash2, ChevronDown, ChevronUp, Edit2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";

import { useMatchingGameMappings, useUpsertMatchingGame, useDeleteMatchingGame } from "../queries/useAdminMatchingGame";
import { adminMatchingGameApi } from "../api/admin-matching-game.api";
import type { MatchingPairDto, MatchingStageDto, MatchingStageConfigDto } from "../api/admin-matching-game.api";

// ─── Constants ────────────────────────────────────────────────────────────

const TOPIC_TITLES_PRIMARY: Record<string, string> = {
  A: "MÁY TÍNH VÀ EM",
  B: "MẠNG MÁY TÍNH VÀ INTERNET",
  C: "TỔ CHỨC LƯU TRỮ, TÌM KIẾM VÀ TRAO ĐỔI THÔNG TIN",
  D: "ĐẠO ĐỨC, PHÁP LUẬT VỀ VĂN HÓA TRONG MÔI TRƯỜNG SỐ",
  E: "ỨNG DỤNG TIN HỌC",
  F: "GIẢI QUYẾT VẤN ĐỀ VỚI SỰ TRỢ GIÚP CỦA MÁY TÍNH",
};

const KNOWN_TOPIC_CODES = Object.keys(TOPIC_TITLES_PRIMARY);

// ─── Types ─────────────────────────────────────────────────────────────────

interface PairForm {
  id?: string;
  leftType: "text" | "image" | "audio";
  leftValue: string;
  rightType: "text" | "image" | "audio";
  rightValue: string;
  hint?: string;
}

interface StageForm {
  id?: string;
  title: string;
  description?: string;
  layoutType: "match" | "media-quiz";
  shuffle: boolean;
  timeLimit?: number | null;
  maxMistakes?: number | null;
  showHints: boolean;
  pairs: PairForm[];
}

interface GameForm {
  grade: number;
  topicCode: string;
  /** The part after "Lớp X - Y: ", e.g. "MÁY TÍNH VÀ EM" */
  topicName: string;
  metaVersion: string;
  metaLanguage: string;
  stages: StageForm[];
}

const buildTitle = (grade: number, topicCode: string, topicName: string) => `Lớp ${grade} - ${topicCode}: ${topicName}`;

const parseTopicName = (title: string, grade: number, topicCode: string): string => {
  const prefix = `Lớp ${grade} - ${topicCode}: `;
  return title.startsWith(prefix) ? title.slice(prefix.length) : title;
};

// ─── Defaults ──────────────────────────────────────────────────────────────

const defaultPair = (): PairForm => ({
  leftType: "text",
  leftValue: "",
  rightType: "text",
  rightValue: "",
  hint: "",
});

const defaultStage = (): StageForm => ({
  title: "",
  description: "",
  layoutType: "match",
  shuffle: true,
  showHints: true,
  timeLimit: null,
  maxMistakes: null,
  pairs: [defaultPair()],
});

const defaultForm = (): GameForm => ({
  grade: 3,
  topicCode: "A",
  topicName: "",
  metaVersion: "1.0.0",
  metaLanguage: "vi",
  stages: [defaultStage()],
});

// ─── Helper: map API data → form ───────────────────────────────────────────

function apiToForm(
  grade: number,
  topicCode: string,
  data: Awaited<ReturnType<typeof adminMatchingGameApi.getGame>>["data"]["data"],
): GameForm {
  const rawTitle = data?.meta?.title ?? "";
  return {
    grade,
    topicCode,
    topicName: parseTopicName(rawTitle, grade, topicCode),
    metaVersion: data?.meta?.version ?? "1.0.0",
    metaLanguage: data?.meta?.language ?? "vi",
    stages: (data?.stages ?? []).map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description ?? "",
      layoutType: (s.config?.layoutType ?? "match") as "match" | "media-quiz",
      shuffle: s.config?.shuffle ?? true,
      showHints: s.config?.showHints ?? true,
      timeLimit: s.config?.timeLimit ?? null,
      maxMistakes: s.config?.maxMistakes ?? null,
      pairs: (s.pairs ?? []).map((p) => ({
        id: p.id,
        leftType: (p.left?.type ?? "text") as "text" | "image" | "audio",
        leftValue: p.left?.value ?? "",
        rightType: (p.right?.type ?? "text") as "text" | "image" | "audio",
        rightValue: p.right?.value ?? "",
        hint: p.hint ?? "",
      })),
    })),
  };
}

// ─── Helper: form → MatchingStageDto[] ────────────────────────────────────

function formToStages(stages: StageForm[]): MatchingStageDto[] {
  return stages.map((s) => {
    const config: MatchingStageConfigDto = {
      shuffle: s.shuffle,
      showHints: s.showHints,
      layoutType: s.layoutType,
      timeLimit: s.timeLimit ?? null,
      maxMistakes: s.maxMistakes ?? null,
    };
    const pairs: MatchingPairDto[] = s.pairs.map((p) => ({
      id: p.id,
      left: { type: p.leftType, value: p.leftValue },
      right: { type: p.rightType, value: p.rightValue },
      hint: p.hint || undefined,
    }));
    return {
      id: s.id,
      title: s.title,
      description: s.description || undefined,
      config,
      pairs,
    };
  });
}

// ─── Sub-components ────────────────────────────────────────────────────────

interface PairEditorProps {
  pair: PairForm;
  index: number;
  onUpdate: (p: PairForm) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const PairEditor = ({ pair, index, onUpdate, onRemove, canRemove }: PairEditorProps) => {
  const itemTypeOptions = (
    <>
      <SelectItem value="text">Văn bản</SelectItem>
      <SelectItem value="image">Hình ảnh (URL)</SelectItem>
      <SelectItem value="audio">Âm thanh (URL)</SelectItem>
    </>
  );

  return (
    <div className="rounded-md border bg-muted/30 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">Cặp #{index + 1}</span>
        {canRemove && (
          <Button type="button" size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={onRemove}>
            <Trash2 size={13} />
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {/* Left */}
        <div className="space-y-1">
          <Label className="text-xs">Loại trái</Label>
          <Select
            value={pair.leftType}
            onValueChange={(v) => onUpdate({ ...pair, leftType: v as PairForm["leftType"] })}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>{itemTypeOptions}</SelectContent>
          </Select>
          <Textarea
            className="text-xs min-h-14"
            placeholder={pair.leftType === "text" ? "Nội dung văn bản..." : "URL hình ảnh/âm thanh..."}
            value={pair.leftValue}
            onChange={(e) => onUpdate({ ...pair, leftValue: e.target.value })}
          />
        </div>
        {/* Right */}
        <div className="space-y-1">
          <Label className="text-xs">Loại phải</Label>
          <Select
            value={pair.rightType}
            onValueChange={(v) => onUpdate({ ...pair, rightType: v as PairForm["rightType"] })}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>{itemTypeOptions}</SelectContent>
          </Select>
          <Textarea
            className="text-xs min-h-14"
            placeholder={pair.rightType === "text" ? "Nội dung văn bản..." : "URL hình ảnh/âm thanh..."}
            value={pair.rightValue}
            onChange={(e) => onUpdate({ ...pair, rightValue: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Gợi ý (tuỳ chọn)</Label>
        <Input
          className="text-xs h-7"
          placeholder="Gợi ý..."
          value={pair.hint ?? ""}
          onChange={(e) => onUpdate({ ...pair, hint: e.target.value })}
        />
      </div>
    </div>
  );
};

interface StageEditorProps {
  stage: StageForm;
  index: number;
  onUpdate: (s: StageForm) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const StageEditor = ({ stage, index, onUpdate, onRemove, canRemove }: StageEditorProps) => {
  const [open, setOpen] = useState(true);

  const updatePair = (pi: number, p: PairForm) => {
    const pairs = stage.pairs.map((x, i) => (i === pi ? p : x));
    onUpdate({ ...stage, pairs });
  };
  const removePair = (pi: number) => {
    onUpdate({ ...stage, pairs: stage.pairs.filter((_, i) => i !== pi) });
  };
  const addPair = () => onUpdate({ ...stage, pairs: [...stage.pairs, defaultPair()] });

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-lg border bg-card">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-muted/50">
            <div className="flex items-center gap-2">
              {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <span className="text-sm font-semibold">
                Stage {index + 1}: {stage.title || "(Chưa đặt tên)"}
              </span>
              <Badge variant="outline" className="text-xs">
                {stage.pairs.length} cặp
              </Badge>
            </div>
            {canRemove && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
              >
                <Trash2 size={13} />
              </Button>
            )}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3">
            <Separator />
            {/* Stage basic info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Tiêu đề stage</Label>
                <Input
                  className="text-xs h-8"
                  value={stage.title}
                  onChange={(e) => onUpdate({ ...stage, title: e.target.value })}
                  placeholder="Ví dụ: Xử lý thông tin"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Loại layout</Label>
                <Select
                  value={stage.layoutType}
                  onValueChange={(v) =>
                    onUpdate({
                      ...stage,
                      layoutType: v as StageForm["layoutType"],
                    })
                  }
                >
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="match">Ghép đôi (match)</SelectItem>
                    <SelectItem value="media-quiz">Câu hỏi hình ảnh (media-quiz)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Mô tả stage</Label>
              <Input
                className="text-xs h-8"
                value={stage.description ?? ""}
                onChange={(e) => onUpdate({ ...stage, description: e.target.value })}
                placeholder="Mô tả ngắn về stage này..."
              />
            </div>

            {/* Stage config */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Giới hạn thời gian (giây)</Label>
                <Input
                  className="text-xs h-8"
                  type="number"
                  min={0}
                  placeholder="Không giới hạn"
                  value={stage.timeLimit ?? ""}
                  onChange={(e) =>
                    onUpdate({
                      ...stage,
                      timeLimit: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Số lần sai tối đa</Label>
                <Input
                  className="text-xs h-8"
                  type="number"
                  min={1}
                  placeholder="Không giới hạn"
                  value={stage.maxMistakes ?? ""}
                  onChange={(e) =>
                    onUpdate({
                      ...stage,
                      maxMistakes: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>
              <div className="space-y-2 pt-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`shuffle-${index}`}
                    checked={stage.shuffle}
                    onCheckedChange={(c) => onUpdate({ ...stage, shuffle: !!c })}
                  />
                  <Label htmlFor={`shuffle-${index}`} className="text-xs cursor-pointer">
                    Xáo trộn
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`hints-${index}`}
                    checked={stage.showHints}
                    onCheckedChange={(c) => onUpdate({ ...stage, showHints: !!c })}
                  />
                  <Label htmlFor={`hints-${index}`} className="text-xs cursor-pointer">
                    Hiện gợi ý
                  </Label>
                </div>
              </div>
            </div>

            {/* Pairs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Các cặp ghép</Label>
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={addPair}>
                  <PlusCircle size={12} /> Thêm cặp
                </Button>
              </div>
              {stage.pairs.map((p, pi) => (
                <PairEditor
                  key={pi}
                  pair={p}
                  index={pi}
                  onUpdate={(updated) => updatePair(pi, updated)}
                  onRemove={() => removePair(pi)}
                  canRemove={stage.pairs.length > 1}
                />
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────

export const MatchingGameManager = () => {
  const { data: mappings = [], isLoading } = useMatchingGameMappings();
  const upsertGame = useUpsertMatchingGame();
  const deleteGame = useDeleteMatchingGame();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [form, setForm] = useState<GameForm>(defaultForm());

  const openCreate = () => {
    setForm(defaultForm());
    setDialogOpen(true);
  };

  const openEdit = async (grade: number, topicCode: string) => {
    setIsLoadingEdit(true);
    try {
      const res = await adminMatchingGameApi.getGame(grade, topicCode);
      setForm(apiToForm(grade, topicCode, res.data.data));
      setDialogOpen(true);
    } catch {
      toast.error("Không thể tải dữ liệu game");
    } finally {
      setIsLoadingEdit(false);
    }
  };

  const handleDelete = async (grade: number, topicCode: string) => {
    if (!confirm(`Xoá matching game Lớp ${grade} - Chủ đề ${topicCode}?`)) return;
    try {
      await deleteGame.mutateAsync({ grade, topicCode });
      toast.success("Đã xoá matching game");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Không thể xoá game");
    }
  };

  const handleSubmit = async () => {
    if (!form.topicName.trim()) {
      toast.error("Vui lòng nhập tên chủ đề");
      return;
    }
    if (!form.topicCode.trim()) {
      toast.error("Vui lòng nhập mã chủ đề");
      return;
    }

    try {
      await upsertGame.mutateAsync({
        grade: form.grade,
        topicCode: form.topicCode.toUpperCase(),
        meta: {
          title: buildTitle(form.grade, form.topicCode.toUpperCase(), form.topicName),
          version: form.metaVersion || "1.0.0",
          language: form.metaLanguage || "vi",
        },
        stages: formToStages(form.stages),
      });
      toast.success("Lưu matching game thành công");
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Không thể lưu game");
    }
  };

  const updateStage = (si: number, s: StageForm) =>
    setForm((prev) => ({
      ...prev,
      stages: prev.stages.map((x, i) => (i === si ? s : x)),
    }));
  const removeStage = (si: number) =>
    setForm((prev) => ({
      ...prev,
      stages: prev.stages.filter((_, i) => i !== si),
    }));
  const addStage = () => setForm((prev) => ({ ...prev, stages: [...prev.stages, defaultStage()] }));

  const isEditing = mappings.some((m) => m.grade === form.grade && m.topicCode === form.topicCode);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Game nối khái niệm</h2>
          <p className="text-sm text-muted-foreground">Quản lý nội dung trò chơi ghép đôi theo chương trình học</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <PlusCircle size={16} /> Thêm matching game
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Đang tải...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Game ID</TableHead>
              <TableHead>Lớp</TableHead>
              <TableHead>Chủ đề</TableHead>
              <TableHead>Tiêu đề game</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mappings.map((m) => (
              <TableRow key={`${m.grade}-${m.topicCode}`}>
                <TableCell className="text-muted-foreground">{m.gameId}</TableCell>
                <TableCell>
                  <Badge variant="secondary">Lớp {m.grade}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{m.topicCode}</Badge>
                </TableCell>
                <TableCell className="font-medium">{m.gameTitle}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    disabled={isLoadingEdit}
                    onClick={() => void openEdit(m.grade, m.topicCode)}
                  >
                    <Edit2 size={13} /> Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => void handleDelete(m.grade, m.topicCode)}
                  >
                    <Trash2 size={13} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {mappings.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Chưa có matching game nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Cập nhật Game nối" : "Tạo Game nối mới"}</DialogTitle>
            <DialogDescription>Nhập thông tin game và cấu hình các stage / cặp ghép đôi.</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* ── Basic info ── */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>Lớp</Label>
                <Select value={String(form.grade)} onValueChange={(v) => setForm((p) => ({ ...p, grade: Number(v) }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 9 }, (_, i) => i + 3).map((g) => (
                      <SelectItem key={g} value={String(g)}>
                        Lớp {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Mã chủ đề</Label>
                <Select
                  value={KNOWN_TOPIC_CODES.includes(form.topicCode) ? form.topicCode : "__custom__"}
                  onValueChange={(v) => {
                    if (v === "__custom__") {
                      setForm((p) => ({ ...p, topicCode: "" }));
                    } else {
                      setForm((p) => ({
                        ...p,
                        topicCode: v,
                        topicName: TOPIC_TITLES_PRIMARY[v] ?? p.topicName,
                      }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chủ đề..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TOPIC_TITLES_PRIMARY).map(([code, title]) => (
                      <SelectItem key={code} value={code}>
                        <span className="font-semibold">{code}</span>
                        <span className="text-muted-foreground ml-1 text-xs">{title}</span>
                      </SelectItem>
                    ))}
                    <SelectItem value="__custom__">Tự nhập...</SelectItem>
                  </SelectContent>
                </Select>
                {!KNOWN_TOPIC_CODES.includes(form.topicCode) && (
                  <Input
                    className="mt-1.5"
                    placeholder="Nhập mã chủ đề..."
                    maxLength={3}
                    value={form.topicCode}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        topicCode: e.target.value.toUpperCase(),
                      }))
                    }
                  />
                )}
              </div>

              <div className="space-y-1">
                <Label>Ngôn ngữ</Label>
                <Select value={form.metaLanguage} onValueChange={(v) => setForm((p) => ({ ...p, metaLanguage: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Tên chủ đề</Label>
              <div className="flex items-center gap-1.5">
                <span className="shrink-0 rounded-md border bg-muted px-2.5 py-1.5 text-sm text-muted-foreground whitespace-nowrap">
                  Lớp {form.grade}&nbsp;–&nbsp;{form.topicCode || "A"}:
                </span>
                <Input
                  placeholder="VD: MÁY TÍNH VÀ EM"
                  value={form.topicName}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      topicName: e.target.value.toUpperCase(),
                    }))
                  }
                />
              </div>
              {form.topicName.trim() && (
                <p className="text-xs text-muted-foreground pt-0.5">
                  Tiêu đề đầy đủ:{" "}
                  <span className="font-medium text-foreground">
                    {buildTitle(form.grade, form.topicCode.toUpperCase() || "A", form.topicName)}
                  </span>
                </p>
              )}
            </div>

            <Separator />

            {/* ── Stages ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Stages ({form.stages.length})</Label>
                <Button type="button" size="sm" variant="outline" className="gap-1" onClick={addStage}>
                  <PlusCircle size={14} /> Thêm stage
                </Button>
              </div>

              {form.stages.map((s, si) => (
                <StageEditor
                  key={si}
                  stage={s}
                  index={si}
                  onUpdate={(updated) => updateStage(si, updated)}
                  onRemove={() => removeStage(si)}
                  canRemove={form.stages.length > 1}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Huỷ
            </Button>
            <Button type="button" onClick={() => void handleSubmit()} disabled={upsertGame.isPending}>
              {upsertGame.isPending ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo game"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
