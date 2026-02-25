import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

export type SoundKey =
	| "mac-quack"
	| "victory-mario"
	| "xp-error"
	| "yay"
	| "anime-wow"
	| "game-background-music";

interface PlayOptions {
	loop?: boolean;
}

interface AudioContextType {
	enabled: boolean;
	toggleEnabled: () => void;
	playSound: (key: SoundKey, options?: PlayOptions) => void;
	stopSound: (key?: SoundKey) => void;
}

const AudioContext = createContext<AudioContextType>({
	enabled: true,
	toggleEnabled: () => {},
	playSound: () => {},
	stopSound: () => {},
});

const SOUND_SOURCES: Record<SoundKey, string> = {
	"mac-quack": "/sounds/mac-quack.mp3",
	"victory-mario": "/sounds/victory-mario.mp3",
	"xp-error": "/sounds/xp-error.mp3",
	yay: "/sounds/yay.mp3",
	"anime-wow": "/sounds/anime-wow.mp3",
	"game-background-music": "/sounds/game-background-music.mp3",
};

export function AudioProvider({ children }: { children: React.ReactNode }) {
	const [enabled, setEnabled] = useState<boolean>(true);
	const audioCacheRef = useRef<Map<SoundKey, HTMLAudioElement>>(new Map());

	useEffect(() => {
		const saved = localStorage.getItem("game-audio-enabled");
		if (saved !== null) {
			setEnabled(saved === "true");
		}
	}, []);

	useEffect(() => {
		localStorage.setItem("game-audio-enabled", String(enabled));
	}, [enabled]);

	// Note: background music is controlled from routes using playSound/stopSound.

	const playSound = useMemo(() => {
		return (key: SoundKey, options?: PlayOptions) => {
			if (!enabled) return;

			const cache = audioCacheRef.current;

			let audio = cache.get(key);
			if (!audio) {
				audio = new Audio(SOUND_SOURCES[key]);
				cache.set(key, audio);
			}

			if (typeof options?.loop === "boolean") {
				audio.loop = options.loop;
			}

			try {
				audio.currentTime = 0;
				void audio.play();
			} catch {
				// ignore play errors (e.g. autoplay restrictions)
			}
		};
	}, [enabled]);

	const stopSound = (key?: SoundKey) => {
		const cache = audioCacheRef.current;
		if (key) {
			const audio = cache.get(key);
			if (audio) {
				audio.pause();
				audio.currentTime = 0;
			}
			return;
		}

		cache.forEach((audioEl) => {
			audioEl.pause();
			audioEl.currentTime = 0;
		});
	};

	const toggleEnabled = () => {
		setEnabled((prev) => !prev);
	};

	return (
		<AudioContext.Provider
			value={{ enabled, toggleEnabled, playSound, stopSound }}
		>
			{children}
		</AudioContext.Provider>
	);
}

export function useAudio() {
	return useContext(AudioContext);
}
