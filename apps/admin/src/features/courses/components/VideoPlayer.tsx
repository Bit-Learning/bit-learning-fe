import React, { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { getAccessToken } from "@/shared/lib/cookies";
import { useVideoStream } from "../queries/useLecture";

interface HlsVideoPlayerProps {
  lectureId: number;
  className?: string;
}

export const HlsVideoPlayer: React.FC<HlsVideoPlayerProps> = ({ lectureId, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: blobUrl, isLoading, isError } = useVideoStream(lectureId);

  useEffect(() => {
    if (!blobUrl || !videoRef.current) return;

    const video = videoRef.current;
    setError(null);

    const initPlayer = async () => {
      const Hls = (await import("hls.js")).default;

      if (Hls.isSupported()) {
        if (hlsRef.current) hlsRef.current.destroy();

        const hls = new Hls({
          xhrSetup: (xhr: XMLHttpRequest) => {
            const token = getAccessToken();
            if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          },
        });

        hls.loadSource(blobUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.ERROR, (_: any, data: any) => {
          if (data.fatal) {
            setError("Không thể tải video. Vui lòng thử lại.");
            hls.destroy();
          }
        });

        hlsRef.current = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = blobUrl;
      } else {
        setError("Trình duyệt không hỗ trợ phát video HLS.");
      }
    };

    initPlayer();

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [blobUrl]);

  if (isLoading) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-lg bg-gray-900 text-white">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm text-gray-400">Đang tải video...</span>
        </div>
      </div>
    );
  }

  if (isError || error) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-lg bg-gray-900 text-white">
        <div className="flex flex-col items-center gap-2 text-red-400">
          <AlertCircle className="h-8 w-8" />
          <span className="text-sm">{error || "Không thể tải video"}</span>
        </div>
      </div>
    );
  }

  return (
    <video ref={videoRef} controls className={className ?? "aspect-video w-full rounded-lg bg-black"} playsInline>
      <track kind="captions" srcLang="vi" label="Tiếng Việt" />
      Trình duyệt không hỗ trợ video
    </video>
  );
};

export default HlsVideoPlayer;
