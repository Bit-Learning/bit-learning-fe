import type { TreeSeriesOption } from "echarts/charts";

export type MindMap = {
	id: number;
	data: string;
	title: string;
	userId: number;
	code: string;
	createdAt: string;
};

export interface InputNode {
	id: string;
	label: string;
	level: number;
}

export interface InputConnection {
	source: string;
	target: string;
}

export interface InputData {
	centerNode: InputNode;
	nodes: InputNode[];
	connections: InputConnection[];
	totalNodes?: number;
	maxDepth?: number;
}

export interface EChartsTreeData {
	name: string;
	value: number;
	children?: EChartsTreeData[];
	itemStyle?: TreeSeriesOption["itemStyle"];
	label?: TreeSeriesOption["label"];
	symbolSize?: number;
}
