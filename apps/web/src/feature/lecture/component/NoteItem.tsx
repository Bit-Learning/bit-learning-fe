import React, { useState, useRef, useEffect } from "react";
import { Button } from "@workspace/ui/components/Button";
import { Textarea } from "@workspace/ui/components/Textarea";
import { Clock, Edit2, Trash2, Save, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { NoteResponse } from "../types/note.type";
import { useUpdateNote, useDeleteNote } from "../queries/useNote";

interface NoteItemProps {
  note: NoteResponse;
  onTimestampClick: (timestamp: number) => void;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onTimestampClick }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const confirmRef = useRef<HTMLDivElement>(null);

  const { mutate: updateNote, isPending: isUpdating } = useUpdateNote();
  const { mutate: deleteNote, isPending: isDeleting } = useDeleteNote();

  const formatTimestamp = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const timeAgo = formatDistanceToNow(new Date(note.createdAt), {
    addSuffix: true,
    locale: vi,
  });

  const handleSave = () => {
    if (!editContent.trim()) return;

    updateNote(
      { noteId: note.id, content: editContent },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const handleCancelEdit = () => {
    setEditContent(note.content);
    setIsEditing(false);
  };

  const handleConfirmDelete = () => {
    deleteNote(note.id, {
      onSuccess: () => setConfirmDelete(false),
    });
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (confirmRef.current && !confirmRef.current.contains(e.target as Node)) {
        setConfirmDelete(false);
      }
    };

    if (confirmDelete) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [confirmDelete]);

  return (
    <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md">
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={() => onTimestampClick(note.videoTimestamp)}
          className="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-1 text-sm font-mono font-medium text-blue-700 transition-colors hover:bg-blue-100"
        >
          <Clock className="h-4 w-4" />
          {formatTimestamp(note.videoTimestamp)}
        </button>

        {!isEditing && (
          <div className="relative flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-8 w-8 p-0">
              <Edit2 className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDelete((prev) => !prev)}
              isDisabled={isDeleting}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            {confirmDelete && (
              <div
                ref={confirmRef}
                className="absolute right-0 top-9 z-20 w-52 rounded-md border bg-white p-3 shadow-lg animate-in fade-in zoom-in-95"
              >
                <p className="mb-3 text-sm text-gray-700">Bạn có chắc muốn xóa ghi chú này?</p>
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)}>
                    Hủy
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={handleConfirmDelete}
                    isDisabled={isDeleting}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-20 resize-none"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleCancelEdit}>
              <X className="mr-1 h-4 w-4" />
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              isDisabled={!editContent.trim() || isUpdating}
              className="bg-blue-700 text-white hover:bg-blue-800"
            >
              <Save className="mr-1 h-4 w-4" />
              Lưu
            </Button>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-wrap text-sm text-gray-700">{note.content}</p>
      )}

      {!isEditing && <div className="mt-2 text-xs text-gray-500">{timeAgo}</div>}
    </div>
  );
};

export default NoteItem;
