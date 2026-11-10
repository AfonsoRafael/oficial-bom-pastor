export const USER_ROLES = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  COORDENADOR: 'COORDENADOR',
  SECRETARIA: 'SECRETARIA',
  RESPONSAVEL: 'RESPONSAVEL',
  CATEQUISTA: 'CATEQUISTA',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export function isUserRole(value: string): value is UserRole {
  return Object.values(USER_ROLES).some((role) => role === value);
}
