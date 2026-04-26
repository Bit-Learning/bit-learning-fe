import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { Flag, Trees } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import type { CharacterState, KidsBlocklyLevel } from "../types";

interface GameBoardProps {
	level: KidsBlocklyLevel;
	character: CharacterState;
	isRunning: boolean;
}

const directionRotation = {
	N: -90,
	E: 0,
	S: 90,
	W: 180,
};

export function GameBoard({ level, character, isRunning }: GameBoardProps) {
	return (
		<div className="rounded-[28px] border border-emerald-200 bg-white/80 p-4 shadow-[0_24px_60px_rgba(15,118,110,0.14)] backdrop-blur-sm">
			<div className="mb-4 flex items-center justify-between gap-4">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">Sân chơi</p>
					<h2 className="mt-1 text-2xl font-bold text-slate-900">{level.title}</h2>
					<p className="mt-1 text-sm text-slate-600">{level.subtitle}</p>
				</div>
				<div className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
					Đích: ({level.goal.x + 1}, {level.goal.y + 1})
				</div>
			</div>

			<div
				className="relative overflow-hidden rounded-[24px] border border-emerald-100 bg-[linear-gradient(180deg,#f0fdf4_0%,#dcfce7_100%)] p-3"
				style={{
					aspectRatio: `${level.gridSize.cols} / ${level.gridSize.rows}`,
				}}
			>
				<div
					className="grid h-full w-full gap-2"
					style={{
						gridTemplateColumns: `repeat(${level.gridSize.cols}, minmax(0, 1fr))`,
						gridTemplateRows: `repeat(${level.gridSize.rows}, minmax(0, 1fr))`,
					}}
				>
					{Array.from({ length: level.gridSize.rows * level.gridSize.cols }, (_, index) => {
						const x = index % level.gridSize.cols;
						const y = Math.floor(index / level.gridSize.cols);
						const isGoal = level.goal.x === x && level.goal.y === y;
						const isObstacle = level.obstacles?.some((item) => item.x === x && item.y === y);
						const isStart = level.start.x === x && level.start.y === y;

						return (
							<div
								key={`${x}-${y}`}
								className={cn(
									"relative rounded-2xl border transition-colors",
									isGoal ? "border-amber-300 bg-amber-100/80" : "border-white/90 bg-white/60",
									isObstacle && "border-emerald-300 bg-emerald-200/90",
									isStart && "ring-2 ring-sky-300",
								)}
							>
								{isGoal && (
									<div className="absolute inset-0 flex items-center justify-center">
										<Flag className="h-7 w-7 text-amber-500" />
									</div>
								)}
								{isObstacle && (
									<div className="absolute inset-0 flex items-center justify-center">
										<Trees className="h-7 w-7 text-emerald-700" />
									</div>
								)}
							</div>
						);
					})}
				</div>

				<motion.div
					animate={{
						left: `calc(${(character.x / level.gridSize.cols) * 100}% + 6px)`,
						top: `calc(${(character.y / level.gridSize.rows) * 100}% + 6px)`,
						rotate: directionRotation[character.dir],
						scale: isRunning ? [1, 1.06, 1] : 1,
					}}
					transition={{
						left: { duration: 0.42, ease: "easeInOut" },
						top: { duration: 0.42, ease: "easeInOut" },
						rotate: { duration: 0.25, ease: "easeInOut" },
						scale: { duration: 0.35, repeat: isRunning ? Number.POSITIVE_INFINITY : 0 },
					}}
					className="pointer-events-none absolute z-20 flex h-[calc(100%/var(--rows)-12px)] w-[calc(100%/var(--cols)-12px)] items-center justify-center"
					style={
						{
							"--rows": level.gridSize.rows,
							"--cols": level.gridSize.cols,
						} as CSSProperties
					}
				>
					<div className="flex h-full w-full items-center justify-center rounded-[22px] bg-[radial-gradient(circle_at_30%_30%,#fef3c7,#fb7185)] shadow-lg">
						<div className="text-3xl">🚗</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
