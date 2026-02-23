import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Card } from "@workspace/ui/components/Card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/Form";
import { Input } from "@workspace/ui/components/Input";
import { useCreateVersion } from "../queries/useMatrix";
import type { TMatrixDetailRequest } from "../types/matrix.type";
import MatrixDetailTable from "./MatrixDetailTable";

const formSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên version"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  matrixId: number;
  totalScore: number;
}

const VersionFormModal: React.FC<Props> = ({ isOpen, onClose, matrixId, totalScore }) => {
  const [matrixDetails, setMatrixDetails] = useState<TMatrixDetailRequest[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", notes: "" },
  });

  const { mutate: createVersion, isPending } = useCreateVersion();

  useEffect(() => {
    if (isOpen) {
      form.reset({ name: "Version 1.0", notes: "" });
      setMatrixDetails([]);
    }
  }, [isOpen, form]);

  const onSubmit = (values: FormValues) => {
    createVersion(
      {
        matrixId,
        name: values.name,
        notes: values.notes,
        matrixDetails: matrixDetails.filter((d) => d.lessonId),
      },
      { onSuccess: onClose },
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl p-6 my-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Tạo version mới</h2>
          <Button variant="ghost" size="sm" onPress={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên version <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Version 1.0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl>
                      <Input placeholder="Ghi chú..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <h3 className="font-medium mb-3">Cấu hình phân bổ câu hỏi</h3>
              <MatrixDetailTable value={matrixDetails} onChange={setMatrixDetails} targetTotalScore={totalScore} />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onPress={onClose}>
                Hủy
              </Button>
              <Button type="submit" isDisabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Tạo version
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default VersionFormModal;
