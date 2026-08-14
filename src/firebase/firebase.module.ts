import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App, cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { FIREBASE_AUTH, FIRESTORE } from './firebase.constants';

const FIREBASE_APP = Symbol('FIREBASE_APP');

@Global()
@Module({
  providers: [
    {
      provide: FIREBASE_APP,
      inject: [ConfigService],
      useFactory: (config: ConfigService): App =>
        initializeApp({
          credential: cert({
            projectId: config.getOrThrow<string>('FIREBASE_PROJECT_ID'),
            clientEmail: config.getOrThrow<string>('FIREBASE_CLIENT_EMAIL'),
            privateKey: config
              .getOrThrow<string>('FIREBASE_PRIVATE_KEY')
              .replace(/\\n/g, '\n'),
          }),
        }),
    },
    {
      provide: FIRESTORE,
      inject: [FIREBASE_APP],
      useFactory: (app: App) => getFirestore(app),
    },
    {
      provide: FIREBASE_AUTH,
      inject: [FIREBASE_APP],
      useFactory: (app: App) => getAuth(app),
    },
  ],
  exports: [FIRESTORE, FIREBASE_AUTH],
})
export class FirebaseModule {}
