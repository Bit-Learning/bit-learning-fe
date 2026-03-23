import type React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Plus, X } from "lucide-react";

export type NodeShape = "rounded" | "pill" | "square" | "circle" | "diamond" | "hexagon";

interface MindMapNodeData {
    label: string;
    description?: string;
    /** CSS inline style từ theme_config.nodeStyles.* */
    nodeStyle: React.CSSProperties;
    /** Màu handle từ theme_config.colors[depth] */
    handleColor: string;
    /** Hình dạng node — được chọn từ ShapePicker */
    nodeShape?: NodeShape;
    /** Callbacks từ MindMapView để edit trực tiếp trên canvas */
    onAddChild?: () => void;
    onDeleteNode?: () => void;
}

// ─── Action buttons (hiện khi hover node) ────────────────────────────────────

function NodeActions({ onAdd, onDelete }: { onAdd?: () => void; onDelete?: () => void }) {
    if (!onAdd && !onDelete) return null;
    return (
        <div className="absolute -right-2 -top-2 z-20 hidden items-center gap-0.5 group-hover:flex">
            {onAdd && (
                <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onAdd(); }}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md transition-colors hover:bg-emerald-600"
                    title="Thêm node con"
                >
                    <Plus className="h-3 w-3" />
                </button>
            )}
            {onDelete && (
                <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-colors hover:bg-red-600"
                    title="Xóa node"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </div>
    );
}

/** Trả về CSS shape riêng — clip-path shapes bỏ qua border/boxShadow của node */
function getShapeStyle(shape: NodeShape | undefined, level: "root" | "branch" | "leaf"): React.CSSProperties {
    switch (shape) {
        case "pill":    return { borderRadius: "9999px" };
        case "square":  return { borderRadius: "0px" };
        case "circle":  return { borderRadius: "50%", aspectRatio: "1 / 1", minWidth: "unset", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" };
        case "diamond": return { borderRadius: 0, clipPath: "polygon(50% 0%,100% 50%,50% 100%,0% 50%)", aspectRatio: "1 / 1", minWidth: "unset", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" };
        case "hexagon": return { borderRadius: 0, clipPath: "polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" };
        default:
            return { borderRadius: level === "root" ? "16px" : level === "branch" ? "12px" : "8px" };
    }
}

function isClipPath(shape: NodeShape | undefined): boolean {
    return shape === "diamond" || shape === "hexagon";
}

// ─── Center handles ───────────────────────────────────────────────────────────
// Đặt handle tại trung tâm node — edge nối vào giữa, node đè lên endpoint

const centerHandleStyle: React.CSSProperties = {
    width: 1,
    height: 1,
    minWidth: 1,
    minHeight: 1,
    border: "none",
    opacity: 0,
    pointerEvents: "none",
    position: "absolute",
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
};

function CenterHandles({ hasSource = true, hasTarget = true }: { hasSource?: boolean; hasTarget?: boolean }) {
    return (
        <>
            {hasTarget && <Handle id="target" type="target" position={Position.Top}    style={centerHandleStyle} />}
            {hasSource && <Handle id="source" type="source" position={Position.Bottom} style={centerHandleStyle} />}
        </>
    );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Tách borderRadius khỏi nodeStyle — chúng ta tự kiểm soát hình dạng node */
function splitNodeStyle(nodeStyle: React.CSSProperties) {
    const { borderRadius: _br, border: _b, boxShadow: _bs, ...rest } = nodeStyle;
    return rest;
}

// ─── Radial nodes ─────────────────────────────────────────────────────────────

export function MindMapRadialRootNode({ data }: NodeProps) {
    const { label, description, nodeStyle, handleColor, nodeShape, onAddChild } = data as unknown as MindMapNodeData;
    const baseStyle = splitNodeStyle(nodeStyle);
    const clipped = isClipPath(nodeShape);
    return (
        <div
            className="group relative min-w-[160px] max-w-[230px] cursor-default select-none break-words px-6 py-4 text-center transition-shadow hover:shadow-2xl"
            style={{
                ...baseStyle,
                ...getShapeStyle(nodeShape, "root"),
                ...(!clipped && {
                    border: `2.5px solid ${handleColor}`,
                    boxShadow: `0 0 0 5px ${handleColor}22, 0 8px 28px ${handleColor}38, 0 2px 8px rgba(0,0,0,0.14)`,
                }),
            }}
        >
            <NodeActions onAdd={onAddChild} />
            <p className="text-sm font-extrabold leading-tight tracking-tight">{label}</p>
            {description && (
                <p className="mt-1.5 text-[11px] font-normal leading-snug opacity-80">{description}</p>
            )}
            <CenterHandles hasSource hasTarget={false} />
        </div>
    );
}

export function MindMapRadialBranchNode({ data }: NodeProps) {
    const { label, description, nodeStyle, handleColor, nodeShape, onAddChild, onDeleteNode } = data as unknown as MindMapNodeData;
    const baseStyle = splitNodeStyle(nodeStyle);
    const clipped = isClipPath(nodeShape);
    return (
        <div
            className="group relative min-w-[130px] max-w-[200px] cursor-default select-none break-words px-5 py-3 text-center transition-shadow hover:shadow-xl"
            style={{
                ...baseStyle,
                ...getShapeStyle(nodeShape, "branch"),
                ...(!clipped && {
                    border: `1.5px solid ${handleColor}70`,
                    boxShadow: `0 4px 16px ${handleColor}28, 0 1px 5px rgba(0,0,0,0.1)`,
                }),
            }}
        >
            <NodeActions onAdd={onAddChild} onDelete={onDeleteNode} />
            <p className="text-xs font-bold leading-tight">{label}</p>
            {description && (
                <p className="mt-1 text-[10px] leading-snug opacity-75">{description}</p>
            )}
            <CenterHandles />
        </div>
    );
}

export function MindMapRadialLeafNode({ data }: NodeProps) {
    const { label, description, nodeStyle, handleColor, nodeShape, onAddChild, onDeleteNode } = data as unknown as MindMapNodeData;
    const baseStyle = splitNodeStyle(nodeStyle);
    const clipped = isClipPath(nodeShape);
    return (
        <div
            className="group relative min-w-[110px] max-w-[175px] cursor-default select-none break-words px-4 py-2.5 text-center transition-shadow hover:shadow-lg"
            style={{
                ...baseStyle,
                ...getShapeStyle(nodeShape, "leaf"),
                ...(!clipped && {
                    border: `1px solid ${handleColor}45`,
                    boxShadow: `0 2px 10px ${handleColor}18, 0 1px 3px rgba(0,0,0,0.07)`,
                }),
            }}
        >
            <NodeActions onAdd={onAddChild} onDelete={onDeleteNode} />
            <p className="text-[11px] font-semibold leading-tight">{label}</p>
            {description && (
                <p className="mt-0.5 text-[10px] leading-snug opacity-70">{description}</p>
            )}
            <CenterHandles />
        </div>
    );
}

// ─── Symmetric nodes ──────────────────────────────────────────────────────────

export function MindMapSymmetricRootNode({ data }: NodeProps) {
    const { label, description, nodeStyle, handleColor, nodeShape, onAddChild } = data as unknown as MindMapNodeData;
    const baseStyle = splitNodeStyle(nodeStyle);
    const clipped = isClipPath(nodeShape);
    return (
        <div
            className="group relative min-w-[160px] max-w-[230px] cursor-default select-none break-words px-6 py-4 text-center transition-shadow hover:shadow-2xl"
            style={{
                ...baseStyle,
                ...getShapeStyle(nodeShape, "root"),
                ...(!clipped && {
                    border: `2.5px solid ${handleColor}`,
                    boxShadow: `0 0 0 5px ${handleColor}22, 0 8px 28px ${handleColor}38, 0 2px 8px rgba(0,0,0,0.14)`,
                }),
            }}
        >
            <NodeActions onAdd={onAddChild} />
            <p className="text-sm font-extrabold leading-tight tracking-tight">{label}</p>
            {description && (
                <p className="mt-1.5 text-[11px] font-normal leading-snug opacity-80">{description}</p>
            )}
            <CenterHandles hasSource hasTarget={false} />
        </div>
    );
}

export function MindMapSymmetricBranchNode({ data }: NodeProps) {
    const { label, description, nodeStyle, handleColor, nodeShape, onAddChild, onDeleteNode } = data as unknown as MindMapNodeData;
    const baseStyle = splitNodeStyle(nodeStyle);
    const clipped = isClipPath(nodeShape);
    return (
        <div
            className="group relative min-w-[130px] max-w-[200px] cursor-default select-none break-words px-5 py-3 text-center transition-shadow hover:shadow-xl"
            style={{
                ...baseStyle,
                ...getShapeStyle(nodeShape, "branch"),
                ...(!clipped && {
                    border: `1.5px solid ${handleColor}70`,
                    boxShadow: `0 4px 16px ${handleColor}28, 0 1px 5px rgba(0,0,0,0.1)`,
                }),
            }}
        >
            <NodeActions onAdd={onAddChild} onDelete={onDeleteNode} />
            <p className="text-xs font-bold leading-tight">{label}</p>
            {description && (
                <p className="mt-1 text-[10px] leading-snug opacity-75">{description}</p>
            )}
            <CenterHandles />
        </div>
    );
}

export function MindMapSymmetricLeafNode({ data }: NodeProps) {
    const { label, description, nodeStyle, handleColor, nodeShape, onAddChild, onDeleteNode } = data as unknown as MindMapNodeData;
    const baseStyle = splitNodeStyle(nodeStyle);
    const clipped = isClipPath(nodeShape);
    return (
        <div
            className="group relative min-w-[110px] max-w-[175px] cursor-default select-none break-words px-4 py-2.5 text-center transition-shadow hover:shadow-lg"
            style={{
                ...baseStyle,
                ...getShapeStyle(nodeShape, "leaf"),
                ...(!clipped && {
                    border: `1px solid ${handleColor}45`,
                    boxShadow: `0 2px 10px ${handleColor}18, 0 1px 3px rgba(0,0,0,0.07)`,
                }),
            }}
        >
            <NodeActions onAdd={onAddChild} onDelete={onDeleteNode} />
            <p className="text-[11px] font-semibold leading-tight">{label}</p>
            {description && (
                <p className="mt-0.5 text-[10px] leading-snug opacity-70">{description}</p>
            )}
            <CenterHandles />
        </div>
    );
}

// ─── Horizontal nodes ─────────────────────────────────────────────────────────

export function MindMapRootNode({ data }: NodeProps) {
    const { label, description, nodeStyle, handleColor, nodeShape, onAddChild } = data as unknown as MindMapNodeData;
    const baseStyle = splitNodeStyle(nodeStyle);
    const clipped = isClipPath(nodeShape);
    return (
        <div
            className="group relative min-w-[160px] max-w-[230px] cursor-default select-none break-words px-6 py-4 text-center"
            style={{
                ...baseStyle,
                ...getShapeStyle(nodeShape, "root"),
                ...(!clipped && {
                    border: `2.5px solid ${handleColor}`,
                    boxShadow: `0 0 0 5px ${handleColor}22, 0 8px 28px ${handleColor}38`,
                }),
            }}
        >
            <NodeActions onAdd={onAddChild} />
            <p className="text-sm font-extrabold leading-tight">{label}</p>
            {description && (
                <p className="mt-1.5 text-[11px] leading-snug opacity-80">{description}</p>
            )}
            <CenterHandles hasSource hasTarget={false} />
        </div>
    );
}

export function MindMapBranchNode({ data }: NodeProps) {
    const { label, description, nodeStyle, handleColor, nodeShape, onAddChild, onDeleteNode } = data as unknown as MindMapNodeData;
    const baseStyle = splitNodeStyle(nodeStyle);
    const clipped = isClipPath(nodeShape);
    return (
        <div
            className="group relative min-w-[130px] max-w-[200px] cursor-default select-none break-words px-5 py-3 text-center"
            style={{
                ...baseStyle,
                ...getShapeStyle(nodeShape, "branch"),
                ...(!clipped && {
                    border: `1.5px solid ${handleColor}70`,
                    boxShadow: `0 4px 16px ${handleColor}28`,
                }),
            }}
        >
            <NodeActions onAdd={onAddChild} onDelete={onDeleteNode} />
            <p className="text-xs font-bold leading-tight">{label}</p>
            {description && (
                <p className="mt-1 text-[10px] leading-snug opacity-75">{description}</p>
            )}
            <CenterHandles />
        </div>
    );
}

export function MindMapLeafNode({ data }: NodeProps) {
    const { label, description, nodeStyle, handleColor, nodeShape, onAddChild, onDeleteNode } = data as unknown as MindMapNodeData;
    const baseStyle = splitNodeStyle(nodeStyle);
    const clipped = isClipPath(nodeShape);
    return (
        <div
            className="group relative min-w-[110px] max-w-[175px] cursor-default select-none break-words px-4 py-2.5 text-center"
            style={{
                ...baseStyle,
                ...getShapeStyle(nodeShape, "leaf"),
                ...(!clipped && {
                    border: `1px solid ${handleColor}45`,
                    boxShadow: `0 2px 10px ${handleColor}18`,
                }),
            }}
        >
            <NodeActions onAdd={onAddChild} onDelete={onDeleteNode} />
            <p className="text-[11px] font-semibold leading-tight">{label}</p>
            {description && (
                <p className="mt-0.5 text-[10px] leading-snug opacity-70">{description}</p>
            )}
            <CenterHandles />
        </div>
    );
}

// ─── NodeTypes maps ───────────────────────────────────────────────────────────

export const mindMapNodeTypes = {
    mindMapRoot:   MindMapRootNode,
    mindMapBranch: MindMapBranchNode,
    mindMapLeaf:   MindMapLeafNode,
};

export const mindMapRadialNodeTypes = {
    mindMapRoot:   MindMapRadialRootNode,
    mindMapBranch: MindMapRadialBranchNode,
    mindMapLeaf:   MindMapRadialLeafNode,
};

export const mindMapSymmetricNodeTypes = {
    mindMapRoot:   MindMapSymmetricRootNode,
    mindMapBranch: MindMapSymmetricBranchNode,
    mindMapLeaf:   MindMapSymmetricLeafNode,
};
