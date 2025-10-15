export type TranscriptionRecord = {
  _id: string
  user: string
  file: string
  callerId: string
  type: 'incoming' | 'outgoing'
  transcription: string
  successSell: boolean | null
  amountToPay: number | null
  reasonFail: string | null
  timestamp: number | null
  targetName: string | null
  targetNumber: string | null
  createdAt: string
  updatedAt: string
}

export type AnalysisResult = {
  successSell: boolean
  amountToPay: number | null
  reasonFail: string | null
}

export type AnalysisStats = {
  totalRecords: number
  analyzedRecords: number
  pendingAnalysis: number
  successfulSales: number
  failedSales: number
}

export type RecordsState = {
  records: TranscriptionRecord[]
  pendingRecords: TranscriptionRecord[]
  stats: AnalysisStats | null
  isLoading: boolean
  error: string | null
}

export type GetRecordsParams = {
  limit?: number
}

export type GetPendingRecordsParams = {
  limit?: number
}

export type AnalyzeRecordParams = {
  id: string
}

export type AnalyzeLatestParams = {
  limit?: number
}
