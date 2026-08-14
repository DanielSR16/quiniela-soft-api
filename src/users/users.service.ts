import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { FIRESTORE } from '../firebase/firebase.constants';

export interface UserProfile {
  email?: string;
  displayName?: string;
  isSuperAdmin?: boolean;
}

@Injectable()
export class UsersService {
  constructor(@Inject(FIRESTORE) private readonly db: Firestore) {}

  async getProfile(uid: string): Promise<UserProfile> {
    const doc = await this.db.collection('users').doc(uid).get();
    if (!doc.exists) {
      throw new NotFoundException(`No existe el perfil users/${uid}`);
    }
    return doc.data() as UserProfile;
  }
}
