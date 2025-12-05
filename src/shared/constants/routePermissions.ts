export type UserRole = 'root' | 'admin' | 'user'

export class RolesPermission {
  static readonly dashboard: UserRole[] = ['root', 'admin', 'user']
  static readonly users: UserRole[] = ['root', 'admin']
  static readonly devices: UserRole[] = ['root']
  static readonly records: UserRole[] = ['root']
  static readonly projects: UserRole[] = ['root', 'admin']
  static readonly project: UserRole[] = ['root', 'admin']
  static readonly projectById: UserRole[] = ['root', 'admin']
  static readonly groups: UserRole[] = ['root', 'admin']
  static readonly whatsapp: UserRole[] = ['root', 'admin', 'user']
  static readonly whatsappSessionChats: UserRole[] = ['root', 'admin', 'user']
}
