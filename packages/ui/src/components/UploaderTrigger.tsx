"use client";

import { Button } from "@workspace/ui/components/Button";
import { formatFileSize } from "@workspace/ui/lib/file";
import { cn } from "@workspace/ui/lib/utils";
import { UploadIcon } from "lucide-react";
import {
	DropZone,
	type FileDropItem,
	FileTrigger,
} from "react-aria-components";

export interface UploaderTriggerProps {
	onDrop: (files: Array<File>) => void;
	acceptedFileExtensions?: string[];
	maxFileSize?: number;
	allowMultiple?: boolean;
	triggerType?: "button" | "dropzone";
	isDisabled?: boolean;
	isInvalid?: boolean;
}

export function UploaderTrigger({
	onDrop,
	acceptedFileExtensions,
	maxFileSize,
	allowMultiple = true,
	triggerType = "button",
	isDisabled = false,
	isInvalid = false,
}: UploaderTriggerProps) {
	if (triggerType === "button") {
		return (
			<FileTrigger
				allowsMultiple={allowMultiple}
				acceptedFileTypes={acceptedFileExtensions?.map(
					(extension) => `.${extension}`,
				)}
				onSelect={(e) => {
					if (!e) return;

					const files = Array.from(e);
					onDrop(files);
				}}
			>
				<Button
					variant="outline"
					className={cn("w-fit", isInvalid && "border-destructive-foreground")}
					isDisabled={isDisabled}
				>
					<UploadIcon /> Upload
				</Button>
			</FileTrigger>
		);
	}

	return (
		<DropZone
			isDisabled={isDisabled}
			onDrop={async (e) => {
				const dropItems = e.items as Array<FileDropItem>;
				const filePromises = dropItems.map((file) => file.getFile());
				const files = await Promise.all(filePromises);
				onDrop(files);
			}}
			className={cn(
				"flex flex-col items-center justify-center gap-3 shadow-sm",
				"bg-background-secondary min-h-[150px] w-full rounded-lg border border-dashed px-3 py-7 text-sm font-medium",
				"data-[drop-target]:border-primary data-[drop-target]:bg-primary/15 transition-all data-[drop-target]:border-solid",
				isDisabled && "opacity-60",
				isInvalid && "border-destructive-foreground",
			)}
		>
			<UploadIcon className="text-muted-foreground size-5" />
			<div className="space-y-0.5 text-center">
				<p className="font-medium">Choose file or drag & drop to upload</p>
				{acceptedFileExtensions && acceptedFileExtensions?.length > 0 && (
					<p className="text-muted-foreground">
						Supported file types: {acceptedFileExtensions?.join(", ")}
					</p>
				)}
				{maxFileSize && (
					<p className="text-muted-foreground">
						Max file size: {formatFileSize(maxFileSize)}
					</p>
				)}
			</div>
			<FileTrigger
				allowsMultiple={allowMultiple}
				acceptedFileTypes={acceptedFileExtensions?.map(
					(extension) => `.${extension}`,
				)}
				onSelect={(e) => {
					if (!e) return;

					const files = Array.from(e);
					onDrop(files);
				}}
			>
				<Button variant="outline" isDisabled={isDisabled}>
					Browse
				</Button>
			</FileTrigger>
		</DropZone>
	);
}
