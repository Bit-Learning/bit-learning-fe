import { useAudio } from "../contexts/AudioProvider";

export function AudioToggle({ className = "" }: { className?: string }) {
	const { enabled, toggleEnabled } = useAudio();

	return (
		<button
			onClick={toggleEnabled}
			className={`flex items-center justify-center size-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary transition-all duration-200 ${className}`}
			aria-label={enabled ? "Tắt âm thanh" : "Bật âm thanh"}
		>
			<span className="material-symbols-outlined text-slate-600">
				{enabled ? "volume_up" : "volume_off"}
			</span>
		</button>
	);
}
