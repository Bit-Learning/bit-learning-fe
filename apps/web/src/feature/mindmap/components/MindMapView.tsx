import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    type Node,
    type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@workspace/ui/components/Button";
import { Input } from "@workspace/ui/components/Input";
import { Loader2, Sparkles, BookOpen, Settings2 } from "lucide-react";
import {
    useGenerateHorizontalMindMap,
    useGenerateRadialMindMap,
    useGenerateSymmetricHorizontalMindMap,
} from "../queries/use-mindmap-queries";
import { mindMapNodeTypes, mindMapRadialNodeTypes, mindMapSymmetricNodeTypes } from "../components/MindMapNodes";
import type { MindMapResponse } from "../types/mindmap.type";

type MindMapLayoutType = "radial" | "symmetric-horizontal" | "horizontal";
type HandleDirection = "top" | "right" | "bottom" | "left";

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

function mapEdgesForRadialLayout(rawNodes: Node[], rawEdges: Edge[]): Edge[] {
    const nodeMap = new Map(rawNodes.map((node) => [node.id, node]));

    return rawEdges.map((edge) => {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);

        if (!sourceNode || !targetNode) {
            return edge;
        }

        const sourceDirection = getDirectionFromPositions(sourceNode, targetNode);
        const targetDirection = getOppositeDirection(sourceDirection);

        return {
            ...edge,
            sourceHandle: `source-${sourceDirection}`,
            targetHandle: `target-${targetDirection}`,
        };
    });
}

function mapEdgesForSymmetricHorizontalLayout(rawNodes: Node[], rawEdges: Edge[]): Edge[] {
    const nodeMap = new Map(rawNodes.map((node) => [node.id, node]));

    return rawEdges.map((edge) => {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);

        if (!sourceNode || !targetNode) {
            return edge;
        }

        const goRight = targetNode.position.x >= sourceNode.position.x;

        return {
            ...edge,
            sourceHandle: goRight ? "source-right" : "source-left",
            targetHandle: goRight ? "target-left" : "target-right",
        };
    });
}

export default function MindMapView() {
    const { t } = useTranslation();
    const [topic, setTopic] = useState("");
    const [layoutType, setLayoutType] = useState<MindMapLayoutType>("radial");
    const [grade, setGrade] = useState(10);
    const [maxDepth, setMaxDepth] = useState(3);
    const [maxBranches, setMaxBranches] = useState(5);
    const [showSettings, setShowSettings] = useState(false);
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [metadata, setMetadata] = useState<MindMapResponse["metadata"] | null>(null);

    const { mutate: generateRadial, isPending: isRadialPending } = useGenerateRadialMindMap();
    const { mutate: generateSymmetricHorizontal, isPending: isSymmetricHorizontalPending } =
        useGenerateSymmetricHorizontalMindMap();
    const { mutate: generateHorizontal, isPending: isHorizontalPending } = useGenerateHorizontalMindMap();

    const isPending = isRadialPending || isSymmetricHorizontalPending || isHorizontalPending;

    const activeNodeTypes =
        layoutType === "radial"
            ? mindMapRadialNodeTypes
            : layoutType === "symmetric-horizontal"
                ? mindMapSymmetricNodeTypes
                : mindMapNodeTypes;

    const handleGenerateSuccess = (response: any) => {
        const data = response.data.data;
        if (!data) return;

        const nextNodes = data.nodes as unknown as Node[];
        const nextEdges = data.edges as Edge[];

        setNodes(nextNodes);
        if (layoutType === "radial") {
            setEdges(mapEdgesForRadialLayout(nextNodes, nextEdges));
        } else if (layoutType === "symmetric-horizontal") {
            setEdges(mapEdgesForSymmetricHorizontalLayout(nextNodes, nextEdges));
        } else {
            setEdges(nextEdges);
        }
        setMetadata(data.metadata);
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

    const hasResult = nodes.length > 0;

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

                {metadata && (
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span>{t("mindmap.metadata.nodes", { count: metadata.total_nodes })}</span>
                        <span>•</span>
                        <span>{t("mindmap.metadata.edges", { count: metadata.total_edges })}</span>
                        <span>•</span>
                        <span>{t("mindmap.metadata.depth", { depth: metadata.max_depth })}</span>
                        {metadata.sources && Object.keys(metadata.sources).length > 0 && (
                            <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <BookOpen className="h-3 w-3" />
                                    {t("mindmap.metadata.sources", { count: Object.keys(metadata.sources).length })}
                                </span>
                            </>
                        )}
                    </div>
                )}
            </div>

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
                        onChange={(e) => setLayoutType(e.target.value as MindMapLayoutType)}
                        disabled={isPending}
                        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                    >
                        <option value="radial">{t("mindmap.layout.radial")}</option>
                        <option value="symmetric-horizontal">{t("mindmap.layout.symmetricHorizontal")}</option>
                        <option value="horizontal">{t("mindmap.layout.horizontal")}</option>
                    </select>
                    <Button
                        variant="outline"
                        onPress={() => setShowSettings(!showSettings)}
                        className="shrink-0"
                    >
                        <Settings2 className="h-4 w-4" />
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
            <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                {hasResult ? (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        nodeTypes={activeNodeTypes}
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
        </div>
    );
}
