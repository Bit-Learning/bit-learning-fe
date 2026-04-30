import { useEffect, useMemo, useRef } from "react";
import * as Blockly from "blockly/core";
import "blockly/blocks";
import { cn } from "@workspace/ui/lib/utils";
import type { ActionBlockType, BlockType, ProgramBlock } from "../types";

interface KidsBlocklyWorkspaceProps {
	allowedBlocks: BlockType[];
	isRunning: boolean;
	activeBlockId: string | null;
	resetSignal: number;
	className?: string;
	onProgramChange: (program: ProgramBlock[]) => void;
}

const blockTypeByBlocklyType: Record<string, ActionBlockType> = {
	kids_move: "move",
	kids_left: "left",
	kids_right: "right",
	kids_back: "back",
	kids_turn_around: "turnAround",
	kids_jump: "jump",
};

const blocklyTypeByBlockType: Record<BlockType, string> = {
	move: "kids_move",
	left: "kids_left",
	right: "kids_right",
	back: "kids_back",
	turnAround: "kids_turn_around",
	jump: "kids_jump",
	repeat: "kids_repeat",
};

const movementBlocks = new Set<BlockType>(["move", "back", "jump"]);
const directionBlocks = new Set<BlockType>(["left", "right", "turnAround"]);
const controlBlocks = new Set<BlockType>(["repeat"]);

let blocksRegistered = false;

function registerKidsBlocks() {
	if (blocksRegistered) return;

	Blockly.common.defineBlocksWithJsonArray([
		{
			type: "kids_start",
			message0: "🚩 Bắt đầu",
			nextStatement: null,
			colour: 205,
			tooltip: "Điểm bắt đầu của chương trình",
			helpUrl: "",
		},
		{
			type: "kids_move",
			message0: "⬆️ Đi thẳng 1 ô",
			previousStatement: null,
			nextStatement: null,
			colour: 160,
			tooltip: "Nhân vật tiến lên 1 ô",
			helpUrl: "",
		},
		{
			type: "kids_left",
			message0: "↩️ Rẽ trái",
			previousStatement: null,
			nextStatement: null,
			colour: 30,
			tooltip: "Nhân vật quay sang trái",
			helpUrl: "",
		},
		{
			type: "kids_right",
			message0: "↪️ Rẽ phải",
			previousStatement: null,
			nextStatement: null,
			colour: 210,
			tooltip: "Nhân vật quay sang phải",
			helpUrl: "",
		},
		{
			type: "kids_back",
			message0: "⬇️ Đi lùi 1 ô",
			previousStatement: null,
			nextStatement: null,
			colour: 120,
			tooltip: "Nhân vật lùi lại 1 ô nhưng vẫn nhìn cùng hướng",
			helpUrl: "",
		},
		{
			type: "kids_turn_around",
			message0: "🔄 Quay lại",
			previousStatement: null,
			nextStatement: null,
			colour: 285,
			tooltip: "Nhân vật quay ngược hướng",
			helpUrl: "",
		},
		{
			type: "kids_jump",
			message0: "⭐ Nhảy 2 ô",
			previousStatement: null,
			nextStatement: null,
			colour: 45,
			tooltip: "Nhân vật đi nhanh 2 ô theo hướng đang nhìn",
			helpUrl: "",
		},
		{
			type: "kids_repeat",
			message0: "🔁 Lặp lại %1 lần",
			args0: [
				{
					type: "field_dropdown",
					name: "TIMES",
					options: [
						["2", "2"],
						["3", "3"],
						["4", "4"],
						["5", "5"],
					],
				},
			],
			message1: "làm %1",
			args1: [
				{
					type: "input_statement",
					name: "DO",
				},
			],
			previousStatement: null,
			nextStatement: null,
			colour: 260,
			tooltip: "Lặp lại các khối bên trong nhiều lần",
			helpUrl: "",
		},
	]);

	blocksRegistered = true;
}

function buildToolboxXml(allowedBlocks: BlockType[]) {
	const movement = allowedBlocks
		.filter((type) => movementBlocks.has(type))
		.map((type) => `<block type="${blocklyTypeByBlockType[type]}"></block>`)
		.join("");
	const directions = allowedBlocks
		.filter((type) => directionBlocks.has(type))
		.map((type) => `<block type="${blocklyTypeByBlockType[type]}"></block>`)
		.join("");
	const controls = allowedBlocks
		.filter((type) => controlBlocks.has(type))
		.map((type) => `<block type="${blocklyTypeByBlockType[type]}"></block>`)
		.join("");

	return `
		<xml xmlns="https://developers.google.com/blockly/xml">
			${movement ? `<category name="Di chuyển" colour="160">${movement}</category>` : ""}
			${directions ? `<category name="Đổi hướng" colour="210">${directions}</category>` : ""}
			${controls ? `<category name="Lặp lại" colour="260">${controls}</category>` : ""}
		</xml>
	`;
}

function loadStartBlock(workspace: Blockly.WorkspaceSvg) {
	workspace.clear();
	const xml = Blockly.utils.xml.textToDom(`
		<xml xmlns="https://developers.google.com/blockly/xml">
			<block type="kids_start" x="28" y="28" deletable="false" movable="false"></block>
		</xml>
	`);
	Blockly.Xml.domToWorkspace(xml, workspace);
}

function readStatementChain(
	block: Blockly.Block | null,
	depth = 0,
): ProgramBlock[] {
	const program: ProgramBlock[] = [];
	let cursor = block;

	while (cursor) {
		if (cursor.type === "kids_repeat" && depth < 4) {
			const times = Number.parseInt(String(cursor.getFieldValue("TIMES")), 10);
			const repeatCount = Number.isFinite(times) ? times : 1;
			const nestedProgram = readStatementChain(
				cursor.getInputTargetBlock("DO"),
				depth + 1,
			);
			for (let index = 0; index < repeatCount; index += 1) {
				program.push(...nestedProgram);
			}
		} else {
			const type = blockTypeByBlocklyType[cursor.type];
			if (type) {
				program.push({ id: cursor.id, type });
			}
		}
		cursor = cursor.getNextBlock();
	}

	return program;
}

function readProgram(workspace: Blockly.WorkspaceSvg): ProgramBlock[] {
	const startBlock = workspace.getBlocksByType("kids_start", false)[0];
	return readStatementChain(startBlock?.getNextBlock() ?? null);
}

export function KidsBlocklyWorkspace({
	allowedBlocks,
	isRunning,
	activeBlockId,
	resetSignal,
	className,
	onProgramChange,
}: KidsBlocklyWorkspaceProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
	const toolboxXml = useMemo(
		() => buildToolboxXml(allowedBlocks),
		[allowedBlocks],
	);

	useEffect(() => {
		registerKidsBlocks();
		if (!containerRef.current) return;

		const workspace = Blockly.inject(containerRef.current, {
			toolbox: toolboxXml,
			trashcan: true,
			zoom: {
				controls: true,
				wheel: true,
				startScale: 0.9,
				maxScale: 1.25,
				minScale: 0.65,
				scaleSpeed: 1.08,
			},
			move: {
				scrollbars: true,
				drag: true,
				wheel: false,
			},
			grid: {
				spacing: 28,
				length: 4,
				colour: "#dbeafe",
				snap: true,
			},
			renderer: "zelos",
		});

		workspaceRef.current = workspace;
		loadStartBlock(workspace);
		onProgramChange([]);

		const listener = (event: Blockly.Events.Abstract) => {
			if (event.isUiEvent) return;
			onProgramChange(readProgram(workspace));
		};

		workspace.addChangeListener(listener);
		Blockly.svgResize(workspace);

		return () => {
			workspace.removeChangeListener(listener);
			workspace.dispose();
			workspaceRef.current = null;
		};
	}, [onProgramChange, toolboxXml]);

	useEffect(() => {
		const workspace = workspaceRef.current;
		if (resetSignal < 0) return;
		if (!workspace) return;

		workspace.updateToolbox(toolboxXml);
		loadStartBlock(workspace);
		onProgramChange([]);
		Blockly.svgResize(workspace);
	}, [onProgramChange, resetSignal, toolboxXml]);

	useEffect(() => {
		const workspace = workspaceRef.current;
		if (!workspace) return;

		workspace.highlightBlock(activeBlockId);
	}, [activeBlockId]);

	return (
		<div
			className={cn(
				"relative h-full min-h-[560px] overflow-hidden rounded-[22px] border border-sky-100 bg-white shadow-inner",
				className,
			)}
		>
			<div ref={containerRef} className="h-full min-h-[560px] w-full" />
			{isRunning && (
				<div className="pointer-events-auto absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
			)}
		</div>
	);
}
