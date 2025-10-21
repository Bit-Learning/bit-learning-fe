import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog'
import { PresentationCard } from '../components/PresentationCard'
import { SlidevModeButtons } from '../components/SlidevModeButtons'
import { usePresentations } from '../hooks/usePresentations'
import { checkSlidevRunning, openSlidevPresentation } from '../lib/slidev-utils'
import { SlidevMode, SlidevPresentation } from '../types'
import { useNavigate } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/Badge'
import { Button } from '@workspace/ui/components/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/Card'
import { Input } from '@workspace/ui/components/Input'
import { Separator } from '@workspace/ui/components/Separator'
import { Plus, Search, Server, ServerOff, Filter, Grid3x3, List } from 'lucide-react'
import { useState, useEffect } from 'react'

export const SlidevPresentationsPage = () => {
    const navigate = useNavigate()
    const { presentations, deletePresentation, duplicatePresentation } = usePresentations()

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedTag, setSelectedTag] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [isSlidevRunning, setIsSlidevRunning] = useState(false)
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean
        presentation: SlidevPresentation | null
    }>({ open: false, presentation: null })
    const [selectedPresentation, setSelectedPresentation] = useState<SlidevPresentation | null>(null)

    // Check if Slidev is running
    useEffect(() => {
        const checkServer = async () => {
            const isRunning = await checkSlidevRunning()
            setIsSlidevRunning(isRunning)
        }
        checkServer()
        // Check every 10 seconds
        const interval = setInterval(checkServer, 10000)
        return () => clearInterval(interval)
    }, [])

    // Get all unique tags
    const allTags = Array.from(new Set(presentations.flatMap(p => p.tags || []))).sort()

    // Filter presentations
    const filteredPresentations = presentations.filter(p => {
        const matchesSearch =
            searchQuery === '' ||
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesTag = selectedTag === null || p.tags?.includes(selectedTag)

        return matchesSearch && matchesTag
    })

    const handleOpenMode = (presentation: SlidevPresentation, mode: SlidevMode) => {
        openSlidevPresentation(presentation.fileName, mode)
    }

    const handleViewDetail = (presentation: SlidevPresentation) => {
        setSelectedPresentation(presentation)
    }

    const handleEdit = (presentation: SlidevPresentation) => {
        navigate({ to: '/templates/slidev/$id/edit', params: { id: presentation.id } })
    }

    const handleDelete = (presentation: SlidevPresentation) => {
        setDeleteDialog({ open: true, presentation })
    }

    const handleConfirmDelete = () => {
        if (deleteDialog.presentation) {
            deletePresentation(deleteDialog.presentation.id)
            setDeleteDialog({ open: false, presentation: null })
            if (selectedPresentation?.id === deleteDialog.presentation.id) {
                setSelectedPresentation(null)
            }
        }
    }

    const handleDuplicate = (presentation: SlidevPresentation) => {
        duplicatePresentation(presentation.id)
    }

    const handleCreate = () => {
        navigate({ to: '/templates/slidev/create' })
    }

    return (
        <div className="container mx-auto space-y-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Slidev Presentations</h1>
                    <p className="text-muted-foreground">Manage your presentation slides powered by Slidev</p>
                </div>
                <Button onClick={handleCreate} size="lg">
                    <Plus className="mr-2 h-5 w-5" />
                    Create New
                </Button>
            </div>

            <Separator />

            {/* Server Status */}
            <Card className={isSlidevRunning ? 'border-green-500 bg-green-50' : 'border-amber-500 bg-amber-50'}>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        {isSlidevRunning ? (
                            <>
                                <Server className="h-5 w-5 text-green-600" />
                                <CardTitle className="text-green-600">Slidev Server Running</CardTitle>
                            </>
                        ) : (
                            <>
                                <ServerOff className="h-5 w-5 text-amber-600" />
                                <CardTitle className="text-amber-600">Slidev Server Not Running</CardTitle>
                            </>
                        )}
                    </div>
                    <CardDescription>
                        {isSlidevRunning ? (
                            'Server is running at http://localhost:3030'
                        ) : (
                            <>
                                Start the server to view presentations:{' '}
                                <code className="rounded bg-amber-100 px-2 py-1 text-xs">
                                    cd apps/slides && pnpm dev
                                </code>
                            </>
                        )}
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-2">
                    <div className="relative max-w-md flex-1">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                            placeholder="Search presentations..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setViewMode('grid')}
                    >
                        <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setViewMode('list')}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Tags Filter */}
            {allTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    <span className="text-muted-foreground text-sm font-medium">Tags:</span>
                    <Badge
                        variant={selectedTag === null ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setSelectedTag(null)}
                    >
                        All ({presentations.length})
                    </Badge>
                    {allTags.map(tag => (
                        <Badge
                            key={tag}
                            variant={selectedTag === tag ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => setSelectedTag(tag)}
                        >
                            {tag} ({presentations.filter(p => p.tags?.includes(tag)).length})
                        </Badge>
                    ))}
                </div>
            )}

            <Separator />

            {/* Presentations Grid/List */}
            {filteredPresentations.length === 0 ? (
                <Card className="p-12 text-center">
                    <CardContent>
                        <p className="text-muted-foreground">
                            {searchQuery || selectedTag
                                ? 'No presentations found matching your filters.'
                                : 'No presentations yet. Create your first presentation!'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div
                    className={
                        viewMode === 'grid' ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'
                    }
                >
                    {filteredPresentations.map(presentation => (
                        <PresentationCard
                            key={presentation.id}
                            presentation={presentation}
                            onClick={() => handleViewDetail(presentation)}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onDuplicate={handleDuplicate}
                        />
                    ))}
                </div>
            )}

            {/* Detail Panel */}
            {selectedPresentation && (
                <Card className="border-primary border-2">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle>{selectedPresentation.title}</CardTitle>
                                <CardDescription>{selectedPresentation.description}</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedPresentation(null)}>
                                ✕
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium">File:</span> {selectedPresentation.fileName}
                            </div>
                            <div>
                                <span className="font-medium">Theme:</span> {selectedPresentation.theme}
                            </div>
                            <div>
                                <span className="font-medium">Created:</span>{' '}
                                {new Date(selectedPresentation.createdAt).toLocaleDateString('vi-VN')}
                            </div>
                            <div>
                                <span className="font-medium">Updated:</span>{' '}
                                {new Date(selectedPresentation.updatedAt).toLocaleDateString('vi-VN')}
                            </div>
                        </div>
                        <Separator />
                        <div>
                            <p className="mb-3 text-sm font-medium">Open Presentation:</p>
                            <SlidevModeButtons
                                fileName={selectedPresentation.fileName}
                                onOpenMode={mode => handleOpenMode(selectedPresentation, mode)}
                                isRunning={isSlidevRunning}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                open={deleteDialog.open}
                onOpenChange={open => !open && setDeleteDialog({ open: false, presentation: null })}
                onConfirm={handleConfirmDelete}
                presentationTitle={deleteDialog.presentation?.title || ''}
            />
        </div>
    )
}
