export type User = {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export type UsersState = {
  users: User[]
  isLoading: boolean
  error: string | null
}

export type CreateUserRequest = {
  name: string
  email: string
  role: string
}

export type UpdateUserRequest = {
  id: string
  name?: string
  email?: string
  role?: string
  status?: 'active' | 'inactive'
}
