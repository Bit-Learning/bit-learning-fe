import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";
import characterMouseAsset from "../asset/character_mouse.png";
import characterTomAsset from "../asset/character_tom.png";
import destinationAsset from "../asset/Destination.png";
import fenceAsset from "../asset/fence.png";
import rockAsset from "../asset/rock.png";
import startAsset from "../asset/start.png";
import tileGrassAsset from "../asset/tile_sea.png";
import treeAsset from "../asset/tree.png";
import wallAsset from "../asset/wall.png";
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

const obstacleAssets = [
	{ src: treeAsset, alt: "Cây chắn đường" },
	{ src: rockAsset, alt: "Đá chắn đường" },
	{ src: fenceAsset, alt: "Hàng rào chắn đường" },
	{ src: wallAsset, alt: "Tường chắn đường" },
];

function getObstacleAsset(x: number, y: number) {
	const index = (x * 7 + y * 11) % obstacleAssets.length;
	return obstacleAssets[index] ?? obstacleAssets[0];
}

function getTileBackgroundStyle(
	level: KidsBlocklyLevel,
	x: number,
	y: number,
): CSSProperties {
	const xPosition =
		level.gridSize.cols <= 1 ? 0 : (x / (level.gridSize.cols - 1)) * 100;
	const yPosition =
		level.gridSize.rows <= 1 ? 0 : (y / (level.gridSize.rows - 1)) * 100;

	return {
		backgroundImage: `url(${tileGrassAsset})`,
		backgroundSize: `${level.gridSize.cols * 100}% ${level.gridSize.rows * 100}%`,
		backgroundPosition: `${xPosition}% ${yPosition}%`,
	};
}

export function GameBoard({ level, character, isRunning }: GameBoardProps) {
	return (
		<div className="flex h-full flex-col rounded-[24px] border border-emerald-200 bg-white/90 p-4 shadow-[0_20px_44px_rgba(15,118,110,0.12)] backdrop-blur-sm">
			<div className="mb-3 flex items-center justify-between gap-4">
				<div className="min-w-0">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
						Sân chơi
					</p>
					<h2 className="mt-1 truncate text-xl font-bold text-slate-900">
						{level.title}
					</h2>
				</div>
				<div className="shrink-0 rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
					Đích: ({level.goal.x + 1}, {level.goal.y + 1})
				</div>
			</div>

			<div
				className="relative flex-1 overflow-hidden rounded-[22px] border border-emerald-200 bg-[linear-gradient(180deg,#f0fdf4_0%,#dcfce7_100%)] p-2"
				style={{
					aspectRatio: `${level.gridSize.cols} / ${level.gridSize.rows}`,
				}}
			>
				<div
					className="grid h-full w-full overflow-hidden rounded-[16px] border border-emerald-200/80"
					style={{
						gridTemplateColumns: `repeat(${level.gridSize.cols}, minmax(0, 1fr))`,
						gridTemplateRows: `repeat(${level.gridSize.rows}, minmax(0, 1fr))`,
					}}
				>
					{Array.from(
						{ length: level.gridSize.rows * level.gridSize.cols },
						(_, index) => {
							const x = index % level.gridSize.cols;
							const y = Math.floor(index / level.gridSize.cols);
							const isGoal = level.goal.x === x && level.goal.y === y;
							const isObstacle = level.obstacles?.some(
								(item) => item.x === x && item.y === y,
							);
							const isStart = level.start.x === x && level.start.y === y;
							const obstacleAsset = isObstacle ? getObstacleAsset(x, y) : null;

							return (
								<div
									key={`${x}-${y}`}
									className={cn(
										"relative overflow-hidden border border-emerald-100/80 transition-colors",
										isGoal
											? "border-amber-300 bg-amber-100/70"
											: "border-white/90 bg-white/60",
										isObstacle && "border-emerald-300 bg-emerald-100/90",
										isStart && "ring-2 ring-sky-300",
									)}
									style={getTileBackgroundStyle(level, x, y)}
								>
									<div className="absolute inset-0 bg-white/18" />
									{isStart && (
										<div className="absolute inset-0 flex items-center justify-center p-1.5">
											<img
												src={startAsset}
												alt="Điểm bắt đầu"
												className="h-full w-full object-contain opacity-90 drop-shadow-sm"
												draggable={false}
											/>
										</div>
									)}
									{isGoal && (
										<div className="absolute inset-0 flex items-center justify-center p-1.5">
											<img
												src={destinationAsset}
												alt="Đích đến"
												className="h-full w-full object-contain drop-shadow-sm"
												draggable={false}
											/>
										</div>
									)}
									{obstacleAsset && (
										<div className="absolute inset-0 flex items-center justify-center p-1.5">
											<img
												src={obstacleAsset.src}
												alt={obstacleAsset.alt}
												className="h-full w-full object-contain drop-shadow-sm"
												draggable={false}
											/>
										</div>
									)}
								</div>
							);
						},
					)}
				</div>

				<motion.div
					animate={{
						left: `calc(8px + ${character.x} * ((100% - 16px) / ${level.gridSize.cols}))`,
						top: `calc(8px + ${character.y} * ((100% - 16px) / ${level.gridSize.rows}))`,
						rotate: directionRotation[character.dir],
						scale: isRunning ? [1, 1.06, 1] : 1,
					}}
					transition={{
						left: { duration: 0.42, ease: "easeInOut" },
						top: { duration: 0.42, ease: "easeInOut" },
						rotate: { duration: 0.25, ease: "easeInOut" },
						scale: {
							duration: 0.35,
							repeat: isRunning ? Number.POSITIVE_INFINITY : 0,
						},
					}}
					className="pointer-events-none absolute z-20 flex h-[calc((100%_-_16px)/var(--rows))] w-[calc((100%_-_16px)/var(--cols))] items-center justify-center"
					style={
						{
							"--rows": level.gridSize.rows,
							"--cols": level.gridSize.cols,
						} as CSSProperties
					}
				>
					<img
						src={characterTomAsset}
						alt="Nhân vật chuột máy"
						className="h-full w-full object-contain drop-shadow-md"
						draggable={false}
					/>
				</motion.div>
			</div>
		</div>
	);
}
