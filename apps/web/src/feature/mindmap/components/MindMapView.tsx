import {
	ReactFlow,
	Background,
	BackgroundVariant,
	Controls,
	MiniMap,
	getViewportForBounds,
	useNodesState,
	useEdgesState,
	type Node,
	type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CurriculumChapterPicker } from "@/feature/matrix/components/CurriculumChapterPicker";
import { toast } from "@/shared/components/Sonner";
import { extractApiErrorMessage } from "@/shared/lib/api-error";
import { Button } from "@workspace/ui/components/Button";
import { Input } from "@workspace/ui/components/Input";
import {
	Loader2,
	Sparkles,
	BookOpen,
	ImageDown,
	BookMarked,
	Pencil,
	Wand2,
	History,
	Eye,
	AlertTriangle,
	Save,
	Maximize2,
	Minimize2,
} from "lucide-react";
import {
	useGenerateMindMap,
	useGetMindMapGallery,
	useRefineMindMap,
	useSaveMindMapTree,
} from "../queries/use-mindmap-queries";
import {
	mindMapNodeTypes,
	mindMapRadialNodeTypes,
	mindMapSymmetricNodeTypes,
} from "./MindMapNodes";
import type {
	MindMapGenerateResponse,
	MindMapMetadata,
	MindMapTreeNode,
	MindMapVersionDto,
	SavedMindMapDto,
} from "../types/mindmap.type";
import { runElkLayout, getAlgorithmFamily } from "../utils/elk-layout";
import SavedMindMapsPanel from "./SavedMindMapsPanel";
import VersionHistorySidebar from "./VersionHistorySidebar";
import {
	StructurePicker,
	ThemePicker,
	ShapePicker,
	type NodeShape,
} from "./GalleryPicker";
import BitCoinIcon from "@/shared/components/BitCoinIcon";

type ActiveTab = "generate" | "saved";
type GenerateMode = "topic" | "lesson";

function addChildToTree(
	tree: MindMapTreeNode,
	parentId: string,
	newChild: MindMapTreeNode,
): MindMapTreeNode {
	if (tree.id === parentId) {
		return { ...tree, children: [...(tree.children ?? []), newChild] };
	}
	return {
		...tree,
		children: (tree.children ?? []).map((c) =>
			addChildToTree(c, parentId, newChild),
		),
	};
}

function removeNodeFromTree(
	tree: MindMapTreeNode,
	nodeId: string,
): MindMapTreeNode | null {
	if (tree.id === nodeId) return null;
	const children = (tree.children ?? [])
		.map((c) => removeNodeFromTree(c, nodeId))
		.filter((c): c is MindMapTreeNode => c !== null);
	return { ...tree, children };
}

function findNodeInTree(
	tree: MindMapTreeNode,
	id: string,
): MindMapTreeNode | null {
	if (tree.id === id) return tree;
	for (const child of tree.children ?? []) {
		const found = findNodeInTree(child, id);
		if (found) return found;
	}
	return null;
}

function getExportNodeSize(node: Node): { width: number; height: number } {
	if (node.type === "mindMapRoot") return { width: 220, height: 80 };
	if (node.type === "mindMapBranch") return { width: 190, height: 70 };
	return { width: 170, height: 60 };
}

function getExportNodeTypography(node: Node) {
	if (node.type === "mindMapRoot") {
		return {
			labelFont: "800 15px Inter, ui-sans-serif, system-ui",
			descriptionFont: "400 11px Inter, ui-sans-serif, system-ui",
			lineHeight: 18,
			descriptionLineHeight: 13,
			horizontalPadding: 28,
			verticalPadding: 22,
		};
	}

	if (node.type === "mindMapBranch") {
		return {
			labelFont: "700 13px Inter, ui-sans-serif, system-ui",
			descriptionFont: "400 11px Inter, ui-sans-serif, system-ui",
			lineHeight: 15,
			descriptionLineHeight: 13,
			horizontalPadding: 28,
			verticalPadding: 18,
		};
	}

	return {
		labelFont: "600 12px Inter, ui-sans-serif, system-ui",
		descriptionFont: "400 11px Inter, ui-sans-serif, system-ui",
		lineHeight: 15,
		descriptionLineHeight: 13,
		horizontalPadding: 24,
		verticalPadding: 16,
	};
}

function getStringStyleValue(value: unknown, fallback: string) {
	return typeof value === "string" && !value.includes("gradient")
		? value
		: fallback;
}

function roundedRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number,
) {
	const safeRadius = Math.min(radius, width / 2, height / 2);
	ctx.beginPath();
	ctx.moveTo(x + safeRadius, y);
	ctx.lineTo(x + width - safeRadius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
	ctx.lineTo(x + width, y + height - safeRadius);
	ctx.quadraticCurveTo(
		x + width,
		y + height,
		x + width - safeRadius,
		y + height,
	);
	ctx.lineTo(x + safeRadius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
	ctx.lineTo(x, y + safeRadius);
	ctx.quadraticCurveTo(x, y, x + safeRadius, y);
	ctx.closePath();
}

function drawNodeShape(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	shape: NodeShape | undefined,
	radius: number,
) {
	if (shape === "circle") {
		ctx.beginPath();
		ctx.ellipse(
			x + width / 2,
			y + height / 2,
			width / 2,
			height / 2,
			0,
			0,
			Math.PI * 2,
		);
		return;
	}

	if (shape === "diamond") {
		ctx.beginPath();
		ctx.moveTo(x + width / 2, y);
		ctx.lineTo(x + width, y + height / 2);
		ctx.lineTo(x + width / 2, y + height);
		ctx.lineTo(x, y + height / 2);
		ctx.closePath();
		return;
	}

	if (shape === "hexagon") {
		ctx.beginPath();
		ctx.moveTo(x + width * 0.25, y);
		ctx.lineTo(x + width * 0.75, y);
		ctx.lineTo(x + width, y + height / 2);
		ctx.lineTo(x + width * 0.75, y + height);
		ctx.lineTo(x + width * 0.25, y + height);
		ctx.lineTo(x, y + height / 2);
		ctx.closePath();
		return;
	}

	roundedRect(ctx, x, y, width, height, shape === "pill" ? height / 2 : radius);
}

function wrapCanvasText(
	ctx: CanvasRenderingContext2D,
	text: string,
	maxWidth: number,
	maxLines: number,
) {
	const words = text.split(/\s+/).filter(Boolean);
	const lines: string[] = [];
	let currentLine = "";

	for (const word of words) {
		const candidate = currentLine ? `${currentLine} ${word}` : word;
		if (ctx.measureText(candidate).width <= maxWidth) {
			currentLine = candidate;
			continue;
		}

		if (currentLine) lines.push(currentLine);
		currentLine = word;
		if (lines.length >= maxLines) break;
	}

	if (currentLine && lines.length < maxLines) lines.push(currentLine);
	if (lines.length > maxLines) return lines.slice(0, maxLines);
	if (lines.length === maxLines && words.length > 0) {
		const last = lines[maxLines - 1];
		if (last && ctx.measureText(text).width > maxWidth) {
			lines[maxLines - 1] = `${last.replace(/\s+\S+$/, "") || last}...`;
		}
	}
	return lines;
}

function wrapCanvasTextFully(
	ctx: CanvasRenderingContext2D,
	text: string,
	maxWidth: number,
) {
	const words = text.split(/\s+/).filter(Boolean);
	const lines: string[] = [];
	let currentLine = "";

	for (const word of words) {
		const candidate = currentLine ? `${currentLine} ${word}` : word;
		if (ctx.measureText(candidate).width <= maxWidth) {
			currentLine = candidate;
			continue;
		}

		if (currentLine) {
			lines.push(currentLine);
			currentLine = word;
			continue;
		}

		let chunk = "";
		for (const char of word) {
			const nextChunk = `${chunk}${char}`;
			if (ctx.measureText(nextChunk).width <= maxWidth) {
				chunk = nextChunk;
				continue;
			}
			if (chunk) lines.push(chunk);
			chunk = char;
		}
		currentLine = chunk;
	}

	if (currentLine) lines.push(currentLine);
	return lines;
}

export default function MindMapView() {
	const [mode, setMode] = useState<GenerateMode>("topic");
	const [topic, setTopic] = useState("");
	const [curriculumId, setCurriculumId] = useState<number | null>(null);
	const [subjectId, setSubjectId] = useState<number | null>(null);
	const [chapterId, setChapterId] = useState<number | null>(null);
	const [lessonId, setLessonId] = useState<number | null>(null);
	const [sourceError, setSourceError] = useState<string | null>(null);
	const [maxDepth, setMaxDepth] = useState(3);
	const [maxBranches, setMaxBranches] = useState(3);
	const [selectedStructureId, setSelectedStructureId] = useState<
		number | undefined
	>(undefined);
	const [selectedThemeId, setSelectedThemeId] = useState<number | undefined>(
		undefined,
	);
	const [nodeShape, setNodeShape] = useState<NodeShape>("rounded");
	const nodeShapeRef = useRef<NodeShape>("rounded");
	const addChildCallbackRef = useRef<(parentId: string) => void>(() => {});
	const deleteNodeCallbackRef = useRef<(nodeId: string) => void>(() => {});

	const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
	const [metadata, setMetadata] = useState<MindMapMetadata | null>(null);
	const [currentTitle, setCurrentTitle] = useState("");
	const [isApplyingLayout, setIsApplyingLayout] = useState(false);
	const [canvasBackground, setCanvasBackground] = useState<string | undefined>(
		undefined,
	);

	const [currentMindMapId, setCurrentMindMapId] = useState<number | null>(null);
	const [currentVersion, setCurrentVersion] = useState(0);

	const [isPreviewingVersion, setIsPreviewingVersion] = useState(false);
	const [previewVersionNumber, setPreviewVersionNumber] = useState<
		number | null
	>(null);
	const previewBackupRef = useRef<{ nodes: Node[]; edges: Edge[] } | null>(
		null,
	);
	const previewTreeRef = useRef<MindMapTreeNode | null>(null);
	const currentTreeRef = useRef<MindMapTreeNode | null>(null);
	const skipPickerEffectRef = useRef(false);

	const [showVersionSidebar, setShowVersionSidebar] = useState(false);
	const [activeTab, setActiveTab] = useState<ActiveTab>("generate");
	const [isFullscreen, setIsFullscreen] = useState(false);

	const withExtras = useCallback(
		(rfNodes: Node[]): Node[] =>
			rfNodes.map((n) => ({
				...n,
				data: {
					...n.data,
					nodeShape: nodeShapeRef.current,
					onAddChild: () => addChildCallbackRef.current(n.id),
					onDeleteNode:
						n.type !== "mindMapRoot"
							? () => deleteNodeCallbackRef.current(n.id)
							: undefined,
				},
			})),
		[],
	);

	const [refineInstruction, setRefineInstruction] = useState("");

	const [editingNode, setEditingNode] = useState<{
		id: string;
		label: string;
		description: string;
	} | null>(null);

	const flowContainerRef = useRef<HTMLDivElement | null>(null);

	const { data: galleryData, isLoading: isGalleryLoading } =
		useGetMindMapGallery();
	const { mutate: generate, isPending: isGenerating } = useGenerateMindMap();
	const { mutate: refine, isPending: isRefining } = useRefineMindMap();
	const { mutate: saveTree, isPending: isSaving } = useSaveMindMapTree();

	const gallery = galleryData?.data?.data;

	useEffect(() => {
		if (!isFullscreen) return;

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsFullscreen(false);
			}
		};

		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		window.addEventListener("keydown", handleEscape);

		return () => {
			document.body.style.overflow = originalOverflow;
			window.removeEventListener("keydown", handleEscape);
		};
	}, [isFullscreen]);

	useEffect(() => {
		if (!gallery) return;
		if (selectedStructureId === undefined && gallery.structures.length > 0) {
			setSelectedStructureId(gallery.structures[0]?.id);
		}
		if (selectedThemeId === undefined && gallery.themes.length > 0) {
			setSelectedThemeId(gallery.themes[0]?.id);
		}
	}, [gallery, selectedStructureId, selectedThemeId]);

	useEffect(() => {
		if (skipPickerEffectRef.current) {
			skipPickerEffectRef.current = false;
			return;
		}

		const tree = isPreviewingVersion
			? previewTreeRef.current
			: currentTreeRef.current;
		if (!tree || !gallery) return;

		const structure = gallery.structures.find(
			(s) => s.id === selectedStructureId,
		);
		const theme = gallery.themes.find((t) => t.id === selectedThemeId);
		if (!structure || !theme) return;

		let cancelled = false;
		setIsApplyingLayout(true);
		runElkLayout(tree, structure, theme, nodeShapeRef.current)
			.then(({ nodes: rfNodes, edges: rfEdges }) => {
				if (cancelled) return;
				setNodes(withExtras(rfNodes));
				setEdges(rfEdges);
				setCanvasBackground(theme.background);
			})
			.catch((error) =>
				toast.error({
					title: "Lỗi khi cập nhật layout",
					description: extractApiErrorMessage(
						error,
						"Không thể cập nhật layout.",
					),
				}),
			)
			.finally(() => {
				if (!cancelled) setIsApplyingLayout(false);
			});

		return () => {
			cancelled = true;
		};
	}, [
		selectedStructureId,
		selectedThemeId,
		isPreviewingVersion,
		gallery,
		setEdges,
		setNodes,
		withExtras,
	]);

	useEffect(() => {
		nodeShapeRef.current = nodeShape;
		setNodes((prev: Node[]) =>
			prev.map((n: Node) => ({ ...n, data: { ...n.data, nodeShape } })),
		);
	}, [nodeShape, setNodes]);

	const handleAddChildNode = useCallback(
		async (parentId: string) => {
			const tree = currentTreeRef.current;
			if (!tree || !gallery || isPreviewingVersion) return;
			const structure = gallery.structures.find(
				(s) => s.id === selectedStructureId,
			);
			const theme = gallery.themes.find((t) => t.id === selectedThemeId);
			if (!structure || !theme) return;

			const parentInTree = findNodeInTree(tree, parentId);
			const newType: "branch" | "leaf" =
				parentInTree?.type === "root" ? "branch" : "leaf";
			const newChild: MindMapTreeNode = {
				id: `node-${Date.now()}`,
				label: "Nút mới",
				description: "",
				type: newType,
				children: [],
			};
			const newTree = addChildToTree(tree, parentId, newChild);
			currentTreeRef.current = newTree;

			setIsApplyingLayout(true);
			try {
				const { nodes: rfNodes, edges: rfEdges } = await runElkLayout(
					newTree,
					structure,
					theme,
					nodeShapeRef.current,
				);
				setNodes(withExtras(rfNodes));
				setEdges(rfEdges);
			} catch (error) {
				toast.error({
					title: "Lỗi khi thêm nút",
					description: extractApiErrorMessage(error, "Không thể thêm nút."),
				});
			} finally {
				setIsApplyingLayout(false);
			}
		},
		[
			gallery,
			selectedStructureId,
			selectedThemeId,
			isPreviewingVersion,
			withExtras,
			setNodes,
			setEdges,
		],
	);

	const handleDeleteNode = useCallback(
		async (nodeId: string) => {
			const tree = currentTreeRef.current;
			if (!tree || !gallery || isPreviewingVersion || tree.id === nodeId)
				return;
			const structure = gallery.structures.find(
				(s) => s.id === selectedStructureId,
			);
			const theme = gallery.themes.find((t) => t.id === selectedThemeId);
			if (!structure || !theme) return;

			const newTree = removeNodeFromTree(tree, nodeId);
			if (!newTree) return;
			currentTreeRef.current = newTree;

			setIsApplyingLayout(true);
			try {
				const { nodes: rfNodes, edges: rfEdges } = await runElkLayout(
					newTree,
					structure,
					theme,
					nodeShapeRef.current,
				);
				setNodes(withExtras(rfNodes));
				setEdges(rfEdges);
			} catch (error) {
				toast.error({
					title: "Lỗi khi xóa nút",
					description: extractApiErrorMessage(error, "Không thể xóa nút."),
				});
			} finally {
				setIsApplyingLayout(false);
			}
		},
		[
			gallery,
			selectedStructureId,
			selectedThemeId,
			isPreviewingVersion,
			withExtras,
			setNodes,
			setEdges,
		],
	);

	useEffect(() => {
		addChildCallbackRef.current = handleAddChildNode;
		deleteNodeCallbackRef.current = handleDeleteNode;
	}, [handleAddChildNode, handleDeleteNode]);

	const applyLayout = useCallback(
		async (response: MindMapGenerateResponse) => {
			setIsApplyingLayout(true);
			try {
				const { nodes: rfNodes, edges: rfEdges } = await runElkLayout(
					response.tree,
					response.structure_config,
					response.theme_config,
					nodeShapeRef.current,
				);
				setNodes(withExtras(rfNodes));
				setEdges(rfEdges);
				setCurrentMindMapId(response.id);
				setCurrentVersion(response.current_version);
				setCurrentTitle(response.title);
				setMetadata(response.metadata);
				setCanvasBackground(response.theme_config.background);
				currentTreeRef.current = response.tree;
			} catch (error) {
				toast.error({
					title: "Lỗi khi tính toán layout",
					description: extractApiErrorMessage(
						error,
						"Không thể tính toán layout.",
					),
				});
			} finally {
				setIsApplyingLayout(false);
			}
		},
		[setNodes, setEdges, withExtras],
	);

	const handleGenerate = () => {
		const trimmed = topic.trim();
		if (mode === "topic" && !trimmed) {
			setSourceError("Vui lòng nhập chủ đề trước khi tạo sơ đồ tư duy.");
			return;
		}

		if (mode === "lesson" && !lessonId) {
			setSourceError("Vui lòng chọn bài học trước khi tạo sơ đồ tư duy.");
			return;
		}

		const request =
			mode === "topic"
				? {
						topic: trimmed,
						max_depth: maxDepth,
						max_branches: maxBranches,
						structure_id: selectedStructureId,
						theme_id: selectedThemeId,
					}
				: {
						lesson_id: lessonId as number,
						max_depth: maxDepth,
						max_branches: maxBranches,
						structure_id: selectedStructureId,
						theme_id: selectedThemeId,
					};

		generate(request, {
			onSuccess: async (res) => {
				const data = res.data.data;
				if (!data) return;
				setSourceError(null);
				setIsPreviewingVersion(false);
				setPreviewVersionNumber(null);
				previewBackupRef.current = null;
				await applyLayout(data);
			},
			onError: (error) => {
				toast.error({
					title: "Lỗi khi tạo sơ đồ tư duy",
					description: extractApiErrorMessage(
						error,
						"Không thể tạo sơ đồ tư duy.",
					),
				});
			},
		});
	};

	const handleRefine = () => {
		if (!currentMindMapId || !refineInstruction.trim()) return;

		refine(
			{
				id: currentMindMapId,
				request: { instruction: refineInstruction.trim() },
			},
			{
				onSuccess: async (res) => {
					const data = res.data.data;
					if (!data) return;
					setIsPreviewingVersion(false);
					setPreviewVersionNumber(null);
					previewBackupRef.current = null;
					setRefineInstruction("");
					await applyLayout(data);
				},
				onError: (error) => {
					toast.error({
						title: "Lỗi khi tinh chỉnh sơ đồ tư duy",
						description: extractApiErrorMessage(
							error,
							"Không thể tinh chỉnh sơ đồ tư duy.",
						),
					});
				},
			},
		);
	};

	const handlePreviewVersion = async (detail: MindMapVersionDto) => {
		const structure = gallery?.structures.find(
			(s) => s.id === selectedStructureId,
		);
		const theme = gallery?.themes.find((t) => t.id === selectedThemeId);
		if (!structure || !theme) {
			toast.error({ title: "Không thể preview: chưa có cấu hình layout" });
			return;
		}
		previewBackupRef.current = { nodes, edges };
		previewTreeRef.current = detail.treeData;
		setIsApplyingLayout(true);
		try {
			const { nodes: rfNodes, edges: rfEdges } = await runElkLayout(
				detail.treeData,
				structure,
				theme,
				nodeShapeRef.current,
			);
			setNodes(withExtras(rfNodes));
			setEdges(rfEdges);
			setCanvasBackground(theme.background);
			setIsPreviewingVersion(true);
			setPreviewVersionNumber(detail.version_number);
		} catch (error) {
			toast.error({
				title: "Lỗi khi xem phiên bản",
				description: extractApiErrorMessage(error, "Không thể xem phiên bản."),
			});
		} finally {
			setIsApplyingLayout(false);
		}
	};

	const handleCancelPreview = () => {
		if (previewBackupRef.current) {
			setNodes(previewBackupRef.current.nodes);
			setEdges(previewBackupRef.current.edges);
			previewBackupRef.current = null;
		}
		previewTreeRef.current = null;
		setIsPreviewingVersion(false);
		setPreviewVersionNumber(null);
	};

	const handleVersionRestored = async (response: MindMapGenerateResponse) => {
		setIsPreviewingVersion(false);
		setPreviewVersionNumber(null);
		previewBackupRef.current = null;
		previewTreeRef.current = null;
		await applyLayout(response);
	};

	const handleLoadSavedMindMap = async (detail: SavedMindMapDto) => {
		const structure = detail.structure_config;
		const theme = detail.theme_config;
		if (!structure || !theme) {
			toast.error({
				title: "Không thể tải sơ đồ tư duy",
				description: "Sơ đồ tư duy này chưa có cấu hình layout hợp lệ.",
			});
			return;
		}

		setIsApplyingLayout(true);
		try {
			const { nodes: rfNodes, edges: rfEdges } = await runElkLayout(
				detail.treeData,
				structure,
				theme,
				nodeShapeRef.current,
			);
			setNodes(withExtras(rfNodes));
			setEdges(rfEdges);
			setMode("topic");
			setTopic(detail.topic);
			setCurriculumId(null);
			setSubjectId(null);
			setChapterId(null);
			setLessonId(null);
			setSourceError(null);
			setCurrentTitle(detail.title);
			setCurrentMindMapId(detail.id);
			setCurrentVersion(detail.current_version);
			setMetadata(detail.metadata);
			setCanvasBackground(theme.background);
			currentTreeRef.current = detail.treeData;
			skipPickerEffectRef.current = true;
			setSelectedStructureId(structure.id);
			setSelectedThemeId(theme.id);
			setIsPreviewingVersion(false);
			setPreviewVersionNumber(null);
			previewBackupRef.current = null;
			setActiveTab("generate");
		} catch (error) {
			toast.error({
				title: "Lỗi khi tải sơ đồ tư duy",
				description: extractApiErrorMessage(
					error,
					"Không thể tải sơ đồ tư duy.",
				),
			});
		} finally {
			setIsApplyingLayout(false);
		}
	};

	const handleNodeDoubleClick = (_event: React.MouseEvent, node: Node) => {
		const data = node.data as { label: string; description: string };
		setEditingNode({
			id: node.id,
			label: data.label ?? "",
			description: data.description ?? "",
		});
	};

	const handleSaveNodeEdit = () => {
		if (!editingNode) return;
		const updateTreeNode = (node: MindMapTreeNode): MindMapTreeNode => {
			if (node.id === editingNode.id) {
				return {
					...node,
					label: editingNode.label,
					description: editingNode.description,
				};
			}
			return node.children?.length
				? { ...node, children: node.children.map(updateTreeNode) }
				: node;
		};
		if (currentTreeRef.current) {
			currentTreeRef.current = updateTreeNode(currentTreeRef.current);
		}
		setNodes((prev: Node[]) =>
			prev.map((n: Node) =>
				n.id === editingNode.id
					? {
							...n,
							data: {
								...n.data,
								label: editingNode.label,
								description: editingNode.description,
							},
						}
					: n,
			),
		);
		setEditingNode(null);
	};

	const handleSaveTree = () => {
		if (!currentMindMapId || !currentTreeRef.current) return;
		saveTree(
			{ id: currentMindMapId, request: { treeData: currentTreeRef.current } },
			{
				onSuccess: (res) => {
					const data = res.data.data;
					if (data) setCurrentVersion(data.version_number);
					toast.success({
						title: `Đã lưu (version ${data?.version_number ?? ""})`,
					});
				},
				onError: (error) => {
					toast.error({
						title: "Lưu thất bại, vui lòng thử lại",
						description: extractApiErrorMessage(
							error,
							"Không thể lưu sơ đồ tư duy.",
						),
					});
				},
			},
		);
	};

	const handleExportImage = async () => {
		if (!hasResult) return;
		try {
			const imageWidth = 1920;
			const imageHeight = 1080;
			const titleHeight = 104;
			const mapHeight = imageHeight - titleHeight;
			const pixelRatio = 2;
			const exportTitle =
				currentTitle.trim() ||
				topic.trim() ||
				`Sơ đồ tư duy bài ${lessonId ?? ""}`.trim() ||
				"Sơ đồ tư duy";
			const canvas = document.createElement("canvas");
			canvas.width = imageWidth * pixelRatio;
			canvas.height = imageHeight * pixelRatio;

			const ctx = canvas.getContext("2d");
			if (!ctx) throw new Error("Canvas context not found");
			ctx.scale(pixelRatio, pixelRatio);

			ctx.fillStyle = canvasBackground ?? "#ffffff";
			ctx.fillRect(0, 0, imageWidth, imageHeight);

			ctx.fillStyle = "rgba(255,255,255,0.92)";
			ctx.fillRect(0, 0, imageWidth, titleHeight);
			ctx.strokeStyle = "rgba(15,23,42,0.12)";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(0, titleHeight);
			ctx.lineTo(imageWidth, titleHeight);
			ctx.stroke();

			ctx.fillStyle = "#0f172a";
			ctx.font =
				"800 34px Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
			ctx.textBaseline = "top";
			const titleLines = wrapCanvasText(ctx, exportTitle, imageWidth - 144, 1);
			ctx.fillText(titleLines[0] ?? exportTitle, 72, 27);

			ctx.fillStyle = "#64748b";
			ctx.font =
				"600 18px Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
			ctx.fillText(
				metadata
					? `${metadata.total_nodes} nút - Độ sâu ${metadata.max_depth}`
					: "Sơ đồ tư duy",
				72,
				70,
			);

			const exportNodeLayouts = new Map(
				nodes.map((node) => {
					const baseSize = getExportNodeSize(node);
					const data = node.data as {
						label?: string;
						description?: string;
						nodeShape?: NodeShape;
					};
					const typography = getExportNodeTypography(node);
					const textWidth = baseSize.width - typography.horizontalPadding;

					ctx.font = typography.labelFont;
					const labelLines = wrapCanvasTextFully(
						ctx,
						data.label?.trim() ?? "",
						textWidth,
					);

					const description = data.description?.trim();
					ctx.font = typography.descriptionFont;
					const descriptionLines = description
						? wrapCanvasTextFully(ctx, description, textWidth)
						: [];

					const textGap = descriptionLines.length > 0 ? 3 : 0;
					const textHeight =
						labelLines.length * typography.lineHeight +
						descriptionLines.length * typography.descriptionLineHeight +
						textGap;
					let width = baseSize.width;
					let height = Math.max(
						baseSize.height,
						textHeight + typography.verticalPadding,
					);

					if (data.nodeShape === "circle" || data.nodeShape === "diamond") {
						const side = Math.max(width, height);
						width = side;
						height = side;
					}

					return [
						node.id,
						{ width, height, labelLines, descriptionLines, typography },
					] as const;
				}),
			);
			const exportBounds = (() => {
				const boxes = nodes.map((node) => {
					const size =
						exportNodeLayouts.get(node.id) ?? getExportNodeSize(node);
					return {
						x: node.position.x,
						y: node.position.y,
						width: size.width,
						height: size.height,
					};
				});
				const minX = Math.min(...boxes.map((box) => box.x));
				const minY = Math.min(...boxes.map((box) => box.y));
				const maxX = Math.max(...boxes.map((box) => box.x + box.width));
				const maxY = Math.max(...boxes.map((box) => box.y + box.height));
				return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
			})();
			const viewport = getViewportForBounds(
				exportBounds,
				imageWidth,
				mapHeight,
				0.2,
				2,
				0.15,
			);

			const nodesById = new Map(nodes.map((node) => [node.id, node]));
			const getCanvasNodeBox = (node: Node) => {
				const size = exportNodeLayouts.get(node.id) ?? getExportNodeSize(node);
				return {
					x: node.position.x * viewport.zoom + viewport.x,
					y: node.position.y * viewport.zoom + viewport.y + titleHeight,
					width: size.width * viewport.zoom,
					height: size.height * viewport.zoom,
				};
			};

			ctx.save();
			ctx.beginPath();
			ctx.rect(0, titleHeight, imageWidth, mapHeight);
			ctx.clip();

			for (const edge of edges) {
				const source = nodesById.get(edge.source);
				const target = nodesById.get(edge.target);
				if (!source || !target) continue;

				const sourceBox = getCanvasNodeBox(source);
				const targetBox = getCanvasNodeBox(target);
				const sourceX = sourceBox.x + sourceBox.width / 2;
				const sourceY = sourceBox.y + sourceBox.height / 2;
				const targetX = targetBox.x + targetBox.width / 2;
				const targetY = targetBox.y + targetBox.height / 2;
				const distanceX = Math.abs(targetX - sourceX);
				const distanceY = Math.abs(targetY - sourceY);

				ctx.strokeStyle = getStringStyleValue(
					(edge.style as React.CSSProperties | undefined)?.stroke,
					"#94a3b8",
				);
				ctx.lineWidth =
					Number(
						(edge.style as React.CSSProperties | undefined)?.strokeWidth,
					) || 2.5;
				ctx.lineCap = "round";
				ctx.beginPath();
				ctx.moveTo(sourceX, sourceY);
				if (distanceX > distanceY) {
					const controlOffset = Math.max(80, distanceX * 0.45);
					ctx.bezierCurveTo(
						sourceX + Math.sign(targetX - sourceX) * controlOffset,
						sourceY,
						targetX - Math.sign(targetX - sourceX) * controlOffset,
						targetY,
						targetX,
						targetY,
					);
				} else {
					const controlOffset = Math.max(70, distanceY * 0.45);
					ctx.bezierCurveTo(
						sourceX,
						sourceY + Math.sign(targetY - sourceY) * controlOffset,
						targetX,
						targetY - Math.sign(targetY - sourceY) * controlOffset,
						targetX,
						targetY,
					);
				}
				ctx.stroke();
			}

			for (const node of nodes) {
				const box = getCanvasNodeBox(node);
				const data = node.data as {
					label?: string;
					description?: string;
					nodeStyle?: React.CSSProperties;
					handleColor?: string;
					nodeShape?: NodeShape;
				};
				const layout = exportNodeLayouts.get(node.id);
				const style = data.nodeStyle ?? {};
				const handleColor = data.handleColor ?? "#94a3b8";
				const radius =
					node.type === "mindMapRoot"
						? 16
						: node.type === "mindMapBranch"
							? 12
							: 8;

				ctx.save();
				ctx.shadowColor = `${handleColor}33`;
				ctx.shadowBlur = node.type === "mindMapRoot" ? 18 : 10;
				ctx.shadowOffsetY = 5;
				drawNodeShape(
					ctx,
					box.x,
					box.y,
					box.width,
					box.height,
					data.nodeShape,
					radius,
				);
				ctx.fillStyle = getStringStyleValue(
					style.backgroundColor ?? style.background,
					"#ffffff",
				);
				ctx.fill();
				ctx.restore();

				drawNodeShape(
					ctx,
					box.x,
					box.y,
					box.width,
					box.height,
					data.nodeShape,
					radius,
				);
				ctx.strokeStyle = handleColor;
				ctx.lineWidth = node.type === "mindMapRoot" ? 2.5 : 1.5;
				ctx.stroke();

				ctx.fillStyle = getStringStyleValue(style.color, "#0f172a");
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				const typography = layout?.typography ?? getExportNodeTypography(node);
				const labelLines = layout?.labelLines ?? [];
				const descriptionLines = layout?.descriptionLines ?? [];
				const textGap = descriptionLines.length > 0 ? 3 : 0;
				const textHeight =
					labelLines.length * typography.lineHeight +
					descriptionLines.length * typography.descriptionLineHeight +
					textGap;
				let textY =
					box.y + box.height / 2 - textHeight / 2 + typography.lineHeight / 2;

				ctx.font = typography.labelFont;
				for (const line of labelLines) {
					ctx.fillText(line, box.x + box.width / 2, textY);
					textY += typography.lineHeight;
				}

				if (descriptionLines.length > 0) {
					ctx.globalAlpha = 0.72;
					ctx.font = typography.descriptionFont;
					textY += textGap;
					for (const line of descriptionLines) {
						ctx.fillText(line, box.x + box.width / 2, textY);
						textY += typography.descriptionLineHeight;
					}
					ctx.globalAlpha = 1;
				}
			}
			ctx.restore();

			const dataUrl = canvas.toDataURL("image/png");

			const anchor = document.createElement("a");
			const safeTopic = (exportTitle || `so-do-tu-duy-${lessonId ?? "mindmap"}`)
				.toLowerCase()
				.replace(/[^a-z0-9\s-]/g, "")
				.replace(/\s+/g, "-");
			anchor.href = dataUrl;
			anchor.download = `${safeTopic || "mindmap"}-mindmap.png`;
			anchor.click();

			toast.success({
				title: "Xuất ảnh thành công",
				description: "Sơ đồ tư duy đã được tải xuống dạng PNG.",
			});
		} catch (error) {
			toast.error({
				title: "Xuất ảnh thất bại",
				description: extractApiErrorMessage(
					error,
					"Không thể xuất ảnh sơ đồ tư duy.",
				),
			});
		}
	};

	const hasResult = nodes.length > 0;
	const isPending = isGenerating || isApplyingLayout;

	const handleModeChange = (nextMode: GenerateMode) => {
		setMode(nextMode);
		setSourceError(null);

		if (nextMode === "topic") {
			setCurriculumId(null);
			setSubjectId(null);
			setChapterId(null);
			setLessonId(null);
			return;
		}

		setTopic("");
	};

	const activeNodeTypes = (() => {
		const structure = gallery?.structures.find(
			(s) => s.id === selectedStructureId,
		);
		if (!structure) return mindMapRadialNodeTypes;
		const family = getAlgorithmFamily(structure);
		if (family === "horizontal") return mindMapNodeTypes;
		if (family === "symmetric") return mindMapSymmetricNodeTypes;
		return mindMapRadialNodeTypes;
	})();

	const sourceEntries = metadata?.sources
		? Object.entries(metadata.sources)
		: [];

	return (
		<div className="flex h-[calc(100vh-2rem)] flex-col gap-4 p-8 bg-slate-50 dark:bg-slate-950">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="text-3xl font-bold text-slate-900 dark:text-white">
						Tạo sơ đồ tư duy
					</h1>
					<p className="mt-1 text-lg text-slate-500 dark:text-slate-400">
						Nhập chủ đề để AI tự động tạo sơ đồ tư duy, giá cho mỗi lần tạo là
						<span className="ms-1 inline-flex items-center gap-0.5 font-semibold text-amber-700 dark:text-gray-100 whitespace-nowrap">
							2000
							<BitCoinIcon size={20} />
						</span>
					</p>
				</div>

				{activeTab === "generate" && metadata && (
					<div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
						<span>{metadata.total_nodes} nút</span>
						<span>•</span>
						<span>{metadata.total_edges} liên kết</span>
						<span>•</span>
						<span>Độ sâu: {metadata.max_depth}</span>
						{sourceEntries.length > 0 && (
							<>
								<span>•</span>
								<details className="group relative">
									<summary className="flex cursor-pointer list-none items-center gap-1 rounded-md px-2 py-1 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white [&::-webkit-details-marker]:hidden">
										<BookOpen className="h-3 w-3" />
										{sourceEntries.length} nguồn
									</summary>
									<div className="absolute right-0 top-full z-30 mt-2 w-96 rounded-lg border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
										<p className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
											Nguồn tham khảo
										</p>
										<div className="max-h-56 space-y-2 overflow-auto pr-1">
											{sourceEntries.map(([name, detail]) => (
												<div
													key={name}
													className="rounded-md border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800/60"
												>
													<p className="text-sm font-medium text-slate-800 dark:text-slate-200">
														{name}
													</p>
													<p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
														{detail}
													</p>
												</div>
											))}
										</div>
									</div>
								</details>
							</>
						)}
					</div>
				)}
			</div>

			<div className="flex gap-8 border-b border-slate-200 dark:border-slate-700">
				<button
					type="button"
					onClick={() => setActiveTab("generate")}
					className={`flex items-center gap-2 cursor-pointer pb-4 border-b-2 font-semibold text-md transition-colors  ${
						activeTab === "generate"
							? "border-primary text-primary"
							: "border-transparent text-slate-500 hover:text-slate-700"
					}`}
				>
					<Sparkles className="h-4 w-4" />
					Tạo sơ đồ
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("saved")}
					className={`flex items-center gap-2 cursor-pointer pb-4 border-b-2 font-semibold text-md transition-colors  ${
						activeTab === "saved"
							? "border-primary text-primary"
							: "border-transparent text-slate-500 hover:text-slate-700"
					}`}
				>
					<BookMarked className="h-4 w-4" />
					Đã lưu
				</button>
			</div>

			{activeTab === "generate" && (
				<div className="flex flex-1 flex-col gap-3 overflow-hidden p-2">
					<div className="flex flex-col gap-3">
						<div className="flex flex-wrap items-center gap-2">
							<div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
								<label
									htmlFor="mindmap-max-depth"
									className="text-sm font-medium text-slate-700 dark:text-slate-300"
								>
									Độ sâu
								</label>
								<select
									id="mindmap-max-depth"
									value={maxDepth}
									onChange={(e) => setMaxDepth(Number(e.target.value))}
									disabled={isPending}
									className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
								>
									{[2, 3, 4].map((d) => (
										<option key={d} value={d}>
											{d}
										</option>
									))}
								</select>
							</div>

							<div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
								<label
									htmlFor="mindmap-max-branches"
									className="text-sm font-medium text-slate-700 dark:text-slate-300"
								>
									Nhánh tối đa
								</label>
								<select
									id="mindmap-max-branches"
									value={maxBranches}
									onChange={(e) => setMaxBranches(Number(e.target.value))}
									disabled={isPending}
									className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
								>
									{Array.from({ length: 7 }, (_, i) => i + 2).map((b) => (
										<option key={b} value={b}>
											{b}
										</option>
									))}
								</select>
							</div>

							<div className="basis-full order-1" />

							<button
								type="button"
								onClick={() => handleModeChange("topic")}
								className={`order-2 rounded-md border px-4 py-2 text-sm font-semibold transition-all ${
									mode === "topic"
										? "border-blue-600 bg-blue-50 text-blue-700"
										: "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
								}`}
							>
								Nhập chủ đề
							</button>

							<button
								type="button"
								onClick={() => handleModeChange("lesson")}
								className={`order-2 rounded-md border px-4 py-2 text-sm font-semibold transition-all ${
									mode === "lesson"
										? "border-blue-600 bg-blue-50 text-blue-700"
										: "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
								}`}
							>
								Chọn bài học
							</button>

							{mode === "topic" ? (
								<input
									className="order-2 min-w-70 flex-1 rounded-md border-2 border-gray-200 bg-white pl-3 pr-4 py-2 shadow-sm outline-none transition-all focus:border-transparent focus:ring-1 focus:ring-primary dark:border-slate-800 dark:bg-slate-900"
									placeholder="Ví dụ: Tìm hiểu về HTML và CSS, Thuật toán sắp xếp..."
									value={topic}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
										setTopic(e.target.value);
										if (sourceError) {
											setSourceError(null);
										}
									}}
									onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
										if (e.key === "Enter" && !isPending) handleGenerate();
									}}
									disabled={isPending}
								/>
							) : (
								<div className="order-2 min-w-130 flex-1 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
									<CurriculumChapterPicker
										curriculumId={curriculumId}
										subjectId={subjectId}
										chapterId={chapterId}
										lessonId={lessonId}
										onCurriculumChange={setCurriculumId}
										onSubjectChange={setSubjectId}
										onChapterChange={(value) => {
											setChapterId(value);
										}}
										onLessonChange={(value) => {
											setLessonId(value);
											if (sourceError) {
												setSourceError(null);
											}
										}}
										error={sourceError ?? undefined}
										disabled={isPending}
									/>
								</div>
							)}
							<Button
								onPress={handleGenerate}
								isDisabled={
									isPending || (mode === "topic" ? !topic.trim() : !lessonId)
								}
								className="order-2 cursor-pointer bg-blue-700 text-md text-white shadow-sm shadow-blue-500/30 transition-all hover:border-blue-600 hover:bg-white hover:text-blue-600 rounded-lg py-5 font-medium flex items-center gap-2"
							>
								{isPending ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Sparkles className="h-4 w-4" />
								)}
								{isPending ? "Đang tạo..." : "Tạo sơ đồ tư duy"}
							</Button>

							<StructurePicker
								structures={gallery?.structures ?? []}
								selectedId={selectedStructureId}
								onChange={setSelectedStructureId}
								disabled={isPending || isGalleryLoading}
							/>

							<ThemePicker
								themes={gallery?.themes ?? []}
								selectedId={selectedThemeId}
								onChange={setSelectedThemeId}
								disabled={isPending || isGalleryLoading}
							/>

							<ShapePicker
								value={nodeShape}
								onChange={setNodeShape}
								disabled={isPending}
							/>

							<Button
								variant="outline"
								onPress={handleExportImage}
								isDisabled={!hasResult || isPending}
								className="cursor-pointer shrink-0 gap-2 py-5 border-blue-600"
							>
								<ImageDown className="h-4 w-4" />
								Xuất PNG
							</Button>

							{currentMindMapId && !isPreviewingVersion && (
								<Button
									variant="outline"
									onPress={handleSaveTree}
									isDisabled={isSaving || isPending}
									className="cursor-pointer shrink-0 gap-2 py-5"
								>
									{isSaving ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Save className="h-4 w-4" />
									)}
									Lưu
								</Button>
							)}

							{currentMindMapId && (
								<Button
									variant="outline"
									onPress={() => setShowVersionSidebar((v) => !v)}
									className={`cursor-pointer shrink-0 gap-2 py-5 ${showVersionSidebar ? "border-indigo-400 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400" : ""}`}
								>
									<History className="h-4 w-4" />
									Lịch sử
								</Button>
							)}
						</div>

						{sourceError && mode === "topic" && (
							<p className="text-sm text-red-600">{sourceError}</p>
						)}
					</div>

					<div
						className={`flex min-h-0 flex-1 overflow-hidden border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950 ${
							isFullscreen ? "fixed inset-0 z-50 rounded-none" : "rounded-xl"
						}`}
					>
						<div
							ref={flowContainerRef}
							className="relative flex-1"
							style={{ background: canvasBackground ?? undefined }}
						>
							{isFullscreen && (
								<div className="absolute left-4 right-4 top-4 z-30 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
									<div className="min-w-0">
										<p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
											{currentTitle || "Sơ đồ tư duy"}
										</p>
										{metadata && (
											<p className="text-xs text-slate-500 dark:text-slate-400">
												{metadata.total_nodes} nút · Độ sâu {metadata.max_depth}
											</p>
										)}
									</div>
									<div className="flex flex-wrap items-center justify-end gap-2">
										<StructurePicker
											structures={gallery?.structures ?? []}
											selectedId={selectedStructureId}
											onChange={setSelectedStructureId}
											disabled={isPending || isGalleryLoading}
										/>

										<ThemePicker
											themes={gallery?.themes ?? []}
											selectedId={selectedThemeId}
											onChange={setSelectedThemeId}
											disabled={isPending || isGalleryLoading}
										/>

										<ShapePicker
											value={nodeShape}
											onChange={setNodeShape}
											disabled={isPending}
										/>

										<button
											type="button"
											onClick={handleExportImage}
											disabled={!hasResult || isPending}
											className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-blue-300"
											title="Xuất PNG"
										>
											<ImageDown className="h-4 w-4" />
											Xuất PNG
										</button>
										{currentMindMapId && !isPreviewingVersion && (
											<button
												type="button"
												onClick={handleSaveTree}
												disabled={isSaving || isPending}
												className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-blue-300"
												title="Lưu sơ đồ tư duy"
											>
												{isSaving ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<Save className="h-4 w-4" />
												)}
												Lưu
											</button>
										)}
										{currentMindMapId && (
											<button
												type="button"
												onClick={() => setShowVersionSidebar((v) => !v)}
												className={`inline-flex h-9 items-center gap-2 rounded-md border bg-white px-3 text-sm font-medium shadow-sm transition-colors hover:border-blue-200 hover:text-blue-700 dark:bg-slate-800 dark:hover:text-blue-300 ${
													showVersionSidebar
														? "border-indigo-300 text-indigo-600 dark:border-indigo-500 dark:text-indigo-300"
														: "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"
												}`}
												title="Lịch sử phiên bản"
											>
												<History className="h-4 w-4" />
												Lịch sử
											</button>
										)}
										<button
											type="button"
											onClick={() => setIsFullscreen(false)}
											className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-blue-300"
											title="Thoát toàn màn hình"
										>
											<Minimize2 className="h-4 w-4" />
										</button>
									</div>
								</div>
							)}

							{hasResult && !isFullscreen && (
								<button
									type="button"
									onClick={() => setIsFullscreen(true)}
									className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white/95 text-slate-600 shadow-md backdrop-blur transition-colors hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-300 dark:hover:text-blue-300"
									title="Xem toàn màn hình"
								>
									<Maximize2 className="h-4 w-4" />
								</button>
							)}

							{isPreviewingVersion && previewVersionNumber && (
								<div
									className={`absolute left-4 right-4 z-20 flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 shadow-md dark:border-amber-700 dark:bg-amber-950 ${
										isFullscreen ? "top-23" : "top-4"
									}`}
								>
									<div className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-300">
										<Eye className="h-4 w-4" />
										Đang xem v{previewVersionNumber}
									</div>
									<div className="flex items-center gap-2">
										<AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
										<span className="text-sm text-amber-600 dark:text-amber-400">
											Chế độ xem — chưa khôi phục
										</span>
										<button
											type="button"
											onClick={handleCancelPreview}
											className="ml-2 rounded-md px-2 py-1 text-sm font-medium text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900"
										>
											Quay lại
										</button>
									</div>
								</div>
							)}

							{isApplyingLayout && (
								<div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-slate-900/70">
									<div className="flex flex-col items-center gap-3">
										<Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
										<p className="text-sm text-slate-500">
											Đang tính toán layout...
										</p>
									</div>
								</div>
							)}

							{hasResult ? (
								<ReactFlow
									nodes={nodes}
									edges={edges}
									onNodesChange={onNodesChange}
									onEdgesChange={onEdgesChange}
									nodeTypes={activeNodeTypes}
									onNodeDoubleClick={handleNodeDoubleClick}
									fitView
									fitViewOptions={{ padding: 0.3 }}
									minZoom={0.2}
									maxZoom={2}
									proOptions={{ hideAttribution: true }}
								>
									<Background
										variant={BackgroundVariant.Dots}
										gap={18}
										size={1.2}
										color={canvasBackground ? "rgba(0,0,0,0.12)" : "#cbd5e1"}
									/>
									<Controls
										position="bottom-right"
										showInteractive={false}
										className="rounded-xl border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800 [&>button]:border-slate-200 [&>button]:text-slate-600 dark:[&>button]:border-slate-700 dark:[&>button]:text-slate-300"
									/>
									<MiniMap
										position="bottom-left"
										pannable
										zoomable
										nodeColor={(n) => {
											const d = (n.data as { handleColor?: string })
												.handleColor;
											return d ?? "#94a3b8";
										}}
										maskColor="rgba(15,23,42,0.06)"
										style={{
											borderRadius: "12px",
											border: "1px solid #e2e8f0",
											boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
										}}
									/>
								</ReactFlow>
							) : (
								<div className="flex h-full flex-col items-center justify-center gap-2 bg-slate-50/60 text-slate-400 dark:bg-slate-900/60 dark:text-slate-500">
									<div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
										<Sparkles className="h-10 w-10 text-indigo-400 opacity-70" />
									</div>
									<p className="mt-2 text-base font-semibold text-slate-600 dark:text-slate-300">
										Nhập chủ đề để bắt đầu
									</p>
									<p className="text-sm">
										Sơ đồ tư duy sẽ được hiển thị tại đây
									</p>
								</div>
							)}

							{isFullscreen && currentMindMapId && hasResult && (
								<div className="absolute bottom-4 left-1/2 z-30 flex w-[min(920px,calc(100%-2rem))] -translate-x-1/2 items-center gap-2 rounded-lg border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
									<Wand2 className="h-4 w-4 shrink-0 text-indigo-500" />
									<input
										className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-all focus:border-blue-400 focus:ring-1 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
										placeholder="Nhập yêu cầu tinh chỉnh sơ đồ tư duy..."
										value={refineInstruction}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setRefineInstruction(e.target.value)
										}
										onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
											if (
												e.key === "Enter" &&
												!isRefining &&
												refineInstruction.trim()
											) {
												handleRefine();
											}
										}}
										disabled={isRefining}
									/>
									<button
										type="button"
										onClick={handleRefine}
										disabled={!refineInstruction.trim() || isRefining}
										className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
									>
										{isRefining ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<Wand2 className="h-4 w-4" />
										)}
										Tinh chỉnh
									</button>
								</div>
							)}
						</div>

						{showVersionSidebar && currentMindMapId && (
							<VersionHistorySidebar
								mindMapId={currentMindMapId}
								currentVersion={currentVersion}
								previewVersionNumber={previewVersionNumber}
								onPreview={handlePreviewVersion}
								onRestored={handleVersionRestored}
								onClose={() => setShowVersionSidebar(false)}
							/>
						)}
					</div>

					{hasResult && (
						<p className="flex items-center gap-1.5 text-md text-slate-400 dark:text-slate-500">
							<Pencil className="h-4 w-4" />
							Double-click vào nút bất kỳ để chỉnh sửa nội dung
						</p>
					)}

					{currentMindMapId && hasResult && (
						<div className="flex items-center gap-3 rounded-md border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/50">
							<Wand2 className="h-4 w-4 shrink-0 text-indigo-500" />
							<input
								className="flex-1 pl-3 pr-4 py-2 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md focus:ring-1 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
								placeholder="Nhập yêu cầu tinh chỉnh, ví dụ: Thêm nhánh về lập trình Java..."
								value={refineInstruction}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setRefineInstruction(e.target.value)
								}
								onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
									if (
										e.key === "Enter" &&
										!isRefining &&
										refineInstruction.trim()
									) {
										handleRefine();
									}
								}}
								disabled={isRefining}
							/>
							<Button
								onPress={handleRefine}
								isDisabled={!refineInstruction.trim() || isRefining}
								className="cursor-pointer bg-blue-700 hover:bg-white hover:text-blue-600 hover:border-blue-600 text-white text-md py-5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm shadow-blue-500/30"
							>
								{isRefining ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Wand2 className="h-4 w-4" />
								)}
								Tinh chỉnh sơ đồ
							</Button>
						</div>
					)}
				</div>
			)}

			{activeTab === "saved" && (
				<SavedMindMapsPanel onLoad={handleLoadSavedMindMap} />
			)}

			{editingNode && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
					<div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
						<h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
							<Pencil className="h-4 w-4" />
							Chỉnh sửa nút
						</h2>
						<div className="mt-4 flex flex-col gap-3">
							<div>
								<label
									htmlFor="mindmap-node-title"
									className="mb-1 block text-md font-medium text-slate-700 dark:text-slate-300"
								>
									Tiêu đề
								</label>
								<Input
									id="mindmap-node-title"
									value={editingNode.label}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										setEditingNode({ ...editingNode, label: e.target.value })
									}
									onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
										if (e.key === "Escape") setEditingNode(null);
									}}
									autoFocus
								/>
							</div>
							<div>
								<label
									htmlFor="mindmap-node-description"
									className="mb-1 block text-md font-medium text-slate-700 dark:text-slate-300"
								>
									Mô tả
								</label>
								<textarea
									id="mindmap-node-description"
									value={editingNode.description}
									onChange={(e) =>
										setEditingNode({
											...editingNode,
											description: e.target.value,
										})
									}
									onKeyDown={(e) => {
										if (e.key === "Escape") setEditingNode(null);
										if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
											handleSaveNodeEdit();
									}}
									rows={3}
									className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
								/>
								<p className="mt-1 text-md text-slate-400">Ctrl+Enter để lưu</p>
							</div>
						</div>
						<div className="mt-5 flex justify-end gap-2">
							<Button
								variant="outline"
								onPress={() => setEditingNode(null)}
								className="p-5 border-blue-600"
							>
								Hủy
							</Button>
							<Button
								onPress={handleSaveNodeEdit}
								isDisabled={!editingNode.label.trim()}
								className="gap-2 py-5"
							>
								<Pencil className="h-4 w-4" />
								Lưu thay đổi
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
