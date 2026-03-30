import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface DurationPickerProps {
  value?: number;
  onChange: (seconds: number) => void;
  label?: string;
  className?: string;
  error?: string;
}

const toHMS = (total: number) => ({
  h: Math.floor(total / 3600),
  m: Math.floor((total % 3600) / 60),
  s: total % 60,
});

const toSeconds = (h: number, m: number, s: number) => h * 3600 + m * 60 + s;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, isNaN(v) ? 0 : v));

const SegmentInput: React.FC<{
  value: number;
  max: number;
  unit: string;
  onChange: (v: string) => void;
}> = ({ value, max, unit, onChange }) => (
  <div className="flex flex-col items-center gap-0.5">
    <input
      type="number"
      min={0}
      max={max}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={(e) => e.target.select()}
      className={cn(
        "w-12 rounded-lg border border-gray-300 bg-white py-1.5 text-center text-base font-semibold tabular-nums",
        "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
        "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
      )}
    />
    <span className="text-[11px] text-gray-700">{unit}</span>
  </div>
);

export const DurationPicker: React.FC<DurationPickerProps> = ({
  value = 0,
  onChange,
  label = "Thời lượng",
  className,
  error,
}) => {
  const [hms, setHMS] = useState(() => toHMS(value));

  useEffect(() => {
    setHMS(toHMS(value));
  }, [value]);

  const update = (field: "h" | "m" | "s", raw: string) => {
    const next = {
      ...hms,
      [field]: clamp(parseInt(raw, 10), 0, field === "h" ? 99 : 59),
    };
    setHMS(next);
    onChange(toSeconds(next.h, next.m, next.s));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-1.5">
        <Clock className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>

      <div
        className={cn(
          "inline-flex items-end gap-2 rounded-xl border bg-gray-50 px-4 py-3",
          error ? "border-red-400" : "border-gray-200",
        )}
      >
        <SegmentInput value={hms.h} max={99} unit="giờ" onChange={(v) => update("h", v)} />
        <span className="mb-4 text-lg font-light text-gray-400">:</span>
        <SegmentInput value={hms.m} max={59} unit="phút" onChange={(v) => update("m", v)} />
        <span className="mb-4 text-lg font-light text-gray-400">:</span>
        <SegmentInput value={hms.s} max={59} unit="giây" onChange={(v) => update("s", v)} />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default DurationPicker;
