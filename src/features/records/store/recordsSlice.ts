import { createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { createAppSlice } from '../../../app/createAppSlice'
import { recordsService } from '../services/recordsService'
import { 
  TranscriptionRecord, 
  AnalysisResult, 
  AnalysisStats, 
  RecordsState,
  GetRecordsParams,
  GetPendingRecordsParams,
  AnalyzeRecordParams,
  AnalyzeLatestParams
} from '../types'

const initialState: RecordsState = {
  records: [],
  pendingRecords: [],
  stats: null,
  isLoading: false,
  error: null,
}

export const getRecordsAsync = createAsyncThunk(
  'records/getRecords',
  async (params: GetRecordsParams | undefined, { rejectWithValue }) => {
    try {
      const records = await recordsService.getRecords(params)
      console.log({ records });
      
      return records
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch records')
    }
  }
)

export const getPendingRecordsAsync = createAsyncThunk(
  'records/getPendingRecords',
  async (params: GetPendingRecordsParams | undefined, { rejectWithValue }) => {
    try {
      const records = await recordsService.getPendingRecords(params)
      return records
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch pending records')
    }
  }
)

export const getRecordByIdAsync = createAsyncThunk(
  'records/getRecordById',
  async (id: string, { rejectWithValue }) => {
    try {
      const record = await recordsService.getRecordById(id)
      return record
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch record')
    }
  }
)

export const analyzeRecordAsync = createAsyncThunk(
  'records/analyzeRecord',
  async (params: AnalyzeRecordParams, { rejectWithValue }) => {
    try {
      const result = await recordsService.analyzeRecord(params)
      return { recordId: params.id, result }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to analyze record')
    }
  }
)

export const analyzeLatestAsync = createAsyncThunk(
  'records/analyzeLatest',
  async (params: AnalyzeLatestParams, { rejectWithValue }) => {
    try {
      const results = await recordsService.analyzeLatest(params)
      return results
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to analyze latest records')
    }
  }
)

export const getStatsAsync = createAsyncThunk(
  'records/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await recordsService.getStats()
      return stats
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch statistics')
    }
  }
)

const recordsSlice = createAppSlice({
  name: 'records',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearRecords: (state) => {
      state.records = []
    },
    clearPendingRecords: (state) => {
      state.pendingRecords = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Get records
      .addCase(getRecordsAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getRecordsAsync.fulfilled, (state, action: PayloadAction<TranscriptionRecord[]>) => {
        state.isLoading = false
        state.records = action.payload
      })
      .addCase(getRecordsAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Get pending records
      .addCase(getPendingRecordsAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getPendingRecordsAsync.fulfilled, (state, action: PayloadAction<TranscriptionRecord[]>) => {
        state.isLoading = false
        state.pendingRecords = action.payload
      })
      .addCase(getPendingRecordsAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Get record by ID
      .addCase(getRecordByIdAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getRecordByIdAsync.fulfilled, (state, action: PayloadAction<TranscriptionRecord>) => {
        state.isLoading = false
        const existingIndex = state.records.findIndex(record => record._id === action.payload._id)
        if (existingIndex !== -1) {
          state.records[existingIndex] = action.payload
        } else {
          state.records.push(action.payload)
        }
      })
      .addCase(getRecordByIdAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Analyze record
      .addCase(analyzeRecordAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(analyzeRecordAsync.fulfilled, (state, action: PayloadAction<{ recordId: string; result: AnalysisResult }>) => {
        state.isLoading = false
        const recordIndex = state.records.findIndex(record => record._id === action.payload.recordId)
        if (recordIndex !== -1) {
          state.records[recordIndex].successSell = action.payload.result.successSell
          state.records[recordIndex].amountToPay = action.payload.result.amountToPay
          state.records[recordIndex].reasonFail = action.payload.result.reasonFail
        }
      })
      .addCase(analyzeRecordAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Analyze latest
      .addCase(analyzeLatestAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(analyzeLatestAsync.fulfilled, (state) => {
        state.isLoading = false
        // Note: This would need to be handled differently in a real app
        // as we don't know which specific records were updated
      })
      .addCase(analyzeLatestAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Get stats
      .addCase(getStatsAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getStatsAsync.fulfilled, (state, action: PayloadAction<AnalysisStats>) => {
        state.isLoading = false
        state.stats = action.payload
      })
      .addCase(getStatsAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, clearRecords, clearPendingRecords } = recordsSlice.actions
export { recordsSlice }
export default recordsSlice
