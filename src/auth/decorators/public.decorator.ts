import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marca un endpoint como exento del FirebaseAuthGuard global
 * (ej. health check, /internal/sync/run que usa su propio secreto).
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
