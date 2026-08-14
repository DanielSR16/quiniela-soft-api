import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { FIRESTORE } from '../../firebase/firebase.constants';
import { AuthenticatedRequest } from '../types/authenticated-request';

/**
 * Requiere que el usuario autenticado tenga users/{uid}.isSuperAdmin == true.
 * Debe aplicarse después del FirebaseAuthGuard global (asume request.user ya presente).
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(@Inject(FIRESTORE) private readonly db: Firestore) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user) {
      throw new UnauthorizedException();
    }

    const userDoc = await this.db
      .collection('users')
      .doc(request.user.uid)
      .get();
    const user = userDoc.data() as { isSuperAdmin?: boolean } | undefined;

    if (!user?.isSuperAdmin) {
      throw new ForbiddenException('Se requiere ser super-admin');
    }

    return true;
  }
}
