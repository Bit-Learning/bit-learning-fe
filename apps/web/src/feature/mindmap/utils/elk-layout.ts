import ELK from "elkjs/lib/elk.bundled.js";
import type { Edge, Node } from "@xyflow/react";
import type { MindMapTreeNode, StructureConfig, ThemeConfig } from "../types/mindmap.type";

const elk = new ELK();

// ─── Tree flattening ──────────────────────────────────────────────────────────

interface FlatNode {
    id: string;
    label: string;
    description?: string;
    type?: "root" | "branch" | "leaf";
    depth: number;
    parentId?: string;
}

function flattenTree(node: MindMapTreeNode, depth = 0, parentId?: string): FlatNode[] {
    const result: FlatNode[] = [
        { id: node.id, label: node.label, description: node.description, type: node.type, depth, parentId },
    ];
    for (const child of node.children ?? []) {
        result.push(...flattenTree(child, depth + 1, node.id));
    }
    return result;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getNodeType(depth: number): "mindMapRoot" | "mindMapBranch" | "mindMapLeaf" {
    if (depth === 0) return "mindMapRoot";
    if (depth === 1) return "mindMapBranch";
    return "mindMapLeaf";
}

function estimateSize(depth: number): { width: number; height: number } {
    if (depth === 0) return { width: 220, height: 80 };
    if (depth === 1) return { width: 190, height: 70 };
    return { width: 170, height: 60 };
}

// ─── Algorithm family ─────────────────────────────────────────────────────────

export type AlgorithmFamily = "horizontal" | "symmetric" | "radial";

/** Xác định hướng kết nối handle dựa vào cả algorithm lẫn elk.direction */
export function getAlgorithmFamily(structureConfig: StructureConfig): AlgorithmFamily {
    const alg = structureConfig.elkAlgorithm.toLowerCase();
    const dir = (structureConfig.elkOptions["elk.direction"] ?? "").toUpperCase();

    if (alg === "radial") return "radial";

    // direction tường minh → ưu tiên
    if (dir === "RIGHT" || dir === "LEFT") return "symmetric";  // nối trái-phải
    if (dir === "DOWN"  || dir === "UP")   return "horizontal"; // nối trên-dưới

    // fallback theo algorithm
    if (alg.includes("layered")) return "symmetric";
    if (alg.includes("mrtree"))  return "horizontal";
    if (alg.includes("stress") || alg.includes("force") || alg.includes("box")) return "symmetric";
    return "radial";
}

// ─── Edge handle direction ────────────────────────────────────────────────────

type HandleDirection = "top" | "right" | "bottom" | "left";

function getDirection(source: Node, target: Node): HandleDirection {
    const dx = target.position.x - source.position.x;
    const dy = target.position.y - source.position.y;
    if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? "right" : "left";
    return dy >= 0 ? "bottom" : "top";
}

function oppositeDir(dir: HandleDirection): HandleDirection {
    if (dir === "top") return "bottom";
    if (dir === "bottom") return "top";
    if (dir === "left") return "right";
    return "left";
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function runElkLayout(
    tree: MindMapTreeNode,
    structureConfig: StructureConfig,
    themeConfig: ThemeConfig,
): Promise<{ nodes: Node[]; edges: Edge[] }> {
    const flatNodes = flattenTree(tree);

    // Dùng elkAlgorithm + elkOptions trực tiếp từ BE
    const layoutOptions: Record<string, string> = {
        "elk.algorithm": structureConfig.elkAlgorithm,
        ...structureConfig.elkOptions,
    };

    const elkGraph = {
        id: "root",
        layoutOptions,
        children: flatNodes.map((n) => ({
            id: n.id,
            ...estimateSize(n.depth),
        })),
        edges: flatNodes
            .filter((n) => n.parentId !== undefined)
            .map((n) => ({
                id: `e-${n.parentId}-${n.id}`,
                sources: [n.parentId!],
                targets: [n.id],
            })),
    };

    const layout = await elk.layout(elkGraph);
    const elkNodeMap = new Map((layout.children ?? []).map((n) => [n.id, n]));

    // Node styles từ theme_config.nodeStyles
    const { nodeStyles, colors } = themeConfig;

    const rfNodes: Node[] = flatNodes.map((n) => {
        const elkNode = elkNodeMap.get(n.id);
        // Ưu tiên type từ BE, fallback về depth-based inference
        const beType = n.type;
        const type = beType === "root" ? "mindMapRoot"
            : beType === "branch" ? "mindMapBranch"
            : beType === "leaf" ? "mindMapLeaf"
            : getNodeType(n.depth);

        const nodeStyle =
            type === "mindMapRoot"
                ? (nodeStyles['root'] ?? {})
                : type === "mindMapBranch"
                    ? (nodeStyles['branch'] ?? {})
                    : (nodeStyles['leaf'] ?? {});

        // Handle color: lấy theo depth từ colors[], fallback về màu cuối cùng
        const handleColor = colors[n.depth] ?? colors.at(-1) ?? "#94a3b8";

        return {
            id: n.id,
            type,
            position: { x: elkNode?.x ?? 0, y: elkNode?.y ?? 0 },
            data: {
                label: n.label,
                description: n.description ?? "",
                nodeStyle,
                handleColor,
            },
        };
    });

    const nodeMap = new Map(rfNodes.map((n) => [n.id, n]));

    // Edge style từ theme_config.edgeStyle + edgeType từ structure_config
    const { animated: edgeAnimated, stroke, strokeWidth, ...restEdgeStyle } = themeConfig.edgeStyle;
    const algorithmFamily = getAlgorithmFamily(structureConfig);

    const rfEdges: Edge[] = flatNodes
        .filter((n) => n.parentId !== undefined)
        .map((n) => {
            const sourceNode = nodeMap.get(n.parentId!);
            const targetNode = nodeMap.get(n.id);

            const base: Edge = {
                id: `e-${n.parentId}-${n.id}`,
                source: n.parentId!,
                target: n.id,
                type: structureConfig.edgeType,
                animated: Boolean(edgeAnimated),
                style: {
                    stroke: stroke ?? "#94a3b8",
                    strokeWidth: strokeWidth ? Number(strokeWidth) : 2,
                    strokeLinecap: "round",
                    ...restEdgeStyle,
                },
            };

            if (!sourceNode || !targetNode) return base;

            if (algorithmFamily === "horizontal") {
                // Chỉ nối top ↔ bottom
                return { ...base, sourceHandle: "source-bottom", targetHandle: "target-top" };
            }

            if (algorithmFamily === "symmetric") {
                // Chỉ nối left ↔ right
                const dir = getDirection(sourceNode, targetNode);
                const hDir = dir === "left" ? "left" : "right";
                return { ...base, sourceHandle: `source-${hDir}`, targetHandle: `target-${oppositeDir(hDir)}` };
            }

            // radial: chọn hướng tốt nhất theo vị trí thực tế
            const dir = getDirection(sourceNode, targetNode);
            return { ...base, sourceHandle: `source-${dir}`, targetHandle: `target-${oppositeDir(dir)}` };
        });

    return { nodes: rfNodes, edges: rfEdges };
}
