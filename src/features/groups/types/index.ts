export type Group = {
  _id: string
  name: string
  projectId: string
  users: string[]
  deleted: boolean
  createdAt: string
  updatedAt: string
}

export type GroupsSliceState = {
  groups: Group[]
  status: "idle" | "loading" | "failed"
  error: string | null
  filterProjectId: string | null
  lastLoadedProjectId: string | null
}

export type CreateGroupRequest = {
  name: string
  projectId: string
  users?: string[]
}

export type UpdateGroupRequest = {
  id: string
  name?: string
  projectId?: string
  users?: string[]
}

export type UpdateGroupUsersRequest = {
  id: string
  users: string[]
}


