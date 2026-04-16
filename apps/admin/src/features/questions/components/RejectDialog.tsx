import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  count: number;
}

export function RejectDialog({ open, onOpenChange, onConfirm, count }: RejectDialogProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối", {
        description:
          "Lý do từ chối là bắt buộc khi từ chối câu hỏi. Vui lòng cung cấp lý do để người gửi có thể chỉnh sửa lại.",
      });
      return;
    }
    onConfirm(reason);
    setReason("");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Từ chối câu hỏi</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn đang từ chối <span className="font-semibold text-foreground">{count}</span> câu hỏi. Vui lòng nhập lý do
            để người gửi có thể chỉnh sửa lại.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <Label htmlFor="reason">Lý do từ chối *</Label>
          <Textarea
            id="reason"
            placeholder="Ví dụ: Câu hỏi chưa rõ ràng, cần bổ sung thêm thông tin..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setReason("")}>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Xác nhận từ chối</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
