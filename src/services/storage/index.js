/**
 * Storage provider interface (shape only). Consumers call through one of these.
 * Default: local provider. Future: supabase provider.
 */

import * as local from './local';

export function createStorageProvider(kind = 'local') {
  switch (kind) {
    case 'local':
    default:
      return local;
  }
}
