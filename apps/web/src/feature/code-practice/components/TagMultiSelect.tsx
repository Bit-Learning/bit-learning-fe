import React, { useRef, useState, useEffect } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Badge } from "@workspace/ui/components/Badge";
import { useGetAllTags } from "../queries/useTag";
import { cn } from "@workspace/ui/lib/utils";

interface TagMultiSelectProps {
  value: string[]; // mảng tag IDs
  onChange: (ids: string[]) => void;
  placeholder?: string;
  className?: string;
}

const TagMultiSelect: React.FC<TagMultiSelectProps> = ({
  value,
  onChange,
  placeholder = "Chọn thẻ tag...",
  className,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: allTags = [], isLoading } = useGetAllTags();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  const remove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== id));
  };

  // Lấy name từ id để hiển thị
  const getTagName = (id: string) => allTags.find((t) => t.id === id)?.name ?? id;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div
        onClick={() => setOpen(!open)}
        className={cn(
          "min-h-12 w-full cursor-pointer rounded-md border-2 border-gray-300 bg-white px-3 py-2 text-base transition-colors",
          "flex flex-wrap items-center gap-1.5",
          open && "border-blue-500 ring-2 ring-blue-500/20",
        )}
      >
        {value.length === 0 ? (
          <span className="text-gray-400">{placeholder}</span>
        ) : (
          value.map((id) => (
            <Badge
              key={id}
              className="flex items-center gap-1 bg-blue-100 px-2 py-0.5 text-sm text-blue-700 hover:bg-blue-200"
            >
              {getTagName(id)}
              <button type="button" onClick={(e) => remove(id, e)} className="ml-0.5 rounded-full hover:text-red-600">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        )}
        <ChevronDown
          className={cn("ml-auto h-4 w-4 shrink-0 text-gray-400 transition-transform", open && "rotate-180")}
        />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-500">Đang tải...</div>
          ) : allTags.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">Chưa có tag nào</div>
          ) : (
            <ul className="max-h-60 overflow-y-auto py-1">
              {allTags.map((tag) => {
                const selected = value.includes(tag.id);
                return (
                  <li
                    key={tag.id}
                    onClick={() => toggle(tag.id)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-gray-50",
                      selected && "bg-blue-50 text-blue-700",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border-2 transition-colors",
                        selected ? "border-blue-600 bg-blue-600" : "border-gray-300",
                      )}
                    >
                      {selected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    {tag.name}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default TagMultiSelect;
