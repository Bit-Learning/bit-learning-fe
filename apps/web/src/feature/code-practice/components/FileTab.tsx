import React, { useState, useRef, useEffect } from "react";
import { FileCode, X } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { Language } from "../types/coding.type";
import { LANGUAGE_EXTENSIONS } from "@/shared/lib/code-editor";

export interface EditorFile {
  id: string;
  name: string;
  content: string;
  language: Language;
}

interface FileTabProps {
  file: EditorFile;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
  canDelete: boolean;
}

export const FileTab: React.FC<FileTabProps> = ({ file, isActive, onClick, onDelete, onRename, canDelete }) => {
  const ext = LANGUAGE_EXTENSIONS[file.language];
  const baseName = file.name.endsWith(ext) ? file.name.slice(0, -ext.length) : file.name;

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(baseName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      onRename(trimmed + ext);
    } else {
      setDraft(baseName);
    }
    setIsEditing(false);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDraft(baseName);
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") {
      setDraft(file.name);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2 border-r border-gray-700 cursor-pointer transition-colors group",
        isActive ? "bg-gray-900 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-750 hover:text-gray-200",
      )}
      onClick={onClick}
      onDoubleClick={handleDoubleClick}
    >
      <FileCode className="w-4 h-4 shrink-0" />
      {isEditing ? (
        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            className="text-sm font-medium bg-gray-700 text-white border border-blue-500 rounded-l px-1 outline-none w-24"
          />
          <span className="text-sm text-gray-400 bg-gray-700 border border-l-0 border-blue-500 rounded-r px-1 select-none">
            {ext}
          </span>
        </div>
      ) : (
        <span className="text-sm font-medium">{file.name}</span>
      )}
      {canDelete && !isEditing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
