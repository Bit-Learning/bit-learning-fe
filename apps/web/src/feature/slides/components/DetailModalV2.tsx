import React from "react";
import {
	AlertCircle,
	Calendar,
	CheckCircle,
	Download,
	ExternalLink,
	FileText,
	Layers,
	X,
} from "lucide-react";
import type { SlideGenerationResponse } from "../types/slide.type";

interface DetailModalV2Props {
	slide: SlideGenerationResponse;
	onClose: () => void;
}

export const DetailModalV2: React.FC<DetailModalV2Props> = ({
	slide,
	onClose,
}) => {
	const handleDownload = () => {
		if (slide.cloudinaryUrl) {
			window.open(slide.cloudinaryUrl, "_blank");
		}
	};

	return (
		<div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/65 p-4 backdrop-blur-sm">
			<div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
				<div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-6 py-4">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
							<Layers className="text-primary" size={18} />
						</div>
						<div>
							<h2 className="line-clamp-1 text-lg font-bold text-slate-900">
								{slide.topic}
							</h2>
							<p className="text-sm text-slate-500">
								{slide.templateName} · {slide.slideCount} slides
							</p>
						</div>
					</div>
					<button
						className="group flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-all hover:bg-slate-100 hover:text-red-600"
						onClick={onClose}
					>
						<X
							className="transition-transform group-hover:rotate-90"
							size={22}
						/>
					</button>
				</div>

				<div className="flex flex-1 overflow-hidden">
					<div className="flex-1 overflow-hidden border-r border-slate-100 bg-slate-50">
						{slide.pdfCloudinaryUrl ? (
							<iframe
								src={slide.pdfCloudinaryUrl}
								title={`Preview - ${slide.topic}`}
								className="h-full w-full border-0"
							/>
						) : (
							<div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400">
								<AlertCircle size={40} className="opacity-40" />
								<p className="text-base">Không có file xem trước.</p>
							</div>
						)}
					</div>

					<div className="flex w-80 shrink-0 flex-col overflow-y-auto p-6">
						<div className="space-y-5">
							<div>
								<h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
									Thông tin deck
								</h3>
								<div className="space-y-3">
									<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
										<p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-slate-400">
											<FileText size={12} />
											Chủ đề
										</p>
										<p className="mt-2 text-base font-semibold text-slate-900">
											{slide.topic}
										</p>
									</div>
									<div className="grid grid-cols-2 gap-3">
										<div className="rounded-2xl border border-slate-200 p-4">
											<p className="text-xs uppercase tracking-[0.14em] text-slate-400">
												Slides
											</p>
											<p className="mt-2 text-base font-semibold text-slate-900">
												{slide.slideCount}
											</p>
										</div>
										<div className="rounded-2xl border border-slate-200 p-4">
											<p className="text-xs uppercase tracking-[0.14em] text-slate-400">
												Template
											</p>
											<p className="mt-2 line-clamp-2 text-sm font-semibold text-primary">
												{slide.templateName}
											</p>
										</div>
									</div>
									<div className="rounded-2xl border border-slate-200 p-4">
										<p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-slate-400">
											<Calendar size={12} />
											Ngày tạo
										</p>
										<p className="mt-2 text-sm font-medium text-slate-900">
											{new Date(slide.generatedAt).toLocaleDateString("vi-VN", {
												year: "numeric",
												month: "long",
												day: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</p>
									</div>
									<div className="rounded-2xl border border-slate-200 p-4">
										<p className="text-xs uppercase tracking-[0.14em] text-slate-400">
											Tên file
										</p>
										<p className="mt-2 break-all text-sm text-slate-600">
											{slide.filename}
										</p>
									</div>
								</div>
							</div>

							{slide.fromCache && (
								<div className="flex items-center gap-2 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
									<CheckCircle className="shrink-0 text-amber-500" size={16} />
									<div>
										<span className="block text-sm font-medium text-amber-700">
											Tạo từ cache
										</span>
										<span className="text-sm text-amber-600">
											Deck này được trả về nhanh hơn nhờ kết quả có sẵn.
										</span>
									</div>
								</div>
							)}
						</div>

						<div className="mt-auto flex flex-col gap-3 border-t border-slate-100 pt-5">
							{slide.pdfCloudinaryUrl && (
								<a
									href={slide.pdfCloudinaryUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-blue-200 px-4 py-3 text-sm font-medium text-blue-700 transition-all hover:bg-blue-50"
								>
									<ExternalLink size={15} />
									Mở PDF trong tab mới
								</a>
							)}
							<button
								className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
								onClick={handleDownload}
								disabled={!slide.cloudinaryUrl}
							>
								<Download size={15} />
								Tải xuống (.pptx)
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
