import { useState } from "react";
import {
	useDownloadGameTemplate,
	useExportGamesExcel,
	useImportGamesExcel,
	usePreviewImportGamesExcel,
} from "../hooks/useAdminGamesExcel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const GamesExcelManager = () => {
	const [file, setFile] = useState<File | null>(null);

	const downloadTemplate = useDownloadGameTemplate();
	const exportGames = useExportGamesExcel();
	const importGames = useImportGamesExcel();
	const previewImport = usePreviewImportGamesExcel();

	const handleDownloadTemplate = async () => {
		const res = await downloadTemplate.mutateAsync();
		const blob = new Blob([res.data], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "game_template.xlsx";
		a.click();
		URL.revokeObjectURL(url);
	};

	const handleExportGames = async () => {
		const res = await exportGames.mutateAsync(undefined);
		const blob = new Blob([res.data], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "games_export.xlsx";
		a.click();
		URL.revokeObjectURL(url);
	};

	const handlePreview = async () => {
		if (!file) return;
		const items = await previewImport.mutateAsync(file);
		toast(
			`Xem trước import: sẽ tạo ${items.length} game từ file này nếu tiếp tục.`,
		);
	};

	const handleImport = async () => {
		if (!file) return;
		const result = await importGames.mutateAsync(file);
		toast(
			`${result.success ? "Import thành công" : "Import có lỗi"}: ${
				result.message
			}`,
		);
	};

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<Label>File Excel game (.xlsx)</Label>
				<Input
					type="file"
					accept=".xlsx,.xls"
					onChange={(e) => {
						const f = e.target.files?.[0] ?? null;
						setFile(f);
					}}
				/>
			</div>

			<div className="flex flex-wrap gap-3">
				<Button
					type="button"
					variant="outline"
					onClick={handleDownloadTemplate}
				>
					Tải template
				</Button>
				<Button type="button" variant="outline" onClick={handleExportGames}>
					Export tất cả game
				</Button>
				<Button
					type="button"
					variant="outline"
					onClick={handlePreview}
					disabled={!file}
				>
					Xem trước import
				</Button>
				<Button type="button" onClick={handleImport} disabled={!file}>
					Thực hiện import
				</Button>
			</div>
		</div>
	);
};
