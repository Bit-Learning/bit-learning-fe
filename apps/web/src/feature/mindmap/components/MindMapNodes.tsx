import { Handle, Position, type NodeProps } from "@xyflow/react";

interface MindMapNodeData {
    label: string;
    description: string;
    theme?: MindMapNodeTheme;
}

export interface MindMapNodeTheme {
    from: string;
    to: string;
    border: string;
    text: string;
    description: string;
    handle: string;
    shadow?: string;
}

const DEFAULT_ROOT_THEME: MindMapNodeTheme = {
    from: "#6366f1",
    to: "#7c3aed",
    border: "#818cf8",
    text: "#ffffff",
    description: "#e0e7ff",
    handle: "#a5b4fc",
    shadow: "rgba(99,102,241,0.35)",
};

const DEFAULT_BRANCH_THEME: MindMapNodeTheme = {
    from: "#eff6ff",
    to: "#e0f2fe",
    border: "#93c5fd",
    text: "#1e3a8a",
    description: "#1d4ed8",
    handle: "#60a5fa",
    shadow: "rgba(59,130,246,0.2)",
};

const DEFAULT_LEAF_THEME: MindMapNodeTheme = {
    from: "#ecfdf5",
    to: "#f0fdfa",
    border: "#a7f3d0",
    text: "#065f46",
    description: "#0f766e",
    handle: "#34d399",
    shadow: "rgba(16,185,129,0.2)",
};

function getNodeStyle(theme: MindMapNodeTheme) {
    return {
        background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
        borderColor: theme.border,
        color: theme.text,
        boxShadow: `0 10px 24px -10px ${theme.shadow ?? "rgba(0,0,0,0.2)"}`,
    };
}

function RadialHandles({ colorClass, hasSource = true, hasTarget = true }: { colorClass: string; hasSource?: boolean; hasTarget?: boolean }) {
    return (
        <>
            {hasTarget && (
                <>
                    <Handle id="target-top" type="target" position={Position.Top} className={`${colorClass} w-2! h-2!`} />
                    <Handle id="target-right" type="target" position={Position.Right} className={`${colorClass} w-2! h-2!`} />
                    <Handle id="target-bottom" type="target" position={Position.Bottom} className={`${colorClass} w-2! h-2!`} />
                    <Handle id="target-left" type="target" position={Position.Left} className={`${colorClass} w-2! h-2!`} />
                </>
            )}
            {hasSource && (
                <>
                    <Handle id="source-top" type="source" position={Position.Top} className={`${colorClass} w-2! h-2!`} />
                    <Handle id="source-right" type="source" position={Position.Right} className={`${colorClass} w-2! h-2!`} />
                    <Handle id="source-bottom" type="source" position={Position.Bottom} className={`${colorClass} w-2! h-2!`} />
                    <Handle id="source-left" type="source" position={Position.Left} className={`${colorClass} w-2! h-2!`} />
                </>
            )}
        </>
    );
}

function RadialHandlesWithColor({
    handleColor,
    hasSource = true,
    hasTarget = true,
}: {
    handleColor: string;
    hasSource?: boolean;
    hasTarget?: boolean;
}) {
    return (
        <>
            {hasTarget && (
                <>
                    <Handle id="target-top" type="target" position={Position.Top} className="w-2! h-2!" style={{ backgroundColor: handleColor }} />
                    <Handle id="target-right" type="target" position={Position.Right} className="w-2! h-2!" style={{ backgroundColor: handleColor }} />
                    <Handle id="target-bottom" type="target" position={Position.Bottom} className="w-2! h-2!" style={{ backgroundColor: handleColor }} />
                    <Handle id="target-left" type="target" position={Position.Left} className="w-2! h-2!" style={{ backgroundColor: handleColor }} />
                </>
            )}
            {hasSource && (
                <>
                    <Handle id="source-top" type="source" position={Position.Top} className="w-2! h-2!" style={{ backgroundColor: handleColor }} />
                    <Handle id="source-right" type="source" position={Position.Right} className="w-2! h-2!" style={{ backgroundColor: handleColor }} />
                    <Handle id="source-bottom" type="source" position={Position.Bottom} className="w-2! h-2!" style={{ backgroundColor: handleColor }} />
                    <Handle id="source-left" type="source" position={Position.Left} className="w-2! h-2!" style={{ backgroundColor: handleColor }} />
                </>
            )}
        </>
    );
}

function SymmetricHandles({ colorClass, hasSource = true, hasTarget = true }: { colorClass: string; hasSource?: boolean; hasTarget?: boolean }) {
    return (
        <>
            {hasTarget && (
                <>
                    <Handle id="target-left" type="target" position={Position.Left} className={`${colorClass} w-2! h-2!`} />
                    <Handle id="target-right" type="target" position={Position.Right} className={`${colorClass} w-2! h-2!`} />
                </>
            )}
            {hasSource && (
                <>
                    <Handle id="source-left" type="source" position={Position.Left} className={`${colorClass} w-2! h-2!`} />
                    <Handle id="source-right" type="source" position={Position.Right} className={`${colorClass} w-2! h-2!`} />
                </>
            )}
        </>
    );
}

function SymmetricHandlesWithColor({
    handleColor,
    hasSource = true,
    hasTarget = true,
}: {
    handleColor: string;
    hasSource?: boolean;
    hasTarget?: boolean;
}) {
    return (
        <>
            {hasTarget && (
                <>
                    <Handle id="target-left" type="target" position={Position.Left} className="w-2! h-2!" style={{ backgroundColor: handleColor }} />
                    <Handle id="target-right" type="target" position={Position.Right} className="w-2! h-2!" style={{ backgroundColor: handleColor }} />
                </>
            )}
            {hasSource && (
                <>
                    <Handle id="source-left" type="source" position={Position.Left} className="w-2! h-2!" style={{ backgroundColor: handleColor }} />
                    <Handle id="source-right" type="source" position={Position.Right} className="w-2! h-2!" style={{ backgroundColor: handleColor }} />
                </>
            )}
        </>
    );
}

export function MindMapRootNode({ data }: NodeProps) {
    const { label, description, theme } = data as unknown as MindMapNodeData;
    const appliedTheme = theme ?? DEFAULT_ROOT_THEME;
    return (
        <div className="rounded-2xl border-2 px-6 py-4 min-w-45 max-w-65" style={getNodeStyle(appliedTheme)}>
            <div className="text-center">
                <p className="text-base font-bold leading-tight">{label}</p>
                {description && (
                    <p className="mt-1.5 text-xs leading-snug opacity-90" style={{ color: appliedTheme.description }}>{description}</p>
                )}
            </div>
            <Handle type="source" position={Position.Bottom} className="w-2! h-2!" style={{ backgroundColor: appliedTheme.handle }} />
        </div>
    );
}

export function MindMapBranchNode({ data }: NodeProps) {
    const { label, description, theme } = data as unknown as MindMapNodeData;
    const appliedTheme = theme ?? DEFAULT_BRANCH_THEME;
    return (
        <div className="rounded-xl border px-5 py-3 min-w-40 max-w-60" style={getNodeStyle(appliedTheme)}>
            <div className="text-center">
                <p className="text-sm font-semibold">{label}</p>
                {description && (
                    <p className="mt-1 text-xs leading-snug" style={{ color: appliedTheme.description }}>{description}</p>
                )}
            </div>
            <Handle type="target" position={Position.Top} className="w-2! h-2!" style={{ backgroundColor: appliedTheme.handle }} />
            <Handle type="source" position={Position.Bottom} className="w-2! h-2!" style={{ backgroundColor: appliedTheme.handle }} />
        </div>
    );
}

export function MindMapLeafNode({ data }: NodeProps) {
    const { label, description, theme } = data as unknown as MindMapNodeData;
    const appliedTheme = theme ?? DEFAULT_LEAF_THEME;
    return (
        <div className="rounded-lg border px-4 py-2.5 min-w-35 max-w-55" style={getNodeStyle(appliedTheme)}>
            <div className="text-center">
                <p className="text-xs font-medium">{label}</p>
                {description && (
                    <p className="mt-0.5 text-[11px] leading-snug" style={{ color: appliedTheme.description }}>{description}</p>
                )}
            </div>
            <Handle type="target" position={Position.Top} className="w-2! h-2!" style={{ backgroundColor: appliedTheme.handle }} />
        </div>
    );
}

export function MindMapRadialRootNode({ data }: NodeProps) {
    const { label, description, theme } = data as unknown as MindMapNodeData;
    const appliedTheme = theme ?? DEFAULT_ROOT_THEME;
    return (
        <div className="rounded-full border-2 px-6 py-5 min-w-44 max-w-56 text-center" style={getNodeStyle(appliedTheme)}>
            <p className="text-sm font-bold leading-tight">{label}</p>
            {description && (
                <p className="mt-1.5 text-[11px] leading-snug opacity-90" style={{ color: appliedTheme.description }}>{description}</p>
            )}
            <RadialHandlesWithColor handleColor={appliedTheme.handle} hasSource hasTarget={false} />
        </div>
    );
}

export function MindMapRadialBranchNode({ data }: NodeProps) {
    const { label, description, theme } = data as unknown as MindMapNodeData;
    const appliedTheme = theme ?? DEFAULT_BRANCH_THEME;
    return (
        <div className="rounded-full border px-5 py-4 min-w-38 max-w-52 text-center" style={getNodeStyle(appliedTheme)}>
            <p className="text-xs font-semibold">{label}</p>
            {description && (
                <p className="mt-1 text-[11px] leading-snug" style={{ color: appliedTheme.description }}>{description}</p>
            )}
            <RadialHandlesWithColor handleColor={appliedTheme.handle} />
        </div>
    );
}

export function MindMapRadialLeafNode({ data }: NodeProps) {
    const { label, description, theme } = data as unknown as MindMapNodeData;
    const appliedTheme = theme ?? DEFAULT_LEAF_THEME;
    return (
        <div className="rounded-full border px-4 py-3 min-w-34 max-w-48 text-center" style={getNodeStyle(appliedTheme)}>
            <p className="text-xs font-medium">{label}</p>
            {description && (
                <p className="mt-0.5 text-[11px] leading-snug" style={{ color: appliedTheme.description }}>{description}</p>
            )}
            <RadialHandlesWithColor handleColor={appliedTheme.handle} hasSource={false} hasTarget />
        </div>
    );
}

export function MindMapSymmetricRootNode({ data }: NodeProps) {
    const { label, description, theme } = data as unknown as MindMapNodeData;
    const appliedTheme = theme ?? DEFAULT_ROOT_THEME;
    return (
        <div className="rounded-2xl border-2 px-6 py-4 min-w-45 max-w-65" style={getNodeStyle(appliedTheme)}>
            <div className="text-center">
                <p className="text-base font-bold leading-tight">{label}</p>
                {description && (
                    <p className="mt-1.5 text-xs leading-snug opacity-90" style={{ color: appliedTheme.description }}>{description}</p>
                )}
            </div>
            <SymmetricHandlesWithColor handleColor={appliedTheme.handle} hasSource hasTarget={false} />
        </div>
    );
}

export function MindMapSymmetricBranchNode({ data }: NodeProps) {
    const { label, description, theme } = data as unknown as MindMapNodeData;
    const appliedTheme = theme ?? DEFAULT_BRANCH_THEME;
    return (
        <div className="rounded-xl border px-5 py-3 min-w-40 max-w-60" style={getNodeStyle(appliedTheme)}>
            <div className="text-center">
                <p className="text-sm font-semibold">{label}</p>
                {description && (
                    <p className="mt-1 text-xs leading-snug" style={{ color: appliedTheme.description }}>{description}</p>
                )}
            </div>
            <SymmetricHandlesWithColor handleColor={appliedTheme.handle} />
        </div>
    );
}

export function MindMapSymmetricLeafNode({ data }: NodeProps) {
    const { label, description, theme } = data as unknown as MindMapNodeData;
    const appliedTheme = theme ?? DEFAULT_LEAF_THEME;
    return (
        <div className="rounded-lg border px-4 py-2.5 min-w-35 max-w-55" style={getNodeStyle(appliedTheme)}>
            <div className="text-center">
                <p className="text-xs font-medium">{label}</p>
                {description && (
                    <p className="mt-0.5 text-[11px] leading-snug" style={{ color: appliedTheme.description }}>{description}</p>
                )}
            </div>
            <SymmetricHandlesWithColor handleColor={appliedTheme.handle} hasSource={false} hasTarget />
        </div>
    );
}

export const mindMapNodeTypes = {
    mindMapRoot: MindMapRootNode,
    mindMapBranch: MindMapBranchNode,
    mindMapLeaf: MindMapLeafNode,
};

export const mindMapRadialNodeTypes = {
    mindMapRoot: MindMapRadialRootNode,
    mindMapBranch: MindMapRadialBranchNode,
    mindMapLeaf: MindMapRadialLeafNode,
};

export const mindMapSymmetricNodeTypes = {
    mindMapRoot: MindMapSymmetricRootNode,
    mindMapBranch: MindMapSymmetricBranchNode,
    mindMapLeaf: MindMapSymmetricLeafNode,
};
