import * as fs from 'fs';
import * as path from 'path';
import type { StorageProvider } from './provider';

export class LocalStorageProvider implements StorageProvider {
  readonly name = 'local';
  private dir: string;

  constructor(dir?: string) {
    this.dir = dir ?? process.env.DOWNLOAD_DIR ?? path.join(process.cwd(), 'downloads');
    if (!fs.existsSync(this.dir)) fs.mkdirSync(this.dir, { recursive: true });
  }

  async save(localPath: string, key: string): Promise<string> {
    const dest = path.join(this.dir, key);
    if (localPath !== dest) {
      fs.copyFileSync(localPath, dest);
    }
    return key;
  }

  getReadPath(key: string): string {
    return path.join(this.dir, key);
  }

  createReadStream(key: string): NodeJS.ReadableStream {
    return fs.createReadStream(path.join(this.dir, key));
  }

  async sizeBytes(key: string): Promise<number | null> {
    try {
      return fs.statSync(path.join(this.dir, key)).size;
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      fs.unlinkSync(path.join(this.dir, key));
    } catch { /* already gone */ }
  }
}
