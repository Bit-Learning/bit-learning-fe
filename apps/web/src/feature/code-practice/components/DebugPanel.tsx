import React, { useMemo, useState } from "react";
import {
  Bug,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Terminal,
  MousePointerClick,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { DebugResponse, DebugStep } from "../types/coding.type";

interface LineGroup {
  line: number;
  iterations: DebugStep[];
}

export interface DebugPanelProps {
  result: DebugResponse | null;
  isDebugging: boolean;
  breakpointCount: number;
}

function groupByLine(steps: DebugStep[]): LineGroup[] {
  const map = new Map<number, DebugStep[]>();
  const order: number[] = [];
  for (const step of steps) {
    if (!map.has(step.line)) {
      map.set(step.line, []);
      order.push(step.line);
    }
    map.get(step.line)!.push(step);
  }
  return order.map((line) => ({ line, iterations: map.get(line)! }));
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
      return { label: "Compile Error", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", Icon: XCircle };
    case "RUNTIME_ERROR":
      return {
        label: "Runtime Error",
        color: "text-amber-400",
        bg: "bg-amber-500/10 border-amber-500/20",
        Icon: AlertTriangle,
      };
    default:
      return { label: status, color: "text-gray-400", bg: "bg-gray-500/10 border-gray-500/20", Icon: AlertTriangle };
  }
}

function VarRow({ name, value }: { name: string; value: string }) {
  const isComplex = value.startsWith("{") || value.startsWith("[") || value.length > 60;
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="flex items-start gap-1 min-w-0">
      <span className="text-purple-400 font-mono text-xs shrink-0 w-20 truncate">{name}</span>
      <span className="text-gray-600 font-mono text-xs shrink-0">=</span>
      {isComplex ? (
        <button onClick={() => setExpanded((v) => !v)} className="text-left min-w-0">
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
        <span className="text-green-300 font-mono text-xs break-all">{value}</span>
      )}
    </div>
  );
}

function IterCard({ step, defaultOpen }: { step: DebugStep; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const varEntries = Object.entries(step.variables);
  return (
    <div
      className={cn(
        "border rounded transition-colors",
        open ? "border-gray-700 bg-gray-900" : "border-gray-800 bg-gray-900/40",
      )}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-800/40 transition-colors"
      >
        {open ? (
          <ChevronDown className="w-3 h-3 text-gray-600 shrink-0" />
        ) : (
          <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
        )}
        <span className="text-xs font-mono text-gray-400">
          iter <span className="text-yellow-400 font-bold">#{step.iteration}</span>
        </span>
        {/* collapsed preview */}
        {!open && varEntries.length > 0 && (
          <span className="ml-auto flex items-center gap-2 overflow-hidden">
            {varEntries.slice(0, 3).map(([k, v]) => (
              <span key={k} className="text-[10px] font-mono text-gray-600">
                <span className="text-purple-400/70">{k}</span>
                <span className="text-gray-700">=</span>
                <span className="text-green-400/70 max-w-12.5 truncate inline-block align-bottom">{v}</span>
              </span>
            ))}
            {varEntries.length > 3 && <span className="text-[10px] text-gray-700">+{varEntries.length - 3}</span>}
          </span>
        )}
      </button>
      {open && (
        <div className="border-t border-gray-800/60 px-3 py-2 space-y-1">
          {varEntries.length === 0 ? (
            <span className="text-[11px] text-gray-700">Không có biến</span>
          ) : (
            varEntries.map(([k, v]) => <VarRow key={k} name={k} value={v} />)
          )}
        </div>
      )}
    </div>
  );
}

function LineGroupBlock({ group }: { group: LineGroup }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-gray-800 rounded overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-gray-800/60 hover:bg-gray-800 transition-colors text-left"
      >
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-gray-500 shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
        )}
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
        <span className="text-xs font-mono text-gray-300">
          Line <span className="text-white font-bold">{group.line}</span>
        </span>
        <span className="ml-auto text-[11px] font-mono text-gray-600">
          {group.iterations.length} {group.iterations.length === 1 ? "iteration" : "iterations"}
        </span>
      </button>
      {open && (
        <div className="p-2 space-y-1.5 bg-gray-950/40">
          {group.iterations.map((step, i) => (
            <IterCard key={`${step.line}-${step.iteration}`} step={step} defaultOpen={i === 0} />
          ))}
        </div>
      )}
    </div>
  );
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ result, isDebugging, breakpointCount }) => {
  const groups = useMemo(() => (result?.steps ? groupByLine(result.steps) : []), [result?.steps]);

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
              Nhấn <span className="text-yellow-400 font-mono">Debug</span> để chạy.
            </p>
          </>
        )}
      </div>
    );
  }

  const meta = statusMeta(result.status);
  const StatusIcon = meta.Icon;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className={cn("shrink-0 flex items-center gap-2 px-3 py-1.5 border rounded mx-3 mt-2 mb-1.5", meta.bg)}>
        <StatusIcon className={cn("w-3.5 h-3.5 shrink-0", meta.color)} />
        <span className={cn("text-xs font-semibold", meta.color)}>{meta.label}</span>
        {result.steps.length > 0 && (
          <span className="ml-auto text-[11px] text-gray-600 font-mono">
            {result.steps.length} steps · {groups.length} lines
          </span>
        )}
      </div>

      {result.error && (
        <div className="shrink-0 mx-3 mb-1.5">
          <pre className="text-[11px] font-mono text-red-300 bg-red-950/40 border border-red-900/50 rounded p-2 whitespace-pre-wrap overflow-auto max-h-20 leading-relaxed">
            {result.error}
          </pre>
        </div>
      )}

      {result.output && (
        <div className="shrink-0 mx-3 mb-1.5">
          <div className="flex items-center gap-1 mb-1">
            <Terminal className="w-3 h-3 text-gray-600" />
            <span className="text-[10px] uppercase tracking-wider text-gray-600 font-semibold">stdout</span>
          </div>
          <pre className="text-[11px] font-mono text-gray-300 bg-gray-800/60 border border-gray-700/50 rounded p-2 whitespace-pre-wrap overflow-auto max-h-20 leading-relaxed">
            {result.output}
          </pre>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
        {groups.length === 0 && !result.error && (
          <p className="text-xs text-gray-600 text-center py-4">
            Không có steps — kiểm tra lại breakpoints và biến theo dõi.
          </p>
        )}
        {groups.map((g) => (
          <LineGroupBlock key={g.line} group={g} />
        ))}
      </div>
    </div>
  );
};
