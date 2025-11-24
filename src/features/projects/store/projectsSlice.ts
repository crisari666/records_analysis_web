import type { PayloadAction } from "@reduxjs/toolkit"
import { createAppSlice } from "../../../app/createAppSlice"
import { projectsService } from "../services/projectsService"
import { Project, CreateProjectRequest, UpdateProjectRequest, UpdateProjectDevicesRequest, UpdateProjectUsersRequest } from "../types"

export type ProjectsSliceState = {
  projects: Project[]
  selectedProject: Project | null
  status: "idle" | "loading" | "failed"
  error: string | null
}

const initialState: ProjectsSliceState = {
  projects: [],
  selectedProject: null,
  status: "idle",
  error: null,
}

export const projectsSlice = createAppSlice({
  name: "projects",
  initialState,
  reducers: create => ({
    clearError: create.reducer(state => {
      state.error = null
    }),
    setStatus: create.reducer((state, action: PayloadAction<"idle" | "loading" | "failed">) => {
      state.status = action.payload
    }),
    fetchProjects: create.asyncThunk(
      async () => {
        const response = await projectsService.getProjects()
        return response
      },
      {
        pending: state => {
          state.status = "loading"
          state.error = null
        },
        fulfilled: (state, action) => {
          state.status = "idle"
          state.projects = action.payload
        },
        rejected: (state, action) => {
          state.status = "failed"
          state.error = action.error.message || "Failed to fetch projects"
        },
      },
    ),
    fetchProjectById: create.asyncThunk(
      async (id: string) => {
        const response = await projectsService.getProjectById(id)
        return response
      },
      {
        pending: state => {
          state.status = "loading"
          state.error = null
        },
        fulfilled: (state, action) => {
          state.status = "idle"
          state.selectedProject = action.payload
          const index = state.projects.findIndex(project => project._id === action.payload._id)
          if (index !== -1) {
            state.projects[index] = action.payload
          } else {
            state.projects.push(action.payload)
          }
        },
        rejected: (state, action) => {
          state.status = "failed"
          state.error = action.error.message || "Failed to fetch project"
        },
      },
    ),
    clearSelectedProject: create.reducer(state => {
      state.selectedProject = null
    }),
    createProject: create.asyncThunk(
      async (projectData: CreateProjectRequest) => {
        const response = await projectsService.createProject(projectData)
        return response
      },
      {
        pending: state => {
          state.status = "loading"
          state.error = null
        },
        fulfilled: (state, action) => {
          state.status = "idle"
          state.projects.push(action.payload)
        },
        rejected: (state, action) => {
          state.status = "failed"
          state.error = action.error.message || "Failed to create project"
        },
      },
    ),
    updateProject: create.asyncThunk(
      async (projectData: UpdateProjectRequest) => {
        const response = await projectsService.updateProject(projectData)
        return response
      },
      {
        pending: state => {
          state.status = "loading"
          state.error = null
        },
        fulfilled: (state, action) => {
          state.status = "idle"
          const index = state.projects.findIndex(project => project._id === action.payload._id)
          if (index !== -1) {
            state.projects[index] = action.payload
          }
        },
        rejected: (state, action) => {
          state.status = "failed"
          state.error = action.error.message || "Failed to update project"
        },
      },
    ),
    updateProjectDevices: create.asyncThunk(
      async (projectData: UpdateProjectDevicesRequest) => {
        const response = await projectsService.updateProjectDevices(projectData)
        return response
      },
      {
        pending: state => {
          state.status = "loading"
          state.error = null
        },
        fulfilled: (state, action) => {
          state.status = "idle"
          const index = state.projects.findIndex(project => project._id === action.payload._id)
          if (index !== -1) {
            state.projects[index] = action.payload
          }
        },
        rejected: (state, action) => {
          state.status = "failed"
          state.error = action.error.message || "Failed to update project devices"
        },
      },
    ),
    deleteProject: create.asyncThunk(
      async (id: string) => {
        await projectsService.deleteProject(id)
        return id
      },
      {
        pending: state => {
          state.status = "loading"
          state.error = null
        },
        fulfilled: (state, action) => {
          state.status = "idle"
          state.projects = state.projects.filter(project => project._id !== action.payload)
        },
        rejected: (state, action) => {
          state.status = "failed"
          state.error = action.error.message || "Failed to delete project"
        },
      },
    ),
    updateProjectUsers: create.asyncThunk(
      async (projectData: UpdateProjectUsersRequest) => {
        const response = await projectsService.updateProjectUsers(projectData)
        return response
      },
      {
        pending: state => {
          state.status = "loading"
          state.error = null
        },
        fulfilled: (state, action) => {
          state.status = "idle"
          const index = state.projects.findIndex(project => project._id === action.payload._id)
          if (index !== -1) {
            state.projects[index] = action.payload
          }
        },
        rejected: (state, action) => {
          state.status = "failed"
          state.error = action.error.message || "Failed to update project users"
        },
      },
    ),
  }),
  selectors: {
    selectProjects: projects => projects.projects,
    selectSelectedProject: projects => projects.selectedProject,
    selectStatus: projects => projects.status,
    selectError: projects => projects.error,
    selectProjectById: (projects, id: string) => projects.projects.find(project => project._id === id),
  },
})

// Action creators are generated for each case reducer function.
export const { 
  clearError, 
  setStatus, 
  fetchProjects,
  fetchProjectById,
  clearSelectedProject,
  createProject, 
  updateProject, 
  updateProjectDevices, 
  deleteProject,
  updateProjectUsers
} = projectsSlice.actions

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { 
  selectProjects,
  selectSelectedProject,
  selectStatus, 
  selectError, 
  selectProjectById 
} = projectsSlice.selectors
