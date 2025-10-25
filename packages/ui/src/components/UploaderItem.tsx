'use client'

import { Button } from '@workspace/ui/components/Button'
import { CircleProgress, Progress } from '@workspace/ui/components/Progress'
import { Tooltip, TooltipTrigger } from '@workspace/ui/components/Tooltip'
import { UploaderIcon } from '@workspace/ui/components/UploaderIcon'
import { formatFileSize, shortenFilename } from '@workspace/ui/lib/file'
import { cn } from '@workspace/ui/lib/utils'
import { DownloadIcon, RotateCwIcon, Trash2Icon } from 'lucide-react'
import { Focusable } from 'react-aria'

export interface UploaderFile {
    /** The unique identifier for the file. */
    id: string

    /** The size of the file. */
    size: number

    /** The name of the file. */
    name: string

    /** MIME type of the file. */
    type: string

    /** The extension of the file. Eg: 'png', 'pdf', etc.*/
    extension: string

    /** The URL of the file. */
    url?: string

    /** The status of the file upload. */
    status?: 'done' | 'error' | 'uploading'

    /** The percent of the file upload. */
    percent?: number

    /** The thumbnail URL of the file. */
    thumbUrl?: string

    /** The error message of the file upload. */
    error?: any

    /** The file. */
    file?: File

    /** The abort controller for canceling the upload request. */
    abortController?: AbortController
}

export interface UploaderItemProps {
    uploaderFile: UploaderFile
    onDelete: (uploaderFile: UploaderFile) => void
    onRetry: (uploaderFile: UploaderFile) => void
    variant?: 'list' | 'card'
    isDisabled?: boolean
}

export function UploaderItem({
    uploaderFile,
    onDelete,
    onRetry,
    variant = 'list',
    isDisabled = false,
}: UploaderItemProps) {
    const isImage = uploaderFile.type.startsWith('image/')
    const getUrl = () => {
        if (uploaderFile.thumbUrl) return uploaderFile.thumbUrl

        if (uploaderFile.url) return uploaderFile.url

        if (uploaderFile.file) return URL.createObjectURL(uploaderFile.file)
    }

    const isUploading = uploaderFile.status === 'uploading'

    // card variant
    if (variant === 'card') {
        return (
            <div className="group bg-background-secondary relative grid size-22 shrink-0 place-items-center rounded-lg">
                {isUploading && <CircleProgress value={uploaderFile.percent} className="absolute top-1 right-1" />}

                {/* content */}
                {isImage ? (
                    <img
                        src={getUrl()}
                        alt={uploaderFile.name}
                        className={cn(
                            'size-full overflow-hidden rounded-lg object-cover shadow-sm',
                            isUploading && 'opacity-30',
                        )}
                    />
                ) : (
                    <UploaderIcon extension={uploaderFile.extension} className={cn(isUploading && 'opacity-30')} />
                )}

                {/* actions */}
                <div
                    className={cn(
                        'bg-background-secondary/80 absolute inset-[-1px] flex items-center justify-center rounded-lg backdrop-blur-[3px] transition-opacity',
                        'opacity-0 group-hover:opacity-100',
                    )}
                >
                    <Actions
                        uploaderFile={uploaderFile}
                        onDelete={onDelete}
                        onRetry={onRetry}
                        isDisabled={isDisabled}
                    />
                </div>

                {/* border */}
                <div
                    className={cn(
                        'pointer-events-none absolute inset-[-1px] rounded-lg border',
                        uploaderFile.status === 'error' && 'border-destructive-foreground',
                    )}
                ></div>
            </div>
        )
    }

    // list variant
    return (
        <div
            className={cn(
                'bg-background-secondary relative w-full rounded-lg border p-1.5 transition-colors',
                uploaderFile.status === 'error' && 'border-destructive-foreground bg-destructive/10',
            )}
        >
            <div className="flex items-center gap-1">
                {/* preview  */}
                <div className={cn('grid size-11 place-items-center rounded', isUploading && 'opacity-60')}>
                    {isImage ? (
                        <img
                            src={getUrl()}
                            alt={uploaderFile.name}
                            className="size-10 overflow-hidden rounded-sm object-cover shadow-sm dark:border"
                        />
                    ) : (
                        <UploaderIcon extension={uploaderFile.extension} />
                    )}
                </div>

                {/* file info */}
                <div className="relative flex flex-1 flex-col gap-0.5">
                    <span className={cn('text-sm leading-3.5 font-medium', isUploading && 'opacity-60')}>
                        {shortenFilename(uploaderFile.name)}
                    </span>

                    {uploaderFile.error && (
                        <span className="text-destructive-foreground text-xs">{uploaderFile.error}</span>
                    )}
                    {!uploaderFile.error && (
                        <span className={cn('text-muted-foreground text-xs', isUploading && 'opacity-60')}>
                            {formatFileSize(uploaderFile.size)}
                        </span>
                    )}

                    <div className="absolute right-0 -bottom-[5px] left-0">
                        <Progress
                            value={uploaderFile.percent}
                            barClassName={cn('h-1 opacity-0', isUploading && 'opacity-100')}
                        />
                    </div>
                </div>

                {/* file action */}
                <Actions uploaderFile={uploaderFile} onDelete={onDelete} onRetry={onRetry} isDisabled={isDisabled} />
            </div>
        </div>
    )
}

function Actions({ uploaderFile, onDelete, onRetry, isDisabled }: Omit<UploaderItemProps, 'variant'>) {
    return (
        <div className="flex">
            {uploaderFile.status === 'done' && (
                <TooltipTrigger>
                    <Focusable>
                        <Button
                            aria-label="Download"
                            size="icon"
                            variant="ghost"
                            className="text-muted-foreground rounded-full"
                            asChild
                        >
                            <a
                                href={uploaderFile.url}
                                download={uploaderFile.name}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <DownloadIcon />
                            </a>
                        </Button>
                    </Focusable>
                    <Tooltip>Download</Tooltip>
                </TooltipTrigger>
            )}
            {uploaderFile.status === 'error' && (
                <TooltipTrigger>
                    <Button
                        aria-label="Retry"
                        size="icon"
                        variant="ghost"
                        onClick={() => onRetry(uploaderFile)}
                        className="text-muted-foreground rounded-full"
                    >
                        <RotateCwIcon />
                    </Button>
                    <Tooltip>Retry</Tooltip>
                </TooltipTrigger>
            )}
            {!isDisabled && (
                <TooltipTrigger>
                    <Button
                        aria-label="Delete"
                        size="icon"
                        variant="ghost"
                        onClick={() => onDelete(uploaderFile)}
                        className="text-muted-foreground rounded-full"
                    >
                        <Trash2Icon />
                    </Button>
                    <Tooltip>Delete</Tooltip>
                </TooltipTrigger>
            )}
        </div>
    )
}
