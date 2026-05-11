import { ImageIcon, XIcon } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

interface ThumbnailUploadProps {
  value?: File | null;
  previewUrl?: string;
  onChange: (file: File | null) => void;
}

export function ThumbnailUpload({ value, previewUrl, onChange }: ThumbnailUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = value ? URL.createObjectURL(value) : previewUrl;

  return (
    <div className="flex items-center gap-3">
      <div
        className="bg-muted relative flex h-20 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors hover:border-primary"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="thumbnail" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="text-muted-foreground h-8 w-8" />
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          {preview ? "Đổi ảnh" : "Tải ảnh lên"}
        </Button>
        {preview && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onChange(null)}
          >
            <XIcon className="mr-1 h-3.5 w-3.5" />
            Xóa ảnh
          </Button>
        )}
        <p className="text-muted-foreground text-xs">PNG, JPG tối đa 2MB</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
