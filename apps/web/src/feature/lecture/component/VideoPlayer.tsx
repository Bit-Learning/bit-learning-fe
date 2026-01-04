import Hls from "hls.js";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import api from "@/shared/api/api";
import { getAccessToken } from "@/shared/lib/cookies";
import { lectureApi } from "../api/lecture.api";
import { useLectureProgress, useSyncProgress } from "../queries/useLearning";
import { VideoControls } from "./VideoControls";

interface VideoPlayerProps {
  lectureId: number;
  onComplete?: () => void;
  onProgressUpdate?: (percent: number) => void;
  onTimeUpdate?: (time: number) => void;
  seekTo?: number | null;
}

const SYNC_INTERVAL = 5000;
const COMPLETION_THRESHOLD = 90;

const VideoPlayer: React.FC<VideoPlayerProps> = ({ lectureId, onComplete, onProgressUpdate, onTimeUpdate, seekTo }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const hasMarkedComplete = useRef(false);
  const maxWatchedTime = useRef(0);
  const lastValidTime = useRef(0);
  const lastProcessedSeekTo = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState("auto");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasResumed, setHasResumed] = useState(false);

  const { data: lastWatchedSecond } = useLectureProgress(lectureId);
  const syncProgressMutation = useSyncProgress();

  const onCompleteRef = useRef(onComplete);
  const onProgressUpdateRef = useRef(onProgressUpdate);
  const onTimeUpdateRef = useRef(onTimeUpdate);

  onCompleteRef.current = onComplete;
  onProgressUpdateRef.current = onProgressUpdate;
  onTimeUpdateRef.current = onTimeUpdate;

  const resetHideControlsTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  const lectureIdRef = useRef(lectureId);
  lectureIdRef.current = lectureId;

  const syncProgressRef = useRef(syncProgressMutation);
  syncProgressRef.current = syncProgressMutation;

  useEffect(() => {
    const doSync = () => {
      const video = videoRef.current;
      if (video && video.duration > 0 && !syncProgressRef.current.isPending) {
        syncProgressRef.current.mutate({
          lectureId: lectureIdRef.current,
          currentSecond: Math.floor(video.currentTime),
          totalDuration: Math.floor(video.duration),
        });
      }
    };

    syncIntervalRef.current = setInterval(doSync, SYNC_INTERVAL);
    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (
      seekTo != null &&
      seekTo !== lastProcessedSeekTo.current &&
      videoRef.current &&
      videoRef.current.readyState >= 2
    ) {
      const video = videoRef.current;
      if (seekTo <= maxWatchedTime.current && Math.abs(video.currentTime - seekTo) > 0.5) {
        video.currentTime = seekTo;
      }
      lastProcessedSeekTo.current = seekTo;
    }
  }, [seekTo]);

  useEffect(() => {
    hasMarkedComplete.current = false;
    maxWatchedTime.current = 0;
    lastValidTime.current = 0;
    lastProcessedSeekTo.current = null;
    setHasResumed(false);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  }, [lectureId]);

  const lastWatchedSecondRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (
      lastWatchedSecond != null &&
      lastWatchedSecond > 0 &&
      lastWatchedSecond !== lastWatchedSecondRef.current &&
      videoRef.current &&
      duration > 0
    ) {
      lastWatchedSecondRef.current = lastWatchedSecond;
      videoRef.current.currentTime = lastWatchedSecond;
      maxWatchedTime.current = lastWatchedSecond;
      lastValidTime.current = lastWatchedSecond;
    }
  }, [lastWatchedSecond, duration]);

  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    let mounted = true;

    const loadVideo = async () => {
      if (Hls.isSupported()) {
        try {
          const response = await lectureApi.fetchVideoM3u8(lectureId);
          if (!mounted) return;

          const manifest = response.data;
          const blob = new Blob([manifest], { type: "application/vnd.apple.mpegurl" });
          const manifestUrl = URL.createObjectURL(blob);

          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            xhrSetup: (xhr: XMLHttpRequest, url: string) => {
              const token = getAccessToken();
              const segmentMatch = url.match(/segment_\d+\.ts/);
              if (segmentMatch) {
                const segment = segmentMatch[0];
                const fullUrl = `${api.defaults.baseURL}lectures/lecture-videos/${lectureId}/${segment}`;
                xhr.open("GET", fullUrl, true);
                if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
                xhr.responseType = "arraybuffer";
              }
            },
          });

          hlsRef.current = hls;
          hls.loadSource(manifestUrl);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => URL.revokeObjectURL(manifestUrl));
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) {
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
              else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
              else {
                hls.destroy();
                hlsRef.current = null;
              }
            }
          });
        } catch (error) {
          console.error("Failed to initialize video:", error);
        }
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        const response = await lectureApi.fetchVideoM3u8(lectureId);
        if (!mounted) return;

        const manifest = response.data;
        const rewrittenManifest = manifest.replace(/segment_\d+\.ts/g, (segment: string) =>
          lectureApi.getVideoSegmentUrl(lectureId, segment)
        );
        const blob = new Blob([rewrittenManifest], { type: "application/vnd.apple.mpegurl" });
        video.src = URL.createObjectURL(blob);
      }
    };

    loadVideo();

    return () => {
      mounted = false;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [lectureId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let lastCallbackTime = 0;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleDurationChange = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      if (current > maxWatchedTime.current) maxWatchedTime.current = current;
      lastValidTime.current = current;

      setCurrentTime(current);

      const now = Date.now();
      if (now - lastCallbackTime < 500) return;
      lastCallbackTime = now;

      onTimeUpdateRef.current?.(current);

      const dur = video.duration;
      if (dur > 0) {
        const percent = (current / dur) * 100;
        onProgressUpdateRef.current?.(percent);

        if (percent >= COMPLETION_THRESHOLD && !hasMarkedComplete.current) {
          hasMarkedComplete.current = true;
          onCompleteRef.current?.();
        }
      }
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onCompleteRef.current?.();
    };

    const handleSeeking = () => {
      if (video.currentTime > maxWatchedTime.current) {
        video.currentTime = lastValidTime.current;
      }
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("progress", handleProgress);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("seeking", handleSeeking);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("progress", handleProgress);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("seeking", handleSeeking);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handlePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) video.play();
      else video.pause();
    }
  }, []);

  const handleSeek = useCallback((time: number) => {
    if (videoRef.current && time <= maxWatchedTime.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleVolumeChange = useCallback((vol: number) => {
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setVolume(vol);
      setIsMuted(vol === 0);
    }
  }, []);

  const handleMuteToggle = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  }, []);

  const handleQualityChange = useCallback((q: string) => {
    setQuality(q);
    if (hlsRef.current) {
      if (q === "auto") hlsRef.current.currentLevel = -1;
      else {
        const level = hlsRef.current.levels.findIndex((l) => l.height === parseInt(q, 10));
        if (level !== -1) hlsRef.current.currentLevel = level;
      }
    }
  }, []);

  const handleFullscreenToggle = useCallback(() => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current.requestFullscreen();
  }, []);

  const handleSkip = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    const targetTime = video.currentTime + seconds;
    if (seconds < 0) {
      video.currentTime = Math.max(0, targetTime);
    } else if (targetTime <= maxWatchedTime.current) {
      video.currentTime = Math.min(video.duration || 0, targetTime);
    }
    setCurrentTime(video.currentTime);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full bg-black"
      onMouseMove={resetHideControlsTimer}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={handlePlayPause}
    >
      <video ref={videoRef} className="h-full w-full" playsInline>
        <track kind="captions" srcLang="vi" label="Tiếng Việt" />
      </video>

      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform hover:scale-110">
            <div className="border-y-15 border-l-25 ml-1 h-0 w-0 border-y-transparent border-l-white" />
          </button>
        </div>
      )}

      <div
        className={`transition-opacity duration-300 ${showControls ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <VideoControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          buffered={buffered}
          volume={volume}
          isMuted={isMuted}
          playbackSpeed={playbackSpeed}
          quality={quality}
          isFullscreen={isFullscreen}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onMuteToggle={handleMuteToggle}
          onSpeedChange={handleSpeedChange}
          onQualityChange={handleQualityChange}
          onFullscreenToggle={handleFullscreenToggle}
          onSkip={handleSkip}
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
