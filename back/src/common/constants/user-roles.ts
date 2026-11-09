export const USER_ROLES = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  RESPONSAVEL: 'RESPONSAVEL',
  CATEQUISTA: 'CATEQUISTA',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
