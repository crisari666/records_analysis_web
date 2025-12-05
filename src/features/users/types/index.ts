export type User = {
  _id: string
  name: string
  lastName: string
  user: string
  email: string
  role: 'root' | 'admin' | 'user'
  projects?: string[]
  removed: boolean
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
  lastName: string
  user: string
  email: string
  password: string
  role?: 'root' | 'admin' | 'user'
  projects?: string[]
}

export type UpdateUserRequest = {
  id: string
  name?: string
  lastName?: string
  user?: string
  email?: string
  password?: string
  role?: 'root' | 'admin' | 'user'
  projects?: string[]
}
