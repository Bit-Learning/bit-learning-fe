import type { EChartsOption } from "echarts";
import { TreeChart } from "echarts/charts";
import {
	TitleComponent,
	ToolboxComponent,
	TooltipComponent,
} from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import ReactECharts from "echarts-for-react";
import { X } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { updateMindMap } from "../services/mindmap.service";
import type {
	EChartsTreeData,
	InputData,
	InputNode,
	MindMap,
} from "../types/mindmap.types";

echarts.use([
	TreeChart,
	CanvasRenderer,
	TitleComponent,
	TooltipComponent,
	ToolboxComponent,
]);

function downloadImage(dataUrl: string) {
	const a = document.createElement("a");
	a.href = dataUrl;
	a.download = "mindmap.jpeg";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}

const convertToEChartsData = (data: InputData): EChartsTreeData => {
	const allNodes = new Map<string, InputNode>();
	allNodes.set(data.centerNode.id, data.centerNode);
	data.nodes.forEach((n) => void allNodes.set(n.id, n));

	const connections = new Map<string, string[]>();
	data.connections.forEach((conn) => {
		const children = connections.get(conn.source) || [];
		children.push(conn.target);
		connections.set(conn.source, children);
	});

	const buildTree = (
		nodeId: string,
		visited = new Set<string>(),
	): EChartsTreeData | null => {
		// Tránh chu trình: nếu node đã thăm, return null
		if (visited.has(nodeId)) {
			return null;
		}

		const node = allNodes.get(nodeId)!;
		const childrenIds = connections.get(nodeId) || [];

		// Thêm node vào visited set
		const newVisited = new Set(visited);
		newVisited.add(nodeId);

		const children = childrenIds
			.map((childId) => buildTree(childId, newVisited))
			.filter((child): child is EChartsTreeData => child !== null);

		const treeNode: EChartsTreeData = {
			name: node.label,
			value: node.level,
			children: children.length > 0 ? children : undefined,
		};

		const level = node.level;
		let nodeBorderColor: string;
		let nodeBgColor: string;
		const textColor = "#333";

		if (level === 0) {
			nodeBorderColor = "#0288d1";
			nodeBgColor = "#e1f5fe";
			treeNode.symbolSize = 15;

			treeNode.label = {
				backgroundColor: nodeBgColor,
				color: textColor,
				fontSize: 14,
				fontWeight: "bold",
			};
		} else {
			const borderIndex = (level - 1) % borderColors.length;
			const bgIndex = (level - 1) % backgroundColors.length;
			nodeBorderColor = borderColors[borderIndex] || "#fff";
			nodeBgColor = backgroundColors[bgIndex] || "#fff";

			treeNode.label = {
				backgroundColor: nodeBgColor,
				color: textColor,
			};
		}

		treeNode.itemStyle = {
			color: nodeBorderColor,
			borderColor: nodeBorderColor,
		};

		return treeNode;
	};

	return buildTree(data.centerNode.id) || { name: "Error", value: 0 };
};

const borderColors = [
	"#2e7d32", // L1 Green
	"#f9a825", // L2 Yellow
	"#616161", // L3 Gray
	"#c2185b", // L4 Pink
	"#673ab7", // L5 Purple
];
const backgroundColors = [
	"#e8f5e9", // L1 Green
	"#fffde7", // L2 Yellow
	"#f5f5f5", // L3 Gray
	"#fce4ec", // L4 Pink
	"#ede7f6", // L5 Purple
];

function Mindmap({ data }: { data: MindMap }) {
	const initialJsonData: InputData = JSON.parse(data.data);
	const echartRef = useRef<ReactECharts | null>(null);
	const [options, setOptions] = useState<EChartsOption>({});
	const [isLoading, setIsLoading] = useState(true);
	const [jsonData, setJsonData] = useState<InputData>(initialJsonData);
	const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
	const [editText, setEditText] = useState<string>("");
	const [hasChanges, setHasChanges] = useState(false);

	useLayoutEffect(() => {
		try {
			setIsLoading(true);
			const echartsData: EChartsTreeData = convertToEChartsData(jsonData);

			// Check if data has changed from initial
			const currentDataString = JSON.stringify(jsonData);
			const initialDataString = JSON.stringify(initialJsonData);
			setHasChanges(currentDataString !== initialDataString);

			const chartOptions: EChartsOption = {
				tooltip: {
					trigger: "item",
					triggerOn: "mousemove",
					formatter: "{b}",
				},
				series: [
					{
						type: "tree",
						data: [echartsData],
						layout: "orthogonal",
						orient: "LR",
						edgeForkPosition: "50%",
						top: "5%",
						bottom: "5%",
						left: "8%",
						right: "10%",

						symbol: "circle",
						symbolSize: 10,

						roam: true,
						scaleLimit: {
							min: 0.6,
							max: 2,
						},
						height: "95%",
						edgeShape: "curve",
						lineStyle: {
							color: "#aaa",
							width: 1.5,
							curveness: 0.4,
							type: "solid",
						},
						center: ["50%", "50%"],
						zoom: 0.95,
						itemStyle: {
							borderWidth: 2,
						},

						label: {
							show: true,
							position: "top",
							verticalAlign: "bottom",
							align: "center",
							fontSize: 12,
							padding: [5, 10],
							borderRadius: 4,
							borderColor: "auto",
							borderWidth: 1.5,
						},

						leaves: {
							label: {
								position: "right",
								verticalAlign: "middle",
								align: "left",
								borderColor: "auto",
								borderWidth: 1.5,
							},
						},

						emphasis: {
							focus: "self",
							blurScope: "coordinateSystem",
							itemStyle: {
								borderWidth: 7,
							},
						},
						initialTreeDepth: -100,
						expandAndCollapse: true,
						animationDuration: 550,
						animationDurationUpdate: 750,
					},
				],
			};

			setOptions(chartOptions);
		} catch (error) {
			console.error("Lỗi khi xử lý dữ liệu ECharts:", error);
		} finally {
			setIsLoading(false);
		}
	}, [jsonData, initialJsonData]);

	const onDownload = () => {
		const echartsInstance = echartRef.current?.getEchartsInstance();
		if (!echartsInstance) {
			console.error("Không tìm thấy ECharts instance");
			return;
		}
		const dataUrl = echartsInstance.getDataURL({
			type: "jpeg",
			backgroundColor: "#ffffff",
			pixelRatio: 2,
		});
		downloadImage(dataUrl);
	};

	const handleChartClick = (params: any) => {
		if (params.componentSubType === "tree" && params.data) {
			const nodeName = params.data.name;

			// Find node in jsonData
			let foundNode: InputNode | null = null;

			if (jsonData.centerNode.label === nodeName) {
				foundNode = jsonData.centerNode;
			} else {
				foundNode = jsonData.nodes.find((n) => n.label === nodeName) || null;
			}

			if (foundNode) {
				// Check if right click (button === 2)
				if (params.event?.event?.button === 2) {
					// Right click - open edit modal
					params.event.event.preventDefault();
					setEditingNodeId(foundNode.id);
					setEditText(foundNode.label);
				}
			}
		}
	};

	const handleChartContextMenu = (params: any) => {
		if (params.componentSubType === "tree" && params.data) {
			const nodeName = params.data.name;

			// Find node in jsonData
			let foundNode: InputNode | null = null;

			if (jsonData.centerNode.label === nodeName) {
				foundNode = jsonData.centerNode;
			} else {
				foundNode = jsonData.nodes.find((n) => n.label === nodeName) || null;
			}

			if (foundNode) {
				params.event?.event?.preventDefault();
				setEditingNodeId(foundNode.id);
				setEditText(foundNode.label);
			}
		}
	};

	const updateNodeLabel = (nodeId: string, newLabel: string) => {
		if (!newLabel.trim()) return;

		const updatedData = { ...jsonData };

		if (updatedData.centerNode.id === nodeId) {
			updatedData.centerNode.label = newLabel;
		} else {
			updatedData.nodes = updatedData.nodes.map((node) =>
				node.id === nodeId ? { ...node, label: newLabel } : node,
			);
		}

		setJsonData(updatedData);
		setEditingNodeId(null);
		setEditText("");
	};

	const handleEditKeyDown = (
		nodeId: string,
		e: React.KeyboardEvent<HTMLInputElement>,
	) => {
		if (e.key === "Enter") {
			updateNodeLabel(nodeId, editText);
		} else if (e.key === "Escape") {
			setEditingNodeId(null);
			setEditText("");
		}
	};

	const handleSave = async () => {
		try {
			const payload = { data: JSON.stringify(jsonData) };
			await updateMindMap(payload, data.code, data.userId);
			setHasChanges(false);
		} catch (err) {
			console.error("Failed to update mindmap:", err);
		}
	};

	if (isLoading) {
		return <div>Đang tải sơ đồ...</div>;
	}

	return (
		<div
			style={{
				width: "100vw",
				height: "100vh",
				position: "relative",
				overflow: "hidden",
			}}
		>
			{/* Download and Save buttons */}
			<div
				style={{
					position: "absolute",
					top: 10,
					right: 25,
					zIndex: 10,
					display: "flex",
					gap: "8px",
				}}
			>
				{hasChanges && (
					<button
						onClick={handleSave}
						style={{
							padding: "10px 15px",
							background: "#28a745",
							color: "white",
							border: "none",
							borderRadius: "5px",
							cursor: "pointer",
							boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
							fontWeight: "500",
						}}
					>
						Lưu
					</button>
				)}
				<button
					onClick={onDownload}
					style={{
						padding: "10px 15px",
						background: "#007bff",
						color: "white",
						border: "none",
						borderRadius: "5px",
						cursor: "pointer",
						boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
					}}
				>
					Download
				</button>
			</div>

			{/* ECharts mindmap */}
			<ReactECharts
				ref={echartRef}
				option={options}
				style={{ width: "100%", height: "100%" }}
				notMerge={true}
				lazyUpdate={true}
				onEvents={{
					click: handleChartClick,
					contextmenu: handleChartContextMenu,
				}}
				onChartReady={(chartInstance) => {
					// Prevent browser context menu on the chart
					const domElement = chartInstance.getDom();
					if (domElement) {
						domElement.addEventListener("contextmenu", (e) => {
							e.preventDefault();
						});
					}
				}}
			/>

			{/* Edit modal dialog */}
			{editingNodeId && (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: "rgba(0, 0, 0, 0.5)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						zIndex: 100,
					}}
					onClick={() => setEditingNodeId(null)}
				>
					<div
						style={{
							backgroundColor: "white",
							borderRadius: "8px",
							padding: "24px",
							minWidth: "400px",
							boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: "16px",
							}}
						>
							<h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
								Chỉnh sửa nội dung
							</h2>
							<button
								onClick={() => setEditingNodeId(null)}
								style={{
									background: "none",
									border: "none",
									cursor: "pointer",
									padding: "4px",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<X size={20} color="#666" />
							</button>
						</div>

						<div style={{ marginBottom: "20px" }}>
							<span
								style={{
									display: "block",
									marginBottom: "8px",
									fontSize: "14px",
									fontWeight: "500",
								}}
							>
								Nội dung
							</span>
							<input
								type="text"
								value={editText}
								onChange={(e) => setEditText(e.target.value)}
								onKeyDown={(e) => handleEditKeyDown(editingNodeId, e)}
								style={{
									width: "100%",
									padding: "8px 12px",
									border: "1px solid #ddd",
									borderRadius: "4px",
									fontSize: "14px",
									boxSizing: "border-box",
									fontFamily: "inherit",
								}}
								placeholder="Nhập nội dung node"
							/>
						</div>

						<div
							style={{
								display: "flex",
								gap: "8px",
								justifyContent: "flex-end",
							}}
						>
							<button
								onClick={() => setEditingNodeId(null)}
								style={{
									padding: "8px 16px",
									background: "#f0f0f0",
									border: "1px solid #ddd",
									borderRadius: "4px",
									cursor: "pointer",
									fontSize: "14px",
									fontWeight: "500",
								}}
							>
								Hủy
							</button>
							<button
								onClick={() => updateNodeLabel(editingNodeId, editText)}
								type="button"
								style={{
									padding: "8px 16px",
									background: "#007bff",
									color: "white",
									border: "none",
									borderRadius: "4px",
									cursor: "pointer",
									fontSize: "14px",
									fontWeight: "500",
								}}
							>
								Lưu
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default Mindmap;
