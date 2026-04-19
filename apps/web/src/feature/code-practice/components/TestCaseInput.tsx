import React, { useRef, useState } from "react";
import { Plus, Trash2, Eye, EyeOff, FileText, Code2, Upload, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/Textarea";
import { cn } from "@workspace/ui/lib/utils";
import type { CreateTestCaseRequest } from "../types/coding.type";

export type TestCaseInputMode = "manual" | "json" | "file";

export interface ManualTestCase {
  input: string;
  expectedOutput: string;
  isSample: boolean;
}

export interface TestCaseInputState {
  mode: TestCaseInputMode;
  manualTestCases: ManualTestCase[];
  testCasesJson: string;
  fileTestCases: ManualTestCase[];
}

export const defaultTestCaseInputState: TestCaseInputState = {
  mode: "manual",
  manualTestCases: [],
  testCasesJson: "",
  fileTestCases: [],
};

export function resolveTestCases(state: TestCaseInputState): {
  testCases: CreateTestCaseRequest[];
  error: string | null;
} {
  const { mode, manualTestCases, testCasesJson, fileTestCases } = state;

  if (mode === "manual") {
    if (manualTestCases.length === 0) return { testCases: [], error: "Vui lòng thêm ít nhất 1 test case" };
    if (manualTestCases.some((tc) => !tc.input.trim() || !tc.expectedOutput.trim()))
      return { testCases: [], error: "Tất cả test cases phải có input và expected output" };
    return { testCases: manualTestCases, error: null };
  }

  if (mode === "json") {
    if (!testCasesJson.trim()) return { testCases: [], error: "Vui lòng nhập JSON test cases" };
    try {
      const parsed = JSON.parse(testCasesJson);
      if (!Array.isArray(parsed)) throw new Error();
      return {
        testCases: parsed.map((item) => ({
          input: String(item.input ?? ""),
          expectedOutput: String(item.expectedOutput ?? ""),
          isSample: typeof item.isSample === "boolean" ? item.isSample : false,
        })),
        error: null,
      };
    } catch {
      return { testCases: [], error: "JSON không hợp lệ, vui lòng định dạng lại" };
    }
  }

  if (mode === "file") {
    if (fileTestCases.length === 0) return { testCases: [], error: "Vui lòng chọn file có ít nhất 1 test case hợp lệ" };
    return { testCases: fileTestCases, error: null };
  }

  return { testCases: [], error: "Chế độ nhập không hợp lệ" };
}

function parseLeetCodeTxt(content: string): ManualTestCase[] {
  return content
    .trim()
    .split(/\n\s*\n/)
    .reduce<ManualTestCase[]>((acc, block) => {
      const inputLines: string[] = [];
      const outputLines: string[] = [];
      let mode: "input" | "output" | null = null;

      for (const line of block.trim().split("\n")) {
        const trimmed = line.trim();
        if (/^Input:/i.test(trimmed)) {
          mode = "input";
          const val = trimmed.replace(/^Input:\s*/i, "").trim();
          if (val) inputLines.push(val);
        } else if (/^Output:/i.test(trimmed)) {
          mode = "output";
          const val = trimmed.replace(/^Output:\s*/i, "").trim();
          if (val) outputLines.push(val);
        } else if (mode === "input") {
          inputLines.push(trimmed);
        } else if (mode === "output") {
          outputLines.push(trimmed);
        }
      }

      if (inputLines.length > 0 && outputLines.length > 0) {
        acc.push({ input: inputLines.join("\n"), expectedOutput: outputLines.join("\n"), isSample: false });
      }
      return acc;
    }, []);
}

function parseJsonFile(content: string): ManualTestCase[] {
  const parsed = JSON.parse(content);
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  return arr.map((item) => ({
    input: String(item.input ?? ""),
    expectedOutput: String(item.expectedOutput ?? ""),
    isSample: typeof item.isSample === "boolean" ? item.isSample : false,
  }));
}

function parseFileContent(content: string, fileName: string): ManualTestCase[] {
  return fileName.endsWith(".json") ? parseJsonFile(content) : parseLeetCodeTxt(content);
}

const TABS: { id: TestCaseInputMode; label: string; icon: React.ReactNode }[] = [
  { id: "manual", label: "Tạo thủ công", icon: <FileText className="w-4 h-4" /> },
  { id: "json", label: "Nhập JSON", icon: <Code2 className="w-4 h-4" /> },
  { id: "file", label: "Import file", icon: <Upload className="w-4 h-4" /> },
];

interface ManualTabProps {
  testCases: ManualTestCase[];
  onChange: (tcs: ManualTestCase[]) => void;
}

const ManualTab: React.FC<ManualTabProps> = ({ testCases, onChange }) => {
  const update = (index: number, field: keyof ManualTestCase, value: string | boolean) =>
    onChange(testCases.map((tc, i) => (i === index ? { ...tc, [field]: value } : tc)));

  return (
    <div className="space-y-4">
      {testCases.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <FileText className="w-10 h-10 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">Chưa có test case nào</p>
          <p className="text-gray-400 text-md mt-1">Nhấn "Thêm test case" để bắt đầu</p>
        </div>
      ) : (
        testCases.map((tc, index) => (
          <div key={index} className="border-2 border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
              <span className="font-bold text-gray-700 text-md">Test Case #{index + 1}</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  {(["true", "false"] as const).map((v) => {
                    const isSample = v === "true";
                    const active = tc.isSample === isSample;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => update(index, "isSample", isSample)}
                        className={cn(
                          "cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded-full text-md font-semibold transition-all border",
                          active
                            ? isSample
                              ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                              : "bg-slate-200 text-slate-700 border-slate-400"
                            : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200",
                        )}
                      >
                        {isSample ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        {isSample ? "Công khai" : "Ẩn"}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => onChange(testCases.filter((_, i) => i !== index))}
                  className="cursor-pointer p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 divide-x divide-gray-200">
              {(["input", "expectedOutput"] as const).map((field) => (
                <div key={field} className="p-4 space-y-2">
                  <Label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    {field === "input" ? "Dữ liệu đầu vào" : "Dữ liệu đầu ra"}
                  </Label>
                  <Textarea
                    value={tc[field]}
                    onChange={(e) => update(index, field, e.target.value)}
                    rows={4}
                    placeholder={field === "input" ? "Ví dụ:\n[2,7,11,15]\n9" : "Ví dụ:\n[0,1]"}
                    className="font-mono text-md bg-gray-50 border-gray-200 resize-none"
                  />
                </div>
              ))}
            </div>
          </div>
        ))
      )}
      <Button
        type="button"
        onClick={() => onChange([...testCases, { input: "", expectedOutput: "", isSample: true }])}
        variant="outline"
        className="w-full h-11 text-md border-dashed border-2 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 font-semibold gap-2"
      >
        <Plus className="w-5 h-5" />
        Thêm test case
      </Button>
    </div>
  );
};

interface JsonTabProps {
  value: string;
  onChange: (v: string) => void;
  error: string | null;
  onSetError: (e: string | null) => void;
}

const JsonTab: React.FC<JsonTabProps> = ({ value, onChange, error, onSetError }) => {
  const handleFormat = () => {
    if (!value.trim()) return;
    let raw = value.trim();
    const tryParse = (str: string) => {
      const parsed = JSON.parse(str);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      return arr.map((item) => ({
        input: String(item.input ?? ""),
        expectedOutput: String(item.expectedOutput ?? ""),
        isSample: typeof item.isSample === "boolean" ? item.isSample : false,
      }));
    };
    try {
      onChange(JSON.stringify(tryParse(raw), null, 2));
      onSetError(null);
      return;
    } catch {}
    try {
      const match = raw.match(/testCases\s*:\s*(\[[\s\S]*\])/);
      if (match) raw = match[1] ?? "";
      const jsonLike = raw
        .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
        .replace(/:\s*'([^']*)'/g, ': "$1"')
        .replace(/,\s*([}\]])/g, "$1");
      onChange(JSON.stringify(tryParse(jsonLike), null, 2));
      onSetError(null);
    } catch {
      onSetError("Không thể tự động định dạng, vui lòng nhập đúng JSON");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-md font-semibold text-gray-700">
          Nội dung JSON <span className="text-red-500">*</span>
        </Label>
        <Button
          type="button"
          onClick={handleFormat}
          variant="outline"
          className="h-9 px-4 text-md font-semibold border-2 border-gray-300 hover:bg-gray-50"
          isDisabled={!value.trim()}
        >
          Định dạng JSON
        </Button>
      </div>

      <Textarea
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          onSetError(null);
        }}
        rows={16}
        placeholder={`[\n  {\n    "input": "[2,7,11,15]\\n9",\n    "expectedOutput": "[0,1]",\n    "isSample": true\n  }\n]`}
        className={cn(
          "font-mono text-md border-2 focus:border-blue-500",
          error ? "border-red-300 focus:border-red-500" : "border-gray-300",
        )}
      />
      {error && (
        <p className="flex items-center gap-1.5 text-md text-red-600">
          <XCircle className="w-4 h-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

interface FileTabProps {
  parsedTestCases: ManualTestCase[];
  onFileParsed: (tcs: ManualTestCase[]) => void;
}

const FileTab: React.FC<FileTabProps> = ({ parsedTestCases, onFileParsed }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParseError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const tcs = parseFileContent(ev.target?.result as string, file.name);
        if (tcs.length === 0) {
          setParseError("Không tìm thấy test case nào trong file. Kiểm tra lại định dạng.");
        } else {
          onFileParsed(tcs);
        }
      } catch {
        setParseError("Không thể đọc file, vui lòng kiểm tra định dạng.");
      }
    };
    reader.readAsText(file, "utf-8");
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFileName(null);
    setParseError(null);
    onFileParsed([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isJson = fileName?.endsWith(".json");

  return (
    <div className="space-y-5">
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
          fileName && parsedTestCases.length > 0
            ? "border-green-300 bg-green-50"
            : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50",
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" accept=".txt,.json" className="hidden" onChange={handleFileChange} />
        {fileName && parsedTestCases.length > 0 ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
            <p className="font-semibold text-green-700">{fileName}</p>
            <p className="text-md text-green-600">
              Đã đọc được <strong>{parsedTestCases.length}</strong> test case
              {parsedTestCases.length !== 1 ? "s" : ""}
            </p>
            <button
              type="button"
              className="text-sm text-gray-400 hover:text-gray-600 underline mt-1"
              onClick={handleReset}
            >
              Chọn file khác
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-10 h-10 text-gray-300" />
            <p className="font-semibold text-gray-600">Kéo thả hoặc nhấn để chọn file</p>
            <p className="text-sm text-gray-400">.txt hoặc .json</p>
          </div>
        )}
      </div>

      {parseError && (
        <p className="flex items-center gap-1.5 text-md text-red-600">
          <XCircle className="w-4 h-4 shrink-0" />
          {parseError}
        </p>
      )}

      {parsedTestCases.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-md font-semibold text-gray-700">Xem trước ({parsedTestCases.length} test cases)</p>
            <p className="text-sm text-gray-400">
              {isJson ? `isSample giữ nguyên từ file` : `Tất cả mặc định là "Ẩn", có thể chỉnh sau khi tạo bài`}
            </p>
          </div>
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {parsedTestCases.map((tc, i) => (
              <div key={i} className="border border-gray-200 rounded-lg bg-white text-sm font-mono overflow-hidden">
                <div className="grid grid-cols-2 divide-x divide-gray-200">
                  {(["input", "expectedOutput"] as const).map((field) => (
                    <div key={field} className="p-3">
                      <p className="text-gray-400 font-sans font-semibold mb-1">
                        {field === "input" ? "Input" : "Output"}
                      </p>
                      <pre className="whitespace-pre-wrap text-gray-700">{tc[field]}</pre>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface TestCaseInputProps {
  state: TestCaseInputState;
  onChange: (state: TestCaseInputState) => void;
  error: string | null;
  jsonError: string | null;
  onSetJsonError: (e: string | null) => void;
}

const TestCaseInput: React.FC<TestCaseInputProps> = ({ state, onChange, error, jsonError, onSetJsonError }) => {
  const { mode, manualTestCases, testCasesJson, fileTestCases } = state;

  const tcCount =
    mode === "manual"
      ? manualTestCases.length
      : mode === "json"
        ? (() => {
            try {
              const p = JSON.parse(testCasesJson);
              return Array.isArray(p) ? p.length : 0;
            } catch {
              return 0;
            }
          })()
        : fileTestCases.length;

  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange({ ...state, mode: tab.id })}
            className={cn(
              "cursor-pointer flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-md font-semibold transition-all",
              mode === tab.id
                ? "bg-white text-blue-700 shadow-sm border border-gray-200"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200",
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {mode === "manual" && (
        <ManualTab testCases={manualTestCases} onChange={(tcs) => onChange({ ...state, manualTestCases: tcs })} />
      )}
      {mode === "json" && (
        <JsonTab
          value={testCasesJson}
          onChange={(v) => onChange({ ...state, testCasesJson: v })}
          error={jsonError}
          onSetError={onSetJsonError}
        />
      )}
      {mode === "file" && (
        <FileTab parsedTestCases={fileTestCases} onFileParsed={(tcs) => onChange({ ...state, fileTestCases: tcs })} />
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-md text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

export default TestCaseInput;
