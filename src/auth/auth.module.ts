import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { GroupRoleGuard } from './guards/group-role.guard';
import { SuperAdminGuard } from './guards/super-admin.guard';

@Module({
  providers: [
    FirebaseAuthGuard,
    SuperAdminGuard,
    GroupRoleGuard,
    { provide: APP_GUARD, useExisting: FirebaseAuthGuard },
  ],
  exports: [FirebaseAuthGuard, SuperAdminGuard, GroupRoleGuard],
})
export class AuthModule {}
