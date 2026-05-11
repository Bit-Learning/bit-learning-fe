import React, { useState } from "react";
import { Button } from "@workspace/ui/components/Button";
import { Textarea } from "@workspace/ui/components/Textarea";
import { Input } from "@workspace/ui/components/Input";
import { StickyNote, Plus, Search, Loader2, X } from "lucide-react";
import { useLectureNotes, useCreateNote } from "../queries/useNote";
import NoteItem from "./NoteItem";

interface VideoNotesSidebarProps {
  lectureId: number;
  currentTime: number;
  onSeekTo: (timestamp: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

const VideoNotesSidebar: React.FC<VideoNotesSidebarProps> = ({ lectureId, currentTime, onSeekTo, isOpen, onClose }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: notes, isLoading } = useLectureNotes(lectureId);
  const { mutate: createNote, isPending: isPosting } = useCreateNote();

  const handleCreateNote = () => {
    if (!newNoteContent.trim()) return;
    createNote(
      { lectureId, videoTimestamp: Math.floor(currentTime), content: newNoteContent },
      {
        onSuccess: () => {
          setNewNoteContent("");
          setIsCreating(false);
        },
      },
    );
  };

  const filteredNotes = notes?.filter((note) => note.content.toLowerCase().includes(searchQuery.toLowerCase()));
  const sortedNotes = filteredNotes?.sort((a, b) => a.videoTimestamp - b.videoTimestamp);

  if (!isOpen) return null;

  const timestampLabel = `${Math.floor(currentTime / 60)}:${(Math.floor(currentTime) % 60).toString().padStart(2, "0")}`;

  return (
    <div className="flex h-full flex-col border-l border-gray-200 bg-white">
      <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-blue-700" />
          <h3 className="text-sm font-semibold text-gray-900">Ghi chú</h3>
          {notes && notes.length > 0 && (
            <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
              {notes.length}
            </span>
          )}
        </div>
        <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="shrink-0 border-b border-gray-200 px-4 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm..."
            className="h-8 pl-8 text-sm"
          />
        </div>
      </div>

      {!isCreating && (
        <div className="shrink-0 border-b border-gray-200 px-4 py-2">
          <Button
            onClick={() => setIsCreating(true)}
            className="w-full bg-blue-700 text-xs text-white hover:bg-blue-800"
            size="sm"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Thêm tại {timestampLabel}
          </Button>
        </div>
      )}

      {isCreating && (
        <div className="shrink-0 border-b border-gray-200 bg-blue-50 px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">Tại {timestampLabel}</span>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewNoteContent("");
              }}
              className="rounded p-0.5 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <Textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Nhập nội dung ghi chú..."
            className="mb-2 min-h-20 resize-none text-sm"
            autoFocus
          />
          <Button
            onClick={handleCreateNote}
            isDisabled={!newNoteContent.trim() || isPosting}
            className="w-full bg-blue-700 text-xs text-white hover:bg-blue-800"
            size="sm"
          >
            {isPosting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Đang lưu
              </>
            ) : (
              <>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Lưu ghi chú
              </>
            )}
          </Button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-700" />
          </div>
        ) : sortedNotes && sortedNotes.length > 0 ? (
          <div className="space-y-2">
            {sortedNotes.map((note) => (
              <NoteItem key={note.id} note={note} onTimestampClick={onSeekTo} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <StickyNote className="mb-2 h-8 w-8 text-gray-300" />
            <p className="text-xs font-medium text-gray-700">{searchQuery ? "Không tìm thấy" : "Chưa có ghi chú"}</p>
            <p className="mt-1 text-xs text-gray-400">
              {searchQuery ? "Thử từ khóa khác" : "Thêm ghi chú để ghi nhớ điểm quan trọng"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoNotesSidebar;
