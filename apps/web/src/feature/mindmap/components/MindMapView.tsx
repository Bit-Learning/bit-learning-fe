import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    getNodesBounds,
    getViewportForBounds,
    useNodesState,
    useEdgesState,
    type Node,
    type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { toPng } from "html-to-image";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "@/shared/components/Sonner";
import { Button } from "@workspace/ui/components/Button";
import { Input } from "@workspace/ui/components/Input";
import { Loader2, Sparkles, BookOpen, Settings2, ImageDown, BookMarked, Save, Pencil } from "lucide-react";
import {
    useGenerateHorizontalMindMap,
    useGenerateRadialMindMap,
    useGenerateSymmetricHorizontalMindMap,
    useSaveMindMap,
} from "../queries/use-mindmap-queries";
import {
    mindMapNodeTypes,
    mindMapRadialNodeTypes,
    mindMapSymmetricNodeTypes,
    type MindMapNodeTheme,
} from "../components/MindMapNodes";
import type { MindMapResponse, SavedMindMapDetailDto } from "../types/mindmap.type";
import SavedMindMapsPanel from "./SavedMindMapsPanel";

type MindMapLayoutType = "radial" | "symmetric-horizontal" | "horizontal";
type HandleDirection = "top" | "right" | "bottom" | "left";
type MindMapPaletteSelection = "random" | "indigo" | "rose" | "teal" | "orange";

type MindMapPalette = {
    id: Exclude<MindMapPaletteSelection, "random">;
    nameKey: string;
    edge: string;
    root: MindMapNodeTheme;
    branch: MindMapNodeTheme;
    leaf: MindMapNodeTheme;
};

const MINDMAP_PALETTES: MindMapPalette[] = [
    {
        id: "indigo",
        nameKey: "mindmap.theme.indigo",
        edge: "#6366f1",
        root: {
            from: "#6366f1",
            to: "#7c3aed",
            border: "#818cf8",
            text: "#ffffff",
            description: "#e0e7ff",
            handle: "#a5b4fc",
            shadow: "rgba(99,102,241,0.35)",
        },
        branch: {
            from: "#eff6ff",
            to: "#e0f2fe",
            border: "#93c5fd",
            text: "#1e3a8a",
            description: "#1d4ed8",
            handle: "#60a5fa",
            shadow: "rgba(59,130,246,0.2)",
        },
        leaf: {
            from: "#ecfdf5",
            to: "#f0fdfa",
            border: "#a7f3d0",
            text: "#065f46",
            description: "#0f766e",
            handle: "#34d399",
            shadow: "rgba(16,185,129,0.2)",
        },
    },
    {
        id: "rose",
        nameKey: "mindmap.theme.rose",
        edge: "#db2777",
        root: {
            from: "#db2777",
            to: "#e11d48",
            border: "#f472b6",
            text: "#ffffff",
            description: "#ffe4f1",
            handle: "#f9a8d4",
            shadow: "rgba(225,29,114,0.35)",
        },
        branch: {
            from: "#fff1f2",
            to: "#ffe4e6",
            border: "#fda4af",
            text: "#9f1239",
            description: "#be123c",
            handle: "#fb7185",
            shadow: "rgba(244,63,94,0.2)",
        },
        leaf: {
            from: "#fff7ed",
            to: "#ffedd5",
            border: "#fdba74",
            text: "#9a3412",
            description: "#c2410c",
            handle: "#fb923c",
            shadow: "rgba(249,115,22,0.2)",
        },
    },
    {
        id: "teal",
        nameKey: "mindmap.theme.teal",
        edge: "#0d9488",
        root: {
            from: "#0d9488",
            to: "#0f766e",
            border: "#2dd4bf",
            text: "#ffffff",
            description: "#ccfbf1",
            handle: "#5eead4",
            shadow: "rgba(13,148,136,0.35)",
        },
        branch: {
            from: "#ecfeff",
            to: "#ccfbf1",
            border: "#5eead4",
            text: "#134e4a",
            description: "#115e59",
            handle: "#2dd4bf",
            shadow: "rgba(20,184,166,0.2)",
        },
        leaf: {
            from: "#f0fdf4",
            to: "#dcfce7",
            border: "#86efac",
            text: "#14532d",
            description: "#166534",
            handle: "#4ade80",
            shadow: "rgba(34,197,94,0.2)",
        },
    },
    {
        id: "orange",
        nameKey: "mindmap.theme.orange",
        edge: "#ea580c",
        root: {
            from: "#ea580c",
            to: "#c2410c",
            border: "#fb923c",
            text: "#ffffff",
            description: "#ffedd5",
            handle: "#fdba74",
            shadow: "rgba(234,88,12,0.35)",
        },
        branch: {
            from: "#fff7ed",
            to: "#ffedd5",
            border: "#fdba74",
            text: "#9a3412",
            description: "#c2410c",
            handle: "#fb923c",
            shadow: "rgba(251,146,60,0.2)",
        },
        leaf: {
            from: "#fefce8",
            to: "#fef9c3",
            border: "#fde047",
            text: "#854d0e",
            description: "#a16207",
            handle: "#facc15",
            shadow: "rgba(250,204,21,0.2)",
        },
    },
];

function applyInlineEdgeStyle(edge: Edge, strokeColor: string): Edge {
    return {
        ...edge,
        type: edge.type ?? "smoothstep",
        animated: edge.animated ?? false,
        style: {
            ...edge.style,
            stroke: strokeColor,
            strokeWidth: 2,
            strokeLinecap: "round",
            // Inline strokeDasharray so html-to-image captures it.
            // React Flow's animated class uses CSS from an external stylesheet
            // which is NOT included when html-to-image clones the viewport element.
            ...(edge.animated ? { strokeDasharray: "5" } : {}),
        },
    };
}

function getDirectionFromPositions(source: Node, target: Node): HandleDirection {
    const deltaX = target.position.x - source.position.x;
    const deltaY = target.position.y - source.position.y;

    if (Math.abs(deltaX) >= Math.abs(deltaY)) {
        return deltaX >= 0 ? "right" : "left";
    }

    return deltaY >= 0 ? "bottom" : "top";
}

function getOppositeDirection(direction: HandleDirection): HandleDirection {
    if (direction === "top") return "bottom";
    if (direction === "bottom") return "top";
    if (direction === "left") return "right";
    return "left";
}

function mapEdgesForRadialLayout(rawNodes: Node[], rawEdges: Edge[], strokeColor: string): Edge[] {
    const nodeMap = new Map(rawNodes.map((node) => [node.id, node]));

    return rawEdges.map((edge) => {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);

        const styledEdge = applyInlineEdgeStyle(edge, strokeColor);

        if (!sourceNode || !targetNode) {
            return styledEdge;
        }

        const sourceDirection = getDirectionFromPositions(sourceNode, targetNode);
        const targetDirection = getOppositeDirection(sourceDirection);

        return {
            ...styledEdge,
            sourceHandle: `source-${sourceDirection}`,
            targetHandle: `target-${targetDirection}`,
        };
    });
}

function mapEdgesForSymmetricHorizontalLayout(rawNodes: Node[], rawEdges: Edge[], strokeColor: string): Edge[] {
    const nodeMap = new Map(rawNodes.map((node) => [node.id, node]));

    return rawEdges.map((edge) => {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);

        const styledEdge = applyInlineEdgeStyle(edge, strokeColor);

        if (!sourceNode || !targetNode) {
            return styledEdge;
        }

        const goRight = targetNode.position.x >= sourceNode.position.x;

        return {
            ...styledEdge,
            sourceHandle: goRight ? "source-right" : "source-left",
            targetHandle: goRight ? "target-left" : "target-right",
        };
    });
}

function mapEdgesForHorizontalLayout(rawEdges: Edge[], strokeColor: string): Edge[] {
    return rawEdges.map((edge) => {
        const styled = applyInlineEdgeStyle(edge, strokeColor);
        // Clear directional handles so the horizontal node components use their default handles
        return { ...styled, sourceHandle: undefined, targetHandle: undefined };
    });
}

function pickRandomPalette(): MindMapPalette {
    const randomIndex = Math.floor(Math.random() * MINDMAP_PALETTES.length);
    return MINDMAP_PALETTES[randomIndex] ?? MINDMAP_PALETTES[0]!;
}

function getPaletteBySelection(selection: MindMapPaletteSelection): MindMapPalette {
    if (selection === "random") {
        return pickRandomPalette();
    }

    return MINDMAP_PALETTES.find((palette) => palette.id === selection) ?? pickRandomPalette();
}

function mapNodesWithPalette(rawNodes: Node[], palette: MindMapPalette): Node[] {
    return rawNodes.map((node) => {
        const theme =
            node.type === "mindMapRoot"
                ? palette.root
                : node.type === "mindMapBranch"
                    ? palette.branch
                    : palette.leaf;

        return {
            ...node,
            data: {
                ...(node.data as Record<string, unknown>),
                theme,
            },
        };
    });
}

type ActiveTab = "generate" | "saved";

export default function MindMapView() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<ActiveTab>("generate");
    const [topic, setTopic] = useState("");
    const [layoutType, setLayoutType] = useState<MindMapLayoutType>("radial");
    const [paletteSelection, setPaletteSelection] = useState<MindMapPaletteSelection>("random");
    const [grade, setGrade] = useState(10);
    const [maxDepth, setMaxDepth] = useState(3);
    const [maxBranches, setMaxBranches] = useState(5);
    const [showSettings, setShowSettings] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [saveName, setSaveName] = useState("");
    const [currentTitle, setCurrentTitle] = useState("");
    const [activePalette, setActivePalette] = useState<MindMapPalette | null>(null);
    const [editingNode, setEditingNode] = useState<{ id: string; label: string; description: string } | null>(null);
    const flowContainerRef = useRef<HTMLDivElement | null>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [metadata, setMetadata] = useState<MindMapResponse["metadata"] | null>(null);

    const { mutate: generateRadial, isPending: isRadialPending } = useGenerateRadialMindMap();
    const { mutate: generateSymmetricHorizontal, isPending: isSymmetricHorizontalPending } =
        useGenerateSymmetricHorizontalMindMap();
    const { mutate: generateHorizontal, isPending: isHorizontalPending } = useGenerateHorizontalMindMap();
    const { mutate: saveMindMap, isPending: isSaving } = useSaveMindMap();

    const isPending = isRadialPending || isSymmetricHorizontalPending || isHorizontalPending;

    const activeNodeTypes =
        layoutType === "radial"
            ? mindMapRadialNodeTypes
            : layoutType === "symmetric-horizontal"
                ? mindMapSymmetricNodeTypes
                : mindMapNodeTypes;

    const applyPaletteToGraph = (palette: MindMapPalette, currentNodes: Node[], currentEdges: Edge[]) => {
        setActivePalette(palette);
        const themedNodes = mapNodesWithPalette(currentNodes, palette);
        setNodes(themedNodes);

        if (layoutType === "radial") {
            setEdges(mapEdgesForRadialLayout(themedNodes, currentEdges, palette.edge));
        } else if (layoutType === "symmetric-horizontal") {
            setEdges(mapEdgesForSymmetricHorizontalLayout(themedNodes, currentEdges, palette.edge));
        } else {
            setEdges(mapEdgesForHorizontalLayout(currentEdges, palette.edge));
        }
    };

    const handlePaletteSelectionChange = (selection: MindMapPaletteSelection) => {
        setPaletteSelection(selection);

        if (nodes.length === 0) {
            return;
        }

        const palette = getPaletteBySelection(selection);
        applyPaletteToGraph(palette, nodes, edges);
    };

    const handleLayoutTypeChange = (newLayoutType: MindMapLayoutType) => {
        setLayoutType(newLayoutType);

        if (nodes.length === 0 || !activePalette) return;

        // Remap edges to match the new layout's handle configuration
        if (newLayoutType === "radial") {
            setEdges(mapEdgesForRadialLayout(nodes, edges, activePalette.edge));
        } else if (newLayoutType === "symmetric-horizontal") {
            setEdges(mapEdgesForSymmetricHorizontalLayout(nodes, edges, activePalette.edge));
        } else {
            setEdges(mapEdgesForHorizontalLayout(edges, activePalette.edge));
        }
    };

    const handleGenerateSuccess = (response: any) => {
        const data = response.data.data;
        if (!data) return;

        const palette = getPaletteBySelection(paletteSelection);
        const nextNodes = data.nodes as unknown as Node[];
        const nextEdges = data.edges as Edge[];

        applyPaletteToGraph(palette, nextNodes, nextEdges);
        setMetadata(data.metadata);
        setCurrentTitle(data.title ?? "");
    };

    const handleSave = () => {
        const trimmedName = saveName.trim();
        if (!trimmedName || !metadata) return;

        saveMindMap(
            {
                name: trimmedName,
                title: currentTitle,
                topic,
                layoutType,
                nodes: nodes as any,
                edges: edges as any,
                metadata,
            },
            {
                onSuccess: () => {
                    setShowSaveDialog(false);
                    setSaveName("");
                    toast.success({ title: "Đã lưu mindmap thành công" });
                },
                onError: () => {
                    toast.error({ title: "Lỗi khi lưu mindmap" });
                },
            },
        );
    };

    const handleLoadSavedMindMap = (detail: SavedMindMapDetailDto) => {
        setTopic(detail.topic);
        setLayoutType(detail.layoutType as MindMapLayoutType);
        setNodes(detail.nodes as unknown as Node[]);
        setEdges(detail.edges as unknown as Edge[]);
        setMetadata(detail.metadata);
        setCurrentTitle(detail.title);
        setActiveTab("generate");
    };

    const handleNodeDoubleClick = (_event: React.MouseEvent, node: Node) => {
        const data = node.data as { label: string; description: string };
        setEditingNode({ id: node.id, label: data.label ?? "", description: data.description ?? "" });
    };

    const handleSaveNodeEdit = () => {
        if (!editingNode) return;
        setNodes((prev) =>
            prev.map((n) =>
                n.id === editingNode.id
                    ? { ...n, data: { ...n.data, label: editingNode.label, description: editingNode.description } }
                    : n,
            ),
        );
        setEditingNode(null);
    };

    const handleGenerate = () => {
        const trimmed = topic.trim();
        if (!trimmed) return;

        const payload = {
            topic: trimmed,
            grade,
            max_depth: maxDepth,
            max_branches: maxBranches,
        };

        const options = { onSuccess: handleGenerateSuccess };

        if (layoutType === "radial") {
            generateRadial(payload, options);
            return;
        }

        if (layoutType === "symmetric-horizontal") {
            generateSymmetricHorizontal(payload, options);
            return;
        }

        generateHorizontal(payload, options);
    };

    const handleExportImage = async () => {
        if (!flowContainerRef.current || !hasResult) return;

        try {
            const viewportElement = flowContainerRef.current.querySelector(
                ".react-flow__viewport",
            ) as HTMLElement | null;

            if (!viewportElement) {
                throw new Error("React Flow viewport not found");
            }

            const imageWidth = 1920;
            const imageHeight = 1080;
            const nodesBounds = getNodesBounds(nodes);
            const viewport = getViewportForBounds(
                nodesBounds,
                imageWidth,
                imageHeight,
                0.2,
                2,
                0.15,
            );

            const dataUrl = await toPng(viewportElement, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: "#ffffff",
                width: imageWidth,
                height: imageHeight,
                style: {
                    width: `${imageWidth}px`,
                    height: `${imageHeight}px`,
                    transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
                },
            });

            const anchor = document.createElement("a");
            const safeTopic = (topic.trim() || "mindmap")
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-");

            anchor.href = dataUrl;
            anchor.download = `${safeTopic}-${layoutType}.png`;
            anchor.click();

            toast.success({
                title: t("mindmap.export.successTitle"),
                description: t("mindmap.export.successDescription"),
            });
        } catch (error) {
            console.error("[MindMap] Export image failed:", error);
            toast.error({
                title: t("mindmap.export.errorTitle"),
                description: t("mindmap.export.errorDescription"),
            });
        }
    };

    const hasResult = nodes.length > 0;
    const sourceEntries = metadata?.sources ? Object.entries(metadata.sources) : [];

    return (
        <div className="flex h-[calc(100vh-2rem)] flex-col gap-4 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {t("mindmap.title")}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {t("mindmap.subtitle")}
                    </p>
                </div>

                {activeTab === "generate" && metadata && (
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span>{t("mindmap.metadata.nodes", { count: metadata.total_nodes })}</span>
                        <span>•</span>
                        <span>{t("mindmap.metadata.edges", { count: metadata.total_edges })}</span>
                        <span>•</span>
                        <span>{t("mindmap.metadata.depth", { depth: metadata.max_depth })}</span>
                        {sourceEntries.length > 0 && (
                            <>
                                <span>•</span>
                                <details className="group relative">
                                    <summary className="flex cursor-pointer list-none items-center gap-1 rounded-md px-2 py-1 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white [&::-webkit-details-marker]:hidden">
                                        <BookOpen className="h-3 w-3" />
                                        {t("mindmap.metadata.sources", { count: sourceEntries.length })}
                                    </summary>
                                    <div className="absolute right-0 top-full z-30 mt-2 w-96 rounded-lg border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                                        <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            {t("mindmap.metadata.sourcesTitle")}
                                        </p>
                                        <div className="max-h-56 space-y-2 overflow-auto pr-1">
                                            {sourceEntries.map(([sourceName, sourceDetail]) => (
                                                <div
                                                    key={sourceName}
                                                    className="rounded-md border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800/60"
                                                >
                                                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                                                        {sourceName}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                                                        {sourceDetail}
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

            {/* Tabs */}
            <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => setActiveTab("generate")}
                    className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === "generate"
                            ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                            : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                >
                    <Sparkles className="h-4 w-4" />
                    Tạo mindmap
                </button>
                <button
                    onClick={() => setActiveTab("saved")}
                    className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === "saved"
                            ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                            : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                >
                    <BookMarked className="h-4 w-4" />
                    Đã lưu
                </button>
            </div>

            {/* Generate Tab */}
            {activeTab === "generate" && (
                <>
                    {/* Input */}
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-3">
                            <Input
                                className="flex-1"
                                placeholder={t("mindmap.topicPlaceholder")}
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !isPending) handleGenerate();
                                }}
                                disabled={isPending}
                            />
                            <select
                                value={layoutType}
                                onChange={(e) => handleLayoutTypeChange(e.target.value as MindMapLayoutType)}
                                disabled={isPending}
                                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                            >
                                <option value="radial">{t("mindmap.layout.radial")}</option>
                                <option value="symmetric-horizontal">{t("mindmap.layout.symmetricHorizontal")}</option>
                                <option value="horizontal">{t("mindmap.layout.horizontal")}</option>
                            </select>
                            <select
                                value={paletteSelection}
                                onChange={(e) => handlePaletteSelectionChange(e.target.value as MindMapPaletteSelection)}
                                disabled={isPending}
                                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                            >
                                <option value="random">{t("mindmap.theme.random")}</option>
                                {MINDMAP_PALETTES.map((palette) => (
                                    <option key={palette.id} value={palette.id}>
                                        {t(palette.nameKey)}
                                    </option>
                                ))}
                            </select>
                            <Button
                                variant="outline"
                                onPress={() => setShowSettings(!showSettings)}
                                className="shrink-0"
                            >
                                <Settings2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                onPress={handleExportImage}
                                isDisabled={!hasResult || isPending}
                                className="gap-2 shrink-0"
                            >
                                <ImageDown className="h-4 w-4" />
                                {t("mindmap.button.export")}
                            </Button>
                            <Button
                                variant="outline"
                                onPress={() => {
                                    setSaveName("");
                                    setShowSaveDialog(true);
                                }}
                                isDisabled={!hasResult || isPending}
                                className="gap-2 shrink-0"
                            >
                                <Save className="h-4 w-4" />
                                Lưu
                            </Button>
                            <Button
                                onPress={handleGenerate}
                                isDisabled={isPending || !topic.trim()}
                                className="gap-2 shrink-0"
                            >
                                {isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Sparkles className="h-4 w-4" />
                                )}
                                {isPending ? t("mindmap.button.generating") : t("mindmap.button.generate")}
                            </Button>
                        </div>

                        {showSettings && (
                            <div className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("mindmap.settings.grade")}</label>
                                    <select
                                        value={grade}
                                        onChange={(e) => setGrade(Number(e.target.value))}
                                        disabled={isPending}
                                        className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                                    >
                                        {Array.from({ length: 10 }, (_, i) => i + 3).map((g) => (
                                            <option key={g} value={g}>{`${t("mindmap.settings.grade")} ${g}`}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("mindmap.settings.maxDepth")}</label>
                                    <select
                                        value={maxDepth}
                                        onChange={(e) => setMaxDepth(Number(e.target.value))}
                                        disabled={isPending}
                                        className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                                    >
                                        {[2, 3, 4].map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("mindmap.settings.maxBranches")}</label>
                                    <select
                                        value={maxBranches}
                                        onChange={(e) => setMaxBranches(Number(e.target.value))}
                                        disabled={isPending}
                                        className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                                    >
                                        {Array.from({ length: 7 }, (_, i) => i + 2).map((b) => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* React Flow Canvas */}
                    <div
                        ref={flowContainerRef}
                        className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                    >
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
                                <Background gap={20} size={1} />
                                <Controls position="bottom-right" />
                                <MiniMap
                                    position="bottom-left"
                                    pannable
                                    zoomable
                                    className="bg-slate-100! dark:bg-slate-800!"
                                />
                            </ReactFlow>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                <Sparkles className="mb-3 h-12 w-12 opacity-30" />
                                <p className="text-lg font-medium">{t("mindmap.empty.title")}</p>
                                <p className="mt-1 text-sm">{t("mindmap.empty.description")}</p>
                            </div>
                        )}
                    </div>

                    {hasResult && (
                        <p className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                            <Pencil className="h-3 w-3" />
                            Double-click vào node bất kỳ để chỉnh sửa nội dung
                        </p>
                    )}
                </>
            )}

            {/* Saved Tab */}
            {activeTab === "saved" && (
                <SavedMindMapsPanel onLoad={handleLoadSavedMindMap} />
            )}

            {/* Edit Node Dialog */}
            {editingNode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                            <Pencil className="h-4 w-4" />
                            Chỉnh sửa node
                        </h2>
                        <div className="mt-4 flex flex-col gap-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Tiêu đề
                                </label>
                                <Input
                                    value={editingNode.label}
                                    onChange={(e) => setEditingNode({ ...editingNode, label: e.target.value })}
                                    onKeyDown={(e) => {
                                        if (e.key === "Escape") setEditingNode(null);
                                    }}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Mô tả
                                </label>
                                <textarea
                                    value={editingNode.description}
                                    onChange={(e) => setEditingNode({ ...editingNode, description: e.target.value })}
                                    onKeyDown={(e) => {
                                        if (e.key === "Escape") setEditingNode(null);
                                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSaveNodeEdit();
                                    }}
                                    rows={3}
                                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                                />
                                <p className="mt-1 text-xs text-slate-400">Ctrl+Enter để lưu</p>
                            </div>
                        </div>
                        <div className="mt-5 flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onPress={() => setEditingNode(null)}
                            >
                                Hủy
                            </Button>
                            <Button
                                onPress={handleSaveNodeEdit}
                                isDisabled={!editingNode.label.trim()}
                                className="gap-2"
                            >
                                <Pencil className="h-4 w-4" />
                                Lưu thay đổi
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Dialog */}
            {showSaveDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Lưu mindmap
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Đặt tên để dễ tìm lại sau này.
                        </p>
                        <Input
                            className="mt-4"
                            placeholder="Ví dụ: Ôn tập chương 3 - Hóa học"
                            value={saveName}
                            onChange={(e) => setSaveName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && saveName.trim()) handleSave();
                                if (e.key === "Escape") setShowSaveDialog(false);
                            }}
                            autoFocus
                        />
                        <div className="mt-4 flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onPress={() => setShowSaveDialog(false)}
                                isDisabled={isSaving}
                            >
                                Hủy
                            </Button>
                            <Button
                                onPress={handleSave}
                                isDisabled={!saveName.trim() || isSaving}
                                className="gap-2"
                            >
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                Lưu
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
