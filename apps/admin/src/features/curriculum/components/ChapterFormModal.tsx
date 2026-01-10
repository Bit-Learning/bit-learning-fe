import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateChapter, useUpdateChapter } from "../queries/useChapter";
import type { TChapterResponse } from "../types/chapter.type";

const formSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên"),
  description: z.string().optional(),
  chapterNo: z.number().min(0, "Số chương phải >= 0"),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  data?: TChapterResponse | null;
  subjectId: number;
  nextChapterNo?: number;
}

const ChapterFormModal: React.FC<Props> = ({ open, onClose, data, subjectId, nextChapterNo = 1 }) => {
  const isEdit = !!data;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "", chapterNo: 1 },
  });

  const { mutate: create, isPending: creating } = useCreateChapter();
  const { mutate: update, isPending: updating } = useUpdateChapter();
  const isPending = creating || updating;

  useEffect(() => {
    if (open) {
      form.reset({
        name: data?.name || "",
        description: data?.description || "",
        chapterNo: data?.chapterNo ?? nextChapterNo,
      });
    }
  }, [open, data, form, nextChapterNo]);

  const onSubmit = (values: FormValues) => {
    const payload = { ...values, subjectId: data?.subjectId || subjectId };
    if (isEdit && data) {
      update({ id: data.id, data: payload }, { onSuccess: onClose });
    } else {
      create(payload, { onSuccess: onClose });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa" : "Tạo"} chương</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="chapterNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số chương</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên chương</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Nhập mô tả..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {isEdit ? "Cập nhật" : "Tạo"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ChapterFormModal;
