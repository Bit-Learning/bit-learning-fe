import type { PyodideInterface } from "pyodide";

let pyodide: PyodideInterface | null = null;

async function init() {
	if (pyodide) return pyodide;

	const { loadPyodide } = await import("pyodide");

	pyodide = await loadPyodide({
		indexURL: "https://cdn.jsdelivr.net/pyodide/v0.29.3/full/",
	});

	await pyodide.loadPackage(["micropip", "packaging"]);

	await pyodide.runPythonAsync(`
import micropip
await micropip.install("black", keep_going=True)
  `);

	return pyodide;
}

self.onmessage = async (e: MessageEvent) => {
	const { code, id } = e.data;

	try {
		const py = await init();
		py.globals.set("code_to_format", code);

		const result = await py.runPythonAsync(`
import black

def normalize_indent(source: str) -> str:
    lines = source.split("\\n")
    result = []
    for line in lines:
        if not line.strip():
            result.append("")
            continue
        stripped = line.lstrip()
        raw_indent = line[: len(line) - len(stripped)]
        expanded = raw_indent.replace("\\t", "    ")
        indent_len = len(expanded)
        normalized = round(indent_len / 4) * 4
        result.append(" " * normalized + stripped)
    return "\\n".join(result)

try:
    formatted = black.format_str(code_to_format, mode=black.Mode(line_length=100))
    output = ("ok", formatted)
except black.InvalidInput:
    try:
        normalized = normalize_indent(code_to_format)
        formatted = black.format_str(normalized, mode=black.Mode(line_length=100))
        output = ("ok", formatted)
    except black.InvalidInput:
        output = ("syntax_error", normalize_indent(code_to_format))
    except Exception:
        output = ("error", code_to_format)
except Exception:
    output = ("error", code_to_format)

output
    `);

		const [status, formatted] = result.toJs() as [string, string];

		if (status === "syntax_error") {
			self.postMessage({
				id,
				result: formatted,
				error:
					"Code có lỗi cú pháp, không thể format hoàn toàn. Đã chuẩn hóa indent.",
				syntaxError: true,
			});
		} else {
			self.postMessage({ id, result: formatted, error: null });
		}
	} catch (e: any) {
		self.postMessage({
			id,
			result: code,
			error: e?.message ?? "Unknown error",
		});
	}
};
