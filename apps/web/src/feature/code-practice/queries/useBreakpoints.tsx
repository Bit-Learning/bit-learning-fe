import { useState, useCallback, useRef, useEffect } from "react";
import * as monaco from "monaco-editor";

export interface BreakpointState {
	breakpoints: Set<number>;
	toggleBreakpoint: (lineNum: number) => void;
	clearBreakpoints: () => void;
	toLineArray: () => number[];
}

export function useBreakpoints(
	editorRef: React.RefObject<monaco.editor.IStandaloneCodeEditor | null>,
): BreakpointState {
	const [breakpoints, setBreakpoints] = useState<Set<number>>(new Set());
	const breakpointsRef = useRef<Set<number>>(new Set());
	const decorationsRef = useRef<string[]>([]);

	const updateDecorations = useCallback(
		(bps: Set<number>) => {
			const editor = editorRef.current;
			if (!editor) return;

			const newDecorations: monaco.editor.IModelDeltaDecoration[] = [
				...bps,
			].map((line) => ({
				range: new monaco.Range(line, 1, line, 1),
				options: {
					isWholeLine: true,
					className: "bp-highlight-line",
					glyphMarginClassName: "bp-glyph",
					glyphMarginHoverMessage: { value: `Breakpoint dòng ${line}` },
					overviewRuler: {
						color: "#E24B4A",
						position: monaco.editor.OverviewRulerLane.Left,
					},
				},
			}));

			decorationsRef.current = editor.deltaDecorations(
				decorationsRef.current,
				newDecorations,
			);
		},
		[editorRef],
	);

	const toggleBreakpoint = useCallback(
		(lineNum: number) => {
			setBreakpoints((prev) => {
				const next = new Set(prev);
				if (next.has(lineNum)) {
					next.delete(lineNum);
				} else {
					next.add(lineNum);
				}
				breakpointsRef.current = next;
				updateDecorations(next);
				return next;
			});
		},
		[updateDecorations],
	);

	const clearBreakpoints = useCallback(() => {
		const empty = new Set<number>();
		breakpointsRef.current = empty;
		setBreakpoints(empty);
		updateDecorations(empty);
	}, [updateDecorations]);

	const toLineArray = useCallback(
		() => [...breakpoints].sort((a, b) => a - b),
		[breakpoints],
	);

	useEffect(() => {
		if (editorRef.current && breakpointsRef.current.size > 0) {
			updateDecorations(breakpointsRef.current);
		}
	}, [editorRef, updateDecorations]);

	return { breakpoints, toggleBreakpoint, clearBreakpoints, toLineArray };
}
