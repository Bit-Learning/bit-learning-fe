import type { EChartsOption } from 'echarts'
import ReactECharts from 'echarts-for-react'
import { TreeChart } from 'echarts/charts'
import { TitleComponent, ToolboxComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { useLayoutEffect, useRef, useState } from 'react'
import { EChartsTreeData, InputData, InputNode, MindMap } from '../types/mindmap.types'

echarts.use([TreeChart, CanvasRenderer, TitleComponent, TooltipComponent, ToolboxComponent])

function downloadImage(dataUrl: string) {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'mindmap.jpeg'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}

const convertToEChartsData = (data: InputData): EChartsTreeData => {
    const allNodes = new Map<string, InputNode>()
    allNodes.set(data.centerNode.id, data.centerNode)
    data.nodes.forEach(n => allNodes.set(n.id, n))

    const connections = new Map<string, string[]>()
    data.connections.forEach(conn => {
        const children = connections.get(conn.source) || []
        children.push(conn.target)
        connections.set(conn.source, children)
    })

    const buildTree = (nodeId: string, visited = new Set<string>()): EChartsTreeData | null => {
        // Tránh chu trình: nếu node đã thăm, return null
        if (visited.has(nodeId)) {
            return null
        }

        const node = allNodes.get(nodeId)!
        const childrenIds = connections.get(nodeId) || []

        // Thêm node vào visited set
        const newVisited = new Set(visited)
        newVisited.add(nodeId)

        const children = childrenIds
            .map(childId => buildTree(childId, newVisited))
            .filter((child): child is EChartsTreeData => child !== null)

        const treeNode: EChartsTreeData = {
            name: node.label,
            value: node.level,
            children: children.length > 0 ? children : undefined,
        }

        const level = node.level
        let nodeBorderColor: string
        let nodeBgColor: string
        const textColor = '#333'

        if (level === 0) {
            nodeBorderColor = '#0288d1'
            nodeBgColor = '#e1f5fe'
            treeNode.symbolSize = 15

            treeNode.label = {
                backgroundColor: nodeBgColor,
                color: textColor,
                fontSize: 14,
                fontWeight: 'bold',
            }
        } else {
            const borderIndex = (level - 1) % borderColors.length
            const bgIndex = (level - 1) % backgroundColors.length
            nodeBorderColor = borderColors[borderIndex] || '#fff'
            nodeBgColor = backgroundColors[bgIndex] || '#fff'

            treeNode.label = {
                backgroundColor: nodeBgColor,
                color: textColor,
            }
        }

        treeNode.itemStyle = {
            color: nodeBorderColor,
            borderColor: nodeBorderColor,
        }

        return treeNode
    }

    return buildTree(data.centerNode.id) || { name: 'Error', value: 0 }
}

const borderColors = [
    '#2e7d32', // L1 Green
    '#f9a825', // L2 Yellow
    '#616161', // L3 Gray
    '#c2185b', // L4 Pink
    '#673ab7', // L5 Purple
]
const backgroundColors = [
    '#e8f5e9', // L1 Green
    '#fffde7', // L2 Yellow
    '#f5f5f5', // L3 Gray
    '#fce4ec', // L4 Pink
    '#ede7f6', // L5 Purple
]

function Mindmap({ data }: { data: MindMap }) {
    const initialJsonData: InputData = JSON.parse(data.data)
    const echartRef = useRef<ReactECharts | null>(null)
    const [options, setOptions] = useState<EChartsOption>({})
    const [isLoading, setIsLoading] = useState(true)

    useLayoutEffect(() => {
        try {
            setIsLoading(true)
            const echartsData: EChartsTreeData = convertToEChartsData(initialJsonData)

            const chartOptions: EChartsOption = {
                tooltip: {
                    trigger: 'item',
                    triggerOn: 'mousemove',
                    formatter: '{b}',
                },
                series: [
                    {
                        type: 'tree',
                        data: [echartsData],
                        layout: 'orthogonal',
                        orient: 'LR',
                        edgeForkPosition: '50%',
                        top: '5%',
                        bottom: '5%',
                        left: '8%',
                        right: '10%',

                        symbol: 'circle',
                        symbolSize: 10,

                        roam: true,
                        scaleLimit: {
                            min: 0.6,
                            max: 2,
                        },
                        height: '95%',
                        edgeShape: 'curve',
                        lineStyle: {
                            color: '#aaa',
                            width: 1.5,
                            curveness: 0.4,
                            type: 'solid',
                        },
                        center: ['50%', '50%'],
                        zoom: 0.95,
                        itemStyle: {
                            borderWidth: 2,
                        },

                        label: {
                            show: true,
                            position: 'top',
                            verticalAlign: 'bottom',
                            align: 'center',
                            fontSize: 12,
                            padding: [5, 10],
                            borderRadius: 4,
                            borderColor: 'auto',
                            borderWidth: 1.5,
                        },

                        leaves: {
                            label: {
                                position: 'right',
                                verticalAlign: 'middle',
                                align: 'left',
                                borderColor: 'auto',
                                borderWidth: 1.5,
                            },
                        },

                        emphasis: {
                            focus: 'self',
                            blurScope: 'coordinateSystem',
                            itemStyle: {
                                borderWidth: 7,
                            },
                        },
                        initialTreeDepth: -100,
                        expandAndCollapse: true,
                        animationDuration: 550,
                        animationDurationUpdate: 750,
                    },
                ],
            }

            setOptions(chartOptions)
        } catch (error) {
            console.error('Lỗi khi xử lý dữ liệu ECharts:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const onDownload = () => {
        const echartsInstance = echartRef.current?.getEchartsInstance()
        if (!echartsInstance) {
            console.error('Không tìm thấy ECharts instance')
            return
        }
        const dataUrl = echartsInstance.getDataURL({
            type: 'jpeg',
            backgroundColor: '#ffffff',
            pixelRatio: 2,
        })
        downloadImage(dataUrl)
    }

    if (isLoading) {
        return <div>Đang tải sơ đồ...</div>
    }

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 10, right: 25, zIndex: 10 }}>
                <button
                    onClick={onDownload}
                    style={{
                        padding: '10px 15px',
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                >
                    Download
                </button>
            </div>
            <ReactECharts
                ref={echartRef}
                option={options}
                style={{ width: '100%', height: '100%' }}
                notMerge={true}
                lazyUpdate={true}
            />
        </div>
    )
}

export default Mindmap
