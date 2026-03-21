import type React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

interface MindMapNodeData {
    label: string;
    description?: string;
    /** CSS inline style từ theme_config.nodeStyles.* */
    nodeStyle: React.CSSProperties;
    /** Màu handle từ theme_config.colors[depth] */
    handleColor: string;
}

// ─── Invisible handles ────────────────────────────────────────────────────────
// Vẫn functional cho edge routing nhưng không hiển thị ra ngoài

const hiddenHandle: React.CSSProperties = {
    width: 8,
    height: 8,
    border: "none",
    opacity: 0,
    pointerEvents: "none",
};

function RadialHandles({
    handleColor,
    hasSource = true,
    hasTarget = true,
}: {
    handleColor: string;
    hasSource?: boolean;
    hasTarget?: boolean;
}) {
    const s = { ...hiddenHandle, background: handleColor };
    return (
        <>
            {hasTarget && (
                <>
                    <Handle id="target-top"    type="target" position={Position.Top}    style={s} />
                    <Handle id="target-right"  type="target" position={Position.Right}  style={s} />
                    <Handle id="target-bottom" type="target" position={Position.Bottom} style={s} />
                    <Handle id="target-left"   type="target" position={Position.Left}   style={s} />
                </>
            )}
            {hasSource && (
                <>
                    <Handle id="source-top"    type="source" position={Position.Top}    style={s} />
                    <Handle id="source-right"  type="source" position={Position.Right}  style={s} />
                    <Handle id="source-bottom" type="source" position={Position.Bottom} style={s} />
                    <Handle id="source-left"   type="source" position={Position.Left}   style={s} />
                </>
            )}
        </>
    );
}

function SymmetricHandles({
    handleColor,
    hasSource = true,
    hasTarget = true,
}: {
    handleColor: string;
    hasSource?: boolean;
    hasTarget?: boolean;
}) {
    const s = { ...hiddenHandle, background: handleColor };
    return (
        <>
            {hasTarget && (
                <>
                    <Handle id="target-left"  type="target" position={Position.Left}  style={s} />
                    <Handle id="target-right" type="target" position={Position.Right} style={s} />
                </>
            )}
            {hasSource && (
                <>
                    <Handle id="source-left"  type="source" position={Position.Left}  style={s} />
                    <Handle id="source-right" type="source" position={Position.Right} style={s} />
                </>
            )}
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
    const { label, description, nodeStyle, handleColor } = data as unknown as MindMapNodeData;
    const baseStyle = splitNodeStyle(nodeStyle);
    return (
        <div
            className="relative min-w-[160px] max-w-[230px] cursor-default select-none break-words rounded-2xl px-6 py-4 text-center transition-shadow hover:shadow-2xl"
            style={{
                ...baseStyle,
                border: `2.5px solid ${handleColor}`,
                boxShadow: `0 0 0 5px ${handleColor}22, 0 8px 28px ${handleColor}38, 0 2px 8px rgba(0,0,0,0.14)`,
            }}
        >
            <p className="text-sm font-extrabold leading-tight tracking-tight">{label}</p>
            {description && (
                <p className="mt-1.5 text-[11px] font-normal leading-snug opacity-80">{description}</p>
            )}
            <RadialHandles handleColor={handleColor} hasSource hasTarget={false} />
        </div>
    );
}

export function MindMapRadialBranchNode({ data }: NodeProps) {
    const { label, description, nodeStyle, handleColor } = data as unknown as MindMapNodeData;
    const baseStyle = splitNodeStyle(nodeStyle);
    return (
        <div
            className="relative min-w-[130px] max-w-[200px] cursor-default select-none break-words rounded-xl px-5 py-3 text-center transition-shadow hover:shadow-xl"
            style={{
                ...baseStyle,
                border: `1.5px solid ${handleColor}70`,
                boxShadow: `0 4px 16px ${handleColor}28, 0 1px 5px rgba(0,0,0,0.1)`,
            }}
        >
            <p className="text-xs font-bold leading-tight">{label}</p>
            {description && (
                <p className="mt-1 text-[10px] leading-snug opacity-75">{description}</p>
            )}
            <RadialHandles handleColor={handleColor} />
        </div>
    );
}

export function MindMapRadialLeafNode({ data }: NodeProps) {
    const { label, description, nodeStyle, handleColor } = data as unknown as MindMapNodeData;
    const baseStyle = splitNodeStyle(nodeStyle);
    return (
        <div
            className="relative min-w-[110px] max-w-[175px] cursor-default select-none break-words rounded-lg px-4 py-2.5 text-center transition-shadow hover:shadow-lg"
            style={{
                ...baseStyle,
                border: `1px solid ${handleColor}45`,
                boxShadow: `0 2px 10px ${handleColor}18, 0 1px 3px rgba(0,0,0,0.07)`,
            }}
        >
            <p className="text-[11px] font-semibold leading-tight">{label}</p>
            {description && (
                <p className="mt-0.5 text-[10px] leading-snug opacity-70">{description}</p>
            )}
            <RadialHandles handleColor={handleColor} hasSource={false} hasTarget />
        </div>
    );
}

// ─── Symmetric nodes ──────────────────────────────────────────────────────────

export function MindMapSymmetricRootNode({ data }: NodeProps) {
    const { label, description, nodeStyle, handleColor } = data as unknown as MindMapNodeData;
    const baseStyle = splitNodeStyle(nodeStyle);
    return (
        <div
            className="relative min-w-[160px] max-w-[230px] cursor-default select-none break-words rounded-2xl px-6 py-4 text-center transition-shadow hover:shadow-2xl"
            style={{
                ...baseStyle,
                border: `2.5px solid ${handleColor}`,
                boxShadow: `0 0 0 5px ${handleColor}22, 0 8px 28px ${handleColor}38, 0 2px 8px rgba(0,0,0,0.14)`,
            }}
        >
            <p className="text-sm font-extrabold leading-tight tracking-tight">{label}</p>
            {description && (
                <p className="mt-1.5 text-[11px] font-normal leading-snug opacity-80">{description}</p>
            )}
            <SymmetricHandles handleColor={handleColor} hasSource hasTarget={false} />
        </div>
    );
}

export function MindMapSymmetricBranchNode({ data }: NodeProps) {
    const { label, description, nodeStyle, handleColor } = data as unknown as MindMapNodeData;
    const baseStyle = splitNodeStyle(nodeStyle);
    return (
        <div
            className="relative min-w-[130px] max-w-[200px] cursor-default select-none break-words rounded-xl px-5 py-3 text-center transition-shadow hover:shadow-xl"
            style={{
                ...baseStyle,
                border: `1.5px solid ${handleColor}70`,
                boxShadow: `0 4px 16px ${handleColor}28, 0 1px 5px rgba(0,0,0,0.1)`,
            }}
        >
            <p className="text-xs font-bold leading-tight">{label}</p>
            {description && (
                <p className="mt-1 text-[10px] leading-snug opacity-75">{description}</p>
            )}
            <SymmetricHandles handleColor={handleColor} />
        </div>
    );
}

export function MindMapSymmetricLeafNode({ data }: NodeProps) {
    const { label, description, nodeStyle, handleColor } = data as unknown as MindMapNodeData;
    const baseStyle = splitNodeStyle(nodeStyle);
    return (
        <div
            className="relative min-w-[110px] max-w-[175px] cursor-default select-none break-words rounded-lg px-4 py-2.5 text-center transition-shadow hover:shadow-lg"
            style={{
                ...baseStyle,
                border: `1px solid ${handleColor}45`,
                boxShadow: `0 2px 10px ${handleColor}18, 0 1px 3px rgba(0,0,0,0.07)`,
            }}
        >
            <p className="text-[11px] font-semibold leading-tight">{label}</p>
            {description && (
                <p className="mt-0.5 text-[10px] leading-snug opacity-70">{description}</p>
            )}
            <SymmetricHandles handleColor={handleColor} hasSource={false} hasTarget />
        </div>
    );
}

// ─── Horizontal nodes ─────────────────────────────────────────────────────────

export function MindMapRootNode({ data }: NodeProps) {
    const { label, description, nodeStyle, handleColor } = data as unknown as MindMapNodeData;
    const baseStyle = splitNodeStyle(nodeStyle);
    const s = { ...hiddenHandle, background: handleColor };
    return (
        <div
            className="relative min-w-[160px] max-w-[230px] cursor-default select-none break-words rounded-2xl px-6 py-4 text-center"
            style={{
                ...baseStyle,
                border: `2.5px solid ${handleColor}`,
                boxShadow: `0 0 0 5px ${handleColor}22, 0 8px 28px ${handleColor}38`,
            }}
        >
            <p className="text-sm font-extrabold leading-tight">{label}</p>
            {description && (
                <p className="mt-1.5 text-[11px] leading-snug opacity-80">{description}</p>
            )}
            <Handle id="source-bottom" type="source" position={Position.Bottom} style={s} />
        </div>
    );
}

export function MindMapBranchNode({ data }: NodeProps) {
    const { label, description, nodeStyle, handleColor } = data as unknown as MindMapNodeData;
    const baseStyle = splitNodeStyle(nodeStyle);
    const s = { ...hiddenHandle, background: handleColor };
    return (
        <div
            className="relative min-w-[130px] max-w-[200px] cursor-default select-none break-words rounded-xl px-5 py-3 text-center"
            style={{
                ...baseStyle,
                border: `1.5px solid ${handleColor}70`,
                boxShadow: `0 4px 16px ${handleColor}28`,
            }}
        >
            <p className="text-xs font-bold leading-tight">{label}</p>
            {description && (
                <p className="mt-1 text-[10px] leading-snug opacity-75">{description}</p>
            )}
            <Handle id="target-top"    type="target" position={Position.Top}    style={s} />
            <Handle id="source-bottom" type="source" position={Position.Bottom} style={s} />
        </div>
    );
}

export function MindMapLeafNode({ data }: NodeProps) {
    const { label, description, nodeStyle, handleColor } = data as unknown as MindMapNodeData;
    const baseStyle = splitNodeStyle(nodeStyle);
    const s = { ...hiddenHandle, background: handleColor };
    return (
        <div
            className="relative min-w-[110px] max-w-[175px] cursor-default select-none break-words rounded-lg px-4 py-2.5 text-center"
            style={{
                ...baseStyle,
                border: `1px solid ${handleColor}45`,
                boxShadow: `0 2px 10px ${handleColor}18`,
            }}
        >
            <p className="text-[11px] font-semibold leading-tight">{label}</p>
            {description && (
                <p className="mt-0.5 text-[10px] leading-snug opacity-70">{description}</p>
            )}
            <Handle id="target-top" type="target" position={Position.Top} style={s} />
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
