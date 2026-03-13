import React, { useState } from "react";
import { Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface HtmlPasteButtonProps {
  onInsert: (html: string) => void;
}

export const HtmlPasteButton: React.FC<HtmlPasteButtonProps> = ({ onInsert }) => {
  const [open, setOpen] = useState(false);
  const [htmlCode, setHtmlCode] = useState("");

  const handleInsert = () => {
    if (htmlCode.trim()) {
      onInsert(htmlCode);
      setHtmlCode("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2">
          <Code2 className="h-4 w-4" />
          Chèn HTML
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-150 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chèn HTML</DialogTitle>
          <DialogDescription>Paste HTML code vào đây để thêm vào nội dung</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-2">
            <Label htmlFor="html-code">HTML Code</Label>
            <Textarea
              id="html-code"
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
              placeholder='<div class="example">Your HTML here...</div>'
              rows={12}
              className="font-mono text-sm resize-none min-h-75"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button type="button" onClick={handleInsert}>
            Chèn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
