import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Firestore } from 'firebase-admin/firestore';
import { FIRESTORE } from '../../firebase/firebase.constants';
import {
  GROUP_ROLES_KEY,
  GroupRole,
} from '../decorators/group-roles.decorator';
import { AuthenticatedRequest } from '../types/authenticated-request';

/**
 * Valida que el usuario autenticado sea miembro activo de :groupId (params
 * de la ruta) y, si @GroupRoles(...) especifica roles, que su rol esté entre
 * ellos. El super-admin siempre pasa, igual que en las reglas de Firestore.
 */
@Injectable()
export class GroupRoleGuard implements CanActivate {
  constructor(
    @Inject(FIRESTORE) private readonly db: Firestore,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user) {
      throw new UnauthorizedException();
    }

    const groupId = request.params.groupId as string | undefined;
    if (!groupId) {
      throw new ForbiddenException(
        'GroupRoleGuard requiere un parámetro :groupId en la ruta',
      );
    }

    const userDoc = await this.db
      .collection('users')
      .doc(request.user.uid)
      .get();
    const user = userDoc.data() as { isSuperAdmin?: boolean } | undefined;
    if (user?.isSuperAdmin) {
      return true;
    }

    const memberDoc = await this.db
      .collection('groups')
      .doc(groupId)
      .collection('members')
      .doc(request.user.uid)
      .get();
    const member = memberDoc.data() as
      { isActive?: boolean; role?: GroupRole } | undefined;

    if (!member?.isActive) {
      throw new ForbiddenException('No perteneces a este grupo');
    }

    const requiredRoles = this.reflector.getAllAndOverride<GroupRole[]>(
      GROUP_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (
      requiredRoles?.length &&
      (!member.role || !requiredRoles.includes(member.role))
    ) {
      throw new ForbiddenException('No tienes el rol necesario en este grupo');
    }

    return true;
  }
}
