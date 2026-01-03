import "@tanstack/react-table";

declare module "@tanstack/react-table" {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface ColumnMeta<_TData, _TValue> {
		className?: string; // apply to both th and td
		tdClassName?: string;
		thClassName?: string;
	}
}
