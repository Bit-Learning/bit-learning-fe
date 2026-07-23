import React from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { useCertificate, useDownloadCertificate } from "../queries/useCourse";
interface CourseCertificateProps {
	courseId: number;
	courseName: string;
	progressPercentage: number;
}

export const CourseCertificate: React.FC<CourseCertificateProps> = ({
	courseId,
	courseName,
	progressPercentage,
}) => {
	const isCompleted = progressPercentage >= 100;

	const { data: certificateUrl, isLoading: certLoading } = useCertificate(
		courseId,
		isCompleted,
	);
	const { mutate: download, isPending: downloading } = useDownloadCertificate();
	const slugify = (str: string) => {
		return str
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.replace(/đ/g, "d")
			.replace(/Đ/g, "D")
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");
	};

	const handleDownload = () => {
		download(courseId, {
			onSuccess: (response) => {
				const blob = new Blob([response.data], { type: "image/png" });
				const url = URL.createObjectURL(blob);

				const a = document.createElement("a");
				a.href = url;
				const safeName = slugify(courseName);

				a.download = `${safeName}.png`;
				a.click();

				URL.revokeObjectURL(url);
			},
		});
	};

	return (
		<Card className="overflow-hidden border-0 p-0">
			<CardContent className="border-0">
				<div className="mb-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs">
					{certLoading ? (
						<div className="flex h-48 items-center justify-center">
							<Loader2 className="h-8 w-8 animate-spin text-amber-500" />
						</div>
					) : certificateUrl ? (
						<img
							src={certificateUrl}
							alt={`Chứng chỉ ${courseName}`}
							className="w-full object-contain"
						/>
					) : (
						<div className="flex h-48 items-center justify-center text-slate-400 text-sm">
							Không thể tải chứng chỉ
						</div>
					)}
				</div>

				<div className="flex gap-2">
					<Button
						className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2 py-5"
						onClick={() => handleDownload()}
						isDisabled={downloading}
					>
						{downloading ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Download className="h-4 w-4" />
						)}
						Tải xuống
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};
