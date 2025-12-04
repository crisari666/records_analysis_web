import type { PayloadAction } from "@reduxjs/toolkit"
import { createAppSlice } from "../../../app/createAppSlice"
import { groupsService } from "../services/groupsService"
import { CreateGroupRequest, UpdateGroupRequest, UpdateGroupUsersRequest, GroupsSliceState } from "../types"

const initialState: GroupsSliceState = {
  groups: [],
  status: "idle",
  error: null,
  filterProjectId: null,
  lastLoadedProjectId: null,
}

export const groupsSlice = createAppSlice({
  name: "groups",
  initialState,
  reducers: create => ({
    clearError: create.reducer(state => {
      state.error = null
    }),
    setStatus: create.reducer((state, action: PayloadAction<"idle" | "loading" | "failed">) => {
      state.status = action.payload
    }),
    setFilterProjectId: create.reducer((state, action: PayloadAction<string | null>) => {
      state.filterProjectId = action.payload
    }),
    fetchGroups: create.asyncThunk(
      async (projectId?: string) => {
        const response = await groupsService.getGroups(projectId)
        return { groups: response, projectId: projectId || null }
      },
      {
        pending: state => {
          state.status = "loading"
          state.error = null
        },
        fulfilled: (state, action) => {
          state.status = "idle"
          state.groups = action.payload.groups
          state.lastLoadedProjectId = action.payload.projectId
        },
        rejected: (state, action) => {
          state.status = "failed"
          state.error = action.error.message || "Failed to fetch groups"
        },
      },
    ),
    createGroup: create.asyncThunk(
      async (groupData: CreateGroupRequest) => {
        const response = await groupsService.createGroup(groupData)
        return response
      },
      {
        pending: state => {
          state.status = "loading"
          state.error = null
        },
        fulfilled: (state, action) => {
          state.status = "idle"
          state.groups.push(action.payload)
        },
        rejected: (state, action) => {
          state.status = "failed"
          state.error = action.error.message || "Failed to create group"
        },
      },
    ),
    updateGroup: create.asyncThunk(
      async (groupData: UpdateGroupRequest) => {
        const response = await groupsService.updateGroup(groupData)
        return response
      },
      {
        pending: state => {
          state.status = "loading"
          state.error = null
        },
        fulfilled: (state, action) => {
          state.status = "idle"
          const index = state.groups.findIndex(group => group._id === action.payload._id)
          if (index !== -1) {
            state.groups[index] = action.payload
          }
        },
        rejected: (state, action) => {
          state.status = "failed"
          state.error = action.error.message || "Failed to update group"
        },
      },
    ),
    updateGroupUsers: create.asyncThunk(
      async (groupData: UpdateGroupUsersRequest) => {
        const response = await groupsService.updateGroupUsers(groupData)
        return response
      },
      {
        pending: state => {
          state.status = "loading"
          state.error = null
        },
        fulfilled: (state, action) => {
          state.status = "idle"
          const index = state.groups.findIndex(group => group._id === action.payload._id)
          if (index !== -1) {
            state.groups[index] = action.payload
          }
        },
        rejected: (state, action) => {
          state.status = "failed"
          state.error = action.error.message || "Failed to update group users"
        },
      },
    ),
    deleteGroup: create.asyncThunk(
      async (id: string) => {
        await groupsService.deleteGroup(id)
        return id
      },
      {
        pending: state => {
          state.status = "loading"
          state.error = null
        },
        fulfilled: (state, action) => {
          state.status = "idle"
          state.groups = state.groups.filter(group => group._id !== action.payload)
        },
        rejected: (state, action) => {
          state.status = "failed"
          state.error = action.error.message || "Failed to delete group"
        },
      },
    ),
  }),
  selectors: {
    selectGroups: groups => groups.groups,
    selectStatus: groups => groups.status,
    selectError: groups => groups.error,
    selectFilterProjectId: groups => groups.filterProjectId,
    selectLastLoadedProjectId: groups => groups.lastLoadedProjectId,
  },
})

export const {
  clearError,
  setStatus,
  setFilterProjectId,
  fetchGroups,
  createGroup,
  updateGroup,
  updateGroupUsers,
  deleteGroup,
} = groupsSlice.actions

export const {
  selectGroups,
  selectStatus,
  selectError,
  selectFilterProjectId,
  selectLastLoadedProjectId,
} = groupsSlice.selectors

export default groupsSlice


