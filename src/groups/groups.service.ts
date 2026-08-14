import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Auth } from 'firebase-admin/auth';
import { FieldValue, Firestore } from 'firebase-admin/firestore';
import { FIREBASE_AUTH, FIRESTORE } from '../firebase/firebase.constants';
import { CreateMemberDto } from './dto/create-member.dto';

@Injectable()
export class GroupsService {
  constructor(
    @Inject(FIRESTORE) private readonly db: Firestore,
    @Inject(FIREBASE_AUTH) private readonly auth: Auth,
  ) {}

  async createMember(groupId: string, dto: CreateMemberDto) {
    const groupRef = this.db.collection('groups').doc(groupId);
    const groupDoc = await groupRef.get();
    if (!groupDoc.exists) {
      throw new NotFoundException(`No existe el grupo ${groupId}`);
    }

    let uid: string;
    try {
      const userRecord = await this.auth.createUser({
        email: dto.email,
        password: dto.password,
        displayName: dto.displayName,
      });
      uid = userRecord.uid;
    } catch (err) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code?: string }).code === 'auth/email-already-exists'
      ) {
        throw new ConflictException('Ya existe un usuario con ese email');
      }
      throw err;
    }

    await this.db
      .collection('users')
      .doc(uid)
      .set({
        email: dto.email,
        displayName: dto.displayName ?? null,
        isSuperAdmin: false,
        createdAt: FieldValue.serverTimestamp(),
      });

    await groupRef.collection('members').doc(uid).set({
      role: dto.role,
      isActive: true,
      joinedAt: FieldValue.serverTimestamp(),
    });

    return { uid, email: dto.email, role: dto.role };
  }
}
