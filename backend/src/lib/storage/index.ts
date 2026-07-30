import type { StorageProvider } from './provider';
import { LocalStorageProvider } from './local';
import { S3StorageProvider } from './s3';

export type { StorageProvider };

let _storage: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (_storage) return _storage;

  const provider = process.env.STORAGE_PROVIDER ?? 'local';

  if (provider === 's3' || provider === 'r2' || provider === 'b2') {
    _storage = new S3StorageProvider();
  } else {
    _storage = new LocalStorageProvider();
  }

  console.log(`[storage] Using provider: ${_storage.name}`);
  return _storage;
}
