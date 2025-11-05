export const Roles = {
  USER: 'USER',
  STAFF: 'STAFF',
  ADMIN: 'ADMIN',
} as const

export type Roles = keyof typeof Roles
