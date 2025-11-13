import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog'
import { Button } from '@workspace/ui/components/Button'
import {
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
    DialogTrigger,
} from '@workspace/ui/components/Dialog'
import { Label } from '@workspace/ui/components/label'
import { Input } from '@workspace/ui/components/update/input'
import {
    AlertCircle,
    Archive,
    ChevronLeft,
    ChevronRight,
    Clock,
    Loader2,
    MessageSquare,
    Plus,
    Trash2,
} from 'lucide-react'
import * as React from 'react'
import { useConversations, useCreateConversation, useDeleteConversation } from '../hooks'

interface ConversationsTabProps {
    onSelectConversation?: (id: string) => void
    currentConversationId?: string
}

export const ConversationsTab = ({ onSelectConversation, currentConversationId }: ConversationsTabProps) => {
    const [page, setPage] = React.useState(1)
    const [deleteId, setDeleteId] = React.useState<string | null>(null)
    const [showCreateDialog, setShowCreateDialog] = React.useState(false)
    const [newTitle, setNewTitle] = React.useState('')

    const { data, isLoading, error } = useConversations(page, 20, false)
    const { deleteConversation, isPending: isDeleting } = useDeleteConversation()
    const { createConversation, isPending: isCreating } = useCreateConversation()

    const handleDelete = () => {
        if (deleteId) {
            deleteConversation(deleteId, {
                onSuccess: () => {
                    setDeleteId(null)
                },
            })
        }
    }

    const handleCreateConversation = () => {
        const title = newTitle.trim()
        createConversation(title ? { title } : {}, {
            onSuccess: data => {
                setShowCreateDialog(false)
                setNewTitle('')
                if (onSelectConversation) {
                    onSelectConversation(data.id)
                }
            },
        })
    }

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
                    <p className="text-gray-600">Đang tải conversations...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-600" />
                    <p className="text-gray-600">Lỗi khi tải conversations</p>
                    <p className="text-sm text-gray-500">{error.message}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-full flex-col bg-gray-50">
            {/* Header */}
            <div className="border-b bg-white px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Conversations</h2>
                        <p className="text-sm text-gray-500">
                            {data?.total || 0} conversations • Page {page}
                        </p>
                    </div>
                    <Button onClick={() => setShowCreateDialog(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4" />
                        New Conversation
                    </Button>
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-6">
                {!data?.conversations || data.conversations.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                            <MessageSquare className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                            <h3 className="mb-2 text-lg font-semibold text-gray-900">No conversations yet</h3>
                            <p className="mb-4 text-sm text-gray-600">Start a new conversation to get started</p>
                            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Create First Conversation
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {data.conversations.map(conv => (
                            <div
                                key={conv.id}
                                className={`group relative rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md ${
                                    currentConversationId === conv.id ? 'border-blue-500 ring-2 ring-blue-100' : ''
                                }`}
                            >
                                {/* Archived Badge */}
                                {conv.is_archived && (
                                    <div className="absolute top-2 right-2">
                                        <Archive className="h-4 w-4 text-gray-400" />
                                    </div>
                                )}

                                {/* Content */}
                                <div className="mb-3">
                                    <h3 className="mb-1 truncate font-semibold text-gray-900">
                                        {conv.title || 'Untitled Conversation'}
                                    </h3>
                                    {conv.subject && (
                                        <p className="mb-1 text-xs text-gray-500">Subject: {conv.subject}</p>
                                    )}
                                    {conv.grade && <p className="text-xs text-gray-500">Grade: {conv.grade}</p>}
                                </div>

                                {/* Metadata */}
                                <div className="mb-3 flex items-center gap-3 text-xs text-gray-500">
                                    {/* <div className="flex items-center gap-1">
                                        <MessageSquare className="h-3.5 w-3.5" />
                                        <span>{conv.message_count || 0} messages</span>
                                    </div> */}
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>
                                            {new Date(conv.updated_at).toLocaleString('vi-VN', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => onSelectConversation?.(conv.id)}
                                    >
                                        Open
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                        onClick={() => setDeleteId(conv.id)}
                                        isDisabled={isDeleting}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {data && data.total > 20 && (
                <div className="border-t bg-white px-6 py-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing {(page - 1) * 20 + 1} - {Math.min(page * 20, data.total)} of {data.total}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                isDisabled={page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => p + 1)}
                                isDisabled={page * 20 >= data.total}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Conversation Dialog */}
            <DialogTrigger isOpen={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogOverlay>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create New Conversation</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">
                                    Conversation Title <span className="text-xs text-gray-500">(Optional)</span>
                                </Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., Learning Python Basics"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && !isCreating) {
                                            handleCreateConversation()
                                        }
                                    }}
                                    disabled={isCreating}
                                    className="w-full"
                                />
                                <p className="text-xs text-gray-500">
                                    Leave blank to auto-generate a title based on your first message
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowCreateDialog(false)
                                    setNewTitle('')
                                }}
                                isDisabled={isCreating}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleCreateConversation} isDisabled={isCreating} className="gap-2">
                                {isCreating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        Create
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </DialogOverlay>
            </DialogTrigger>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this conversation and all its
                            messages.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
