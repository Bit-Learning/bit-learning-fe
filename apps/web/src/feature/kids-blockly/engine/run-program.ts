import type {
	BlockType,
	CharacterState,
	KidsBlocklyLevel,
	PlaybackStep,
	ProgramBlock,
	RunResult,
} from "../types";

const directionOrder = ["N", "E", "S", "W"] as const;

const moveDelta: Record<CharacterState["dir"], { dx: number; dy: number }> = {
	N: { dx: 0, dy: -1 },
	E: { dx: 1, dy: 0 },
	S: { dx: 0, dy: 1 },
	W: { dx: -1, dy: 0 },
};

function turn(dir: CharacterState["dir"], block: Extract<BlockType, "left" | "right">): CharacterState["dir"] {
	const currentIndex = directionOrder.indexOf(dir);
	const delta = block === "left" ? -1 : 1;
	return directionOrder[(currentIndex + delta + directionOrder.length) % directionOrder.length];
}

function isObstacle(level: KidsBlocklyLevel, x: number, y: number): boolean {
	return level.obstacles?.some((item) => item.x === x && item.y === y) ?? false;
}

export function runProgram(level: KidsBlocklyLevel, program: ProgramBlock[]): RunResult {
	let state: CharacterState = { ...level.start };
	const steps: PlaybackStep[] = [];

	if (program.length === 0) {
		return {
			status: "incomplete",
			finalState: state,
			steps,
			message: "Hãy kéo vài khối lệnh vào trước nhé.",
		};
	}

	for (const block of program) {
		if (block.type === "left" || block.type === "right") {
			state = { ...state, dir: turn(state.dir, block.type) };
			steps.push({ state: { ...state }, blockId: block.id, type: block.type, status: "running" });
			continue;
		}

		const delta = moveDelta[state.dir];
		const nextX = state.x + delta.dx;
		const nextY = state.y + delta.dy;

		if (nextX < 0 || nextY < 0 || nextX >= level.gridSize.cols || nextY >= level.gridSize.rows) {
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
			};
		}

		if (isObstacle(level, nextX, nextY)) {
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
			};
		}

		state = { ...state, x: nextX, y: nextY };
		steps.push({ state: { ...state }, blockId: block.id, type: block.type, status: "running" });
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
		};
	}

	return {
		status: "incomplete",
		finalState: state,
		steps,
		message: "Nhân vật chưa tới đích, thử thêm hoặc đổi thứ tự khối lệnh nhé.",
	};
}
