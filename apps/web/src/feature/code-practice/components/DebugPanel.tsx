import React, { useState, useEffect, useCallback } from "react";
import {
	Bug,
	AlertTriangle,
	XCircle,
	CheckCircle2,
	Terminal,
	MousePointerClick,
	SkipBack,
	SkipForward,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { DebugResponse, DebugStep } from "../types/coding.type";

export interface DebugPanelProps {
	result: DebugResponse | null;
	isDebugging: boolean;
	breakpointCount: number;
	onStepChange?: (step: DebugStep | null) => void;
}

function statusMeta(status: string) {
	switch (status) {
		case "ACCEPTED":
			return {
				label: "Accepted",
				color: "text-emerald-400",
				bg: "bg-emerald-500/10 border-emerald-500/20",
				Icon: CheckCircle2,
			};
		case "COMPILE_ERROR":
			return {
				label: "Compile Error",
				color: "text-red-400",
				bg: "bg-red-500/10 border-red-500/20",
				Icon: XCircle,
			};
		case "RUNTIME_ERROR":
			return {
				label: "Runtime Error",
				color: "text-amber-400",
				bg: "bg-amber-500/10 border-amber-500/20",
				Icon: AlertTriangle,
			};
		default:
			return {
				label: status,
				color: "text-gray-400",
				bg: "bg-gray-500/10 border-gray-500/20",
				Icon: AlertTriangle,
			};
	}
}

function VarRow({ name, value }: { name: string; value: string }) {
	const isComplex =
		value.startsWith("{") || value.startsWith("[") || value.length > 60;
	const [expanded, setExpanded] = useState(false);
	return (
		<div className="flex items-start gap-1 min-w-0">
			<span className="text-purple-400 font-mono text-xs shrink-0 w-20 truncate">
				{name}
			</span>
			<span className="text-gray-600 font-mono text-xs shrink-0">=</span>
			{isComplex ? (
				<button
					onClick={() => setExpanded((v) => !v)}
					className="text-left min-w-0"
				>
					{expanded ? (
						<pre className="text-green-300 font-mono text-xs whitespace-pre-wrap break-all leading-relaxed">
							{value}
						</pre>
					) : (
						<span className="text-green-300 font-mono text-xs truncate block max-w-45 hover:text-green-200">
							{value}
							<span className="text-gray-600 ml-1">▼</span>
						</span>
					)}
				</button>
			) : (
				<span className="text-green-300 font-mono text-xs break-all">
					{value}
				</span>
			)}
		</div>
	);
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
	result,
	isDebugging,
	breakpointCount,
	onStepChange,
}) => {
	const [currentIdx, setCurrentIdx] = useState(0);

	const totalSteps = result?.steps.length ?? 0;
	const currentStep = result?.steps[currentIdx] ?? null;

	useEffect(() => {
		setCurrentIdx(0);
		onStepChange?.(result?.steps[0] ?? null);
	}, [result]);

	const goTo = useCallback(
		(idx: number) => {
			if (!result) return;
			const clamped = Math.max(0, Math.min(idx, totalSteps - 1));
			setCurrentIdx(clamped);
			onStepChange?.(result.steps[clamped]);
		},
		[result, totalSteps, onStepChange],
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "ArrowRight" || e.key === "ArrowDown") {
				e.preventDefault();
				goTo(currentIdx + 1);
			}
			if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
				e.preventDefault();
				goTo(currentIdx - 1);
			}
			if (e.key === "Home") {
				e.preventDefault();
				goTo(0);
			}
			if (e.key === "End") {
				e.preventDefault();
				goTo(totalSteps - 1);
			}
		},
		[currentIdx, totalSteps, goTo],
	);

	if (isDebugging) {
		return (
			<div className="flex flex-col items-center justify-center h-full gap-3">
				<div className="relative w-8 h-8">
					<div className="absolute inset-0 rounded-full border-2 border-yellow-500/20" />
					<div className="absolute inset-0 rounded-full border-2 border-t-yellow-400 animate-spin" />
				</div>
				<p className="text-xs text-gray-500">Đang chạy debug...</p>
			</div>
		);
	}

	if (!result) {
		return (
			<div className="flex flex-col items-center justify-center h-full gap-2 text-center px-4">
				{breakpointCount === 0 ? (
					<>
						<MousePointerClick className="w-5 h-5 text-gray-700" />
						<p className="text-xs text-gray-600 leading-relaxed">
							Click vào số dòng
							<br />
							để đặt breakpoint
						</p>
					</>
				) : (
					<>
						<Bug className="w-5 h-5 text-yellow-600/60" />
						<p className="text-xs text-gray-500 leading-relaxed">
							{breakpointCount} breakpoint đã đặt.
							<br />
							Nhấn <span className="text-yellow-400 font-mono">Debug</span> để
							chạy.
						</p>
					</>
				)}
			</div>
		);
	}

	const meta = statusMeta(result.status);
	const StatusIcon = meta.Icon;
	const varEntries = currentStep ? Object.entries(currentStep.variables) : [];
	const progress = totalSteps > 0 ? ((currentIdx + 1) / totalSteps) * 100 : 0;

	return (
		<div
			className="flex flex-col h-full overflow-hidden outline-none"
			tabIndex={0}
			onKeyDown={handleKeyDown}
		>
			{/* Status header */}
			<div
				className={cn(
					"shrink-0 flex items-center gap-2 px-3 py-1.5 border rounded mx-3 mt-2 mb-1.5",
					meta.bg,
				)}
			>
				<StatusIcon className={cn("w-3.5 h-3.5 shrink-0", meta.color)} />
				<span className={cn("text-xs font-semibold", meta.color)}>
					{meta.label}
				</span>
				{totalSteps > 0 && (
					<span className="ml-auto text-[11px] text-gray-600 font-mono">
						{totalSteps} steps
					</span>
				)}
			</div>

			{/* Error */}
			{result.error && (
				<div className="shrink-0 mx-3 mb-1.5">
					<pre className="text-[11px] font-mono text-red-300 bg-red-950/40 border border-red-900/50 rounded p-2 whitespace-pre-wrap overflow-auto max-h-20 leading-relaxed">
						{result.error}
					</pre>
				</div>
			)}

			{/* Stdout */}
			{result.output && (
				<div className="shrink-0 mx-3 mb-1.5">
					<div className="flex items-center gap-1 mb-1">
						<Terminal className="w-3 h-3 text-gray-600" />
						<span className="text-[10px] uppercase tracking-wider text-gray-600 font-semibold">
							stdout
						</span>
					</div>
					<pre className="text-[11px] font-mono text-gray-300 bg-gray-800/60 border border-gray-700/50 rounded p-2 whitespace-pre-wrap overflow-auto max-h-20 leading-relaxed">
						{result.output}
					</pre>
				</div>
			)}

			{totalSteps === 0 ? (
				<p className="text-xs text-gray-600 text-center py-4">
					Không có steps — kiểm tra lại breakpoints.
				</p>
			) : (
				<div className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-2">
					{/* Progress + navigation */}
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center justify-between text-[11px] font-mono">
							<span className="text-gray-500">
								Step{" "}
								<span className="text-yellow-400 font-bold">
									{currentIdx + 1}
								</span>{" "}
								/ {totalSteps}
							</span>
							{currentStep && (
								<span className="text-gray-600">
									{currentStep.file && <span>{currentStep.file} · </span>}
									Line <span className="text-white">{currentStep.line}</span>
									{currentStep.iteration > 0 && (
										<span className="text-orange-400/80 ml-1">
											· loop #{currentStep.iteration + 1}
										</span>
									)}
								</span>
							)}
						</div>

						{/* Progress bar */}
						<div className="h-1 bg-gray-800 rounded-full overflow-hidden">
							<div
								className="h-full bg-yellow-500 rounded-full transition-all duration-150"
								style={{ width: `${progress}%` }}
							/>
						</div>

						{/* Navigation buttons */}
						<div className="flex items-center justify-center gap-1">
							<button
								onClick={() => goTo(0)}
								disabled={currentIdx === 0}
								className="p-1.5 rounded hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-400 hover:text-white"
								title="Bước đầu (Home)"
							>
								<SkipBack className="w-3.5 h-3.5" />
							</button>
							<button
								onClick={() => goTo(currentIdx - 1)}
								disabled={currentIdx === 0}
								className="p-1.5 rounded hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-400 hover:text-white"
								title="Bước trước (←)"
							>
								<ChevronLeft className="w-4 h-4" />
							</button>
							<span className="w-16 text-center text-[11px] font-mono text-gray-600">
								{currentIdx + 1} / {totalSteps}
							</span>
							<button
								onClick={() => goTo(currentIdx + 1)}
								disabled={currentIdx === totalSteps - 1}
								className="p-1.5 rounded hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-400 hover:text-white"
								title="Bước sau (→)"
							>
								<ChevronRight className="w-4 h-4" />
							</button>
							<button
								onClick={() => goTo(totalSteps - 1)}
								disabled={currentIdx === totalSteps - 1}
								className="p-1.5 rounded hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-400 hover:text-white"
								title="Bước cuối (End)"
							>
								<SkipForward className="w-3.5 h-3.5" />
							</button>
						</div>
					</div>

					{/* Current step variables */}
					{currentStep && (
						<div className="border border-gray-700 rounded overflow-hidden">
							<div className="flex items-center gap-2 px-3 py-2 bg-gray-800/60">
								<span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
								<span className="text-xs font-mono text-gray-300">
									Line{" "}
									<span className="text-white font-bold">
										{currentStep.line}
									</span>
									{currentStep.iteration > 0 && (
										<span className="text-orange-400/80 ml-2">
											iter #{currentStep.iteration + 1} 🔁
										</span>
									)}
								</span>
							</div>
							<div className="p-2.5 space-y-1.5 bg-gray-950/40">
								{varEntries.length === 0 ? (
									<span className="text-[11px] text-gray-700">
										Không có biến
									</span>
								) : (
									varEntries.map(([k, v]) => (
										<VarRow key={k} name={k} value={v} />
									))
								)}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};
