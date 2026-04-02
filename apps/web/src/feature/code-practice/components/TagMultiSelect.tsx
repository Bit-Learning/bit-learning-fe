import React, { useRef, useState, useEffect } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Badge } from "@workspace/ui/components/Badge";
import { useGetAllTags } from "../queries/useTag";
import { cn } from "@workspace/ui/lib/utils";

interface TagMultiSelectProps {
  value: string[];
  onChange: (tags: string[]) => void;
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

  const toggle = (tagName: string) => {
    if (value.includes(tagName)) {
      onChange(value.filter((t) => t !== tagName));
    } else {
      onChange([...value, tagName]);
    }
  };

  const remove = (tagName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((t) => t !== tagName));
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* Trigger */}
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
          value.map((tag) => (
            <Badge
              key={tag}
              className="flex items-center gap-1 bg-blue-100 px-2 py-0.5 text-sm text-blue-700 hover:bg-blue-200"
            >
              {tag}
              <button type="button" onClick={(e) => remove(tag, e)} className="ml-0.5 rounded-full hover:text-red-600">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        )}
        <ChevronDown
          className={cn("ml-auto h-4 w-4 shrink-0 text-gray-400 transition-transform", open && "rotate-180")}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-500">Đang tải...</div>
          ) : allTags.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">Chưa có tag nào</div>
          ) : (
            <ul className="max-h-60 overflow-y-auto py-1">
              {allTags.map((tag) => {
                const selected = value.includes(tag.name);
                return (
                  <li
                    key={tag.id}
                    onClick={() => toggle(tag.name)}
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
