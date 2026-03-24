import React from "react";
import { FileCode, X } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { Language } from "../types/coding.type";

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
  canDelete: boolean;
}

export const FileTab: React.FC<FileTabProps> = ({ file, isActive, onClick, onDelete, canDelete }) => (
  <div
    className={cn(
      "flex items-center gap-2 px-4 py-2 border-r border-gray-700 cursor-pointer transition-colors group",
      isActive ? "bg-gray-900 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-750 hover:text-gray-200",
    )}
    onClick={onClick}
  >
    <FileCode className="w-4 h-4" />
    <span className="text-sm font-medium">{file.name}</span>
    {canDelete && (
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
