
import Api from '../../../app/http'
import { 
  TranscriptionRecord, 
  AnalysisResult, 
  AnalysisStats,
  GetRecordsParams,
  GetPendingRecordsParams,
  AnalyzeRecordParams,
  AnalyzeLatestParams
} from '../types'

const API_ENDPOINTS = {
  RECORDS: '/transcriptions/records',
  PENDING: '/transcriptions/pending',
  RECORD_BY_ID: (id: string) => `/transcriptions/records/${id}`,
  ANALYZE_RECORD: (id: string) => `/transcriptions/analyze/${id}`,
  ANALYZE_LATEST: '/transcriptions/analyze-latest',
  STATS: '/transcriptions/stats',
  HEALTH: '/transcriptions/health',
} as const

const api = new Api()

export const recordsService = {
  // Get all records with transcriptions
  async getRecords(params?: GetRecordsParams): Promise<TranscriptionRecord[]> {
    const queryParams = new URLSearchParams()
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString())
    }
    
    const response = await api.get({ 
      path: `${API_ENDPOINTS.RECORDS}?${queryParams.toString()}` 
    })
    return response.data
  },

  // Get pending analysis records
  async getPendingRecords(params?: GetPendingRecordsParams): Promise<TranscriptionRecord[]> {
    const queryParams = new URLSearchParams()
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString())
    }
    
    const response = await api.get({ 
      path: `${API_ENDPOINTS.PENDING}?${queryParams.toString()}` 
    })
    return response.data
  },

  // Get specific record by ID
  async getRecordById(id: string): Promise<TranscriptionRecord> {
    const response = await api.get({ path: API_ENDPOINTS.RECORD_BY_ID(id) })
    return response.data
  },

  // Analyze specific record
  async analyzeRecord(params: AnalyzeRecordParams): Promise<AnalysisResult> {
    const response = await api.post({ 
      path: API_ENDPOINTS.ANALYZE_RECORD(params.id)
    })
    return response.data
  },

  // Analyze latest unanalyzed records
  async analyzeLatest(params?: AnalyzeLatestParams): Promise<AnalysisResult[]> {
    const queryParams = new URLSearchParams()
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString())
    }
    
    const response = await api.post({ 
      path: `${API_ENDPOINTS.ANALYZE_LATEST}?${queryParams.toString()}` 
    })
    return response.data
  },

  // Get analysis statistics
  async getStats(): Promise<AnalysisStats> {
    const response = await api.get({ path: API_ENDPOINTS.STATS })
    return response.data
  },

  // Health check
  async healthCheck(): Promise<{ success: boolean; message: string; timestamp: string }> {
    const response = await api.get({ path: API_ENDPOINTS.HEALTH })
    return response
  }
}
