import type {
	ActionBlockType,
	BlockType,
	CharacterState,
	KidsBlocklyLevel,
	PlaybackStep,
	ProgramBlock,
	RunResult,
} from "../types/kid-blockly.types";

const moveDelta: Record<CharacterState["dir"], { dx: number; dy: number }> = {
	N: { dx: 0, dy: -1 },
	E: { dx: 1, dy: 0 },
	S: { dx: 0, dy: 1 },
	W: { dx: -1, dy: 0 },
};

const turnLeft: Record<CharacterState["dir"], CharacterState["dir"]> = {
	N: "W",
	E: "N",
	S: "E",
	W: "S",
};

const turnRight: Record<CharacterState["dir"], CharacterState["dir"]> = {
	N: "E",
	E: "S",
	S: "W",
	W: "N",
};

function turn(
	dir: CharacterState["dir"],
	block: Extract<BlockType, "left" | "right">,
): CharacterState["dir"] {
	return block === "left" ? turnLeft[dir] : turnRight[dir];
}

function turnAround(dir: CharacterState["dir"]): CharacterState["dir"] {
	return turnRight[turnRight[dir]];
}

function isObstacle(level: KidsBlocklyLevel, x: number, y: number): boolean {
	return level.obstacles?.some((item) => item.x === x && item.y === y) ?? false;
}

function getMoveDelta(
	type: Extract<ActionBlockType, "move" | "back" | "jump">,
	dir: CharacterState["dir"],
) {
	const delta = moveDelta[dir];
	if (type === "back") {
		return { dx: -delta!.dx, dy: -delta!.dy, distance: 1 };
	}
	if (type === "jump") {
		return { dx: delta!.dx, dy: delta!.dy, distance: 2 };
	}
	return { ...delta, distance: 1 };
}

function isOutOfBounds(level: KidsBlocklyLevel, x: number, y: number): boolean {
	return x < 0 || y < 0 || x >= level.gridSize.cols || y >= level.gridSize.rows;
}

export function runProgram(
	level: KidsBlocklyLevel,
	program: ProgramBlock[],
): RunResult {
	let state: CharacterState = { ...level.start };
	const steps: PlaybackStep[] = [];

	if (program.length === 0) {
		return {
			status: "incomplete",
			finalState: state,
			steps,
			message: "Hãy kéo vài khối lệnh vào trước nhé.",
			stars: 0,
			isNewBest: false,
		};
	}

	for (const block of program) {
		if (block.type === "left" || block.type === "right") {
			state = { ...state, dir: turn(state.dir, block.type) };
			steps.push({
				state: { ...state },
				blockId: block.id,
				type: block.type,
				status: "running",
			});
			continue;
		}

		if (block.type === "turnAround") {
			state = { ...state, dir: turnAround(state.dir) };
			steps.push({
				state: { ...state },
				blockId: block.id,
				type: block.type,
				status: "running",
			});
			continue;
		}

		const delta = getMoveDelta(block.type, state.dir);
		let nextX = state.x;
		let nextY = state.y;
		const shouldCheckObstacle = block.type !== "jump";

		for (let stepIndex = 0; stepIndex < delta.distance; stepIndex += 1) {
			nextX += delta.dx;
			nextY += delta.dy;

			if (isOutOfBounds(level, nextX, nextY)) {
				steps.push({
					state: { ...state },
					blockId: block.id,
					type: block.type,
					status: "out-of-bounds",
				});
				return {
					status: "out-of-bounds",
					finalState: state,
					steps,
					failedBlockId: block.id,
					message: "Ôi, bạn đi ra ngoài bản đồ rồi.",
					stars: 0,
					isNewBest: false,
				};
			}

			if (shouldCheckObstacle && isObstacle(level, nextX, nextY)) {
				state = { ...state, x: nextX, y: nextY };
				steps.push({
					state: { ...state },
					blockId: block.id,
					type: block.type,
					status: "hit-wall",
				});
				return {
					status: "hit-wall",
					finalState: state,
					steps,
					failedBlockId: block.id,
					message: "Nhân vật bị chặn bởi chướng ngại vật.",
					stars: 0,
					isNewBest: false,
				};
			}
		}

		if (block.type === "jump" && isObstacle(level, nextX, nextY)) {
			state = { ...state, x: nextX, y: nextY };
			steps.push({
				state: { ...state },
				blockId: block.id,
				type: block.type,
				status: "hit-wall",
			});
			return {
				status: "hit-wall",
				finalState: state,
				steps,
				failedBlockId: block.id,
				message: "NhÃ¢n váº­t bá»‹ cháº·n bá»Ÿi chÆ°á»›ng ngáº¡i váº­t.",
				stars: 0,
				isNewBest: false,
			};
		}

		state = { ...state, x: nextX, y: nextY };
		steps.push({
			state: { ...state },
			blockId: block.id,
			type: block.type,
			status: "running",
		});
	}

	const reachedGoal = state.x === level.goal.x && state.y === level.goal.y;
	if (reachedGoal) {
		const lastStep = steps[steps.length - 1];
		if (lastStep) lastStep.status = "success";
		return {
			status: "success",
			finalState: state,
			steps,
			message: "Tuyệt lắm, bạn đã tới đích.",
			stars: 0,
			isNewBest: false,
		};
	}

	return {
		status: "incomplete",
		finalState: state,
		steps,
		message: "Nhân vật chưa tới đích, thử thêm hoặc đổi thứ tự khối lệnh nhé.",
		stars: 0,
		isNewBest: false,
	};
}
