import { Button } from "@workspace/ui/components/Button";
import {
	Gauge,
	Maximize,
	Minimize,
	Pause,
	Play,
	Settings,
	SkipBack,
	SkipForward,
	Volume2,
	VolumeX,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { PLAYBACK_SPEEDS, VIDEO_QUALITIES } from "../types/learning.type";

interface VideoControlsProps {
	isPlaying: boolean;
	currentTime: number;
	duration: number;
	buffered: number;
	volume: number;
	isMuted: boolean;
	playbackSpeed: number;
	quality: string;
	isFullscreen: boolean;
	onPlayPause: () => void;
	onSeek: (time: number) => void;
	onVolumeChange: (volume: number) => void;
	onMuteToggle: () => void;
	onSpeedChange: (speed: number) => void;
	onQualityChange: (quality: string) => void;
	onFullscreenToggle: () => void;
	onSkip: (seconds: number) => void;
}

const formatTime = (seconds: number): string => {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = Math.floor(seconds % 60);
	if (h > 0)
		return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
	return `${m}:${s.toString().padStart(2, "0")}`;
};

export const VideoControls: React.FC<VideoControlsProps> = ({
	isPlaying,
	currentTime,
	duration,
	buffered,
	volume,
	isMuted,
	playbackSpeed,
	quality,
	isFullscreen,
	onPlayPause,
	onSeek,
	onVolumeChange,
	onMuteToggle,
	onSpeedChange,
	onQualityChange,
	onFullscreenToggle,
	onSkip,
}) => {
	const [showSpeedMenu, setShowSpeedMenu] = useState(false);
	const [showQualityMenu, setShowQualityMenu] = useState(false);
	const [showVolumeSlider, setShowVolumeSlider] = useState(false);
	const [hoverTime, setHoverTime] = useState<number | null>(null);
	const [hoverPosition, setHoverPosition] = useState(0);
	const progressRef = useRef<HTMLDivElement>(null);

	const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
	const bufferedProgress = duration > 0 ? (buffered / duration) * 100 : 0;

	const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!progressRef.current || duration === 0) return;
		const rect = progressRef.current.getBoundingClientRect();
		const percent = (e.clientX - rect.left) / rect.width;
		onSeek(percent * duration);
	};

	const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!progressRef.current || duration === 0) return;
		const rect = progressRef.current.getBoundingClientRect();
		const percent = (e.clientX - rect.left) / rect.width;
		setHoverTime(percent * duration);
		setHoverPosition(e.clientX - rect.left);
	};

	useEffect(() => {
		const handleClickOutside = () => {
			setShowSpeedMenu(false);
			setShowQualityMenu(false);
		};
		document.addEventListener("click", handleClickOutside);
		return () => document.removeEventListener("click", handleClickOutside);
	}, []);

	return (
		<div className="bg-linear-to-t absolute inset-x-0 bottom-0 from-black/90 via-black/50 to-transparent px-4 pb-4 pt-16">
			<div
				ref={progressRef}
				className="group relative mb-4 h-1 cursor-pointer rounded-full bg-white/30 transition-all hover:h-2"
				onClick={handleProgressClick}
				onMouseMove={handleProgressHover}
				onMouseLeave={() => setHoverTime(null)}
			>
				<div
					className="absolute left-0 top-0 h-full rounded-full bg-white/50"
					style={{ width: `${bufferedProgress}%` }}
				/>
				<div
					className="absolute left-0 top-0 h-full rounded-full bg-blue-500"
					style={{ width: `${progress}%` }}
				/>
				{hoverTime !== null && (
					<div
						className="absolute -top-10 -translate-x-1/2 rounded bg-black/90 px-2 py-1 text-xs text-white"
						style={{ left: hoverPosition }}
					>
						{formatTime(hoverTime)}
					</div>
				)}
				<div
					className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-blue-500 opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
					style={{ left: `calc(${progress}% - 8px)` }}
				/>
			</div>

			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={onPlayPause}
						className="text-white hover:bg-white/20"
					>
						{isPlaying ? (
							<Pause className="h-6 w-6" />
						) : (
							<Play className="h-6 w-6" />
						)}
					</Button>

					<Button
						variant="ghost"
						size="sm"
						onClick={() => onSkip(-10)}
						className="text-white hover:bg-white/20"
					>
						<SkipBack className="h-5 w-5" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => onSkip(10)}
						className="text-white hover:bg-white/20"
					>
						<SkipForward className="h-5 w-5" />
					</Button>

					<div
						className="relative flex items-center"
						onMouseEnter={() => setShowVolumeSlider(true)}
						onMouseLeave={() => setShowVolumeSlider(false)}
					>
						<Button
							variant="ghost"
							size="sm"
							onClick={onMuteToggle}
							className="text-white hover:bg-white/20"
						>
							{isMuted || volume === 0 ? (
								<VolumeX className="h-5 w-5" />
							) : (
								<Volume2 className="h-5 w-5" />
							)}
						</Button>
						{showVolumeSlider && (
							<input
								type="range"
								min="0"
								max="1"
								step="0.1"
								value={isMuted ? 0 : volume}
								onChange={(e) =>
									onVolumeChange(Number.parseFloat(e.target.value))
								}
								className="ml-2 w-20 accent-blue-500"
							/>
						)}
					</div>

					<span className="ml-2 text-sm text-white">
						{formatTime(currentTime)} / {formatTime(duration)}
					</span>
				</div>

				<div className="flex items-center gap-2">
					<div className="relative" onClick={(e) => e.stopPropagation()}>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								setShowSpeedMenu(!showSpeedMenu);
								setShowQualityMenu(false);
							}}
							className="gap-1 text-white hover:bg-white/20"
						>
							<Gauge className="h-4 w-4" />
							<span className="text-xs">{playbackSpeed}x</span>
						</Button>
						{showSpeedMenu && (
							<div className="absolute bottom-full right-0 mb-2 rounded-lg bg-gray-900/95 py-2 shadow-xl">
								{PLAYBACK_SPEEDS.map((s) => (
									<button
										key={s.value}
										onClick={() => {
											onSpeedChange(s.value);
											setShowSpeedMenu(false);
										}}
										className={`w-full px-4 py-2 text-left text-sm hover:bg-white/10 ${playbackSpeed === s.value ? "text-blue-400" : "text-white"}`}
									>
										{s.label}
									</button>
								))}
							</div>
						)}
					</div>

					<div className="relative" onClick={(e) => e.stopPropagation()}>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								setShowQualityMenu(!showQualityMenu);
								setShowSpeedMenu(false);
							}}
							className="gap-1 text-white hover:bg-white/20"
						>
							<Settings className="h-4 w-4" />
							<span className="text-xs">
								{quality === "auto" ? "Auto" : `${quality}p`}
							</span>
						</Button>
						{showQualityMenu && (
							<div className="absolute bottom-full right-0 mb-2 rounded-lg bg-gray-900/95 py-2 shadow-xl">
								{VIDEO_QUALITIES.map((q) => (
									<button
										key={q.value}
										onClick={() => {
											onQualityChange(q.value);
											setShowQualityMenu(false);
										}}
										className={`w-full px-4 py-2 text-left text-sm hover:bg-white/10 ${quality === q.value ? "text-blue-400" : "text-white"}`}
									>
										{q.label}
									</button>
								))}
							</div>
						)}
					</div>

					<Button
						variant="ghost"
						size="sm"
						onClick={onFullscreenToggle}
						className="text-white hover:bg-white/20"
					>
						{isFullscreen ? (
							<Minimize className="h-5 w-5" />
						) : (
							<Maximize className="h-5 w-5" />
						)}
					</Button>
				</div>
			</div>
		</div>
	);
};
