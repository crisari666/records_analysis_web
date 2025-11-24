import { createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { createAppSlice } from '../../../app/createAppSlice'
import { usersService } from '../services/usersService'
import { User, UsersState, CreateUserRequest, UpdateUserRequest } from '../types'

const initialState: UsersState = {
  users: [],
  isLoading: false,
  error: null,
}

export const getUsersAsync = createAsyncThunk(
  'users/getUsers',
  async (_, { rejectWithValue }) => {
    try {
      const users = await usersService.getUsers()
      return users
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch users')
    }
  }
)

export const createUserAsync = createAsyncThunk(
  'users/createUser',
  async (userData: CreateUserRequest, { rejectWithValue }) => {
    try {
      const user = await usersService.createUser(userData)
      return user
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create user')
    }
  }
)

export const updateUserAsync = createAsyncThunk(
  'users/updateUser',
  async (userData: UpdateUserRequest, { rejectWithValue }) => {
    try {
      const user = await usersService.updateUser(userData)
      return user
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update user')
    }
  }
)

export const deleteUserAsync = createAsyncThunk(
  'users/deleteUser',
  async (id: string, { rejectWithValue }) => {
    try {
      await usersService.deleteUser(id)
      return id
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete user')
    }
  }
)

const usersSlice = createAppSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Get users
      .addCase(getUsersAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getUsersAsync.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.isLoading = false
        state.users = action.payload
      })
      .addCase(getUsersAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Create user
      .addCase(createUserAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createUserAsync.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false
        state.users.push(action.payload)
      })
      .addCase(createUserAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update user
      .addCase(updateUserAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateUserAsync.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false
        const index = state.users.findIndex(user => user._id === action.payload._id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
      })
      .addCase(updateUserAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Delete user
      .addCase(deleteUserAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteUserAsync.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false
        state.users = state.users.filter(user => user._id !== action.payload)
      })
      .addCase(deleteUserAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = usersSlice.actions
export { usersSlice }
export default usersSlice
