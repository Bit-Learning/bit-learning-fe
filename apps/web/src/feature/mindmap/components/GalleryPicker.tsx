import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Layout, Palette, Shapes } from "lucide-react";
import type { StructureConfig, ThemeConfig } from "../types/mindmap.type";
import type { NodeShape } from "./MindMapNodes";

export type { NodeShape };

const SHAPES: { value: NodeShape; label: string }[] = [
  { value: "rounded", label: "Tròn vừa" },
  { value: "pill", label: "Viên thuốc" },
  { value: "square", label: "Vuông góc" },
  { value: "circle", label: "Hình tròn" },
  { value: "diamond", label: "Hình thoi" },
  { value: "hexagon", label: "Lục giác" },
];

function ShapeIcon({ shape }: { shape: NodeShape }) {
  const fill = "currentColor";
  const fillOp = 0.15;
  const stroke = "currentColor";
  const sw = 1.5;
  switch (shape) {
    case "rounded":
      return (
        <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
          <rect
            x="1"
            y="1"
            width="30"
            height="18"
            rx="5"
            fill={fill}
            fillOpacity={fillOp}
            stroke={stroke}
            strokeWidth={sw}
          />
        </svg>
      );
    case "pill":
      return (
        <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
          <rect
            x="1"
            y="1"
            width="30"
            height="18"
            rx="9"
            fill={fill}
            fillOpacity={fillOp}
            stroke={stroke}
            strokeWidth={sw}
          />
        </svg>
      );
    case "square":
      return (
        <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
          <rect
            x="1"
            y="1"
            width="30"
            height="18"
            rx="0"
            fill={fill}
            fillOpacity={fillOp}
            stroke={stroke}
            strokeWidth={sw}
          />
        </svg>
      );
    case "circle":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8.75" fill={fill} fillOpacity={fillOp} stroke={stroke} strokeWidth={sw} />
        </svg>
      );
    case "diamond":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <polygon
            points="12,1 23,12 12,23 1,12"
            fill={fill}
            fillOpacity={fillOp}
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </svg>
      );
    case "hexagon":
      return (
        <svg width="28" height="24" viewBox="0 0 28 24" fill="none">
          <polygon
            points="7,1 21,1 27,12 21,23 7,23 1,12"
            fill={fill}
            fillOpacity={fillOp}
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

interface ShapePickerProps {
  value: NodeShape;
  onChange: (shape: NodeShape) => void;
  disabled?: boolean;
}

export function ShapePicker({ value, onChange, disabled }: ShapePickerProps) {
  const { open, setOpen, ref } = useDropdown();
  const selected = SHAPES.find((s) => s.value === value) ?? { value: "rounded" as NodeShape, label: "Tròn vừa" };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className={`cursor-pointer flex items-center gap-2 rounded-md border px-3 py-3 text-sm transition-colors
                    ${
                      open
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950 dark:text-indigo-300"
                        : "border-slate-300 bg-white text-slate-700 hover:border-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500"
                    }
                    disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <Shapes className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span className="max-w-24 truncate">{selected.label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Hình dạng node
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {SHAPES.map((s) => {
              const isSelected = s.value === value;
              return (
                <button
                  key={s.value}
                  type="button"
                  title={s.label}
                  onClick={() => {
                    onChange(s.value);
                    setOpen(false);
                  }}
                  className={`cursor-pointer relative flex flex-col items-center gap-1 rounded-lg border-2 px-2 py-3.5 transition-all
                                        ${
                                          isSelected
                                            ? "border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300"
                                            : "border-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-50 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                                        }`}
                >
                  <ShapeIcon shape={s.value} />
                  <span className="text-[10px] font-medium leading-tight">{s.label}</span>
                  {isSelected && (
                    <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-indigo-500">
                      <Check className="h-2 w-2 text-white" />
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
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className={`cursor-pointer flex items-center gap-2 rounded-md border px-3 py-3 text-sm transition-colors
                    ${
                      open
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950 dark:text-indigo-300"
                        : "border-slate-300 bg-white text-slate-700 hover:border-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500"
                    }
                    disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <Layout className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span className="max-w-24 truncate">{selected?.name ?? "Bố cục"}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

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
                  onClick={() => {
                    onChange(s.id);
                    setOpen(false);
                  }}
                  className={`cursor-pointer relative flex flex-col overflow-hidden rounded-lg border-2 text-left transition-all
                                        ${
                                          isSelected
                                            ? "border-indigo-500 shadow-sm shadow-indigo-100 dark:shadow-indigo-950"
                                            : "border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                                        }`}
                >
                  <div className="flex h-20 items-center justify-center bg-slate-100 dark:bg-slate-800">
                    {s.thumbnailUrl ? (
                      <img src={s.thumbnailUrl} alt={s.name} className="h-full w-full object-cover" />
                    ) : (
                      <Layout className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>

                  <div className="p-2">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{s.name}</p>
                    {s.description && (
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">
                        {s.description}
                      </p>
                    )}
                  </div>

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
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className={`cursor-pointer flex items-center gap-2 rounded-md border px-3 py-3 text-sm transition-colors
                    ${
                      open
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950 dark:text-indigo-300"
                        : "border-slate-300 bg-white text-slate-700 hover:border-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500"
                    }
                    disabled:cursor-not-allowed disabled:opacity-50`}
      >
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
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

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
                  onClick={() => {
                    onChange(t.id);
                    setOpen(false);
                  }}
                  className={`cursor-pointer relative flex flex-col overflow-hidden rounded-lg border-2 text-left transition-all
                                        ${
                                          isSelected
                                            ? "border-indigo-500 shadow-sm shadow-indigo-100 dark:shadow-indigo-950"
                                            : "border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                                        }`}
                >
                  <div
                    className="flex h-14 items-center justify-center gap-1.5 px-3"
                    style={{ backgroundColor: t.background || "#f8fafc" }}
                  >
                    {t.thumbnailUrl ? (
                      <img src={t.thumbnailUrl} alt={t.name} className="h-full w-full object-cover" />
                    ) : (
                      t.colors
                        .slice(0, 4)
                        .map((c, i) => (
                          <span
                            key={i}
                            className="inline-block h-6 w-6 rounded-full border-2 border-white/70 shadow"
                            style={{ backgroundColor: c }}
                          />
                        ))
                    )}
                  </div>

                  <div className="p-2">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{t.name}</p>
                    {t.description && (
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {t.description}
                      </p>
                    )}
                    <div className="mt-1.5 flex gap-0.5">
                      {t.colors.map((c, i) => (
                        <span key={i} className="h-2 flex-1 rounded-sm" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>

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
