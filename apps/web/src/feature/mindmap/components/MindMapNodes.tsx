import { Handle, Position, type NodeProps } from "@xyflow/react";

interface MindMapNodeData {
    label: string;
    description: string;
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

export function MindMapRootNode({ data }: NodeProps) {
    const { label, description } = data as unknown as MindMapNodeData;
    return (
        <div className="rounded-2xl border-2 border-indigo-400 bg-linear-to-br from-indigo-500 to-purple-600 px-6 py-4 text-white shadow-lg shadow-indigo-500/30 min-w-45 max-w-65">
            <div className="text-center">
                <p className="text-base font-bold leading-tight">{label}</p>
                {description && (
                    <p className="mt-1.5 text-xs leading-snug text-indigo-100 opacity-90">{description}</p>
                )}
            </div>
            <Handle type="source" position={Position.Bottom} className="bg-indigo-300! w-2! h-2!" />
        </div>
    );
}

export function MindMapBranchNode({ data }: NodeProps) {
    const { label, description } = data as unknown as MindMapNodeData;
    return (
        <div className="rounded-xl border border-blue-300 bg-linear-to-br from-blue-50 to-sky-100 px-5 py-3 shadow-md min-w-40 max-w-60 dark:from-blue-900/60 dark:to-sky-900/40 dark:border-blue-700">
            <div className="text-center">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">{label}</p>
                {description && (
                    <p className="mt-1 text-xs leading-snug text-blue-600/80 dark:text-blue-300/70">{description}</p>
                )}
            </div>
            <Handle type="target" position={Position.Top} className="bg-blue-400! w-2! h-2!" />
            <Handle type="source" position={Position.Bottom} className="bg-blue-400! w-2! h-2!" />
        </div>
    );
}

export function MindMapLeafNode({ data }: NodeProps) {
    const { label, description } = data as unknown as MindMapNodeData;
    return (
        <div className="rounded-lg border border-emerald-200 bg-linear-to-br from-emerald-50 to-teal-50 px-4 py-2.5 shadow-sm min-w-35 max-w-55 dark:from-emerald-900/40 dark:to-teal-900/30 dark:border-emerald-700">
            <div className="text-center">
                <p className="text-xs font-medium text-emerald-800 dark:text-emerald-200">{label}</p>
                {description && (
                    <p className="mt-0.5 text-[11px] leading-snug text-emerald-600/70 dark:text-emerald-300/60">{description}</p>
                )}
            </div>
            <Handle type="target" position={Position.Top} className="bg-emerald-400! w-2! h-2!" />
        </div>
    );
}

export function MindMapRadialRootNode({ data }: NodeProps) {
    const { label, description } = data as unknown as MindMapNodeData;
    return (
        <div className="rounded-full border-2 border-indigo-400 bg-linear-to-br from-indigo-500 to-purple-600 px-6 py-5 text-white shadow-lg shadow-indigo-500/30 min-w-44 max-w-56 text-center">
            <p className="text-sm font-bold leading-tight">{label}</p>
            {description && (
                <p className="mt-1.5 text-[11px] leading-snug text-indigo-100 opacity-90">{description}</p>
            )}
            <RadialHandles colorClass="bg-indigo-300!" hasSource hasTarget={false} />
        </div>
    );
}

export function MindMapRadialBranchNode({ data }: NodeProps) {
    const { label, description } = data as unknown as MindMapNodeData;
    return (
        <div className="rounded-full border border-blue-300 bg-linear-to-br from-blue-50 to-sky-100 px-5 py-4 shadow-md min-w-38 max-w-52 text-center dark:from-blue-900/60 dark:to-sky-900/40 dark:border-blue-700">
            <p className="text-xs font-semibold text-blue-800 dark:text-blue-200">{label}</p>
            {description && (
                <p className="mt-1 text-[11px] leading-snug text-blue-600/80 dark:text-blue-300/70">{description}</p>
            )}
            <RadialHandles colorClass="bg-blue-400!" />
        </div>
    );
}

export function MindMapRadialLeafNode({ data }: NodeProps) {
    const { label, description } = data as unknown as MindMapNodeData;
    return (
        <div className="rounded-full border border-emerald-200 bg-linear-to-br from-emerald-50 to-teal-50 px-4 py-3 shadow-sm min-w-34 max-w-48 text-center dark:from-emerald-900/40 dark:to-teal-900/30 dark:border-emerald-700">
            <p className="text-xs font-medium text-emerald-800 dark:text-emerald-200">{label}</p>
            {description && (
                <p className="mt-0.5 text-[11px] leading-snug text-emerald-600/70 dark:text-emerald-300/60">{description}</p>
            )}
            <RadialHandles colorClass="bg-emerald-400!" hasSource={false} hasTarget />
        </div>
    );
}

export function MindMapSymmetricRootNode({ data }: NodeProps) {
    const { label, description } = data as unknown as MindMapNodeData;
    return (
        <div className="rounded-2xl border-2 border-indigo-400 bg-linear-to-br from-indigo-500 to-purple-600 px-6 py-4 text-white shadow-lg shadow-indigo-500/30 min-w-45 max-w-65">
            <div className="text-center">
                <p className="text-base font-bold leading-tight">{label}</p>
                {description && (
                    <p className="mt-1.5 text-xs leading-snug text-indigo-100 opacity-90">{description}</p>
                )}
            </div>
            <SymmetricHandles colorClass="bg-indigo-300!" hasSource hasTarget={false} />
        </div>
    );
}

export function MindMapSymmetricBranchNode({ data }: NodeProps) {
    const { label, description } = data as unknown as MindMapNodeData;
    return (
        <div className="rounded-xl border border-blue-300 bg-linear-to-br from-blue-50 to-sky-100 px-5 py-3 shadow-md min-w-40 max-w-60 dark:from-blue-900/60 dark:to-sky-900/40 dark:border-blue-700">
            <div className="text-center">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">{label}</p>
                {description && (
                    <p className="mt-1 text-xs leading-snug text-blue-600/80 dark:text-blue-300/70">{description}</p>
                )}
            </div>
            <SymmetricHandles colorClass="bg-blue-400!" />
        </div>
    );
}

export function MindMapSymmetricLeafNode({ data }: NodeProps) {
    const { label, description } = data as unknown as MindMapNodeData;
    return (
        <div className="rounded-lg border border-emerald-200 bg-linear-to-br from-emerald-50 to-teal-50 px-4 py-2.5 shadow-sm min-w-35 max-w-55 dark:from-emerald-900/40 dark:to-teal-900/30 dark:border-emerald-700">
            <div className="text-center">
                <p className="text-xs font-medium text-emerald-800 dark:text-emerald-200">{label}</p>
                {description && (
                    <p className="mt-0.5 text-[11px] leading-snug text-emerald-600/70 dark:text-emerald-300/60">{description}</p>
                )}
            </div>
            <SymmetricHandles colorClass="bg-emerald-400!" hasSource={false} hasTarget />
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
