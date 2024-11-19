export const ROLES = {
  REGULAR: 'regular' as const,
  ADMIN: 'admin' as const,
} as const;

export const ROLE_LABELS = {
  [ROLES.REGULAR]: 'Regular - Can\'t delete members',
  [ROLES.ADMIN]: 'Admin - Can delete users'
} as const;
