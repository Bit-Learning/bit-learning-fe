import api from '@/shared/api/api'
import { getAccessToken } from '@/shared/lib/cookies'
import Hls from 'hls.js'
import React, { useEffect, useRef } from 'react'
import { lectureApi } from '../api/lecture.api'

interface VideoPlayerProps {
    lectureId: number
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ lectureId }) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const hlsRef = useRef<Hls | null>(null)
    const currentTimeRef = useRef(0)

    useEffect(() => {
        if (!videoRef.current) return

        const video = videoRef.current

        let isBlockingSeeking = false

        const handleSeeking = () => {
            if (video && !isBlockingSeeking) {
                isBlockingSeeking = true

                const wasPlaying = !video.paused

                video.currentTime = currentTimeRef.current

                if (wasPlaying) {
                    setTimeout(() => {
                        video.play().catch(err => {
                            console.log('Resume play failed:', err)
                        })
                        isBlockingSeeking = false
                    }, 100)
                } else {
                    isBlockingSeeking = false
                }
            }
        }

        const handleTimeUpdate = () => {
            if (video && !video.seeking) {
                currentTimeRef.current = video.currentTime
            }
        }

        video.addEventListener('seeking', handleSeeking)
        video.addEventListener('timeupdate', handleTimeUpdate)

        const loadVideo = async () => {
            if (Hls.isSupported()) {
                try {
                    const response = await lectureApi.fetchVideoM3u8(lectureId)
                    const manifest = response.data

                    const blob = new Blob([manifest], {
                        type: 'application/vnd.apple.mpegurl',
                    })
                    const manifestUrl = URL.createObjectURL(blob)

                    const hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        debug: false,
                        xhrSetup: function (xhr: XMLHttpRequest, url: string) {
                            const token = getAccessToken()

                            const segmentMatch = url.match(/segment_\d+\.ts/)
                            if (segmentMatch) {
                                const segment = segmentMatch[0]
                                const fullUrl = `${api.defaults.baseURL}lectures/lecture-videos/${lectureId}/${segment}`
                                xhr.open('GET', fullUrl, true)

                                if (token) {
                                    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
                                }

                                xhr.responseType = 'arraybuffer'
                            }
                        },
                    })

                    hlsRef.current = hls

                    hls.loadSource(manifestUrl)
                    hls.attachMedia(video)

                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        console.log('Manifest parsed successfully')
                        URL.revokeObjectURL(manifestUrl)
                        video.play().catch(err => {
                            console.log('Auto-play prevented:', err)
                        })
                    })

                    hls.on(Hls.Events.ERROR, (_event, data) => {
                        console.error('HLS Error:', data)

                        if (data.fatal) {
                            switch (data.type) {
                                case Hls.ErrorTypes.NETWORK_ERROR:
                                    console.log('Fatal network error, trying to recover...')
                                    hls.startLoad()
                                    break
                                case Hls.ErrorTypes.MEDIA_ERROR:
                                    console.log('Fatal media error, trying to recover...')
                                    hls.recoverMediaError()
                                    break
                                default:
                                    console.error('Fatal error, cannot recover')
                                    hls.destroy()
                                    hlsRef.current = null
                                    break
                            }
                        }
                    })

                    hls.on(Hls.Events.FRAG_LOADED, () => {
                        console.log('Fragment loaded successfully')
                    })
                } catch (error) {
                    console.error('Failed to initialize video player:', error)
                }
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                try {
                    const response = await lectureApi.fetchVideoM3u8(lectureId)
                    const manifest = response.data

                    const rewrittenManifest = manifest.replace(/segment_\d+\.ts/g, segment =>
                        lectureApi.getVideoSegmentUrl(lectureId, segment),
                    )

                    const blob = new Blob([rewrittenManifest], {
                        type: 'application/vnd.apple.mpegurl',
                    })
                    const manifestUrl = URL.createObjectURL(blob)

                    video.src = manifestUrl
                    video.addEventListener('loadedmetadata', () => {
                        URL.revokeObjectURL(manifestUrl)
                        video.play().catch(err => {
                            console.log('Auto-play prevented:', err)
                        })
                    })
                } catch (error) {
                    console.error('Failed to load video:', error)
                }
            } else {
                console.error('HLS is not supported in this browser')
            }
        }

        loadVideo()

        return () => {
            video.removeEventListener('seeking', handleSeeking)
            video.removeEventListener('timeupdate', handleTimeUpdate)

            if (hlsRef.current) {
                hlsRef.current.destroy()
                hlsRef.current = null
            }
        }
    }, [lectureId])

    return (
        <div className="relative h-full w-full bg-black">
            <video ref={videoRef} className="h-full w-full" controls controlsList="nodownload" playsInline />
        </div>
    )
}

export default VideoPlayer
