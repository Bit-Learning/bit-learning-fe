import Hls from "hls.js";
import type React from "react";
import { useCallback, useEffect, useRef, useState, memo } from "react";
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

const SYNC_INTERVAL = 1000;
const COMPLETION_THRESHOLD = 90;
const TIME_UPDATE_THROTTLE = 500;

const VideoPlayer: React.FC<VideoPlayerProps> = memo(
  ({ lectureId, onComplete, onProgressUpdate, onTimeUpdate, seekTo }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

    // Tracking refs
    const hasMarkedComplete = useRef(false);
    const maxWatchedTime = useRef(0);
    const lastValidTime = useRef(0);
    const lastProcessedSeekTo = useRef<number | null>(null);

    // Store callbacks in ref to avoid re-renders
    const callbackRefs = useRef({ onComplete, onProgressUpdate, onTimeUpdate });
    useEffect(() => {
      callbackRefs.current = { onComplete, onProgressUpdate, onTimeUpdate };
    });

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

    const resetHideControlsTimer = useCallback(() => {
      setShowControls(true);
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
      if (isPlaying) {
        hideControlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
      }
    }, [isPlaying]);

    const syncProgress = useCallback(() => {
      if (videoRef.current && videoRef.current.duration > 0) {
        syncProgressMutation.mutate({
          lectureId,
          currentSecond: Math.floor(videoRef.current.currentTime),
          totalDuration: Math.floor(videoRef.current.duration),
        });
      }
    }, [lectureId, syncProgressMutation]);

    // Handle seek from notes
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

    // Sync progress interval
    useEffect(() => {
      syncIntervalRef.current = setInterval(syncProgress, SYNC_INTERVAL);
      return () => {
        if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
        syncProgress();
      };
    }, [syncProgress]);

    // Reset on lecture change
    useEffect(() => {
      hasMarkedComplete.current = false;
      maxWatchedTime.current = 0;
      lastValidTime.current = 0;
      lastProcessedSeekTo.current = null;
      setHasResumed(false);
      setCurrentTime(0);
      setDuration(0);
    }, [lectureId]);

    // Resume from last watched
    useEffect(() => {
      if (videoRef.current && lastWatchedSecond && lastWatchedSecond > 0 && !hasResumed && duration > 0) {
        videoRef.current.currentTime = lastWatchedSecond;
        maxWatchedTime.current = lastWatchedSecond;
        lastValidTime.current = lastWatchedSecond;
        setHasResumed(true);
      }
    }, [lastWatchedSecond, hasResumed, duration]);

    // Load video
    useEffect(() => {
      if (!videoRef.current) return;
      const video = videoRef.current;

      const loadVideo = async () => {
        if (Hls.isSupported()) {
          try {
            const response = await lectureApi.fetchVideoM3u8(lectureId);
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
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      };
    }, [lectureId]);

    // Video event listeners - EMPTY DEPS to run only once
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleDurationChange = () => setDuration(video.duration);

      const handleEnded = () => {
        setIsPlaying(false);
        callbackRefs.current.onComplete?.();
      };

      // Throttled time update
      let lastTimeUpdateCall = 0;
      let lastReportedTime = 0;

      const handleTimeUpdate = () => {
        const current = video.currentTime;

        // Always update tracking refs
        if (current > maxWatchedTime.current) maxWatchedTime.current = current;
        lastValidTime.current = current;

        // Throttle state updates
        const now = Date.now();
        if (now - lastTimeUpdateCall < TIME_UPDATE_THROTTLE) return;
        lastTimeUpdateCall = now;

        // Only update if changed significantly
        if (Math.abs(current - lastReportedTime) < 0.5) return;
        lastReportedTime = current;

        setCurrentTime(current);
        callbackRefs.current.onTimeUpdate?.(current);

        // Check completion
        if (video.duration > 0) {
          const percent = (current / video.duration) * 100;
          callbackRefs.current.onProgressUpdate?.(percent);

          if (percent >= COMPLETION_THRESHOLD && !hasMarkedComplete.current) {
            hasMarkedComplete.current = true;
            callbackRefs.current.onComplete?.();
          }
        }
      };

      const handleProgress = () => {
        if (video.buffered.length > 0) {
          setBuffered(video.buffered.end(video.buffered.length - 1));
        }
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

    // Fullscreen listener
    useEffect(() => {
      const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    // Stable handlers
    const handlePlayPause = useCallback(() => {
      if (videoRef.current) {
        if (videoRef.current.paused) videoRef.current.play();
        else videoRef.current.pause();
      }
    }, []);

    const handleSeek = useCallback((time: number) => {
      if (videoRef.current && time <= maxWatchedTime.current) {
        videoRef.current.currentTime = time;
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
        const newMuted = !videoRef.current.muted;
        videoRef.current.muted = newMuted;
        setIsMuted(newMuted);
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
      if (videoRef.current) {
        const targetTime = videoRef.current.currentTime + seconds;
        if (seconds < 0) {
          videoRef.current.currentTime = Math.max(0, targetTime);
        } else if (targetTime <= maxWatchedTime.current) {
          videoRef.current.currentTime = Math.min(videoRef.current.duration, targetTime);
        }
      }
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
          className={`transition-opacity duration-300 ${
            showControls ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
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
  }
);

VideoPlayer.displayName = "VideoPlayer";
export default VideoPlayer;
