import api from '@/shared/api/api'
import { ApiResponse } from '@/shared/api/api.type'
import { AxiosResponse } from 'axios'
import { MindMap } from '../types/mindmap.types'

export const getMindMapDataByUserIdAndCode = async (
    userId: number,
    code: string,
): Promise<AxiosResponse<ApiResponse<MindMap>>> => {
    return api.get<ApiResponse<MindMap>>(`/products/mindmaps/${userId}/${code}`)
}
