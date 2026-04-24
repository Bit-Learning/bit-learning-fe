import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  getNodesBounds,
  getViewportForBounds,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { toPng } from "html-to-image";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CurriculumChapterPicker } from "@/feature/matrix/components/CurriculumChapterPicker";
import { toast } from "@/shared/components/Sonner";
import { extractApiErrorMessage } from "@/shared/lib/api-error";
import { Button } from "@workspace/ui/components/Button";
import { Input } from "@workspace/ui/components/Input";
import {
  Loader2,
  Sparkles,
  BookOpen,
  ImageDown,
  BookMarked,
  Pencil,
  Wand2,
  History,
  Eye,
  AlertTriangle,
  Save,
} from "lucide-react";
import {
  useGenerateMindMap,
  useGetMindMapGallery,
  useRefineMindMap,
  useSaveMindMapTree,
} from "../queries/use-mindmap-queries";
import { mindMapNodeTypes, mindMapRadialNodeTypes, mindMapSymmetricNodeTypes } from "./MindMapNodes";
import type {
  MindMapGenerateResponse,
  MindMapMetadata,
  MindMapTreeNode,
  MindMapVersionDto,
  SavedMindMapDto,
} from "../types/mindmap.type";
import { runElkLayout, getAlgorithmFamily } from "../utils/elk-layout";
import SavedMindMapsPanel from "./SavedMindMapsPanel";
import VersionHistorySidebar from "./VersionHistorySidebar";
import { StructurePicker, ThemePicker, ShapePicker, type NodeShape } from "./GalleryPicker";
import BitCoinIcon from "@/shared/components/BitCoinIcon";

type ActiveTab = "generate" | "saved";
type GenerateMode = "topic" | "chapter";

function addChildToTree(tree: MindMapTreeNode, parentId: string, newChild: MindMapTreeNode): MindMapTreeNode {
  if (tree.id === parentId) {
    return { ...tree, children: [...(tree.children ?? []), newChild] };
  }
  return {
    ...tree,
    children: (tree.children ?? []).map((c) => addChildToTree(c, parentId, newChild)),
  };
}

function removeNodeFromTree(tree: MindMapTreeNode, nodeId: string): MindMapTreeNode | null {
  if (tree.id === nodeId) return null;
  const children = (tree.children ?? [])
    .map((c) => removeNodeFromTree(c, nodeId))
    .filter((c): c is MindMapTreeNode => c !== null);
  return { ...tree, children };
}

function findNodeInTree(tree: MindMapTreeNode, id: string): MindMapTreeNode | null {
  if (tree.id === id) return tree;
  for (const child of tree.children ?? []) {
    const found = findNodeInTree(child, id);
    if (found) return found;
  }
  return null;
}

export default function MindMapView() {
  const [mode, setMode] = useState<GenerateMode>("topic");
  const [topic, setTopic] = useState("");
  const [curriculumId, setCurriculumId] = useState<number | null>(null);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [chapterId, setChapterId] = useState<number | null>(null);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [maxDepth, setMaxDepth] = useState(3);
  const [maxBranches, setMaxBranches] = useState(3);
  const [selectedStructureId, setSelectedStructureId] = useState<number | undefined>(undefined);
  const [selectedThemeId, setSelectedThemeId] = useState<number | undefined>(undefined);
  const [nodeShape, setNodeShape] = useState<NodeShape>("rounded");
  const nodeShapeRef = useRef<NodeShape>("rounded");
  const addChildCallbackRef = useRef<(parentId: string) => void>(() => {});
  const deleteNodeCallbackRef = useRef<(nodeId: string) => void>(() => {});

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [metadata, setMetadata] = useState<MindMapMetadata | null>(null);
  const [currentTitle, setCurrentTitle] = useState("");
  const [isApplyingLayout, setIsApplyingLayout] = useState(false);
  const [canvasBackground, setCanvasBackground] = useState<string | undefined>(undefined);

  const [currentMindMapId, setCurrentMindMapId] = useState<number | null>(null);
  const [currentVersion, setCurrentVersion] = useState(0);

  const [isPreviewingVersion, setIsPreviewingVersion] = useState(false);
  const [previewVersionNumber, setPreviewVersionNumber] = useState<number | null>(null);
  const previewBackupRef = useRef<{ nodes: Node[]; edges: Edge[] } | null>(null);
  const previewTreeRef = useRef<MindMapTreeNode | null>(null);
  const currentTreeRef = useRef<MindMapTreeNode | null>(null);
  const skipPickerEffectRef = useRef(false);

  const [showVersionSidebar, setShowVersionSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("generate");

  const withExtras = useCallback(
    (rfNodes: Node[]): Node[] =>
      rfNodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          nodeShape: nodeShapeRef.current,
          onAddChild: () => addChildCallbackRef.current(n.id),
          onDeleteNode: n.type !== "mindMapRoot" ? () => deleteNodeCallbackRef.current(n.id) : undefined,
        },
      })),
    [],
  );

  const [refineInstruction, setRefineInstruction] = useState("");

  const [editingNode, setEditingNode] = useState<{
    id: string;
    label: string;
    description: string;
  } | null>(null);

  const flowContainerRef = useRef<HTMLDivElement | null>(null);

  const { data: galleryData, isLoading: isGalleryLoading } = useGetMindMapGallery();
  const { mutate: generate, isPending: isGenerating } = useGenerateMindMap();
  const { mutate: refine, isPending: isRefining } = useRefineMindMap();
  const { mutate: saveTree, isPending: isSaving } = useSaveMindMapTree();

  const gallery = galleryData?.data?.data;

  useEffect(() => {
    if (!gallery) return;
    if (selectedStructureId === undefined && gallery.structures.length > 0) {
      setSelectedStructureId(gallery.structures[0]?.id);
    }
    if (selectedThemeId === undefined && gallery.themes.length > 0) {
      setSelectedThemeId(gallery.themes[0]?.id);
    }
  }, [gallery, selectedStructureId, selectedThemeId]);

  useEffect(() => {
    if (skipPickerEffectRef.current) {
      skipPickerEffectRef.current = false;
      return;
    }

    const tree = isPreviewingVersion ? previewTreeRef.current : currentTreeRef.current;
    if (!tree || !gallery) return;

    const structure = gallery.structures.find((s) => s.id === selectedStructureId);
    const theme = gallery.themes.find((t) => t.id === selectedThemeId);
    if (!structure || !theme) return;

    let cancelled = false;
    setIsApplyingLayout(true);
    runElkLayout(tree, structure, theme, nodeShapeRef.current)
      .then(({ nodes: rfNodes, edges: rfEdges }) => {
        if (cancelled) return;
        setNodes(withExtras(rfNodes));
        setEdges(rfEdges);
        setCanvasBackground(theme.background);
      })
      .catch((error) =>
        toast.error({
          title: "Lỗi khi cập nhật layout",
          description: extractApiErrorMessage(error, "Không thể cập nhật layout."),
        }),
      )
      .finally(() => {
        if (!cancelled) setIsApplyingLayout(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedStructureId, selectedThemeId, isPreviewingVersion, gallery, setEdges, setNodes, withExtras]);

  useEffect(() => {
    nodeShapeRef.current = nodeShape;
    setNodes((prev: Node[]) => prev.map((n: Node) => ({ ...n, data: { ...n.data, nodeShape } })));
  }, [nodeShape, setNodes]);

  const handleAddChildNode = useCallback(
    async (parentId: string) => {
      const tree = currentTreeRef.current;
      if (!tree || !gallery || isPreviewingVersion) return;
      const structure = gallery.structures.find((s) => s.id === selectedStructureId);
      const theme = gallery.themes.find((t) => t.id === selectedThemeId);
      if (!structure || !theme) return;

      const parentInTree = findNodeInTree(tree, parentId);
      const newType: "branch" | "leaf" = parentInTree?.type === "root" ? "branch" : "leaf";
      const newChild: MindMapTreeNode = {
        id: `node-${Date.now()}`,
        label: "Nút mới",
        description: "",
        type: newType,
        children: [],
      };
      const newTree = addChildToTree(tree, parentId, newChild);
      currentTreeRef.current = newTree;

      setIsApplyingLayout(true);
      try {
        const { nodes: rfNodes, edges: rfEdges } = await runElkLayout(newTree, structure, theme, nodeShapeRef.current);
        setNodes(withExtras(rfNodes));
        setEdges(rfEdges);
      } catch (error) {
        toast.error({
          title: "Lỗi khi thêm node",
          description: extractApiErrorMessage(error, "Không thể thêm node."),
        });
      } finally {
        setIsApplyingLayout(false);
      }
    },
    [gallery, selectedStructureId, selectedThemeId, isPreviewingVersion, withExtras, setNodes, setEdges],
  );

  const handleDeleteNode = useCallback(
    async (nodeId: string) => {
      const tree = currentTreeRef.current;
      if (!tree || !gallery || isPreviewingVersion || tree.id === nodeId) return;
      const structure = gallery.structures.find((s) => s.id === selectedStructureId);
      const theme = gallery.themes.find((t) => t.id === selectedThemeId);
      if (!structure || !theme) return;

      const newTree = removeNodeFromTree(tree, nodeId);
      if (!newTree) return;
      currentTreeRef.current = newTree;

      setIsApplyingLayout(true);
      try {
        const { nodes: rfNodes, edges: rfEdges } = await runElkLayout(newTree, structure, theme, nodeShapeRef.current);
        setNodes(withExtras(rfNodes));
        setEdges(rfEdges);
      } catch (error) {
        toast.error({
          title: "Lỗi khi xóa node",
          description: extractApiErrorMessage(error, "Không thể xóa node."),
        });
      } finally {
        setIsApplyingLayout(false);
      }
    },
    [gallery, selectedStructureId, selectedThemeId, isPreviewingVersion, withExtras, setNodes, setEdges],
  );

  useEffect(() => {
    addChildCallbackRef.current = handleAddChildNode;
    deleteNodeCallbackRef.current = handleDeleteNode;
  }, [handleAddChildNode, handleDeleteNode]);

  const applyLayout = useCallback(
    async (response: MindMapGenerateResponse) => {
      setIsApplyingLayout(true);
      try {
        const { nodes: rfNodes, edges: rfEdges } = await runElkLayout(
          response.tree,
          response.structure_config,
          response.theme_config,
          nodeShapeRef.current,
        );
        setNodes(withExtras(rfNodes));
        setEdges(rfEdges);
        setCurrentMindMapId(response.id);
        setCurrentVersion(response.current_version);
        setCurrentTitle(response.title);
        setMetadata(response.metadata);
        setCanvasBackground(response.theme_config.background);
        currentTreeRef.current = response.tree;
      } catch (error) {
        toast.error({
          title: "Lỗi khi tính toán layout",
          description: extractApiErrorMessage(error, "Không thể tính toán layout."),
        });
      } finally {
        setIsApplyingLayout(false);
      }
    },
    [setNodes, setEdges, withExtras],
  );

  const handleGenerate = () => {
    const trimmed = topic.trim();
    if (mode === "topic" && !trimmed) {
      setSourceError("Vui lòng nhập chủ đề trước khi tạo mindmap.");
      return;
    }

    if (mode === "chapter" && !chapterId) {
      setSourceError("Vui lòng chọn chương học trước khi tạo mindmap.");
      return;
    }

    const request =
      mode === "topic"
        ? {
            topic: trimmed,
            max_depth: maxDepth,
            max_branches: maxBranches,
            structure_id: selectedStructureId,
            theme_id: selectedThemeId,
          }
        : {
            chapter_id: chapterId as number,
            max_depth: maxDepth,
            max_branches: maxBranches,
            structure_id: selectedStructureId,
            theme_id: selectedThemeId,
          };

    generate(request, {
      onSuccess: async (res) => {
        const data = res.data.data;
        if (!data) return;
        setSourceError(null);
        setIsPreviewingVersion(false);
        setPreviewVersionNumber(null);
        previewBackupRef.current = null;
        await applyLayout(data);
      },
      onError: (error) => {
        toast.error({
          title: "Lỗi khi tạo mindmap",
          description: extractApiErrorMessage(error, "Không thể tạo mindmap."),
        });
      },
    });
  };

  const handleRefine = () => {
    if (!currentMindMapId || !refineInstruction.trim()) return;

    refine(
      {
        id: currentMindMapId,
        request: { instruction: refineInstruction.trim() },
      },
      {
        onSuccess: async (res) => {
          const data = res.data.data;
          if (!data) return;
          setIsPreviewingVersion(false);
          setPreviewVersionNumber(null);
          previewBackupRef.current = null;
          setRefineInstruction("");
          await applyLayout(data);
        },
        onError: (error) => {
          toast.error({
            title: "Lỗi khi tinh chỉnh mindmap",
            description: extractApiErrorMessage(error, "Không thể tinh chỉnh mindmap."),
          });
        },
      },
    );
  };

  const handlePreviewVersion = async (detail: MindMapVersionDto) => {
    const structure = gallery?.structures.find((s) => s.id === selectedStructureId);
    const theme = gallery?.themes.find((t) => t.id === selectedThemeId);
    if (!structure || !theme) {
      toast.error({ title: "Không thể preview: chưa có cấu hình layout" });
      return;
    }
    previewBackupRef.current = { nodes, edges };
    previewTreeRef.current = detail.treeData;
    setIsApplyingLayout(true);
    try {
      const { nodes: rfNodes, edges: rfEdges } = await runElkLayout(
        detail.treeData,
        structure,
        theme,
        nodeShapeRef.current,
      );
      setNodes(withExtras(rfNodes));
      setEdges(rfEdges);
      setCanvasBackground(theme.background);
      setIsPreviewingVersion(true);
      setPreviewVersionNumber(detail.version_number);
    } catch (error) {
      toast.error({
        title: "Lỗi khi xem phiên bản",
        description: extractApiErrorMessage(error, "Không thể xem phiên bản."),
      });
    } finally {
      setIsApplyingLayout(false);
    }
  };

  const handleCancelPreview = () => {
    if (previewBackupRef.current) {
      setNodes(previewBackupRef.current.nodes);
      setEdges(previewBackupRef.current.edges);
      previewBackupRef.current = null;
    }
    previewTreeRef.current = null;
    setIsPreviewingVersion(false);
    setPreviewVersionNumber(null);
  };

  const handleVersionRestored = async (response: MindMapGenerateResponse) => {
    setIsPreviewingVersion(false);
    setPreviewVersionNumber(null);
    previewBackupRef.current = null;
    previewTreeRef.current = null;
    await applyLayout(response);
  };

  const handleLoadSavedMindMap = async (detail: SavedMindMapDto) => {
    const structure = detail.structure_config;
    const theme = detail.theme_config;
    if (!structure || !theme) {
      toast.error({
        title: "Không thể tải mindmap",
        description: "Mindmap này chưa có cấu hình layout hợp lệ.",
      });
      return;
    }

    setIsApplyingLayout(true);
    try {
      const { nodes: rfNodes, edges: rfEdges } = await runElkLayout(
        detail.treeData,
        structure,
        theme,
        nodeShapeRef.current,
      );
      setNodes(withExtras(rfNodes));
      setEdges(rfEdges);
      setMode("topic");
      setTopic(detail.topic);
      setCurriculumId(null);
      setSubjectId(null);
      setChapterId(null);
      setSourceError(null);
      setCurrentTitle(detail.title);
      setCurrentMindMapId(detail.id);
      setCurrentVersion(detail.current_version);
      setMetadata(detail.metadata);
      setCanvasBackground(theme.background);
      currentTreeRef.current = detail.treeData;
      skipPickerEffectRef.current = true;
      setSelectedStructureId(structure.id);
      setSelectedThemeId(theme.id);
      setIsPreviewingVersion(false);
      setPreviewVersionNumber(null);
      previewBackupRef.current = null;
      setActiveTab("generate");
    } catch (error) {
      toast.error({
        title: "Lỗi khi tải mindmap",
        description: extractApiErrorMessage(error, "Không thể tải mindmap."),
      });
    } finally {
      setIsApplyingLayout(false);
    }
  };

  const handleNodeDoubleClick = (_event: React.MouseEvent, node: Node) => {
    const data = node.data as { label: string; description: string };
    setEditingNode({
      id: node.id,
      label: data.label ?? "",
      description: data.description ?? "",
    });
  };

  const handleSaveNodeEdit = () => {
    if (!editingNode) return;
    const updateTreeNode = (node: MindMapTreeNode): MindMapTreeNode => {
      if (node.id === editingNode.id) {
        return {
          ...node,
          label: editingNode.label,
          description: editingNode.description,
        };
      }
      return node.children?.length ? { ...node, children: node.children.map(updateTreeNode) } : node;
    };
    if (currentTreeRef.current) {
      currentTreeRef.current = updateTreeNode(currentTreeRef.current);
    }
    setNodes((prev: Node[]) =>
      prev.map((n: Node) =>
        n.id === editingNode.id
          ? {
              ...n,
              data: {
                ...n.data,
                label: editingNode.label,
                description: editingNode.description,
              },
            }
          : n,
      ),
    );
    setEditingNode(null);
  };

  const handleSaveTree = () => {
    if (!currentMindMapId || !currentTreeRef.current) return;
    saveTree(
      { id: currentMindMapId, request: { treeData: currentTreeRef.current } },
      {
        onSuccess: (res) => {
          const data = res.data.data;
          if (data) setCurrentVersion(data.version_number);
          toast.success({
            title: `Đã lưu (version ${data?.version_number ?? ""})`,
          });
        },
        onError: (error) => {
          toast.error({
            title: "Lưu thất bại, vui lòng thử lại",
            description: extractApiErrorMessage(error, "Không thể lưu mindmap."),
          });
        },
      },
    );
  };

  const handleExportImage = async () => {
    if (!flowContainerRef.current || !hasResult) return;
    try {
      const viewportElement = flowContainerRef.current.querySelector(".react-flow__viewport") as HTMLElement | null;
      if (!viewportElement) throw new Error("Viewport not found");

      const imageWidth = 1920;
      const imageHeight = 1080;
      const nodesBounds = getNodesBounds(nodes);
      const viewport = getViewportForBounds(nodesBounds, imageWidth, imageHeight, 0.2, 2, 0.15);

      const dataUrl = await toPng(viewportElement, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        width: imageWidth,
        height: imageHeight,
        style: {
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        },
      });

      const anchor = document.createElement("a");
      const safeTopic = (currentTitle.trim() || topic.trim() || `chapter-${chapterId ?? "mindmap"}`)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      anchor.href = dataUrl;
      anchor.download = `${safeTopic}-mindmap.png`;
      anchor.click();

      toast.success({
        title: "Xuất ảnh thành công",
        description: "Mind map đã được tải xuống dạng PNG.",
      });
    } catch (error) {
      toast.error({
        title: "Xuất ảnh thất bại",
        description: extractApiErrorMessage(error, "Không thể xuất ảnh mindmap."),
      });
    }
  };

  const hasResult = nodes.length > 0;
  const isPending = isGenerating || isApplyingLayout;

  const handleModeChange = (nextMode: GenerateMode) => {
    setMode(nextMode);
    setSourceError(null);

    if (nextMode === "topic") {
      setCurriculumId(null);
      setSubjectId(null);
      setChapterId(null);
      return;
    }

    setTopic("");
  };

  const activeNodeTypes = (() => {
    const structure = gallery?.structures.find((s) => s.id === selectedStructureId);
    if (!structure) return mindMapRadialNodeTypes;
    const family = getAlgorithmFamily(structure);
    if (family === "horizontal") return mindMapNodeTypes;
    if (family === "symmetric") return mindMapSymmetricNodeTypes;
    return mindMapRadialNodeTypes;
  })();

  const sourceEntries = metadata?.sources ? Object.entries(metadata.sources) : [];

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col gap-4 p-8 bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Tạo Mind Map</h1>
          <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">
            Nhập chủ đề để AI tự động tạo sơ đồ tư duy, giá cho mỗi lần tạo là
            <span className="ms-1 inline-flex items-center gap-0.5 font-semibold text-amber-700 dark:text-gray-100 whitespace-nowrap">
              2000
              <BitCoinIcon size={20} />
            </span>
          </p>
        </div>

        {activeTab === "generate" && metadata && (
          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <span>{metadata.total_nodes} nodes</span>
            <span>•</span>
            <span>{metadata.total_edges} edges</span>
            <span>•</span>
            <span>Depth: {metadata.max_depth}</span>
            {sourceEntries.length > 0 && (
              <>
                <span>•</span>
                <details className="group relative">
                  <summary className="flex cursor-pointer list-none items-center gap-1 rounded-md px-2 py-1 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white [&::-webkit-details-marker]:hidden">
                    <BookOpen className="h-3 w-3" />
                    {sourceEntries.length} nguồn
                  </summary>
                  <div className="absolute right-0 top-full z-30 mt-2 w-96 rounded-lg border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                    <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Nguồn tham khảo</p>
                    <div className="max-h-56 space-y-2 overflow-auto pr-1">
                      {sourceEntries.map(([name, detail]) => (
                        <div
                          key={name}
                          className="rounded-md border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800/60"
                        >
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{name}</p>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-8 border-b border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setActiveTab("generate")}
          className={`flex items-center gap-2 cursor-pointer pb-4 border-b-2 font-semibold text-md transition-colors  ${
            activeTab === "generate"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Tạo mindmap
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("saved")}
          className={`flex items-center gap-2 cursor-pointer pb-4 border-b-2 font-semibold text-md transition-colors  ${
            activeTab === "saved"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <BookMarked className="h-4 w-4" />
          Đã lưu
        </button>
      </div>

      {activeTab === "generate" && (
        <div className="flex flex-1 flex-col gap-3 overflow-hidden p-2">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                <label htmlFor="mindmap-max-depth" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Độ sâu
                </label>
                <select
                  id="mindmap-max-depth"
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(Number(e.target.value))}
                  disabled={isPending}
                  className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                >
                  {[2, 3, 4].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                <label
                  htmlFor="mindmap-max-branches"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Nhánh tối đa
                </label>
                <select
                  id="mindmap-max-branches"
                  value={maxBranches}
                  onChange={(e) => setMaxBranches(Number(e.target.value))}
                  disabled={isPending}
                  className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                >
                  {Array.from({ length: 7 }, (_, i) => i + 2).map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="basis-full order-1" />

              <button
                type="button"
                onClick={() => handleModeChange("topic")}
                className={`order-2 rounded-md border px-4 py-2 text-sm font-semibold transition-all ${
                  mode === "topic"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                Nhập chủ đề
              </button>

              <button
                type="button"
                onClick={() => handleModeChange("chapter")}
                className={`order-2 rounded-md border px-4 py-2 text-sm font-semibold transition-all ${
                  mode === "chapter"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                Chọn chương học
              </button>

              {mode === "topic" ? (
                <input
                  className="order-2 min-w-70 flex-1 rounded-md border-2 border-gray-200 bg-white pl-3 pr-4 py-2 shadow-sm outline-none transition-all focus:border-transparent focus:ring-1 focus:ring-primary dark:border-slate-800 dark:bg-slate-900"
                  placeholder="Ví dụ: Tìm hiểu về HTML và CSS, Thuật toán sắp xếp..."
                  value={topic}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setTopic(e.target.value);
                    if (sourceError) {
                      setSourceError(null);
                    }
                  }}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter" && !isPending) handleGenerate();
                  }}
                  disabled={isPending}
                />
              ) : (
                <div className="order-2 min-w-130 flex-1 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                  <CurriculumChapterPicker
                    curriculumId={curriculumId}
                    subjectId={subjectId}
                    chapterId={chapterId}
                    onCurriculumChange={setCurriculumId}
                    onSubjectChange={setSubjectId}
                    onChapterChange={(value) => {
                      setChapterId(value);
                      if (sourceError) {
                        setSourceError(null);
                      }
                    }}
                    error={sourceError ?? undefined}
                    disabled={isPending}
                  />
                </div>
              )}
              <Button
                onPress={handleGenerate}
                isDisabled={isPending || (mode === "topic" ? !topic.trim() : !chapterId)}
                className="order-2 cursor-pointer bg-blue-700 text-md text-white shadow-sm shadow-blue-500/30 transition-all hover:border-blue-600 hover:bg-white hover:text-blue-600 rounded-lg py-5 font-medium flex items-center gap-2"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {isPending ? "Đang tạo..." : "Tạo Mind Map"}
              </Button>

              <StructurePicker
                structures={gallery?.structures ?? []}
                selectedId={selectedStructureId}
                onChange={setSelectedStructureId}
                disabled={isPending || isGalleryLoading}
              />

              <ThemePicker
                themes={gallery?.themes ?? []}
                selectedId={selectedThemeId}
                onChange={setSelectedThemeId}
                disabled={isPending || isGalleryLoading}
              />

              <ShapePicker value={nodeShape} onChange={setNodeShape} disabled={isPending} />

              <Button
                variant="outline"
                onPress={handleExportImage}
                isDisabled={!hasResult || isPending}
                className="cursor-pointer shrink-0 gap-2 py-5 border-blue-600"
              >
                <ImageDown className="h-4 w-4" />
                Export PNG
              </Button>

              {currentMindMapId && !isPreviewingVersion && (
                <Button
                  variant="outline"
                  onPress={handleSaveTree}
                  isDisabled={isSaving || isPending}
                  className="cursor-pointer shrink-0 gap-2 py-5"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Lưu
                </Button>
              )}

              {currentMindMapId && (
                <Button
                  variant="outline"
                  onPress={() => setShowVersionSidebar((v) => !v)}
                  className={`cursor-pointer shrink-0 gap-2 py-5 ${showVersionSidebar ? "border-indigo-400 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400" : ""}`}
                >
                  <History className="h-4 w-4" />
                  Lịch sử
                </Button>
              )}
            </div>

            {sourceError && mode === "topic" && <p className="text-sm text-red-600">{sourceError}</p>}
          </div>

          <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
            <div
              ref={flowContainerRef}
              className="relative flex-1"
              style={{ background: canvasBackground ?? undefined }}
            >
              {isPreviewingVersion && previewVersionNumber && (
                <div className="absolute left-4 right-4 top-4 z-20 flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 shadow-md dark:border-amber-700 dark:bg-amber-950">
                  <div className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-300">
                    <Eye className="h-4 w-4" />
                    Đang xem v{previewVersionNumber}
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    <span className="text-sm text-amber-600 dark:text-amber-400">Chế độ xem — chưa khôi phục</span>
                    <button
                      type="button"
                      onClick={handleCancelPreview}
                      className="ml-2 rounded-md px-2 py-1 text-sm font-medium text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900"
                    >
                      Quay lại
                    </button>
                  </div>
                </div>
              )}

              {isApplyingLayout && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-slate-900/70">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-slate-500">Đang tính toán layout...</p>
                  </div>
                </div>
              )}

              {hasResult ? (
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  nodeTypes={activeNodeTypes}
                  onNodeDoubleClick={handleNodeDoubleClick}
                  fitView
                  fitViewOptions={{ padding: 0.3 }}
                  minZoom={0.2}
                  maxZoom={2}
                  proOptions={{ hideAttribution: true }}
                >
                  <Background
                    variant={BackgroundVariant.Dots}
                    gap={18}
                    size={1.2}
                    color={canvasBackground ? "rgba(0,0,0,0.12)" : "#cbd5e1"}
                  />
                  <Controls
                    position="bottom-right"
                    showInteractive={false}
                    className="rounded-xl border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800 [&>button]:border-slate-200 [&>button]:text-slate-600 dark:[&>button]:border-slate-700 dark:[&>button]:text-slate-300"
                  />
                  <MiniMap
                    position="bottom-left"
                    pannable
                    zoomable
                    nodeColor={(n) => {
                      const d = (n.data as { handleColor?: string }).handleColor;
                      return d ?? "#94a3b8";
                    }}
                    maskColor="rgba(15,23,42,0.06)"
                    style={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                </ReactFlow>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 bg-slate-50/60 text-slate-400 dark:bg-slate-900/60 dark:text-slate-500">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                    <Sparkles className="h-10 w-10 text-indigo-400 opacity-70" />
                  </div>
                  <p className="mt-2 text-base font-semibold text-slate-600 dark:text-slate-300">
                    Nhập chủ đề để bắt đầu
                  </p>
                  <p className="text-sm">Mind map sẽ được hiển thị tại đây</p>
                </div>
              )}
            </div>

            {showVersionSidebar && currentMindMapId && (
              <VersionHistorySidebar
                mindMapId={currentMindMapId}
                currentVersion={currentVersion}
                previewVersionNumber={previewVersionNumber}
                onPreview={handlePreviewVersion}
                onRestored={handleVersionRestored}
                onClose={() => setShowVersionSidebar(false)}
              />
            )}
          </div>

          {hasResult && (
            <p className="flex items-center gap-1.5 text-md text-slate-400 dark:text-slate-500">
              <Pencil className="h-4 w-4" />
              Double-click vào node bất kỳ để chỉnh sửa nội dung
            </p>
          )}

          {currentMindMapId && hasResult && (
            <div className="flex items-center gap-3 rounded-md border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/50">
              <Wand2 className="h-4 w-4 shrink-0 text-indigo-500" />
              <input
                className="flex-1 pl-3 pr-4 py-2 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-md focus:ring-1 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
                placeholder="Nhập yêu cầu tinh chỉnh, ví dụ: Thêm nhánh về lập trình Java..."
                value={refineInstruction}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRefineInstruction(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter" && !isRefining && refineInstruction.trim()) {
                    handleRefine();
                  }
                }}
                disabled={isRefining}
              />
              <Button
                onPress={handleRefine}
                isDisabled={!refineInstruction.trim() || isRefining}
                className="cursor-pointer bg-blue-700 hover:bg-white hover:text-blue-600 hover:border-blue-600 text-white text-md py-5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm shadow-blue-500/30"
              >
                {isRefining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                Tinh chỉnh Mindmap
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === "saved" && <SavedMindMapsPanel onLoad={handleLoadSavedMindMap} />}

      {editingNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <Pencil className="h-4 w-4" />
              Chỉnh sửa node
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              <div>
                <label
                  htmlFor="mindmap-node-title"
                  className="mb-1 block text-md font-medium text-slate-700 dark:text-slate-300"
                >
                  Tiêu đề
                </label>
                <Input
                  id="mindmap-node-title"
                  value={editingNode.label}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditingNode({ ...editingNode, label: e.target.value })
                  }
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Escape") setEditingNode(null);
                  }}
                  autoFocus
                />
              </div>
              <div>
                <label
                  htmlFor="mindmap-node-description"
                  className="mb-1 block text-md font-medium text-slate-700 dark:text-slate-300"
                >
                  Mô tả
                </label>
                <textarea
                  id="mindmap-node-description"
                  value={editingNode.description}
                  onChange={(e) =>
                    setEditingNode({
                      ...editingNode,
                      description: e.target.value,
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setEditingNode(null);
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSaveNodeEdit();
                  }}
                  rows={3}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                />
                <p className="mt-1 text-md text-slate-400">Ctrl+Enter để lưu</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onPress={() => setEditingNode(null)} className="p-5 border-blue-600">
                Hủy
              </Button>
              <Button onPress={handleSaveNodeEdit} isDisabled={!editingNode.label.trim()} className="gap-2 py-5">
                <Pencil className="h-4 w-4" />
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
