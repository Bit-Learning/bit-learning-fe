import { SymbolAnimationMode } from "../data";

interface SymbolBackgroundProps {
	animationMode?: SymbolAnimationMode;
	size?: "lg" | "md";
}

export function SymbolBackground({
	animationMode = SymbolAnimationMode.On,
	size = "lg",
}: SymbolBackgroundProps) {
	const isAnimationOn = animationMode === SymbolAnimationMode.On;
	const textSize = size === "lg" ? "text-8xl" : "text-7xl md:text-8xl";

	const cls = (on: string, base: string) =>
		`${isAnimationOn ? on : ""} ${base}`.trim();

	return (
		<div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-0 overflow-hidden select-none">
			<div
				className={`absolute top-0 left-0 w-full h-full flex flex-wrap gap-20 p-10 justify-around items-center ${textSize} font-black`}
			>
				<span
					className={cls(
						"motion-safe:animate-bounce motion-safe:[animation-duration:5s] motion-safe:[animation-delay:0.2s]",
						"translate-y-1 rotate-3",
					)}
				>
					01
				</span>
				<span
					className={cls(
						"motion-safe:animate-pulse motion-safe:[animation-duration:6s] motion-safe:[animation-delay:0.6s]",
						"-translate-y-2 -rotate-2",
					)}
				>
					{"{ }"}
				</span>
				<span
					className={cls(
						"motion-safe:animate-bounce motion-safe:[animation-duration:7s] motion-safe:[animation-delay:0.8s]",
						"translate-x-2 rotate-6",
					)}
				>
					{"</>"}
				</span>
				<span
					className={cls(
						"motion-safe:animate-pulse motion-safe:[animation-duration:4.5s] motion-safe:[animation-delay:0.4s]",
						"-translate-x-3",
					)}
				>
					{"[]"}
				</span>
				<span
					className={cls(
						"motion-safe:animate-bounce motion-safe:[animation-duration:6.5s] motion-safe:[animation-delay:1s]",
						"translate-y-2 -rotate-3",
					)}
				>
					10
				</span>

				<span
					className={cls(
						"motion-safe:animate-pulse motion-safe:[animation-duration:5.5s] motion-safe:[animation-delay:1.1s]",
						"translate-y-3",
					)}
				>
					;
				</span>
				<span
					className={cls(
						"motion-safe:animate-bounce motion-safe:[animation-duration:4s] motion-safe:[animation-delay:0.9s]",
						"-translate-y-1 rotate-2",
					)}
				>
					#
				</span>
				<span
					className={cls(
						"motion-safe:animate-pulse motion-safe:[animation-duration:7s] motion-safe:[animation-delay:0.3s]",
						"translate-x-3",
					)}
				>
					//
				</span>
				<span
					className={cls(
						"motion-safe:animate-bounce motion-safe:[animation-duration:6s] motion-safe:[animation-delay:1.4s]",
						"-translate-x-2 -rotate-6",
					)}
				>
					{"<!>"}
				</span>
				<span
					className={cls(
						"motion-safe:animate-pulse motion-safe:[animation-duration:5s] motion-safe:[animation-delay:0.5s]",
						"translate-y-1",
					)}
				>
					{"{}"}
				</span>

				<span
					className={cls(
						"motion-safe:animate-bounce motion-safe:[animation-duration:6.8s] motion-safe:[animation-delay:0.7s]",
						"-translate-y-2 -rotate-3",
					)}
				>
					01
				</span>
				<span
					className={cls(
						"motion-safe:animate-pulse motion-safe:[animation-duration:4.2s] motion-safe:[animation-delay:1.3s]",
						"translate-y-2",
					)}
				>
					()
				</span>
				<span
					className={cls(
						"motion-safe:animate-bounce motion-safe:[animation-duration:5.7s] motion-safe:[animation-delay:0.6s]",
						"-translate-x-1 rotate-6",
					)}
				>
					=&gt;
				</span>
				<span
					className={cls(
						"motion-safe:animate-pulse motion-safe:[animation-duration:6.3s] motion-safe:[animation-delay:0.9s]",
						"translate-x-1",
					)}
				>
					&amp;&amp;
				</span>
				<span
					className={cls(
						"motion-safe:animate-bounce motion-safe:[animation-duration:4.8s] motion-safe:[animation-delay:1.2s]",
						"-translate-y-1 -rotate-2",
					)}
				>
					||
				</span>

				<span
					className={cls(
						"motion-safe:animate-pulse motion-safe:[animation-duration:6.1s] motion-safe:[animation-delay:0.4s]",
						"translate-y-3",
					)}
				>
					+
				</span>
				<span
					className={cls(
						"motion-safe:animate-bounce motion-safe:[animation-duration:5.3s] motion-safe:[animation-delay:0.8s]",
						"-translate-y-2",
					)}
				>
					-
				</span>
				<span
					className={cls(
						"motion-safe:animate-pulse motion-safe:[animation-duration:7.2s] motion-safe:[animation-delay:1.5s]",
						"translate-x-2",
					)}
				>
					*
				</span>
				<span
					className={cls(
						"motion-safe:animate-bounce motion-safe:[animation-duration:4.4s] motion-safe:[animation-delay:0.3s]",
						"-translate-x-3",
					)}
				>
					/
				</span>
				<span
					className={cls(
						"motion-safe:animate-pulse motion-safe:[animation-duration:5.9s] motion-safe:[animation-delay:1.1s]",
						"translate-y-1",
					)}
				>
					%
				</span>

				<span
					className={cls(
						"motion-safe:animate-bounce motion-safe:[animation-duration:6.6s] motion-safe:[animation-delay:0.9s]",
						"-translate-y-1 rotate-3",
					)}
				>
					101
				</span>
				<span
					className={cls(
						"motion-safe:animate-pulse motion-safe:[animation-duration:4.7s] motion-safe:[animation-delay:0.5s]",
						"translate-y-2",
					)}
				>
					{"</>"}
				</span>
				<span
					className={cls(
						"motion-safe:animate-bounce motion-safe:[animation-duration:5.4s] motion-safe:[animation-delay:1.4s]",
						"-translate-x-1",
					)}
				>
					{"{ }"}
				</span>
				<span
					className={cls(
						"motion-safe:animate-pulse motion-safe:[animation-duration:6.9s] motion-safe:[animation-delay:0.6s]",
						"translate-x-1",
					)}
				>
					01
				</span>
				<span
					className={cls(
						"motion-safe:animate-bounce motion-safe:[animation-duration:5.1s] motion-safe:[animation-delay:1.2s]",
						"-translate-y-2",
					)}
				>
					!=
				</span>
			</div>
		</div>
	);
}
