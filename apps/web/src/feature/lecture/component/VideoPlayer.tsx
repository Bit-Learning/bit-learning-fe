import api from '@/shared/api/api'
import { getAccessToken } from '@/shared/lib/cookies'
import Hls from 'hls.js'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { lectureApi } from '../api/lecture.api'
import { useLectureProgress, useSyncProgress } from '../queries/useLearning'
import { VideoControls } from './VideoControls'

interface VideoPlayerProps {
    lectureId: number
    onComplete?: () => void
    onProgressUpdate?: (percent: number) => void
}

const SYNC_INTERVAL = 1000
const COMPLETION_THRESHOLD = 90

const VideoPlayer: React.FC<VideoPlayerProps> = ({ lectureId, onComplete, onProgressUpdate }) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const hlsRef = useRef<Hls | null>(null)
    const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const hasMarkedComplete = useRef(false)
    const maxWatchedTime = useRef(0)
    const lastValidTime = useRef(0)

    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [buffered, setBuffered] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [playbackSpeed, setPlaybackSpeed] = useState(1)
    const [quality, setQuality] = useState('auto')
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [hasResumed, setHasResumed] = useState(false)

    const { data: lastWatchedSecond } = useLectureProgress(lectureId)
    const syncProgressMutation = useSyncProgress()

    const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null)

    const resetHideControlsTimer = useCallback(() => {
        setShowControls(true)
        if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current)
        if (isPlaying) {
            hideControlsTimeout.current = setTimeout(() => setShowControls(false), 3000)
        }
    }, [isPlaying])

    const syncProgress = useCallback(() => {
        if (videoRef.current && videoRef.current.duration > 0) {
            syncProgressMutation.mutate({
                lectureId,
                currentSecond: Math.floor(videoRef.current.currentTime),
                totalDuration: Math.floor(videoRef.current.duration),
            })
        }
    }, [lectureId, syncProgressMutation])

    useEffect(() => {
        syncIntervalRef.current = setInterval(syncProgress, SYNC_INTERVAL)
        return () => {
            if (syncIntervalRef.current) clearInterval(syncIntervalRef.current)
            syncProgress()
        }
    }, [lectureId])

    useEffect(() => {
        hasMarkedComplete.current = false
        maxWatchedTime.current = 0
        lastValidTime.current = 0
        setHasResumed(false)
    }, [lectureId])

    useEffect(() => {
        if (videoRef.current && lastWatchedSecond && lastWatchedSecond > 0 && !hasResumed && duration > 0) {
            videoRef.current.currentTime = lastWatchedSecond
            maxWatchedTime.current = lastWatchedSecond
            lastValidTime.current = lastWatchedSecond
            setHasResumed(true)

            const progressPercent = (lastWatchedSecond / duration) * 100
            console.log('Resumed at', Math.round(progressPercent), '% (', lastWatchedSecond, 's)')
        }
    }, [lastWatchedSecond, hasResumed, duration, lectureId])

    const onCompleteRef = useRef(onComplete)
    const onProgressUpdateRef = useRef(onProgressUpdate)

    useEffect(() => {
        onCompleteRef.current = onComplete
        onProgressUpdateRef.current = onProgressUpdate
    }, [onComplete, onProgressUpdate])

    useEffect(() => {
        if (duration > 0 && currentTime > 0) {
            const percent = (currentTime / duration) * 100
            onProgressUpdateRef.current?.(percent)

            if (percent >= COMPLETION_THRESHOLD && !hasMarkedComplete.current) {
                hasMarkedComplete.current = true
                onCompleteRef.current?.()
            }
        }
    }, [currentTime, duration])

    useEffect(() => {
        if (!videoRef.current) return
        const video = videoRef.current

        const loadVideo = async () => {
            if (Hls.isSupported()) {
                try {
                    const response = await lectureApi.fetchVideoM3u8(lectureId)
                    const manifest = response.data

                    const blob = new Blob([manifest], { type: 'application/vnd.apple.mpegurl' })
                    const manifestUrl = URL.createObjectURL(blob)

                    const hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        xhrSetup: (xhr: XMLHttpRequest, url: string) => {
                            const token = getAccessToken()
                            const segmentMatch = url.match(/segment_\d+\.ts/)
                            if (segmentMatch) {
                                const segment = segmentMatch[0]
                                const fullUrl = `${api.defaults.baseURL}lectures/lecture-videos/${lectureId}/${segment}`
                                xhr.open('GET', fullUrl, true)
                                if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
                                xhr.responseType = 'arraybuffer'
                            }
                        },
                    })

                    hlsRef.current = hls
                    hls.loadSource(manifestUrl)
                    hls.attachMedia(video)

                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        URL.revokeObjectURL(manifestUrl)
                    })

                    hls.on(Hls.Events.ERROR, (_event, data) => {
                        if (data.fatal) {
                            switch (data.type) {
                                case Hls.ErrorTypes.NETWORK_ERROR:
                                    hls.startLoad()
                                    break
                                case Hls.ErrorTypes.MEDIA_ERROR:
                                    hls.recoverMediaError()
                                    break
                                default:
                                    hls.destroy()
                                    hlsRef.current = null
                            }
                        }
                    })
                } catch (error) {
                    console.error('Failed to initialize video:', error)
                }
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                const response = await lectureApi.fetchVideoM3u8(lectureId)
                const manifest = response.data
                const rewrittenManifest = manifest.replace(/segment_\d+\.ts/g, (segment: string) =>
                    lectureApi.getVideoSegmentUrl(lectureId, segment),
                )
                const blob = new Blob([rewrittenManifest], { type: 'application/vnd.apple.mpegurl' })
                video.src = URL.createObjectURL(blob)
            }
        }

        loadVideo()

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy()
                hlsRef.current = null
            }
        }
    }, [lectureId])

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const onPlay = () => setIsPlaying(true)
        const onPause = () => setIsPlaying(false)
        const onTimeUpdate = () => {
            const current = video.currentTime
            setCurrentTime(current)

            if (current > maxWatchedTime.current) {
                maxWatchedTime.current = current
            }
            lastValidTime.current = current
        }
        const onDurationChange = () => setDuration(video.duration)
        const onProgress = () => {
            if (video.buffered.length > 0) {
                setBuffered(video.buffered.end(video.buffered.length - 1))
            }
        }
        const onEnded = () => {
            setIsPlaying(false)
            onComplete?.()
        }

        const onSeeking = () => {
            if (video.currentTime > maxWatchedTime.current) {
                video.currentTime = lastValidTime.current
            }
        }

        video.addEventListener('play', onPlay)
        video.addEventListener('pause', onPause)
        video.addEventListener('timeupdate', onTimeUpdate)
        video.addEventListener('durationchange', onDurationChange)
        video.addEventListener('progress', onProgress)
        video.addEventListener('ended', onEnded)
        video.addEventListener('seeking', onSeeking)

        return () => {
            video.removeEventListener('play', onPlay)
            video.removeEventListener('pause', onPause)
            video.removeEventListener('timeupdate', onTimeUpdate)
            video.removeEventListener('durationchange', onDurationChange)
            video.removeEventListener('progress', onProgress)
            video.removeEventListener('ended', onEnded)
            video.removeEventListener('seeking', onSeeking)
        }
    }, [onComplete])

    useEffect(() => {
        const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement)
        document.addEventListener('fullscreenchange', onFullscreenChange)
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
    }, [])

    const handlePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause()
            else videoRef.current.play()
        }
    }

    const handleSeek = (time: number) => {
        if (videoRef.current) {
            if (time <= maxWatchedTime.current) {
                videoRef.current.currentTime = time
            }
        }
    }

    const handleVolumeChange = (vol: number) => {
        if (videoRef.current) {
            videoRef.current.volume = vol
            setVolume(vol)
            setIsMuted(vol === 0)
        }
    }

    const handleMuteToggle = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted
            setIsMuted(!isMuted)
        }
    }

    const handleSpeedChange = (speed: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = speed
            setPlaybackSpeed(speed)
        }
    }

    const handleQualityChange = (q: string) => {
        setQuality(q)
        if (hlsRef.current) {
            if (q === 'auto') hlsRef.current.currentLevel = -1
            else {
                const level = hlsRef.current.levels.findIndex(l => l.height === parseInt(q))
                if (level !== -1) hlsRef.current.currentLevel = level
            }
        }
    }

    const handleFullscreenToggle = () => {
        if (!containerRef.current) return
        if (isFullscreen) document.exitFullscreen()
        else containerRef.current.requestFullscreen()
    }

    const handleSkip = (seconds: number) => {
        if (videoRef.current) {
            const targetTime = currentTime + seconds

            if (seconds < 0) {
                videoRef.current.currentTime = Math.max(0, targetTime)
            } else {
                if (targetTime <= maxWatchedTime.current) {
                    videoRef.current.currentTime = Math.min(duration, targetTime)
                }
            }
        }
    }

    return (
        <div
            ref={containerRef}
            className="relative h-full w-full bg-black"
            onMouseMove={resetHideControlsTimer}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            onClick={handlePlayPause}
        >
            <video ref={videoRef} className="h-full w-full" playsInline />

            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <button className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform hover:scale-110">
                        <div className="border-y-15 border-l-25 ml-1 h-0 w-0 border-y-transparent border-l-white" />
                    </button>
                </div>
            )}

            <div
                className={`transition-opacity duration-300 ${showControls ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                onClick={e => e.stopPropagation()}
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
    )
}

export default VideoPlayer
