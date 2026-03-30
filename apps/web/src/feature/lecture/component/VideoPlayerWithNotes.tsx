import React, { useState, useCallback, useRef, memo, useEffect } from "react";
import { Button } from "@workspace/ui/components/Button";
import { StickyNote } from "lucide-react";
import VideoPlayer from "./VideoPlayer";
import VideoNotesSidebar from "./VideoNotesSidebar";

interface VideoPlayerWithNotesProps {
  lectureId: number;
  onComplete?: () => void;
  onProgressUpdate?: (percent: number) => void;
}

const VideoPlayerWithNotes: React.FC<VideoPlayerWithNotesProps> = memo(
  ({ lectureId, onComplete, onProgressUpdate }) => {
    const [isNotesSidebarOpen, setIsNotesSidebarOpen] = useState(false);
    const [currentVideoTime, setCurrentVideoTime] = useState(0);
    const [videoSeekTo, setVideoSeekTo] = useState<number | null>(null);

    const lastSeekTimestamp = useRef<number | null>(null);

    const callbackRefs = useRef({ onComplete, onProgressUpdate });
    useEffect(() => {
      callbackRefs.current = { onComplete, onProgressUpdate };
    });

    const handleTimeUpdate = useCallback((time: number) => {
      const roundedTime = Math.floor(time);
      setCurrentVideoTime((prev) => {
        if (Math.abs(prev - roundedTime) >= 1) return roundedTime;
        return prev;
      });
    }, []);

    const handleComplete = useCallback(() => {
      callbackRefs.current.onComplete?.();
    }, []);

    const handleProgressUpdate = useCallback((percent: number) => {
      callbackRefs.current.onProgressUpdate?.(percent);
    }, []);

    const handleSeekFromNote = useCallback((timestamp: number) => {
      if (timestamp !== lastSeekTimestamp.current) {
        lastSeekTimestamp.current = timestamp;
        setVideoSeekTo(timestamp);
      }
    }, []);

    return (
      <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
        <VideoPlayer
          lectureId={lectureId}
          onComplete={handleComplete}
          onProgressUpdate={handleProgressUpdate}
          onTimeUpdate={handleTimeUpdate}
          seekTo={videoSeekTo}
        />

        {!isNotesSidebarOpen && (
          <div className="absolute right-4 top-4 z-10">
            <Button
              onClick={() => setIsNotesSidebarOpen(true)}
              className="bg-white/90 text-gray-900 shadow-lg backdrop-blur-sm hover:bg-white"
            >
              <StickyNote className="mr-2 h-4 w-4" />
              Ghi chú
            </Button>
          </div>
        )}

        {isNotesSidebarOpen && (
          <div className="absolute inset-y-0 right-0 z-20 w-80 ">
            <VideoNotesSidebar
              lectureId={lectureId}
              currentTime={currentVideoTime}
              onSeekTo={handleSeekFromNote}
              isOpen={isNotesSidebarOpen}
              onClose={() => setIsNotesSidebarOpen(false)}
            />
          </div>
        )}
      </div>
    );
  },
);

VideoPlayerWithNotes.displayName = "VideoPlayerWithNotes";
export default VideoPlayerWithNotes;
