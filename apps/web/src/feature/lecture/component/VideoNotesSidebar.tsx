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
      {
        lectureId,
        videoTimestamp: Math.floor(currentTime),
        content: newNoteContent,
      },
      {
        onSuccess: () => {
          setNewNoteContent("");
          setIsCreating(false);
        },
      }
    );
  };

  const filteredNotes = notes?.filter((note) => note.content.toLowerCase().includes(searchQuery.toLowerCase()));

  const sortedNotes = filteredNotes?.sort((a, b) => a.videoTimestamp - b.videoTimestamp);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 lg:hidden" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-gray-200 bg-white shadow-xl lg:relative lg:w-96">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-blue-700" />
            <h3 className="font-semibold text-gray-900">Ghi chú của tôi</h3>
            {notes && notes.length > 0 && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                {notes.length}
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="border-b border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm ghi chú..."
              className="pl-9"
            />
          </div>
        </div>

        {!isCreating && (
          <div className="border-b border-gray-200 p-4">
            <Button onClick={() => setIsCreating(true)} className="w-full bg-blue-700 text-white hover:bg-blue-800">
              <Plus className="mr-2 h-4 w-4" />
              Thêm ghi chú tại {Math.floor(currentTime / 60)}:
              {(Math.floor(currentTime) % 60).toString().padStart(2, "0")}
            </Button>
          </div>
        )}

        {isCreating && (
          <div className="border-b border-gray-200 bg-blue-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Ghi chú tại {Math.floor(currentTime / 60)}:{(Math.floor(currentTime) % 60).toString().padStart(2, "0")}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsCreating(false);
                  setNewNoteContent("");
                }}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Nhập nội dung ghi chú..."
              className="mb-2 min-h-25 resize-none"
              autoFocus
            />
            <Button
              onClick={handleCreateNote}
              isDisabled={!newNoteContent.trim() || isPosting}
              className="w-full bg-blue-700 text-white hover:bg-blue-800"
            >
              {isPosting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Lưu ghi chú
                </>
              )}
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
            </div>
          ) : sortedNotes && sortedNotes.length > 0 ? (
            <div className="space-y-3">
              {sortedNotes.map((note) => (
                <NoteItem key={note.id} note={note} onTimestampClick={onSeekTo} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <StickyNote className="mb-3 h-12 w-12 text-gray-300" />
              <p className="mb-2 font-medium text-gray-900">
                {searchQuery ? "Không tìm thấy ghi chú" : "Chưa có ghi chú nào"}
              </p>
              <p className="text-sm text-gray-500">
                {searchQuery ? "Thử tìm kiếm với từ khóa khác" : "Thêm ghi chú để ghi nhớ những điểm quan trọng"}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VideoNotesSidebar;
