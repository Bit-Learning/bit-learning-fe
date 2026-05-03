export type Direction = "N" | "E" | "S" | "W";

export type ActionBlockType =
	| "move"
	| "left"
	| "right"
	| "back"
	| "turnAround"
	| "jump";

export type ControlBlockType = "repeat";

export type BlockType = ActionBlockType | ControlBlockType;

export interface Position {
	x: number;
	y: number;
}

export interface CharacterState extends Position {
	dir: Direction;
}

export interface KidsBlocklyLevel {
	id: string;
	title: string;
	subtitle: string;
	gridSize: { rows: number; cols: number };
	start: CharacterState;
	goal: Position;
	obstacles?: Position[];
	allowedBlocks: BlockType[];
	hint: string;
	par: number;
}

export interface ProgramBlock {
	id: string;
	type: ActionBlockType;
}

export interface PlaybackStep {
	state: CharacterState;
	blockId: string;
	type: ActionBlockType;
	status: "running" | "success" | "hit-wall" | "out-of-bounds";
}

export interface RunResult {
	status: "success" | "hit-wall" | "out-of-bounds" | "incomplete";
	finalState: CharacterState;
	steps: PlaybackStep[];
	failedBlockId?: string;
	message: string;
	stars: number;
	isNewBest: boolean;
	unlockedNextLevelId?: string;
}

export interface KidsBlocklyProgressResponse {
	unlockedLevelIds: string[];
	starsByLevel: Record<string, number>;
	completedLevelIds: string[];
	totalStars: number;
	lastPlayedLevelId?: string;
}

export interface KidsBlocklyBootstrapResponse {
	levels: KidsBlocklyLevel[];
	progress: KidsBlocklyProgressResponse;
}

export interface SubmitKidsBlocklyRunRequest {
	program: ProgramBlock[];
	clientRunId?: string;
}

export interface SubmitKidsBlocklyRunResponse {
	runId: string;
	levelId: string;
	result: RunResult;
	progress: KidsBlocklyProgressResponse;
}
