import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Layout, Palette } from "lucide-react";
import type { StructureConfig, ThemeConfig } from "../types/mindmap.type";

// ─── NodeShape ────────────────────────────────────────────────────────────────

export type NodeShape = "rounded" | "pill" | "square" | "soft";

const SHAPES: { value: NodeShape; label: string; rx: number }[] = [
    { value: "rounded", label: "Tròn vừa", rx: 5 },
    { value: "pill",    label: "Viên thuốc", rx: 14 },
    { value: "square",  label: "Vuông góc", rx: 0 },
    { value: "soft",    label: "Bo nhẹ", rx: 2 },
];

function ShapeIcon({ rx }: { rx: number }) {
    return (
        <svg width="30" height="18" viewBox="0 0 30 18" fill="none">
            <rect x="1" y="1" width="28" height="16" rx={rx} fill="currentColor" fillOpacity={0.12} stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
}

interface ShapePickerProps {
    value: NodeShape;
    onChange: (shape: NodeShape) => void;
    disabled?: boolean;
}

export function ShapePicker({ value, onChange, disabled }: ShapePickerProps) {
    return (
        <div className="flex items-center gap-0.5 rounded-md border border-slate-300 bg-white px-1 py-1 dark:border-slate-600 dark:bg-slate-800">
            {SHAPES.map((s) => (
                <button
                    key={s.value}
                    type="button"
                    title={s.label}
                    disabled={disabled}
                    onClick={() => onChange(s.value)}
                    className={`flex items-center justify-center rounded px-1.5 py-0.5 transition-colors
                        ${value === s.value
                            ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300"
                            : "text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                        }
                        disabled:cursor-not-allowed disabled:opacity-50`}
                >
                    <ShapeIcon rx={s.rx} />
                </button>
            ))}
        </div>
    );
}

// ─── Shared hook — close on outside click / Escape ────────────────────────────

function useDropdown() {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("mousedown", handleClick);
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("keydown", handleKey);
        };
    }, [open]);

    return { open, setOpen, ref };
}

// ─── StructurePicker ──────────────────────────────────────────────────────────

interface StructurePickerProps {
    structures: StructureConfig[];
    selectedId: number | undefined;
    onChange: (id: number) => void;
    disabled?: boolean;
}

export function StructurePicker({ structures, selectedId, onChange, disabled }: StructurePickerProps) {
    const { open, setOpen, ref } = useDropdown();
    const selected = structures.find((s) => s.id === selectedId);

    return (
        <div ref={ref} className="relative">
            {/* Trigger button */}
            <button
                type="button"
                onClick={() => !disabled && setOpen((v) => !v)}
                disabled={disabled}
                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors
                    ${open
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950 dark:text-indigo-300"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500"
                    }
                    disabled:cursor-not-allowed disabled:opacity-50`}
            >
                <Layout className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="max-w-24 truncate">{selected?.name ?? "Bố cục"}</span>
                <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                    <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Chọn bố cục
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {structures.map((s) => {
                            const isSelected = s.id === selectedId;
                            return (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => { onChange(s.id); setOpen(false); }}
                                    className={`relative flex flex-col overflow-hidden rounded-lg border-2 text-left transition-all
                                        ${isSelected
                                            ? "border-indigo-500 shadow-sm shadow-indigo-100 dark:shadow-indigo-950"
                                            : "border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                                        }`}
                                >
                                    {/* Thumbnail or placeholder */}
                                    <div className="flex h-20 items-center justify-center bg-slate-100 dark:bg-slate-800">
                                        {s.thumbnailUrl ? (
                                            <img
                                                src={s.thumbnailUrl}
                                                alt={s.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <Layout className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-2">
                                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{s.name}</p>
                                        {s.description && (
                                            <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">
                                                {s.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Selected checkmark */}
                                    {isSelected && (
                                        <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500">
                                            <Check className="h-3 w-3 text-white" />
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── ThemePicker ──────────────────────────────────────────────────────────────

interface ThemePickerProps {
    themes: ThemeConfig[];
    selectedId: number | undefined;
    onChange: (id: number) => void;
    disabled?: boolean;
}

export function ThemePicker({ themes, selectedId, onChange, disabled }: ThemePickerProps) {
    const { open, setOpen, ref } = useDropdown();
    const selected = themes.find((t) => t.id === selectedId);

    return (
        <div ref={ref} className="relative">
            {/* Trigger button */}
            <button
                type="button"
                onClick={() => !disabled && setOpen((v) => !v)}
                disabled={disabled}
                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors
                    ${open
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950 dark:text-indigo-300"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500"
                    }
                    disabled:cursor-not-allowed disabled:opacity-50`}
            >
                {/* Color swatches preview */}
                {selected ? (
                    <span className="flex shrink-0 items-center gap-0.5">
                        {selected.colors.slice(0, 3).map((c, i) => (
                            <span
                                key={i}
                                className="inline-block h-3 w-3 rounded-full border border-white/50 shadow-sm"
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </span>
                ) : (
                    <Palette className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                )}
                <span className="max-w-24 truncate">{selected?.name ?? "Giao diện"}</span>
                <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute left-0 top-full z-50 mt-1 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                    <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Chọn giao diện
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {themes.map((t) => {
                            const isSelected = t.id === selectedId;
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => { onChange(t.id); setOpen(false); }}
                                    className={`relative flex flex-col overflow-hidden rounded-lg border-2 text-left transition-all
                                        ${isSelected
                                            ? "border-indigo-500 shadow-sm shadow-indigo-100 dark:shadow-indigo-950"
                                            : "border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                                        }`}
                                >
                                    {/* Background preview with color swatches */}
                                    <div
                                        className="flex h-14 items-center justify-center gap-1.5 px-3"
                                        style={{ backgroundColor: t.background || "#f8fafc" }}
                                    >
                                        {t.thumbnailUrl ? (
                                            <img
                                                src={t.thumbnailUrl}
                                                alt={t.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            t.colors.slice(0, 4).map((c, i) => (
                                                <span
                                                    key={i}
                                                    className="inline-block h-6 w-6 rounded-full border-2 border-white/70 shadow"
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))
                                        )}
                                    </div>

                                    {/* Info + full color strip */}
                                    <div className="p-2">
                                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{t.name}</p>
                                        {t.description && (
                                            <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400">
                                                {t.description}
                                            </p>
                                        )}
                                        {/* Full color palette strip */}
                                        <div className="mt-1.5 flex gap-0.5">
                                            {t.colors.map((c, i) => (
                                                <span
                                                    key={i}
                                                    className="h-2 flex-1 rounded-sm"
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Selected checkmark */}
                                    {isSelected && (
                                        <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500">
                                            <Check className="h-3 w-3 text-white" />
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
