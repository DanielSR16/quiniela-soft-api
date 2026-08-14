import { SetMetadata } from '@nestjs/common';

export const GROUP_ROLES_KEY = 'groupRoles';

export type GroupRole = 'group_admin' | 'member';

/**
 * Restringe un endpoint a miembros del grupo (:groupId en la ruta) con alguno
 * de los roles indicados. Sin argumentos, solo exige membresía activa.
 */
export const GroupRoles = (...roles: GroupRole[]) =>
  SetMetadata(GROUP_ROLES_KEY, roles);
