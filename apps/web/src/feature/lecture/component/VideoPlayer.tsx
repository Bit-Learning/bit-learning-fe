import Hls from 'hls.js'
import React, { useEffect, useRef } from 'react'
import { useVideoUrls } from '../queries/useLecture'

interface VideoPlayerProps {
    lectureId: number
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ lectureId }) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const { m3u8Url } = useVideoUrls(lectureId)

    useEffect(() => {
        if (!videoRef.current) return

        const video = videoRef.current

        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            })

            hls.loadSource(m3u8Url)
            hls.attachMedia(video)

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play()
            })

            hls.on(Hls.Events.ERROR, (_event, data: { fatal: any; type: any }) => {
                if (data.fatal) {
                    console.error('HLS Error:', data)
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            hls.startLoad()
                            break
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            hls.recoverMediaError()
                            break
                        default:
                            hls.destroy()
                            break
                    }
                }
            })

            return () => {
                hls.destroy()
            }
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = m3u8Url
            video.addEventListener('loadedmetadata', () => {
                video.play()
            })
        } else {
            console.error('HLS is not supported in this browser')
        }
    }, [lectureId, m3u8Url])

    return (
        <div className="relative h-full w-full bg-black">
            <video ref={videoRef} className="h-full w-full" controls controlsList="nodownload" playsInline />
        </div>
    )
}

export default VideoPlayer
